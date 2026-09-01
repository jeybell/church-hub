import Link from 'next/link'

export default function BoardHeader({ query }: { query?: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/events" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-900">교회 자료실</span>
        </Link>

        <form action="/events" className="flex-1 max-w-md relative">
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
            defaultValue={query}
            placeholder="행사 이름, 내용 검색"
            className="w-full h-9 pl-8 pr-3 text-sm bg-zinc-100 border border-transparent rounded-lg placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-300 transition-colors"
          />
        </form>

        <nav className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/files"
            className="px-3 h-8 flex items-center text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            폴더로 보기
          </Link>
          <Link
            href="/events/new"
            className="px-3 h-8 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            행사 등록
          </Link>
        </nav>
      </div>
    </header>
  )
}
