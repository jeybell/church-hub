/**
 * 화면 확인용 더미 자료를 만든다.
 *
 *   npm run seed:demo
 *
 * 저장소(드라이브)에 파일을 올리고, 이미 등록된 글에 부서가 맞는 것끼리 묶는다.
 * 파일이 하나도 없으면 카테고리·첨부·변경 이력이 전부 빈 화면으로만 보여서
 * 실제로 어떻게 보이는지 확인할 수가 없다.
 *
 * 여러 번 돌려도 안전하다. 같은 이름의 파일과 이미 묶인 첨부는 건너뛴다.
 * 되돌리려면 npm run seed:demo -- --clean 을 쓴다.
 *
 * 가짜 확장자를 붙이지 않는다. 열리지 않는 파일이 저장소에 남으면 그게 더
 * 성가시다. 그래서 구글 문서/스프레드시트처럼 실제로 열리는 형식과
 * 진짜 png·txt 만 만든다.
 */

export {}

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const GDOC = 'application/vnd.google-apps.document'
const GSHEET = 'application/vnd.google-apps.spreadsheet'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

type Seed = {
  department: string
  category: string
  name: string
  /** 구글 문서로 만들지, 실제 바이트를 올릴지 */
  kind: 'doc' | 'sheet' | 'png' | 'txt'
  text?: string
  /** 같은 파일을 몇 번 더 덮어쓸지. 변경 이력을 만들기 위한 것 */
  revisions?: number
}

const SEEDS: Seed[] = [
  { department: '예배부', category: '주보', name: '주보_2026-08-30', kind: 'doc' },
  { department: '예배부', category: '주보', name: '주보_2026-08-23', kind: 'doc' },
  { department: '예배부', category: '예배 순서지', name: '예배순서_2026-08-30.txt', kind: 'txt',
    text: '1. 묵도\n2. 찬송 12장\n3. 기도\n4. 성경봉독\n5. 설교\n6. 헌금\n7. 축도\n' },
  { department: '찬양팀', category: '악보', name: '찬양_콘티_2026-08.txt', kind: 'txt',
    text: '1부 예배 콘티\n- 주 은혜임을 (D)\n- 예수 나의 첫사랑 되시네 (G)\n- 성령이 오셨네 (A)\n' },
  { department: '교육부', category: '주일학교', name: '여름성경학교_계획서', kind: 'doc' },
  // 이 파일만 여러 번 덮어써서 변경 이력이 쌓이게 한다.
  { department: '교육부', category: '주일학교', name: '여름성경학교_포스터.png', kind: 'png', revisions: 2 },
  { department: '교육부', category: '성경공부', name: '가을성경공부_교재안내.txt', kind: 'txt',
    text: '교재: 로마서 강해\n기간: 9월 첫째 주 ~ 11월 마지막 주\n장소: 교육관 2층\n' },
  { department: '청년부', category: '수련회', name: '수련회_일정표', kind: 'sheet' },
  { department: '행정부', category: '예산', name: '2026_예산안', kind: 'sheet' },
  { department: '행정부', category: '회의록', name: '제직회_회의록_2026-09.txt', kind: 'txt',
    text: '일시: 2026-09-01 20:00\n장소: 본당 세미나실\n안건: 하반기 예산 조정, 성탄 행사 준비\n' },
]

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

async function drive<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const json = await res.json()
  if (!res.ok) die(`드라이브 API 실패 (${res.status}): ${JSON.stringify(json)}`)
  return json as T
}

async function supabase<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...init?.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!res.ok) die(`Supabase 실패 (${res.status}): ${text}`)
  return (text ? JSON.parse(text) : undefined) as T
}

async function findChild(token: string, parentId: string, name: string) {
  const q = [
    `name='${name.replace(/'/g, "\\'")}'`,
    `'${parentId}' in parents`,
    'trashed=false',
  ].join(' and ')
  const found = await drive<{ files: { id: string; name: string; mimeType: string }[] }>(
    token,
    `files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)`,
  )
  return found.files[0]
}

/** 1×1 png. 색만 바꿔서 여러 번 올리면 변경 이력이 쌓인다. */
function pngBytes(seed: number): Buffer {
  const base =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  const buf = Buffer.from(base, 'base64')
  // 픽셀 데이터 근처 한 바이트만 흔들어 내용이 달라지게 한다.
  buf[buf.length - 10] = (buf[buf.length - 10] + seed) % 256
  return buf
}

async function uploadMedia(
  token: string,
  fileId: string,
  body: Buffer | string,
  contentType: string,
) {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
      body: body as BodyInit,
    },
  )
  if (!res.ok) die(`업로드 실패 (${res.status}): ${await res.text()}`)
}

