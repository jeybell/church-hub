/**
 * 구글 드라이브 조회 (서버 전용)
 *
 * refresh token 은 서버 환경변수에만 있으므로 클라이언트 컴포넌트에서
 * 이 모듈을 import 하면 안 된다. 서버 컴포넌트나 라우트 핸들러에서만 쓴다.
 */

export type DriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const json = (await res.json()) as { access_token?: string }
  if (!res.ok || !json.access_token) throw new Error('토큰 갱신 실패')
  return json.access_token
}

export async function listDriveFiles(): Promise<DriveFile[]> {
  const token = await getAccessToken()

  const params = new URLSearchParams({
    q: 'trashed=false',
    fields: 'files(id,name,mimeType,modifiedTime)',
    pageSize: '20',
    orderBy: 'modifiedTime desc',
  })

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`드라이브 조회 실패 (${res.status})`)

  const json = (await res.json()) as { files?: DriveFile[] }
  return json.files ?? []
}
