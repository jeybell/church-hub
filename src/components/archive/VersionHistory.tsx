'use client'

import { useEffect, useState } from 'react'
import { loadRevisionsAction } from '@/app/archive/actions'
import { formatFileSize, formatDateTime } from '@/lib/file-utils'
import type { FileRevision } from '@/lib/drive'

type Props = {
  fileId: string
}

/**
 * 변경 이력. 펼칠 때만 불러온다.
 *
 * 목록 화면에서 글마다 이걸 부르면 첨부 수만큼 왕복이 생겨서 목록이 느려진다.
 * 그래서 상세에서, 그것도 사용자가 펼친 첨부에 대해서만 조회한다.
 */
export default function VersionHistory({ fileId }: Props) {
  const [revisions, setRevisions] = useState<FileRevision[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    loadRevisionsAction(fileId).then(result => {
      if (!alive) return
      if (result.ok) setRevisions(result.revisions)
      else setError(result.error)
    })
    return () => {
      alive = false
    }
  }, [fileId])

  if (error) {
    return <p className="pl-11 pr-4 pb-3 text-xs text-zinc-500">이력을 불러오지 못했습니다. {error}</p>
  }

  if (!revisions) {
    return <p className="pl-11 pr-4 pb-3 text-xs text-zinc-400">이력을 불러오는 중…</p>
  }

  if (revisions.length === 0) {
    return <p className="pl-11 pr-4 pb-3 text-xs text-zinc-400">남아 있는 이전 버전이 없습니다.</p>
  }

  // 최신이 위로 오게 뒤집는다. 번호는 오래된 것이 v1 이다.
  const ordered = [...revisions].reverse()

  return (
    <ol className="pl-11 pr-4 pb-3 flex flex-col">
      {ordered.map((rev, i) => (
        <li key={rev.id} className="flex gap-2.5 text-xs">
          {/* 세로선 + 점으로 시간의 흐름을 잇는다 */}
          <div className="flex flex-col items-center flex-shrink-0 pt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-zinc-500' : 'bg-zinc-300'}`}
            />
            {i < ordered.length - 1 && <span className="flex-1 w-px bg-zinc-200 my-0.5" />}
          </div>

          <div className="pb-2.5 min-w-0">
            <span className="text-zinc-700 font-medium tabular-nums">v{rev.number}</span>
            {i === 0 && <span className="ml-1.5 text-zinc-400">현재</span>}
            <span className="text-zinc-300 mx-1.5">·</span>
            <span className="text-zinc-500">{rev.author}</span>
            <span className="text-zinc-300 mx-1.5">·</span>
            <span className="text-zinc-400">{formatDateTime(rev.modifiedTime)}</span>
            {rev.size > 0 && (
              <>
                <span className="text-zinc-300 mx-1.5">·</span>
                <span className="text-zinc-400">{formatFileSize(rev.size)}</span>
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
