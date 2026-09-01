'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { deletePostAction } from '@/app/archive/actions'
import { ARCHIVE_BASE } from '@/lib/search-params'

/**
 * 자료 수정·삭제.
 *
 * 읽는 흐름을 끊지 않도록 본문과 첨부 아래에 둔다. 삭제는 되돌릴 수 없어서
 * 한 번 더 묻는다. 브라우저 기본 confirm 대신 같은 자리에서 펼치는 편이
 * 무엇을 지우는지 화면에 그대로 보인 채로 결정하게 해준다.
 */
export default function PostActions({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="mt-10 pt-4 border-t border-zinc-100">
      {confirming ? (
        <form action={deletePostAction} className="flex items-center gap-2 flex-wrap">
          <input type="hidden" name="id" value={id} />
          <p className="text-sm text-zinc-700 mr-1">
            <span className="font-medium">{title}</span> 을(를) 삭제할까요? 되돌릴 수 없습니다.
          </p>
          <DeleteButton />
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-8 px-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          >
            취소
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-1.5">
          <Link
            href={`${ARCHIVE_BASE}/${id}/edit`}
            className="h-8 px-2.5 inline-flex items-center text-sm text-zinc-600 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-8 px-2.5 inline-flex items-center text-sm text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-8 px-3 inline-flex items-center bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded-md transition-colors"
    >
      {pending ? '삭제하는 중…' : '삭제'}
    </button>
  )
}
