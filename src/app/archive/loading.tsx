/**
 * /archive 목록 화면의 로딩 뼈대.
 *
 * 부서·카테고리·연도·정렬 칩은 전부 링크라, 누르면 서버가 새 필터로
 * 다시 렌더할 때까지 화면이 아무 반응 없이 멈춰 있었다. 이 파일이
 * 있으면 그 사이 목록 자리에 스켈레톤이 곧바로 뜬다 — 헤더와 사이드바는
 * layout.tsx 쪽이라 이 경계 밖에 있어 그대로 남는다.
 */
export default function ArchiveLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto pb-16 animate-pulse">
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">자료실</h1>
          <div className="h-8 w-20 bg-zinc-100 rounded-md" />
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-7 w-12 bg-zinc-100 rounded-md" />
          <div className="h-7 w-16 bg-zinc-100 rounded-md" />
          <div className="h-7 w-16 bg-zinc-100 rounded-md" />
          <div className="h-7 w-16 bg-zinc-100 rounded-md" />
        </div>

        <div className="mt-4 h-4 w-10 bg-zinc-100 rounded" />
      </div>

      <div className="mt-2 border-t border-zinc-200 divide-y divide-zinc-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-4 bg-zinc-100 rounded w-2/5" />
            <div className="mt-2 h-3 bg-zinc-100 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
