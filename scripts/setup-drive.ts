/**
 * 1회성 셋업 스크립트.
 *
 *   npm run setup:drive
 *
 * 하는 일
 *   1. 구글 OAuth 동의를 받아 refresh token 을 발급받는다
 *   2. 드라이브에 자료 최상위 폴더를 만든다 (이미 있으면 재사용)
 *   3. 두 값을 .env.local 에 기록한다
 *
 * 왜 폴더를 손으로 만들면 안 되는가
 *   drive.file 스코프는 "이 앱이 만든 파일"에만 접근 권한이 붙는다.
 *   드라이브에서 직접 만든 폴더는 앱에서 보이지 않으므로,
 *   최상위 폴더도 반드시 앱이 만들어야 한다.
 */

import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const PORT = 3000
const REDIRECT_URI = `http://localhost:${PORT}/api/google/callback`
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const ROOT_FOLDER_NAME = '교회행사자료'
const ENV_PATH = '.env.local'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

function die(message: string): never {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

function openBrowser(url: string) {
  const [cmd, args]: [string, string[]] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]]
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
}

/** 브라우저를 띄우고 콜백으로 돌아온 authorization code 를 받는다. */
function waitForCode(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
      if (url.pathname !== '/api/google/callback') {
        res.writeHead(404).end()
        return
      }

      const error = url.searchParams.get('error')
      const code = url.searchParams.get('code')

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(
        `<meta charset="utf-8"><body style="font-family:system-ui;padding:3rem;text-align:center">` +
          (code
            ? `<h2>인증 완료</h2><p>터미널로 돌아가세요.</p>`
            : `<h2>인증 실패</h2><p>${error ?? '알 수 없는 오류'}</p>`) +
          `</body>`,
      )

      server.close()
      if (code) resolve(code)
      else reject(new Error(error ?? '인증이 취소되었습니다'))
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`${PORT}번 포트가 사용 중입니다. 개발 서버를 끄고 다시 실행하세요.`))
      } else {
        reject(err)
      }
    })

    server.listen(PORT, () => {
      console.log('\n브라우저에서 구글 계정을 선택하고 권한을 허용하세요.')
      console.log('창이 열리지 않으면 아래 주소를 직접 여세요.\n')
      console.log(`  ${authUrl}\n`)
      openBrowser(authUrl)
    })
  })
}

async function exchangeCode(code: string): Promise<{ access: string; refresh: string }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  const json = (await res.json()) as {
    access_token?: string
    refresh_token?: string
    error_description?: string
    error?: string
  }

  if (!res.ok) {
    die(`토큰 교환 실패: ${json.error_description ?? json.error ?? res.status}`)
  }
  if (!json.refresh_token) {
    die(
      'refresh token 이 발급되지 않았습니다.\n' +
        '  https://myaccount.google.com/permissions 에서 이 앱의 액세스를 삭제한 뒤 다시 실행하세요.',
    )
  }
  return { access: json.access_token!, refresh: json.refresh_token }
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

/** 최상위 폴더를 찾거나 새로 만든다. */
async function ensureRootFolder(accessToken: string): Promise<{ id: string; created: boolean }> {
  const query = [
    `name='${ROOT_FOLDER_NAME}'`,
    `mimeType='${FOLDER_MIME}'`,
    `'root' in parents`,
    'trashed=false',
  ].join(' and ')

  const found = await drive<{ files: { id: string; name: string }[] }>(
    accessToken,
    `files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
  )

  if (found.files.length > 0) {
    return { id: found.files[0].id, created: false }
  }

  const folder = await drive<{ id: string }>(accessToken, 'files?fields=id', {
    method: 'POST',
    body: JSON.stringify({ name: ROOT_FOLDER_NAME, mimeType: FOLDER_MIME }),
  })
  return { id: folder.id, created: true }
}

/** .env.local 의 키를 갱신한다. 없으면 .env.example 을 바탕으로 만든다. */
async function writeEnv(values: Record<string, string>) {
  let content = ''
  if (existsSync(ENV_PATH)) {
    content = await readFile(ENV_PATH, 'utf8')
  } else if (existsSync('.env.example')) {
    content = await readFile('.env.example', 'utf8')
    console.log(`\n${ENV_PATH} 가 없어 .env.example 을 바탕으로 새로 만듭니다.`)
  }

  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`
    const pattern = new RegExp(`^${key}=.*$`, 'm')
    content = pattern.test(content)
      ? content.replace(pattern, line)
      : `${content.trimEnd()}\n${line}\n`
  }

  await writeFile(ENV_PATH, content, 'utf8')
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    die(
      `${ENV_PATH} 에 GOOGLE_CLIENT_ID 와 GOOGLE_CLIENT_SECRET 를 먼저 채우세요.\n` +
        '  cp .env.example .env.local',
    )
  }

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    })

  const code = await waitForCode(authUrl)
  console.log('인증 코드 수신. 토큰으로 교환합니다...')

  const { access, refresh } = await exchangeCode(code)
  console.log('refresh token 발급 완료.')

  const folder = await ensureRootFolder(access)
  console.log(
    folder.created
      ? `최상위 폴더 '${ROOT_FOLDER_NAME}' 생성 완료.`
      : `기존 폴더 '${ROOT_FOLDER_NAME}' 를 재사용합니다.`,
  )

  const env: Record<string, string> = {
    GOOGLE_REFRESH_TOKEN: refresh,
    DRIVE_ROOT_FOLDER_ID: folder.id,
  }
  if (!process.env.AUTH_SECRET) {
    env.AUTH_SECRET = randomBytes(32).toString('base64')
    console.log('AUTH_SECRET 도 함께 생성했습니다.')
  }

  await writeEnv(env)

  console.log(`\n✓ ${ENV_PATH} 에 기록했습니다.`)
  console.log(`  DRIVE_ROOT_FOLDER_ID=${folder.id}`)
  console.log(`  GOOGLE_REFRESH_TOKEN=${refresh.slice(0, 12)}... (숨김)`)
  console.log('\n다음: 카카오 개발자 앱을 등록하고 AUTH_KAKAO_ID / AUTH_KAKAO_SECRET 를 채우세요.\n')
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)))
