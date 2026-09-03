'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFolderCtx } from '@/lib/folder-context'
import { getChildren } from '@/lib/folder-utils'

type Props = { onClose: () => void }
type FileProgress = {
  status: 'waiting' | 'uploading' | 'done' | 'error'
  percent: number
}

function initialFolders(
  folders: ReturnType<typeof useFolderCtx>['folders'],
  rootId: string,
  currentFolderId: string,
) {
  const current = folders.find(folder => folder.id === currentFolderId)
  if (!current || current.id === rootId) return { department: '', category: '' }
  if (current.parentId === rootId) return { department: current.id, category: '' }

  const parent = folders.find(folder => folder.id === current.parentId)
  return parent?.parentId === rootId
    ? { department: parent.id, category: current.id }
    : { department: '', category: '' }
}

async function errorMessage(response: Response): Promise<string> {
  const json = (await response.json().catch(() => null)) as { error?: string } | null
  return json?.error ?? `업로드 요청에 실패했습니다. (${response.status})`
}

function uploadFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('Content-Range', `bytes 0-${file.size - 1}/${file.size}`)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onerror = () => reject(new Error('네트워크 연결이 끊겼습니다.'))
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) resolve()
      else reject(new Error(`Drive 업로드에 실패했습니다. (${xhr.status})`))
    }
    xhr.send(file)
  })
}

export default function UploadDialog({ onClose }: Props) {
  const router = useRouter()
  const { folders, rootId, currentFolderId } = useFolderCtx()
  const departments = getChildren(folders, rootId)
  const initial = initialFolders(folders, rootId, currentFolderId)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<FileProgress[]>([])
  const [department, setDepartment] = useState(initial.department)
  const [category, setCategory] = useState(initial.category)
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const categories = department ? getChildren(folders, department) : []

  function addFiles(incoming: File[]) {
    const nonEmpty = incoming.filter(file => file.size > 0)
    setFiles(prev => {
      const seen = new Set(prev.map(file => `${file.name}:${file.size}:${file.lastModified}`))
      return [...prev, ...nonEmpty.filter(file => !seen.has(`${file.name}:${file.size}:${file.lastModified}`))]
    })
    setError(incoming.length !== nonEmpty.length ? '빈 파일은 제외했습니다.' : null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function updateProgress(index: number, next: Partial<FileProgress>) {
    setProgress(prev => prev.map((item, i) => (i === index ? { ...item, ...next } : item)))
  }

  async function handleUpload() {
    const folderId = category || department
    if (files.length === 0 || !folderId || uploading) return

    setUploading(true)
    setError(null)
    setProgress(files.map(() => ({ status: 'waiting', percent: 0 })))
    const normalizedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean)

    try {
      // 한꺼번에 너무 많은 세션을 열지 않고 한 파일씩 확실히 완료한다.
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        updateProgress(index, { status: 'uploading', percent: 0 })

        const response = await fetch('/api/files/upload-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            folderId,
            tags: normalizedTags,
            description,
          }),
        })
        if (!response.ok) throw new Error(await errorMessage(response))

        const { uploadUrl } = (await response.json()) as { uploadUrl: string }
        await uploadFile(uploadUrl, file, percent => updateProgress(index, { percent }))
        updateProgress(index, { status: 'done', percent: 100 })
      }

      setCompleted(true)
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      setProgress(prev => prev.map(item =>
        item.status === 'uploading' ? { ...item, status: 'error' } : item,
      ))
    } finally {
      setUploading(false)
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const doneCount = progress.filter(item => item.status === 'done').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={uploading ? undefined : onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">자료 업로드</h2>
          <button type="button" onClick={onClose} disabled={uploading} aria-label="닫기" className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {!completed && (
            <div
              onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={uploading ? undefined : handleDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
            >
              <svg className="mx-auto mb-3 text-zinc-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              <p className="text-sm font-medium text-zinc-600">파일을 드래그하거나 클릭하여 선택</p>
              <p className="text-xs text-zinc-400 mt-1">여러 파일 선택 가능</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((file, index) => {
                const state = progress[index]
                return (
                  <div key={`${file.name}:${file.size}:${file.lastModified}`} className="px-3 py-2.5 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-800 font-medium truncate">{file.name}</p>
                        <p className="text-xs text-zinc-400">{formatSize(file.size)}{state?.status === 'uploading' && ` · ${state.percent}%`}{state?.status === 'done' && ' · 완료'}{state?.status === 'error' && ' · 실패'}</p>
                      </div>
                      {!uploading && !completed && (
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} aria-label={`${file.name} 제거`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    {state && <div className="h-1 mt-2 bg-zinc-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={state.percent} aria-valuemin={0} aria-valuemax={100}><div className={`h-full transition-[width] ${state.status === 'error' ? 'bg-red-400' : 'bg-indigo-500'}`} style={{ width: `${state.percent}%` }} /></div>}
                  </div>
                )
              })}
            </div>
          )}

          {completed ? (
            <div className="py-3 text-center"><p className="text-sm font-medium text-zinc-900">파일 {files.length}개를 올렸습니다.</p><p className="text-xs text-zinc-400 mt-1">닫으면 최신 목록을 확인할 수 있습니다.</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 mb-1.5 block">부서 <span className="text-red-400">*</span></label>
                  <select value={department} disabled={uploading} onChange={e => { setDepartment(e.target.value); setCategory('') }} className="w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:border-indigo-400 disabled:bg-zinc-50 transition-colors">
                    <option value="">부서 선택</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 mb-1.5 block">카테고리</label>
                  <select value={category} disabled={!department || uploading} onChange={e => setCategory(e.target.value)} className="w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:border-indigo-400 disabled:bg-zinc-50 transition-colors">
                    <option value="">부서 폴더에 바로 저장</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-zinc-600 mb-1.5 block">태그</label><input type="text" value={tags} disabled={uploading} onChange={e => setTags(e.target.value)} placeholder="쉼표로 구분 (예: 주보, 예배)" className="w-full h-9 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-indigo-400 placeholder:text-zinc-300 disabled:bg-zinc-50 transition-colors" /></div>
              <div><label className="text-xs font-medium text-zinc-600 mb-1.5 block">설명</label><textarea value={description} disabled={uploading} onChange={e => setDescription(e.target.value)} placeholder="파일에 대한 간단한 설명 (선택)" rows={2} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:border-indigo-400 placeholder:text-zinc-300 disabled:bg-zinc-50 transition-colors" /></div>
            </div>
          )}

          {error && <p className="px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg" role="alert">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          {completed ? (
            <button type="button" onClick={onClose} className="px-5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">닫기</button>
          ) : (
            <><button type="button" onClick={onClose} disabled={uploading} className="px-4 h-9 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-40 font-medium transition-colors">취소</button><button type="button" onClick={handleUpload} disabled={files.length === 0 || !department || uploading} className="px-5 h-9 min-w-20 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors">{uploading ? `${doneCount}/${files.length}` : '업로드'}</button></>
          )}
        </div>
      </div>
    </div>
  )
}
