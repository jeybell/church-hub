import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostMeta from '@/components/archive/PostMeta'
import AttachmentList from '@/components/archive/AttachmentList'
import PostStatusControl from '@/components/archive/PostStatusControl'
import { getEvent } from '@/lib/events'
import { getDriveTree, listFileRevisions } from '@/lib/drive'
import { toPostVM, type AttachmentVM } from '@/lib/post-view'
import { ARCHIVE_BASE } from '@/lib/search-params'

export const dynamic = 'force-dynamic'

/**
 * 첨부마다 현재 버전을 매긴다.
 *
 * 저장소가 주는 version 값은 이름 변경 같은 수정에도 올라가서 사용자가 세는
 * 버전과 어긋난다. 그래서 실제 이력 개수를 쓴다. 목록에서 이러면 글 수만큼
 * 곱해져 느려지므로 상세에서만 한다. 한 건이 실패해도 나머지는 보여준다.
 */
async function withVersions(files: AttachmentVM[]): Promise<AttachmentVM[]> {
  return Promise.all(
    files.map(async file => ({
      ...file,
      version: await listFileRevisions(file.fileId)
        .then(revisions => revisions.length || null)
        .catch(() => null),
    })),
  )
}

export default async function PostDetailPage({ params }: PageProps<'/archive/[id]'>) {
  const { id } = await params

  const [event, { tree }] = await Promise.all([getEvent(id), getDriveTree()])
  if (!event) notFound()

  const post = toPostVM(event, tree)
  const attachments = await withVersions(post.attachments)

  return (
    <article className="w-full max-w-3xl mx-auto px-4 py-6 pb-16">
      <Link
        href={ARCHIVE_BASE}
        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        자료실
      </Link>

      <PostMeta post={post} />

      {post.body && (
        <div className="mt-6 pt-6 border-t border-zinc-100 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      )}

      <AttachmentList files={attachments} />

      <PostStatusControl id={post.id} status={post.status} />
    </article>
  )
}
