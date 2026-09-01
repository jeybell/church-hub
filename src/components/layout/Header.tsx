'use client'

import { useState } from 'react'
import Link from 'next/link'
import GlobalSearch from '@/components/search/GlobalSearch'

type Props = {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: Props) {
  const [query, setQuery] = useState('')

  function handleChange(v: string) {
    setQuery(v)
    onSearch?.(v)
  }

  return (
    <header className="h-[var(--header-height)] border-b border-zinc-200 bg-white flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0 w-[var(--sidebar-width)] pl-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-zinc-900">교회 자료실</span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch value={query} onChange={handleChange} />
      </div>

      {/* User */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/archive"
          className="h-8 px-2.5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5" />
          </svg>
          자료실
        </Link>
        <button className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center hover:bg-indigo-200 transition-colors">
          김
        </button>
      </div>
    </header>
  )
}
