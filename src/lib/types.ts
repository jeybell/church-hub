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
}

export type ViewMode = 'list' | 'grid'

export type SortField = 'name' | 'updatedAt' | 'size'
export type SortDir = 'asc' | 'desc'
