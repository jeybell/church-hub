'use client'

import FileListItem from './FileListItem'
import EmptyState from '@/components/ui/EmptyState'
import type { FileItem, FolderItem } from '@/lib/types'
import { useFolderCtx } from '@/lib/folder-context'

type Action = 'preview' | 'download' | 'favorite' | 'rename' | 'move' | 'delete'

type Props = {
  folders: FolderItem[]
  folderCounts: Record<string, number>
  files: FileItem[]
  selectedId: string | null
  searchQuery: string
  onSelect: (file: FileItem) => void
  onAction: (file: FileItem, action: Action) => void
}

function FolderRow({ folder, itemCount }: {
  folder: FolderItem
  itemCount: number
}) {
  const { navigate } = useFolderCtx()

  return (
    <div
      onDoubleClick={() => navigate(folder.id)}
      onClick={() => navigate(folder.id)}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0 group"
    >
      {/* Folder icon */}
      <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 12h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{folder.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {itemCount === 0 ? '비어 있음' : `항목 ${itemCount}개`}
        </p>
      </div>

      {/* Right chevron */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="text-zinc-300 group-hover:text-zinc-400 transition-colors flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )
}

export default function FileList({ folders, folderCounts, files, selectedId, searchQuery, onSelect, onAction }: Props) {

  if (searchQuery.trim()) {
    // Search mode: flat list of matching files across all folders
    const filtered = files.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    if (filtered.length === 0) {
      return <EmptyState title={`'${searchQuery}'에 대한 검색 결과가 없습니다.`} description="다른 검색어를 시도해보세요." />
    }
    return (
      <div>
        <ColumnHeader />
        {filtered.map(file => (
          <FileListItem key={file.id} file={file} selected={file.id === selectedId}
            onClick={() => onSelect(file)} onAction={onAction} />
        ))}
      </div>
    )
  }

  const isEmpty = folders.length === 0 && files.length === 0
  if (isEmpty) {
    return <EmptyState title="아직 등록된 자료가 없습니다." description="자료 업로드 버튼을 눌러 첫 번째 파일을 추가하세요." />
  }

  return (
    <div>
      <ColumnHeader />
      {/* Folders first */}
      {folders.map(folder => (
        <FolderRow key={folder.id} folder={folder} itemCount={folderCounts[folder.id] ?? 0} />
      ))}
      {/* Then files */}
      {files.map(file => (
        <FileListItem key={file.id} file={file} selected={file.id === selectedId}
          onClick={() => onSelect(file)} onAction={onAction} />
      ))}
    </div>
  )
}

function ColumnHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-200 bg-zinc-50">
      <div className="w-10 flex-shrink-0" />
      <div className="flex-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">이름</div>
      <div className="hidden lg:block w-20 flex-shrink-0 text-xs font-medium text-zinc-400 uppercase tracking-wide">등록자</div>
      <div className="hidden md:block w-20 flex-shrink-0 text-xs font-medium text-zinc-400 uppercase tracking-wide text-right">크기</div>
      <div className="hidden md:block w-20 flex-shrink-0 text-xs font-medium text-zinc-400 uppercase tracking-wide text-right">수정일</div>
      <div className="w-7 flex-shrink-0" />
    </div>
  )
}
