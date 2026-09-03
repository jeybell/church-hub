/**
 * 화면이 쓰는 자료 모델.
 *
 * 게시글은 Supabase 에, 파일은 구글 드라이브에 있다. 두 곳을 컴포넌트가 각각
 * 알게 두면 UI 가 백엔드 두 개에 동시에 묶인다. 여기서 한 번 합쳐서 내려보내고,
 * 컴포넌트는 이 타입만 안다.
 *
 * 드라이브라는 말은 이 파일 밖으로 나가지 않는다. 사용자는 자료실을 쓰는 것이지
 * 드라이브를 쓰는 게 아니다.
 */

import type { DriveTree } from './drive'
import type { EventPost } from './events'
import type { FileType, FolderItem } from './types'
import { getFileType, formatFileSize } from './file-utils'

export type AttachmentVM = {
  id: string
  /** 다운로드 링크와 변경 이력 조회에만 쓴다. 화면에 드러내지 않는다. */
  fileId: string
  name: string
  type: FileType
  mimeType: string
  size: number
  sizeLabel: string
  /** "예배부 / 주보" — 자료가 놓인 자리 */
  location: string | null
  updatedAt: string | null
  /**
   * 현재 버전. 세려면 저장소에 파일마다 물어봐야 해서 목록에서는 비워 둔다.
   * 상세 화면이 withVersions 로 채운다.
   */
  version: number | null
}

export type PostVM = {
  id: string
  title: string
  body: string
  department: string
  /** 글에 저장된 카테고리. 없으면 첨부가 놓인 폴더에서 유추한다. */
  category: string | null
  author: string
  createdAt: string
  updatedAt: string
  eventDate: string | null
  tags: string[]
  attachments: AttachmentVM[]
}

/** 부서 = 루트 바로 아래 폴더, 카테고리 = 그 아래 폴더. */
export type Department = {
  name: string
  categories: string[]
}

function parentOf(folders: FolderItem[], id: string | null): FolderItem | undefined {
  return id ? folders.find(f => f.id === id) : undefined
}

/**
 * 드라이브 폴더 구조를 부서/카테고리 목록으로 바꾼다.
 * 루트 = 자료실, 1단계 = 부서, 2단계 = 카테고리로 약속되어 있다.
 */
export function getDepartments(tree: DriveTree | null): Department[] {
  if (!tree) return []
  return tree.folders
    .filter(f => f.parentId === tree.root.id)
    .map(dept => ({
      name: dept.name,
      categories: tree.folders.filter(f => f.parentId === dept.id).map(f => f.name),
    }))
}

export function toPostVM(event: EventPost, tree: DriveTree | null): PostVM {
  const folders = tree?.folders ?? []
  const rootId = tree?.root.id ?? null

  const attachments: AttachmentVM[] = event.event_files.map(f => {
    const driveFile = tree?.files.find(df => df.id === f.drive_file_id)
    const folder = driveFile ? folders.find(x => x.id === driveFile.folderId) : undefined
    const parent = parentOf(folders, folder?.parentId ?? null)

    // 파일이 카테고리 폴더에 있으면 "부서 / 카테고리", 부서 폴더 바로 밑이면 부서만.
    const location = !folder
      ? null
      : folder.id === rootId
        ? null
        : parent && parent.id !== rootId
          ? `${parent.name} / ${folder.name}`
          : folder.name

    return {
      id: f.id,
      fileId: f.drive_file_id,
      name: f.name,
      type: getFileType(f.mime_type),
      mimeType: f.mime_type,
      size: f.size,
      sizeLabel: formatFileSize(f.size),
      location,
      updatedAt: driveFile?.updatedAt ?? null,
      version: null,
    }
  })

  return {
    id: event.id,
    title: event.title,
    body: event.body,
    department: event.department,
    category: event.category ?? deriveCategory(event, tree),
    author: event.author,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    eventDate: event.event_date,
    tags: deriveTags(event, tree),
    attachments,
  }
}

/**
 * 카테고리를 저장하기 전에 쓴 글을 위한 대비책.
 *
 * 첨부가 어느 폴더에 들어있는지로 유추한다. 자료를 "예배부 / 주보" 에 올렸다면
 * 그 글의 카테고리는 주보다. 다만 한 글에 여러 폴더의 파일이 붙으면 첫 번째
 * 것 하나로만 잡힌다 — 이 한계 때문에 category 컬럼을 따로 두게 됐다.
 * 새 글은 글에 저장된 값을 쓰므로 여기까지 오지 않는다.
 */
