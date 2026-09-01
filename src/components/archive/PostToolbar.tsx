'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import FilterChip from './FilterChip'
import PostFilterPanel from './PostFilterPanel'
import { withParams } from '@/lib/search-params'
import { SORT_KEYS, SORT_LABEL, type SortKey } from '@/lib/events'
import type { Department } from '@/lib/post-view'

type Props = {
  departments: Department[]
  years: { year: string; count: number }[]
  count: number
}

export default function PostToolbar({ departments, years, count }: Props) {
  const params = useSearchParams()
  const router = useRouter()
  const department = params.get('department')
  const sort = (params.get('sort') ?? 'updated') as SortKey

  const detailFilters = ['category', 'status', 'year'].filter(k => params.get(k))
  const [open, setOpen] = useState(detailFilters.length > 0)

  const categories = departments.find(d => d.name === department)?.categories ?? []

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">자료실</h1>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-sm transition-colors ${
              open || detailFilters.length > 0
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M6.75 12h10.5m-7.5 6h4.5" />
            </svg>
            필터
            {detailFilters.length > 0 && (
              <span className="text-xs text-zinc-500">{detailFilters.length}</span>
            )}
          </button>

          <Link
            href="/archive/new"
            className="h-8 px-3 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            자료 등록
          </Link>
        </div>
      </div>

      {/* 부서는 늘 보인다. 좁은 화면에서는 가로로 흘린다. */}
      <div className="mt-3 -mx-1 px-1 flex items-center gap-1 overflow-x-auto">
        <FilterChip
          href={withParams(params, { department: undefined, category: undefined })}
          active={!department}
        >
          전체
        </FilterChip>
        {departments.map(d => (
          <FilterChip
            key={d.name}
            href={withParams(params, { department: d.name, category: undefined })}
            active={department === d.name}
          >
            {d.name}
          </FilterChip>
        ))}
      </div>

      {open && <PostFilterPanel categories={categories} years={years} />}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{count}건</p>

        <label className="flex items-center gap-1.5">
          <span className="sr-only">정렬</span>
          <select
            value={sort}
            onChange={e => router.push(withParams(params, { sort: e.target.value }))}
            className="h-7 pl-2 pr-6 text-sm text-zinc-600 bg-transparent rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-300 cursor-pointer"
          >
            {SORT_KEYS.map(k => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
