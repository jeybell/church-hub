'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import FileIcon from '@/components/ui/FileIcon'
import { createPostAction, type FormState } from '@/app/archive/actions'
import { EVENT_STATUSES, STATUS_LABEL } from '@/lib/events'
import { toAttachmentPayload, type Department, type PickableFile } from '@/lib/post-view'
import { ARCHIVE_BASE } from '@/lib/search-params'

type Props = {
  departments: Department[]
  files: PickableFile[]
}

const LABEL = 'text-xs font-medium text-zinc-600 mb-1.5 block'
const FIELD =
  'w-full h-9 px-2.5 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors'

export default function PostForm({ departments, files }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createPostAction,
    { error: null },
  )

  const [selected, setSelected] = useState<PickableFile[]>([])
  const [department, setDepartment] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filter, setFilter] = useState('')

  function toggle(file: PickableFile) {
    setSelected(prev => {
      const has = prev.some(f => f.id === file.id)
      const next = has ? prev.filter(f => f.id !== file.id) : [...prev, file]
      // 첫 파일을 고르면 그 파일이 놓인 부서를 미리 채워 준다.
      if (!has && !department && file.department) setDepartment(file.department)
      return next
    })
  }

  // 파일은 놓인 자리별로 묶어서 보여준다. 목록이 평평하면 어디 있는 파일인지 모른다.
  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const visible = q ? files.filter(f => f.name.toLowerCase().includes(q)) : files

    const map = new Map<string, PickableFile[]>()
    for (const f of visible) {
      const list = map.get(f.location) ?? []
      list.push(f)
      map.set(f.location, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ko'))
  }, [files, filter])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="files" value={JSON.stringify(toAttachmentPayload(selected))} />

      {state.error && (
        <p
          aria-live="polite"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <div>
        <label className={LABEL} htmlFor="title">
          제목 <span className="text-red-400">*</span>
        </label>
        <input id="title" name="title" required className={FIELD} placeholder="예) 2026 여름성경학교 행사 자료" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL} htmlFor="department">
            부서 <span className="text-red-400">*</span>
          </label>
          <select
            id="department"
            name="department"
            required
            className={FIELD}
            value={department}
            onChange={e => setDepartment(e.target.value)}
          >
            <option value="" disabled>
              부서 선택
            </option>
            {departments.map(d => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor="status">
            상태
          </label>
          <select id="status" name="status" className={FIELD} defaultValue="planned">
            {EVENT_STATUSES.map(s => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor="event_date">
            날짜
          </label>
          <input id="event_date" name="event_date" type="date" className={FIELD} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="author">
          작성자 <span className="text-red-400">*</span>
        </label>
        <input id="author" name="author" required className={FIELD} placeholder="이름" />
      </div>

      <div>
        <label className={LABEL} htmlFor="body">
          내용
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          className="w-full px-2.5 py-2 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors resize-y"
          placeholder="자료 개요, 준비 사항, 결과 등을 자유롭게 적으세요."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={LABEL}>첨부 자료</span>
          <button
            type="button"
            onClick={() => setPickerOpen(v => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {pickerOpen ? '닫기' : '파일 고르기'}
          </button>
        </div>

        {selected.length === 0 ? (
          <p className="text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-md px-3 py-4 text-center">
            아직 묶인 자료가 없습니다.
          </p>
        ) : (
          <ul className="border border-zinc-200 rounded-md divide-y divide-zinc-100">
            {selected.map(f => (
              <li key={f.id} className="flex items-center gap-2.5 px-3 py-2">
                <FileIcon type={f.type} size="sm" variant="muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 truncate">{f.name}</p>
                  <p className="text-xs text-zinc-400">
                    {f.location}
                    {f.size > 0 && ` · ${f.sizeLabel}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(f)}
                  className="text-xs text-zinc-400 hover:text-red-600 transition-colors"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        )}

        {pickerOpen && (
          <div className="mt-2 border border-zinc-200 rounded-md overflow-hidden">
            <div className="p-2 border-b border-zinc-100 bg-zinc-50">
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="파일 이름으로 좁히기"
                className="w-full h-8 px-2.5 text-sm bg-white border border-zinc-200 rounded focus:outline-none focus:border-zinc-400"
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {grouped.length === 0 ? (
                <p className="text-sm text-zinc-400 px-3 py-6 text-center">
                  {files.length === 0
                    ? '저장소에 아직 파일이 없습니다.'
                    : '이름이 맞는 파일이 없습니다.'}
                </p>
              ) : (
                grouped.map(([location, items]) => (
                  <div key={location}>
                    <p className="sticky top-0 px-3 py-1.5 text-[11px] font-medium text-zinc-400 bg-zinc-50 border-b border-zinc-100">
                      {location}
                    </p>
                    {items.map(f => (
                      <label
                        key={f.id}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.some(s => s.id === f.id)}
                          onChange={() => toggle(f)}
                          className="accent-zinc-900"
                        />
                        <FileIcon type={f.type} size="sm" variant="muted" />
                        <span className="text-sm text-zinc-800 truncate">{f.name}</span>
                      </label>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <p className="mt-1.5 text-xs text-zinc-400">
          아직은 저장소에 올라와 있는 파일만 묶을 수 있습니다.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Link
          href={ARCHIVE_BASE}
          className="px-3 h-9 inline-flex items-center text-sm text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-4 h-9 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-md transition-colors"
        >
          {pending ? '등록하는 중…' : '등록'}
        </button>
      </div>
    </form>
  )
}
