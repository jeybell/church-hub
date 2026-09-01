import Link from 'next/link'
import BoardHeader from '@/components/layout/BoardHeader'
import StatusBadge from '@/components/events/StatusBadge'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { listEvents, countByYear, EVENT_STATUSES, STATUS_LABEL, type EventStatus, type EventPost } from '@/lib/events'
import { getDriveTree } from '@/lib/drive'
import { getChildren } from '@/lib/folder-utils'
import { formatDate } from '@/lib/file-utils'

export const dynamic = 'force-dynamic'

function isStatus(v: string | undefined): v is EventStatus {
  return !!v && (EVENT_STATUSES as readonly string[]).includes(v)
}

/** 현재 걸린 필터를 유지한 채 한 항목만 바꾼 링크를 만든다. */
function withParam(
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined,
) {
  const next = new URLSearchParams()
  for (const [k, v] of Object.entries({ ...current, [key]: value })) {
    if (v) next.set(k, v)
  }
  const qs = next.toString()
  return qs ? `/events?${qs}` : '/events'
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-2.5 h-7 inline-flex items-center rounded-lg text-sm transition-colors ${
        active
          ? 'bg-indigo-50 text-indigo-700 font-medium'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
      }`}
    >
      {children}
    </Link>
  )
}

function EventRow({ event }: { event: EventPost }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
    >
      <div className="w-14 flex-shrink-0">
        <StatusBadge status={event.status} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{event.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {event.department}
          {event.event_date && ` · ${event.event_date}`}
          {' · '}
          {event.author}
        </p>
      </div>

      {event.event_files.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
          </svg>
          {event.event_files.length}
        </div>
      )}

      <div className="hidden md:block w-20 flex-shrink-0 text-xs text-zinc-400 text-right">
        {formatDate(event.created_at)}
      </div>
    </Link>
  )
}

export default async function EventsPage({ searchParams }: PageProps<'/events'>) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  const filter = {
    department: one(sp.department),
    status: isStatus(one(sp.status)) ? (one(sp.status) as EventStatus) : undefined,
    year: one(sp.year),
    query: one(sp.q),
  }

  let events: EventPost[]
  try {
    events = await listEvents(filter)
  } catch (e) {
    return (
      <>
        <BoardHeader query={filter.query} />
        <ErrorState message={`행사 목록을 불러오지 못했습니다. ${e instanceof Error ? e.message : String(e)}`} />
      </>
    )
  }

  // 부서 목록은 드라이브 최상위 폴더를 그대로 쓴다. 드라이브가 안 열리면 필터만 생략한다.
  const { tree } = await getDriveTree()
  const departments = tree ? getChildren(tree.folders, tree.root.id).map(f => f.name) : []

  // 연도 칩은 전체 기간 기준으로 뽑아야 해서 연도 필터는 빼고 한 번 더 센다.
  const allYears = countByYear(
    filter.year ? await listEvents({ ...filter, year: undefined }) : events,
  )

  const current = {
    department: filter.department,
    status: filter.status,
    year: filter.year,
    q: filter.query,
  }

  return (
    <>
      <BoardHeader query={filter.query} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h1 className="text-lg font-semibold text-zinc-900">행사 기록</h1>
          <p className="text-sm text-zinc-400">{events.length}건</p>
        </div>

        {/* 필터 */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-zinc-400 w-10 flex-shrink-0">부서</span>
            <FilterChip href={withParam(current, 'department', undefined)} active={!filter.department}>
              전체
            </FilterChip>
            {departments.map(d => (
              <FilterChip key={d} href={withParam(current, 'department', d)} active={filter.department === d}>
                {d}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-zinc-400 w-10 flex-shrink-0">상태</span>
            <FilterChip href={withParam(current, 'status', undefined)} active={!filter.status}>
              전체
            </FilterChip>
            {EVENT_STATUSES.map(s => (
              <FilterChip key={s} href={withParam(current, 'status', s)} active={filter.status === s}>
                {STATUS_LABEL[s]}
              </FilterChip>
            ))}
          </div>

          {allYears.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-zinc-400 w-10 flex-shrink-0">연도</span>
              <FilterChip href={withParam(current, 'year', undefined)} active={!filter.year}>
                전체
              </FilterChip>
              {allYears.map(({ year, count }) => (
                <FilterChip key={year} href={withParam(current, 'year', year)} active={filter.year === year}>
                  {year} <span className="text-zinc-400 ml-1">{count}</span>
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        {/* 목록 */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          {events.length === 0 ? (
            <EmptyState
              title={
                filter.query
                  ? `'${filter.query}'에 대한 결과가 없습니다.`
                  : '아직 등록된 행사가 없습니다.'
              }
              description="행사 등록 버튼을 눌러 첫 기록을 남기세요."
            />
          ) : (
            events.map(event => <EventRow key={event.id} event={event} />)
          )}
        </div>
      </main>
    </>
  )
}
