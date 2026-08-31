type DriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
}

async function getFiles(): Promise<DriveFile[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/drive`, { cache: 'no-store' })
  const json = await res.json()
  return json.files ?? []
}

function mimeLabel(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') return '📁'
  if (mimeType.includes('presentation')) return '📊'
  if (mimeType.includes('document')) return '📄'
  if (mimeType.includes('spreadsheet')) return '📋'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('image')) return '🖼'
  if (mimeType.includes('video')) return '🎬'
  return '📎'
}

export default async function DrivePage() {
  const files = await getFiles()

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-6">구글 드라이브 파일 목록</h1>
      {files.length === 0 ? (
        <p className="text-zinc-500">파일이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {files.map((f) => (
            <li key={f.id} className="py-3 flex items-start gap-3">
              <span className="text-xl">{mimeLabel(f.mimeType)}</span>
              <div>
                <p className="font-medium">{f.name}</p>
                <p className="text-sm text-zinc-400">{f.modifiedTime.slice(0, 10)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
