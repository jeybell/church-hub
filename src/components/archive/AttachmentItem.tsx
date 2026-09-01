'use client'

import { useState } from 'react'
import FileIcon from '@/components/ui/FileIcon'
import VersionHistory from './VersionHistory'
import { getFileTypeLabel } from '@/lib/file-utils'
import type { AttachmentVM } from '@/lib/post-view'

/**
 * 첨부 한 줄.
 *
 * 큰 카드로 만들지 않는다. 첨부가 여덟 개인 자료도 있어서, 줄이 낮아야 한 눈에
 * 다 들어온다. 이력은 이 줄 아래에서 펼쳐지므로 어느 파일 이력인지 헷갈리지 않는다.
 */
export default function AttachmentItem({ file }: { file: AttachmentVM }) {
  const [open, setOpen] = useState(false)

  return (
    <li>
      <div className="group flex items-center gap-3 px-4 py-2.5">
        <FileIcon type={file.type} size="sm" variant="muted" />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-900 truncate">{file.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {getFileTypeLabel(file.type)}
            {file.size > 0 && ` · ${file.sizeLabel}`}
            {file.version && ` · v${file.version}`}
            {file.location && ` · ${file.location}`}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href={`https://drive.google.com/file/d/${file.fileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 inline-flex items-center text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            열기
          </a>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            className={`h-7 px-2 inline-flex items-center gap-1 text-xs rounded transition-colors ${
              open ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            이력
            <svg
              width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3"
              className={`transition-transform ${open ? 'rotate-90' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {open && <VersionHistory fileId={file.fileId} />}
    </li>
  )
}
