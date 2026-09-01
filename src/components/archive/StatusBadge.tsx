import { STATUS_LABEL, type EventStatus } from '@/lib/events'

const RING: Record<EventStatus, string> = {
  planned: 'text-amber-700 ring-amber-200 bg-amber-50',
  ongoing: 'text-indigo-700 ring-indigo-200 bg-indigo-50',
  done: 'text-zinc-500 ring-zinc-200 bg-zinc-50',
}

const DOT: Record<EventStatus, string> = {
  planned: 'bg-amber-400',
  ongoing: 'bg-indigo-500',
  done: 'bg-zinc-300',
}

type Props = {
  status: EventStatus
  /**
   * badge — 상세 화면. 상태가 그 글의 성격이라 눈에 띄어야 한다.
   * dot   — 목록. 제목보다 앞서면 안 되므로 점 하나와 회색 글씨로 낮춘다.
   */
  variant?: 'badge' | 'dot'
}

export default function StatusBadge({ status, variant = 'badge' }: Props) {
  if (variant === 'dot') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${DOT[status]}`} />
        {STATUS_LABEL[status]}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${RING[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
