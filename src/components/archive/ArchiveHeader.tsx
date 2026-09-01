'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ARCHIVE_BASE } from '@/lib/search-params'

type Props = {
  onMenuClick: () => void
}

export default function ArchiveHeader({ onMenuClick }: Props) {
  const params = useSearchParams()

  // 검색해도 보고 있던 부서·카테고리는 유지한다.
  const department = params.get('department') ?? ''
  const category = params.get('category') ?? ''

  return (
    <header className="h-14 flex-shrink-0 border-b border-zinc-200 bg-white flex items-center gap-3 px-3 sm:px-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
        className="lg:hidden w-8 h-8 -ml-1 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      <Link
        href={ARCHIVE_BASE}
        className="flex items-center gap-2 flex-shrink-0 lg:w-[var(--sidebar-width)] lg:pl-1"
      >
        <span className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-zinc-900 tracking-tight">교회 자료실</span>
      </Link>

      <form action={ARCHIVE_BASE} className="flex-1 max-w-lg relative">
        {department && <input type="hidden" name="department" value={department} />}
        {category && <input type="hidden" name="category" value={category} />}
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={params.get('q') ?? ''}
          placeholder="자료 · 파일명 · 작성자 검색"
          className="w-full h-8 pl-8 pr-3 text-sm bg-zinc-100 border border-transparent rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-300 transition-colors"
        />
      </form>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href="/files"
          className="hidden sm:flex items-center h-8 px-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
        >
          폴더로 보기
        </Link>
        {/* 로그인이 아직 없어서 실제 사용자를 표시하지 않는다. */}
        <span className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.9 17.9 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z" />
          </svg>
        </span>
      </div>
    </header>
  )
}
