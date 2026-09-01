'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EVENT_STATUSES, STATUS_LABEL } from '@/lib/events'
import { getFileType, formatFileSize } from '@/lib/file-utils'
import FileIcon from '@/components/ui/FileIcon'
import type { FileItem, FolderItem } from '@/lib/types'

type Props = {
  departments: FolderItem[]
  folders: FolderItem[]
  files: FileItem[]
  action: (formData: FormData) => void
}

const LABEL = 'text-xs font-medium text-zinc-600 mb-1.5 block'
const INPUT =
  'w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:border-indigo-400 transition-colors'

export default function EventForm({ departments, folders, files, action }: Props) {
  const [selected, setSelected] = useState<FileItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filter, setFilter] = useState('')

  function toggle(file: FileItem) {
    setSelected(prev =>
      prev.some(f => f.id === file.id) ? prev.filter(f => f.id !== file.id) : [...prev, file],
    )
  }

  const visible = filter.trim()
    ? files.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    : files

  const folderName = (id: string) => folders.find(f => f.id === id)?.name ?? ''

  const payload = JSON.stringify(
    selected.map(f => ({
      drive_file_id: f.id,
      name: f.name,
      mime_type: f.mimeType,
      size: f.size,
    })),
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="files" value={payload} />

      <div>
        <label className={LABEL} htmlFor="title">
          행사 이름 <span className="text-red-400">*</span>
        </label>
        <input id="title" name="title" required className={INPUT} placeholder="예) 2026 여름 수련회" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL} htmlFor="department">
            부서 <span className="text-red-400">*</span>
          </label>
          <select id="department" name="department" required className={INPUT} defaultValue="">
            <option value="" disabled>
              부서 선택
            </option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor="status">
            진행 상태
          </label>
          <select id="status" name="status" className={INPUT} defaultValue="planned">
            {EVENT_STATUSES.map(s => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor="event_date">
            행사 날짜
          </label>
          <input id="event_date" name="event_date" type="date" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="author">
          작성자 <span className="text-red-400">*</span>
        </label>
        <input id="author" name="author" required className={INPUT} placeholder="이름" />
      </div>

      <div>
        <label className={LABEL} htmlFor="body">
          내용
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:border-indigo-400 transition-colors resize-y"
          placeholder="행사 개요, 준비 사항, 결과 등을 자유롭게 적으세요."
        />
      </div>

      {/* 첨부 — 드라이브에 이미 있는 파일을 묶는다 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={LABEL}>첨부 자료</span>
          <button
            type="button"
            onClick={() => setPickerOpen(v => !v)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {pickerOpen ? '닫기' : '드라이브에서 고르기'}
          </button>
        </div>

        {selected.length === 0 ? (
          <p className="text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-lg px-3 py-4 text-center">
            아직 묶인 자료가 없습니다.
          </p>
        ) : (
          <ul className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
            {selected.map(f => (
              <li key={f.id} className="flex items-center gap-2.5 px-3 py-2">
                <FileIcon type={getFileType(f.mimeType)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 truncate">{f.name}</p>
                  <p className="text-xs text-zinc-400">
                    {folderName(f.folderId)} · {formatFileSize(f.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(f)}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        )}

        {pickerOpen && (
          <div className="mt-2 border border-zinc-200 rounded-lg overflow-hidden">
            <div className="p-2 border-b border-zinc-100 bg-zinc-50">
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="파일 이름으로 좁히기"
                className="w-full h-8 px-2.5 text-sm bg-white border border-zinc-200 rounded-md focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {visible.length === 0 ? (
                <p className="text-sm text-zinc-400 px-3 py-6 text-center">
                  드라이브에 파일이 없습니다.
                </p>
              ) : (
                visible.map(f => {
                  const checked = selected.some(s => s.id === f.id)
                  return (
                    <label
                      key={f.id}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(f)}
                        className="accent-indigo-600"
                      />
                      <FileIcon type={getFileType(f.mimeType)} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-800 truncate">{f.name}</p>
                        <p className="text-xs text-zinc-400">{folderName(f.folderId)}</p>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href="/events"
          className="px-4 h-9 inline-flex items-center text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          취소
        </Link>
        <button
          type="submit"
          className="px-4 h-9 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          등록
        </button>
      </div>
    </form>
  )
}
