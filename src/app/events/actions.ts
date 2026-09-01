'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEvent, updateEventStatus, EVENT_STATUSES, type EventStatus } from '@/lib/events'

function asStatus(value: FormDataEntryValue | null): EventStatus {
  const v = String(value ?? '')
  return (EVENT_STATUSES as readonly string[]).includes(v) ? (v as EventStatus) : 'planned'
}

export async function createEventAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const department = String(formData.get('department') ?? '').trim()
  const author = String(formData.get('author') ?? '').trim()

  if (!title || !department || !author) {
    throw new Error('제목, 부서, 작성자는 반드시 입력해야 합니다.')
  }

  const rawFiles = String(formData.get('files') ?? '[]')
  const files = JSON.parse(rawFiles) as {
    drive_file_id: string
    name: string
    mime_type: string
    size: number
  }[]

  const eventDate = String(formData.get('event_date') ?? '').trim()

  const id = await createEvent({
    title,
    department,
    author,
    body: String(formData.get('body') ?? ''),
    status: asStatus(formData.get('status')),
    event_date: eventDate || null,
    files,
  })

  revalidatePath('/events')
  redirect(`/events/${id}`)
}

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('행사 id 가 없습니다.')

  await updateEventStatus(id, asStatus(formData.get('status')))

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
}
