import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostForm from '@/components/archive/PostForm'
import ErrorState from '@/components/ui/ErrorState'
import { getEvent } from '@/lib/events'
import { getDriveTree } from '@/lib/drive'
import {
  toPostVM,
  getDepartments,
  getPickableFiles,
  attachmentToPickable,
} from '@/lib/post-view'
import { ARCHIVE_BASE } from '@/lib/search-params'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: PageProps<'/archive/[id]/edit'>) {
  const { id } = await params

  const [event, { tree, error }] = await Promise.all([getEvent(id), getDriveTree()])
  if (!event) notFound()

  if (error || !tree) {
    return <ErrorState message={`부서 목록을 불러오지 못했습니다. ${error ?? ''}`} />
  }

  const post = toPostVM(event, tree)

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-16">
      <Link
        href={`${ARCHIVE_BASE}/${post.id}`}
        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        {post.title}
      </Link>

      <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">자료 수정</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-400">
        묶인 파일을 빼거나 더할 수 있습니다.
      </p>

      <PostForm
        departments={getDepartments(tree)}
        files={getPickableFiles(tree)}
        initial={{
          id: post.id,
          title: post.title,
          department: post.department,
          author: post.author,
          body: post.body,
          eventDate: post.eventDate,
          files: post.attachments.map(attachmentToPickable),
        }}
      />
    </div>
  )
}
