import { listDriveFiles } from '@/lib/drive'

export async function GET() {
  try {
    return Response.json({ files: await listDriveFiles() })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
