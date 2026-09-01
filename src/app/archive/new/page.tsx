import Link from 'next/link'
import PostForm from '@/components/archive/PostForm'
import ErrorState from '@/components/ui/ErrorState'
import { getDriveTree } from '@/lib/drive'
import { getDepartments, getPickableFiles } from '@/lib/post-view'
import { ARCHIVE_BASE } from '@/lib/search-params'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const { tree, error } = await getDriveTree()

  if (error || !tree) {
    return <ErrorState message={`부서 목록을 불러오지 못했습니다. ${error ?? ''}`} />
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-16">
      <Link
        href={ARCHIVE_BASE}
        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        자료실
      </Link>

      <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">자료 등록</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-400">
        자료 하나에 파일 여러 개를 묶을 수 있습니다.
      </p>

      <PostForm departments={getDepartments(tree)} files={getPickableFiles(tree)} />
    </div>
  )
}
