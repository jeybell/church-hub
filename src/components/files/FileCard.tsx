'use client'

import FileIcon from '@/components/ui/FileIcon'
import type { FileItem } from '@/lib/types'
import { getFileType, formatFileSize, formatDate } from '@/lib/file-utils'

type Props = {
  file: FileItem
  selected: boolean
  onClick: () => void
}

export default function FileCard({ file, selected, onClick }: Props) {
  const type = getFileType(file.mimeType)

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-indigo-300 bg-indigo-50/60 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm bg-white'
      }`}
    >
      {file.starred && (
        <svg className="absolute top-3 right-3 w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      )}

      <FileIcon type={type} size="lg" />

      <p className="mt-3 text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">{file.name}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">{file.department}</span>
        <span className="text-xs text-zinc-400">{formatFileSize(file.size)}</span>
      </div>

      <p className="mt-1.5 text-xs text-zinc-400">{formatDate(file.updatedAt)}</p>
    </div>
  )
}
