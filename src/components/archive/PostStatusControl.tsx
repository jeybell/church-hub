import { updateStatusAction } from '@/app/archive/actions'
import { EVENT_STATUSES, STATUS_LABEL } from '@/lib/events'
import type { EventStatus } from '@/lib/events'

/**
 * 상태 변경.
 *
 * 자료를 읽는 흐름(제목 → 본문 → 첨부)을 끊지 않도록 맨 아래에 둔다.
 * 자주 하는 일이 아니고, 지금 상태는 위쪽 배지로 이미 보인다.
 */
export default function PostStatusControl({
  id,
  status,
}: {
  id: string
  status: EventStatus
}) {
  return (
    <form
      action={updateStatusAction}
      className="mt-10 pt-4 border-t border-zinc-100 flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <label htmlFor="status" className="text-xs text-zinc-400">
        진행 상태
      </label>
      <select
        id="status"
        name="status"
        defaultValue={status}
        className="h-7 pl-2 pr-6 text-xs text-zinc-600 border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-400 cursor-pointer"
      >
        {EVENT_STATUSES.map(s => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
      >
        변경
      </button>
    </form>
  )
}
