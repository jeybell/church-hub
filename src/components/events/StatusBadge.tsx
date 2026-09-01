import { STATUS_LABEL, type EventStatus } from '@/lib/events'

const STYLE: Record<EventStatus, string> = {
  planned: 'bg-amber-50 text-amber-700 ring-amber-200',
  ongoing: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  done: 'bg-zinc-100 text-zinc-500 ring-zinc-200',
}

export default function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
