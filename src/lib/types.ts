export type FileType =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'zip'
  | 'folder'
  | 'other'

export type FolderItem = {
  id: string
  name: string
  parentId: string | null
}

export type FileItem = {
  id: string
  name: string
  mimeType: string
  size: number
  folderId: string
  uploadedBy: string
  updatedAt: string
  starred: boolean
  tags: string[]
  description?: string
  /** 드라이브가 매기는 리비전 번호. 이름 변경 같은 메타데이터 수정에도 오른다. */
  version?: number
}

export type ViewMode = 'list' | 'grid'

export type SortField = 'name' | 'updatedAt' | 'size'
export type SortDir = 'asc' | 'desc'
