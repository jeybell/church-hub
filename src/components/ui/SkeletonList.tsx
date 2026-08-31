export default function SkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-zinc-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-10 h-10 rounded-md bg-zinc-100 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-3.5 bg-zinc-100 rounded w-2/5 mb-2" />
            <div className="h-3 bg-zinc-100 rounded w-1/4" />
          </div>
          <div className="hidden md:block h-3 bg-zinc-100 rounded w-16" />
          <div className="hidden lg:block h-3 bg-zinc-100 rounded w-16" />
          <div className="h-3 bg-zinc-100 rounded w-12" />
        </div>
      ))}
    </div>
  )
}
