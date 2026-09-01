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

export const SORT_KEYS = ['updated', 'created', 'title'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABEL: Record<SortKey, string> = {
  updated: '최근 수정',
  created: '최근 등록',
  title: '제목',
}

// 자료실에서 가장 자주 찾는 것은 "요즘 손댄 자료"라서 최근 수정이 기본이다.
const ORDER_BY: Record<SortKey, string> = {
  updated: 'updated_at.desc',
  created: 'created_at.desc',
  title: 'title.asc',
}

/** "최근 자료" 가 기준으로 삼을 시각. 렌더 중에 시계를 읽지 않도록 여기 둔다. */
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

export type EventFilter = {
  department?: string
  status?: EventStatus
  author?: string
  /** 이 시각 이후에 수정된 글만. "최근 자료" 메뉴가 쓴다. */
  updatedAfter?: string
  sort?: SortKey
}

/**
 * 목록. 정렬 기본값은 최근 수정순.
 *
 * DB 가 싸게 거를 수 있는 것만 여기서 거른다. 검색어·카테고리·연도는
 * 첨부 파일이나 집계가 필요해서 조회 뒤 뷰 계층(lib/post-view.ts)이 맡는다.
 * 특히 검색은 첨부 파일명과 태그까지 훑어야 하는데 그건 임베드된 리소스라
 * PostgREST 의 or 절 하나로 묶을 수 없다. 절반만 DB 에서 거르면 파일명으로만
 * 맞는 글이 아예 넘어오지 않는다.
 */
export async function listEvents(filter: EventFilter = {}): Promise<EventPost[]> {
  const params = new URLSearchParams({
    select: SELECT,
    order: ORDER_BY[filter.sort ?? 'updated'],
  })

  if (filter.department) params.set('department', `eq.${filter.department}`)
  if (filter.status) params.set('status', `eq.${filter.status}`)
  if (filter.author) params.set('author', `eq.${filter.author}`)
  if (filter.updatedAfter) params.set('updated_at', `gte.${filter.updatedAfter}`)

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

