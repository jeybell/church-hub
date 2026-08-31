import { listDriveFiles, type DriveFile } from '@/lib/drive'

// 배포 환경에서 빌드 시점에 드라이브를 호출하지 않도록 매 요청마다 렌더한다.
export const dynamic = 'force-dynamic'

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
  let files: DriveFile[] = []
  let error: string | null = null

  try {
    files = await listDriveFiles()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-6">구글 드라이브 파일 목록</h1>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="font-medium text-red-800">드라이브를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <p className="mt-2 text-sm text-red-600">
            환경변수(GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN)를
            확인하세요. refresh token 은 동의 화면이 테스트 상태면 7일 뒤 만료됩니다.
          </p>
        </div>
      ) : files.length === 0 ? (
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
