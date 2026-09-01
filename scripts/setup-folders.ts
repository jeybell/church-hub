/**
 * 자료실 카테고리 폴더를 드라이브에 만든다.
 *
 *   npm run setup:folders
 *
 * DRIVE_ROOT_FOLDER_ID 아래에 아래 FOLDER_TREE 구조를 만든다.
 * 같은 이름의 폴더가 이미 있으면 다시 만들지 않고 그대로 둔다.
 * 그래서 여러 번 돌려도 안전하고, 구조를 늘린 뒤 다시 돌리면
 * 새로 추가된 것만 생긴다.
 *
 * 폴더를 드라이브에서 직접 만들어도 되지만, 이 스크립트로 만들면
 * 이름과 구조가 저장소에 남아 나중에 같은 구조를 재현할 수 있다.
 */

// 이 파일은 독립 실행 스크립트다. export 를 두어 모듈로 인식시키지 않으면
// 다른 스크립트와 전역 스코프를 공유해 같은 이름의 함수가 충돌한다.
export {}

const FOLDER_MIME = 'application/vnd.google-apps.folder'

/** 카테고리 구조. 수정한 뒤 다시 실행하면 늘어난 폴더만 만들어진다. */
const FOLDER_TREE: Record<string, string[]> = {
  예배부: ['주보', '예배 순서지', '양식'],
  찬양팀: ['악보', '음원'],
  교육부: ['주일학교', '성경공부'],
  청년부: ['수련회', '모임 자료'],
  행정부: ['예산', '회의록'],
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID

function die(message: string): never {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const json = (await res.json()) as { access_token?: string; error_description?: string }
  if (!res.ok || !json.access_token) {
    die(
      `토큰 갱신 실패: ${json.error_description ?? res.status}\n` +
        '  동의 화면이 테스트 상태면 refresh token 이 7일 만에 만료됩니다.\n' +
        '  npm run setup:drive 를 다시 실행해 새 토큰을 받으세요.',
    )
  }
  return json.access_token
}

async function drive<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) {
    die(`드라이브 API 실패 (${res.status}): ${JSON.stringify(json)}`)
  }
  return json as T
}

/** 부모 아래에서 이름이 같은 폴더를 찾고, 없으면 만든다. */
async function ensureFolder(
  accessToken: string,
  name: string,
  parentId: string,
): Promise<{ id: string; created: boolean }> {
  const query = [
    `name='${name.replace(/'/g, "\\'")}'`,
    `mimeType='${FOLDER_MIME}'`,
    `'${parentId}' in parents`,
    'trashed=false',
  ].join(' and ')

  const found = await drive<{ files: { id: string }[] }>(
    accessToken,
    `files?q=${encodeURIComponent(query)}&fields=files(id)`,
  )
  if (found.files.length > 0) {
    return { id: found.files[0].id, created: false }
  }

  const folder = await drive<{ id: string }>(accessToken, 'files?fields=id', {
    method: 'POST',
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  })
  return { id: folder.id, created: true }
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    die('.env.local 에 GOOGLE_CLIENT_ID 와 GOOGLE_CLIENT_SECRET 가 필요합니다.')
  }
  if (!REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    die('.env.local 에 GOOGLE_REFRESH_TOKEN 과 DRIVE_ROOT_FOLDER_ID 가 없습니다.\n  먼저 npm run setup:drive 를 실행하세요.')
  }

  const token = await getAccessToken()

  const root = await drive<{ id: string; name: string }>(
    token,
    `files/${ROOT_FOLDER_ID}?fields=id,name`,
  )
  console.log(`\n${root.name}/`)

  let created = 0
  const departments = Object.entries(FOLDER_TREE)

  for (const [index, [department, children]] of departments.entries()) {
    const isLastDept = index === departments.length - 1
    const dept = await ensureFolder(token, department, ROOT_FOLDER_ID)
    if (dept.created) created++
    console.log(`${isLastDept ? '└' : '├'} ${department}/${dept.created ? '' : '  (이미 있음)'}`)

    for (const [childIndex, child] of children.entries()) {
      const isLastChild = childIndex === children.length - 1
      const sub = await ensureFolder(token, child, dept.id)
      if (sub.created) created++
      const prefix = isLastDept ? '  ' : '│  '
      console.log(`${prefix}${isLastChild ? '└' : '├'} ${child}${sub.created ? '' : '  (이미 있음)'}`)
    }
  }

  console.log(
    created === 0
      ? '\n✓ 이미 모두 있어 새로 만든 폴더는 없습니다.\n'
      : `\n✓ 폴더 ${created}개를 만들었습니다.\n`,
  )
}

main().catch(e => die(String(e)))
