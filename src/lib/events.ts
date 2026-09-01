import { postgrest } from './supabase'

export const EVENT_STATUSES = ['planned', 'ongoing', 'done'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]

export const STATUS_LABEL: Record<EventStatus, string> = {
  planned: '기획',
  ongoing: '진행',
  done: '종료',
}

export type EventFile = {
  id: string
  drive_file_id: string
  name: string
  mime_type: string
  size: number
}

export type EventPost = {
  id: string
  title: string
  body: string
  department: string
  status: EventStatus
  event_date: string | null
  author: string
  created_at: string
  updated_at: string
  event_files: EventFile[]
}

const SELECT = 'id,title,body,department,status,event_date,author,created_at,updated_at,event_files(id,drive_file_id,name,mime_type,size)'

export type EventFilter = {
  department?: string
  status?: EventStatus
  /** 연도 4자리. 행사일이 그 해에 속한 글만 */
  year?: string
  query?: string
}

/** 목록. 행사일 최신순, 행사일이 없으면 뒤로 민다. */
export async function listEvents(filter: EventFilter = {}): Promise<EventPost[]> {
  const params = new URLSearchParams({
    select: SELECT,
    order: 'event_date.desc.nullslast,created_at.desc',
  })

  if (filter.department) params.set('department', `eq.${filter.department}`)
  if (filter.status) params.set('status', `eq.${filter.status}`)
  if (filter.year) {
    params.append('event_date', `gte.${filter.year}-01-01`)
    params.append('event_date', `lte.${filter.year}-12-31`)
  }
  if (filter.query) {
    // 제목 또는 본문에 포함
    const q = filter.query.replace(/[(),*]/g, ' ').trim()
    if (q) params.set('or', `(title.ilike.*${q}*,body.ilike.*${q}*)`)
  }

  return postgrest<EventPost[]>(`events?${params}`)
}

export async function getEvent(id: string): Promise<EventPost | null> {
  const params = new URLSearchParams({ select: SELECT, id: `eq.${id}`, limit: '1' })
  const rows = await postgrest<EventPost[]>(`events?${params}`)
  return rows[0] ?? null
}

export type NewEvent = {
  title: string
  body: string
  department: string
  status: EventStatus
  event_date: string | null
  author: string
  files: { drive_file_id: string; name: string; mime_type: string; size: number }[]
}

/** 행사 등록. 첨부는 드라이브에 이미 있는 파일을 묶는 것이라 업로드가 없다. */
export async function createEvent(input: NewEvent): Promise<string> {
  const [created] = await postgrest<{ id: string }[]>('events', {
    method: 'POST',
    returning: true,
    body: {
      title: input.title,
      body: input.body,
      department: input.department,
      status: input.status,
      event_date: input.event_date,
      author: input.author,
    },
  })

  if (input.files.length > 0) {
    await postgrest('event_files', {
      method: 'POST',
      body: input.files.map(f => ({ ...f, event_id: created.id })),
    })
  }

  return created.id
}

export async function updateEventStatus(id: string, status: EventStatus): Promise<void> {
  const params = new URLSearchParams({ id: `eq.${id}` })
  await postgrest(`events?${params}`, { method: 'PATCH', body: { status } })
}

/** 연도별 행사 수. 기록이 쌓이는 흐름을 목록 위에 보여주기 위한 값. */
export function countByYear(events: EventPost[]): { year: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const e of events) {
    const year = e.event_date?.slice(0, 4) ?? e.created_at.slice(0, 4)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year))
}
