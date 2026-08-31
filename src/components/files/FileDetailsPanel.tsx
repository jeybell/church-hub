'use client'

import FileIcon from '@/components/ui/FileIcon'
import type { FileItem } from '@/lib/types'
import { getFileType, getFileTypeLabel, formatFileSize, formatDate } from '@/lib/file-utils'
import { getFolderName } from '@/lib/folder-utils'
import { MOCK_FOLDERS } from '@/lib/mock-data'

type Props = {
  file: FileItem
  onClose: () => void
}

export default function FileDetailsPanel({ file, onClose }: Props) {
  const type = getFileType(file.mimeType)

  return (
    <aside className="w-72 flex-shrink-0 border-l border-zinc-200 bg-white flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <span className="text-sm font-medium text-zinc-700">파일 정보</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview area */}
      <div className="mx-4 mt-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center aspect-video">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <FileIcon type={type} size="lg" />
          <p className="text-xs text-zinc-400 mt-1">{getFileTypeLabel(type)}</p>
        </div>
      </div>

      {/* File name */}
      <div className="px-4 mt-4">
        <p className="text-sm font-semibold text-zinc-900 leading-snug">{file.name}</p>
      </div>

      {/* Metadata */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        <MetaRow label="형식" value={getFileTypeLabel(type)} />
        <MetaRow label="크기" value={formatFileSize(file.size)} />
        <MetaRow label="위치" value={getFolderName(MOCK_FOLDERS, file.folderId)} />
        <MetaRow label="등록자" value={file.uploadedBy} />
        <MetaRow label="수정일" value={formatDate(file.updatedAt)} />
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">태그</p>
          <div className="flex flex-wrap gap-1.5">
            {file.tags.map(tag => (
              <span key={tag} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {file.description && (
        <div className="px-4 mt-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">설명</p>
          <p className="text-sm text-zinc-600 leading-relaxed">{file.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 mt-6 mb-4 flex flex-col gap-2">
        <button className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          다운로드
        </button>
        <button className="w-full h-9 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-lg transition-colors">
          즐겨찾기
        </button>
      </div>
    </aside>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-zinc-400 flex-shrink-0 w-14">{label}</span>
      <span className="text-xs text-zinc-700 text-right">{value}</span>
    </div>
  )
}
