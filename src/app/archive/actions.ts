'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createEvent,
  updateEvent,
  deleteEvent,
  type AttachmentInput,
  type EventInput,
} from '@/lib/events'
import { getDriveTree, listFileRevisions, type FileRevision } from '@/lib/drive'
import { ARCHIVE_BASE } from '@/lib/search-params'

export type FormState = { error: string | null }

type Parsed = { ok: true; input: EventInput } | { ok: false; error: string }

/** 폼이 보낸 값을 저장 가능한 모양으로 바꾼다. 등록과 수정이 같은 폼을 쓴다. */
function parse(formData: FormData): Parsed {
  const title = String(formData.get('title') ?? '').trim()
  const department = String(formData.get('department') ?? '').trim()
  const author = String(formData.get('author') ?? '').trim()

  if (!title || !department || !author) {
    return { ok: false, error: '제목, 부서, 작성자는 반드시 입력해야 합니다.' }
  }

  let files: AttachmentInput[]
  try {
    files = JSON.parse(String(formData.get('files') ?? '[]'))
  } catch {
    return { ok: false, error: '첨부 목록을 읽지 못했습니다. 다시 시도해 주세요.' }
  }

  const eventDate = String(formData.get('event_date') ?? '').trim()

  return {
    ok: true,
    input: {
      title,
      department,
      author,
      body: String(formData.get('body') ?? ''),
      event_date: eventDate || null,
      files,
    },
  }
}

/**
 * 자료 등록.
 *
 * 실패를 던지지 않고 돌려준다. 던지면 Next 오류 화면으로 튕겨서 사용자가
 * 방금 쓴 내용을 잃는다. 폼 안에 메시지로 남기는 편이 낫다.
 */
export async function createPostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parse(formData)
  if (!parsed.ok) return { error: parsed.error }

  let id: string
  try {
    id = await createEvent(parsed.input)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }

  revalidatePath(ARCHIVE_BASE)
  redirect(`${ARCHIVE_BASE}/${id}`)
}

export async function updatePostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return { error: '수정할 자료를 찾지 못했습니다.' }

  const parsed = parse(formData)
  if (!parsed.ok) return { error: parsed.error }

  try {
    await updateEvent(id, parsed.input)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }

  revalidatePath(ARCHIVE_BASE)
  revalidatePath(`${ARCHIVE_BASE}/${id}`)
  redirect(`${ARCHIVE_BASE}/${id}`)
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) throw new Error('자료 id 가 없습니다.')

  await deleteEvent(id)

  revalidatePath(ARCHIVE_BASE)
  redirect(ARCHIVE_BASE)
}

export type RevisionsResult =
  | { ok: true; revisions: FileRevision[] }
  | { ok: false; error: string }

/**
 * 첨부 하나의 변경 이력.
 *
 * 서버 액션은 화면을 거치지 않고 직접 POST 로도 불릴 수 있다. 그래서 넘어온
 * id 를 그대로 믿지 않고, 자료실 폴더 안에 있는 파일인지 먼저 확인한다.
 * 확인하지 않으면 계정의 아무 파일이나 훔쳐볼 수 있는 통로가 된다.
 */
export async function loadRevisionsAction(fileId: string): Promise<RevisionsResult> {
  const { tree } = await getDriveTree()
  if (!tree) return { ok: false, error: '자료 저장소를 열지 못했습니다.' }
  if (!tree.files.some(f => f.id === fileId)) {
    return { ok: false, error: '자료실에 없는 파일입니다.' }
  }

  try {
    return { ok: true, revisions: await listFileRevisions(fileId) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
