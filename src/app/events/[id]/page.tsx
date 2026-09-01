import Link from 'next/link'
import { notFound } from 'next/navigation'
import BoardHeader from '@/components/layout/BoardHeader'
import StatusBadge from '@/components/events/StatusBadge'
import FileIcon from '@/components/ui/FileIcon'
import { getEvent, EVENT_STATUSES, STATUS_LABEL } from '@/lib/events'
import { getFileType, formatFileSize, formatDate } from '@/lib/file-utils'
import { updateStatusAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: PageProps<'/events/[id]'>) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  return (
    <>
      <BoardHeader />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/events" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
          ← 행사 기록
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-900">{event.title}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {event.department}
              {event.event_date && ` · ${event.event_date}`}
              {' · '}
              {event.author} · {formatDate(event.created_at)}
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        {/* 진행 상태 변경 */}
        <form action={updateStatusAction} className="mt-4 flex items-center gap-2">
          <input type="hidden" name="id" value={event.id} />
          <span className="text-xs text-zinc-400">상태 변경</span>
          <select
            name="status"
            defaultValue={event.status}
            className="h-8 px-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400"
          >
            {EVENT_STATUSES.map(s => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-8 px-3 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            저장
          </button>
        </form>

        {event.body && (
          <div className="mt-6 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {event.body}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-500 mb-2">
            첨부 자료 {event.event_files.length > 0 && `(${event.event_files.length})`}
          </h2>

          {event.event_files.length === 0 ? (
            <p className="text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-lg px-3 py-6 text-center">
              묶인 자료가 없습니다.
            </p>
          ) : (
            <ul className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden bg-white">
              {event.event_files.map(f => (
                <li key={f.id}>
                  <a
                    href={`https://drive.google.com/file/d/${f.drive_file_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <FileIcon type={getFileType(f.mime_type)} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-800 truncate">{f.name}</p>
                      <p className="text-xs text-zinc-400">{formatFileSize(f.size)}</p>
                    </div>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" className="text-zinc-300 flex-shrink-0"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
