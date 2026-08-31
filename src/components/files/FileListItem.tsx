'use client'

import { useState, useRef, useEffect } from 'react'
import FileIcon from '@/components/ui/FileIcon'
import type { FileItem } from '@/lib/types'
import { getFileType, formatFileSize, formatDate } from '@/lib/file-utils'

type Action = 'preview' | 'download' | 'favorite' | 'rename' | 'move' | 'delete'

type Props = {
  file: FileItem
  selected: boolean
  onClick: () => void
  onAction: (file: FileItem, action: Action) => void
}

const ACTIONS: { key: Action; label: string }[] = [
  { key: 'preview', label: '미리보기' },
  { key: 'download', label: '다운로드' },
  { key: 'favorite', label: '즐겨찾기' },
  { key: 'rename', label: '이름 변경' },
  { key: 'move', label: '이동' },
  { key: 'delete', label: '삭제' },
]

export default function FileListItem({ file, selected, onClick, onAction }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const type = getFileType(file.mimeType)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-zinc-100 last:border-b-0 ${
        selected ? 'bg-indigo-50/60' : 'hover:bg-zinc-50'
      }`}
    >
      <FileIcon type={type} size="md" />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5 lg:hidden">{formatDate(file.updatedAt)}</p>
      </div>

      {/* Uploader */}
      <div className="hidden lg:block w-20 flex-shrink-0 text-sm text-zinc-500 truncate">
        {file.uploadedBy}
      </div>

      {/* Size */}
      <div className="hidden md:block w-20 flex-shrink-0 text-sm text-zinc-400 text-right">
        {formatFileSize(file.size)}
      </div>

      {/* Date */}
      <div className="hidden md:block w-20 flex-shrink-0 text-sm text-zinc-400 text-right">
        {formatDate(file.updatedAt)}
      </div>

      {/* Star */}
      {file.starred && (
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      )}

      {/* Action menu */}
      <div
        ref={menuRef}
        className="relative flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(p => !p)}
          className={`w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors ${
            menuOpen ? 'opacity-100 bg-zinc-200 text-zinc-700' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-zinc-200 rounded-lg shadow-md py-1 overflow-hidden">
            {ACTIONS.map(action => (
              <button
                key={action.key}
                onClick={() => { onAction(file, action.key); setMenuOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  action.key === 'delete'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
