/**
 * 드라이브 연결 확인용 1회성 스크립트
 *
 *   npm run test:drive
 *
 * 하는 일
 *   1. refresh token 으로 access token 을 갱신한다
 *   2. 드라이브 루트의 파일 목록을 최대 10개 출력한다
 *   3. DRIVE_ROOT_FOLDER_ID 폴더 안 파일도 함께 출력한다
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID

function die(msg: string): never {
  console.error(`\n✗ ${msg}\n`)
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
  if (!res.ok) die(`토큰 갱신 실패: ${json.error_description ?? res.status}`)
  return json.access_token!
}

async function listFiles(
  accessToken: string,
  query: string,
  label: string,
): Promise<void> {
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,modifiedTime)',
    pageSize: '10',
    orderBy: 'modifiedTime desc',
  })
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json()) as {
    files?: { id: string; name: string; mimeType: string; modifiedTime: string }[]
    error?: { message: string }
  }

  if (!res.ok) die(`파일 목록 조회 실패: ${json.error?.message ?? res.status}`)

  const files = json.files ?? []
  console.log(`\n── ${label} (${files.length}건) ──`)
  if (files.length === 0) {
    console.log('  (파일 없음)')
  } else {
    for (const f of files) {
      console.log(`  [${f.modifiedTime.slice(0, 10)}] ${f.name}`)
      console.log(`         id=${f.id}  type=${f.mimeType}`)
    }
  }
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) die('.env.local 에 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 없음')
  if (!REFRESH_TOKEN) die('.env.local 에 GOOGLE_REFRESH_TOKEN 없음 — npm run setup:drive 를 먼저 실행하세요')

  console.log('access token 갱신 중...')
  const token = await getAccessToken()
  console.log('✓ 토큰 갱신 완료')

  // 드라이브 전체에서 최근 파일 10개
  await listFiles(token, "trashed=false", '드라이브 전체 최근 파일')

  // 앱 루트 폴더 안 파일
  if (ROOT_FOLDER_ID) {
    await listFiles(
      token,
      `'${ROOT_FOLDER_ID}' in parents and trashed=false`,
      `앱 루트 폴더(${ROOT_FOLDER_ID}) 안 파일`,
    )
  } else {
    console.log('\n⚠ DRIVE_ROOT_FOLDER_ID 없음 — 루트 폴더 조회 생략')
  }

  console.log('\n✓ 테스트 완료\n')
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)))