async function clean(token: string, rootId: string) {
  console.log('\n더미 자료를 걷어냅니다.\n')

  const folders = await drive<{ files: { id: string; name: string }[] }>(
    token,
    `files?q=${encodeURIComponent(`'${rootId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id,name)`,
  )

  for (const seed of SEEDS) {
    const dept = folders.files.find(f => f.name === seed.department)
    if (!dept) continue
    const cats = await drive<{ files: { id: string; name: string }[] }>(
      token,
      `files?q=${encodeURIComponent(`'${dept.id}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id,name)`,
    )
    const cat = cats.files.find(f => f.name === seed.category)
    if (!cat) continue

    const file = await findChild(token, cat.id, seed.name)
    if (!file) continue

    await supabase(`event_files?drive_file_id=eq.${file.id}`, { method: 'DELETE' })
    await drive(token, `files/${file.id}`, { method: 'DELETE' })
    console.log(`  지움  ${seed.department}/${seed.category}/${seed.name}`)
  }

  console.log('\n완료. 게시글 자체는 건드리지 않았습니다.\n')
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    die('.env.local 에 구글 드라이브 설정이 필요합니다. npm run setup:drive 를 먼저 실행하세요.')
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    die('.env.local 에 SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  }

  const token = await getAccessToken()

  if (process.argv.includes('--clean')) {
    await clean(token, ROOT_FOLDER_ID)
    return
  }

  console.log('\n저장소에 더미 파일을 올립니다.\n')

  const departments = await drive<{ files: { id: string; name: string }[] }>(
    token,
    `files?q=${encodeURIComponent(`'${ROOT_FOLDER_ID}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id,name)`,
  )

  // 부서 이름 → 이 부서에 올린 파일들
  const uploaded = new Map<string, { id: string; name: string; mimeType: string; size: number }[]>()

  for (const seed of SEEDS) {
    const dept = departments.files.find(f => f.name === seed.department)
    if (!dept) {
      console.log(`  건너뜀  부서 폴더 없음: ${seed.department}`)
      continue
    }

    const cats = await drive<{ files: { id: string; name: string }[] }>(
      token,
      `files?q=${encodeURIComponent(`'${dept.id}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id,name)`,
    )
    const cat = cats.files.find(f => f.name === seed.category)
    if (!cat) {
      console.log(`  건너뜀  카테고리 폴더 없음: ${seed.department}/${seed.category}`)
      continue
    }

    let file = await findChild(token, cat.id, seed.name)
    let note = '이미 있음'

    if (!file) {
      if (seed.kind === 'doc' || seed.kind === 'sheet') {
        file = await drive<{ id: string; name: string; mimeType: string }>(
          token,
          'files?fields=id,name,mimeType',
          {
            method: 'POST',
            body: JSON.stringify({
              name: seed.name,
              mimeType: seed.kind === 'doc' ? GDOC : GSHEET,
              parents: [cat.id],
            }),
          },
        )
      } else {
        file = await drive<{ id: string; name: string; mimeType: string }>(
          token,
          'files?fields=id,name,mimeType',
          {
            method: 'POST',
            body: JSON.stringify({
              name: seed.name,
              mimeType: seed.kind === 'png' ? 'image/png' : 'text/plain',
              parents: [cat.id],
            }),
          },
        )
        await uploadMedia(
          token,
          file.id,
          seed.kind === 'png' ? pngBytes(0) : (seed.text ?? ''),
          seed.kind === 'png' ? 'image/png' : 'text/plain; charset=utf-8',
        )
      }
      note = '만듦'

      // 변경 이력을 만들려고 같은 파일을 몇 번 덮어쓴다.
      for (let i = 1; i <= (seed.revisions ?? 0); i++) {
        await uploadMedia(token, file.id, pngBytes(i * 40), 'image/png')
        note += `, 리비전 +${i}`
      }
    }

    const meta = await drive<{ id: string; name: string; mimeType: string; size?: string }>(
      token,
      `files/${file.id}?fields=id,name,mimeType,size`,
    )

    const list = uploaded.get(seed.department) ?? []
    list.push({
      id: meta.id,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size ? Number(meta.size) : 0,
    })
    uploaded.set(seed.department, list)

    console.log(`  ${note.padEnd(22)} ${seed.department}/${seed.category}/${seed.name}`)
  }

  console.log('\n이미 등록된 글에 부서가 맞는 파일을 묶습니다.\n')

  const events = await supabase<
    { id: string; title: string; department: string; event_files: { drive_file_id: string }[] }[]
  >('events?select=id,title,department,event_files(drive_file_id)&order=created_at.asc')

  for (const event of events) {
    const candidates = uploaded.get(event.department) ?? []
    if (candidates.length === 0) continue

    const already = new Set(event.event_files.map(f => f.drive_file_id))
    const toLink = candidates.filter(f => !already.has(f.id))
    if (toLink.length === 0) {
      console.log(`  건너뜀  ${event.title} (이미 묶여 있음)`)
      continue
    }

    await supabase('event_files', {
      method: 'POST',
      body: JSON.stringify(
        toLink.map(f => ({
          event_id: event.id,
          drive_file_id: f.id,
          name: f.name,
          mime_type: f.mimeType,
          size: f.size,
        })),
      ),
    })
    console.log(`  묶음    ${event.title} ← ${toLink.length}건`)
  }

  console.log('\n완료. 되돌리려면 npm run seed:demo -- --clean\n')
}

main()
