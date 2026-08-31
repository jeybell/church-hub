'use client'

import FileCard from './FileCard'
import EmptyState from '@/components/ui/EmptyState'
import type { FileItem } from '@/lib/types'

type Props = {
  files: FileItem[]
  selectedId: string | null
  searchQuery: string
  onSelect: (file: FileItem) => void
}

export default function FileGrid({ files, selectedId, searchQuery, onSelect }: Props) {
  const filtered = searchQuery.trim()
    ? files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : files

  if (filtered.length === 0) {
    return searchQuery
      ? <EmptyState title={`'${searchQuery}'에 대한 검색 결과가 없습니다.`} description="다른 검색어를 시도해보세요." />
      : <EmptyState title="아직 등록된 자료가 없습니다." />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
      {filtered.map(file => (
        <FileCard
          key={file.id}
          file={file}
          selected={file.id === selectedId}
          onClick={() => onSelect(file)}
        />
      ))}
    </div>
  )
}
