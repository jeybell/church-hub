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

export async function GET() {
  try {
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
    const json = await res.json()

    return Response.json(json)
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