function deriveCategory(event: EventPost, tree: DriveTree | null): string | null {
  if (!tree) return null

  for (const f of event.event_files) {
    const driveFile = tree.files.find(df => df.id === f.drive_file_id)
    if (!driveFile) continue

    const folder = tree.folders.find(x => x.id === driveFile.folderId)
    if (!folder || folder.id === tree.root.id) continue

    // 부서 폴더 자체는 카테고리가 아니다.
    if (folder.parentId === tree.root.id) continue

    return folder.name
  }

  return null
}

/** 태그도 게시글에는 없다. 첨부 파일에 달린 태그를 모아서 보여준다. */
function deriveTags(event: EventPost, tree: DriveTree | null): string[] {
  if (!tree) return []

  const tags = new Set<string>()
  for (const f of event.event_files) {
    const driveFile = tree.files.find(df => df.id === f.drive_file_id)
    driveFile?.tags.forEach(t => tags.add(t))
  }
  return [...tags]
}

/**
 * 검색. 제목·본문·작성자에 더해 첨부 파일명과 태그까지 훑는다.
 *
 * 파일명과 태그는 드라이브에서 온 값이라 DB 질의로는 걸를 수 없다. 그래서
 * 검색 전체를 여기서 한 번에 처리한다. 자료실 규모에서는 안전하고, 데이터가
 * 커지면 검색용 뷰나 컬럼으로 옮기면 된다.
 */
export function matchesQuery(post: PostVM, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  return (
    post.title.toLowerCase().includes(q) ||
    post.body.toLowerCase().includes(q) ||
    post.author.toLowerCase().includes(q) ||
    post.attachments.some(a => a.name.toLowerCase().includes(q)) ||
    post.tags.some(t => t.toLowerCase().includes(q))
  )
}

/** 연도 칩. 자료가 어느 해에 몰려 있는지 보여준다. 행사일이 없으면 등록일을 쓴다. */
export function countByYear(posts: PostVM[]): { year: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of posts) {
    const year = p.eventDate?.slice(0, 4) ?? p.createdAt.slice(0, 4)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year))
}

/** 연도 필터. 행사일 기준이고, 행사일이 없으면 등록일로 본다. */
export function matchesYear(post: PostVM, year: string): boolean {
  return (post.eventDate?.slice(0, 4) ?? post.createdAt.slice(0, 4)) === year
}

/** 자료를 등록할 때 고를 수 있는 파일. 저장소에 이미 올라와 있는 것들이다. */
export type PickableFile = {
  id: string
  name: string
  type: FileType
  size: number
  sizeLabel: string
  mimeType: string
  department: string | null
  category: string | null
  /** "예배부 / 주보" — 묶어서 보여줄 때 쓰는 표시용 경로 */
  location: string
}

export function getPickableFiles(tree: DriveTree | null): PickableFile[] {
  if (!tree) return []

  return tree.files.map(f => {
    const folder = tree.folders.find(x => x.id === f.folderId)
    const parent = parentOf(tree.folders, folder?.parentId ?? null)

    // 루트 = 자료실, 1단계 = 부서, 2단계 = 카테고리.
    const isDept = folder ? folder.parentId === tree.root.id : false
    const department = !folder || folder.id === tree.root.id ? null : isDept ? folder.name : (parent?.name ?? null)
    const category = folder && !isDept && folder.id !== tree.root.id ? folder.name : null

    return {
      id: f.id,
      name: f.name,
      type: getFileType(f.mimeType),
      size: f.size,
      sizeLabel: formatFileSize(f.size),
      mimeType: f.mimeType,
      department,
      category,
      location: [department, category].filter(Boolean).join(' / ') || '자료실',
    }
  })
}

/**
 * 폼이 서버로 보낼 첨부 목록.
 * 저장소 식별자 이름(drive_file_id)이 화면 코드로 새어나가지 않게 여기서 만든다.
 */
export function toAttachmentPayload(files: PickableFile[]) {
  return files.map(f => ({
    drive_file_id: f.id,
    name: f.name,
    mime_type: f.mimeType,
    size: f.size,
  }))
}

/**
 * 이미 글에 묶여 있는 첨부를 수정 화면의 선택 목록 형태로 되돌린다.
 *
 * 저장소에서 사라진 파일은 고를 수 있는 목록에 없다. 그걸 그냥 빼면 글을
 * 수정하는 것만으로 첨부가 소리 없이 사라지므로, 글이 들고 있던 값으로 되살린다.
 */
export function attachmentToPickable(file: AttachmentVM): PickableFile {
  const [department = null, category = null] = (file.location ?? '').split(' / ')

  return {
    id: file.fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    sizeLabel: file.sizeLabel,
    mimeType: file.mimeType,
    department,
    category,
    location: file.location ?? '자료실',
  }
}
