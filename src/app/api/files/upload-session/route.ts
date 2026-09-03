import { createDriveUploadSession, getDriveTree } from '@/lib/drive'

type UploadRequest = {
  name?: unknown
  mimeType?: unknown
  size?: unknown
  folderId?: unknown
  tags?: unknown
  description?: unknown
}

const MAX_NAME_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 5_000
const MAX_TAGS_LENGTH = 1_000

export async function POST(request: Request) {
  let body: UploadRequest
  try {
    body = (await request.json()) as UploadRequest
  } catch {
    return Response.json({ error: '업로드 정보가 올바르지 않습니다.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const mimeType =
    typeof body.mimeType === 'string' && body.mimeType
      ? body.mimeType
      : 'application/octet-stream'
  const size = typeof body.size === 'number' ? body.size : Number.NaN
  const folderId = typeof body.folderId === 'string' ? body.folderId : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean)
    : []

  if (!name || name.length > MAX_NAME_LENGTH) {
    return Response.json({ error: '파일 이름이 없거나 너무 깁니다.' }, { status: 400 })
  }
  if (!Number.isSafeInteger(size) || size <= 0) {
    return Response.json({ error: '빈 파일은 업로드할 수 없습니다.' }, { status: 400 })
  }
  if (description.length > MAX_DESCRIPTION_LENGTH || tags.join(',').length > MAX_TAGS_LENGTH) {
    return Response.json({ error: '설명 또는 태그가 너무 깁니다.' }, { status: 400 })
  }

  const { tree, error } = await getDriveTree()
  if (!tree) {
    return Response.json({ error: error ?? '자료 저장소를 열지 못했습니다.' }, { status: 502 })
  }
  if (!tree.folders.some(folder => folder.id === folderId && folder.id !== tree.root.id)) {
    return Response.json({ error: '자료실에 없는 폴더입니다.' }, { status: 400 })
  }

  try {
    const uploadUrl = await createDriveUploadSession({
      name,
      mimeType,
      size,
      folderId,
      tags,
      description: description || undefined,
    })
    return Response.json({ uploadUrl })
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    )
  }
}
