'use client'

import { useState, useRef } from 'react'
import { useFolderCtx } from '@/lib/folder-context'
import { getChildren } from '@/lib/folder-utils'

type Props = {
  onClose: () => void
}

export default function UploadDialog({ onClose }: Props) {
  const { folders, rootId } = useFolderCtx()
  const departments = getChildren(folders, rootId)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [department, setDepartment] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setFiles(prev => [...prev, ...Array.from(e.target.files!)])
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">자료 업로드</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-indigo-400 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <svg className="mx-auto mb-3 text-zinc-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-zinc-600">파일을 드래그하거나 클릭하여 선택</p>
            <p className="text-xs text-zinc-400 mt-1">여러 파일 선택 가능</p>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-800 font-medium truncate">{f.name}</p>
                    <p className="text-xs text-zinc-400">{formatSize(f.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1.5 block">부서 <span className="text-red-400">*</span></label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:border-indigo-400 transition-colors"
              >
                <option value="">부서 선택</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1.5 block">태그</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="쉼표로 구분 (예: 주보, 예배)"
                className="w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-indigo-400 placeholder:text-zinc-300 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1.5 block">설명</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="파일에 대한 간단한 설명 (선택)"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:border-indigo-400 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 h-9 text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
          >
            취소
          </button>
          <button
            disabled={files.length === 0 || !department}
            className="px-5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            업로드
          </button>
        </div>
      </div>
    </div>
  )
}
