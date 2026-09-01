import Link from 'next/link'
import { formatFullDate, formatDateTime } from '@/lib/file-utils'
import { ARCHIVE_BASE } from '@/lib/search-params'
import type { PostVM } from '@/lib/post-view'

/**
 * 상세 화면의 머리.
 *
 * 문서 페이지처럼 읽히게 한다. 어디에 속한 자료인지(빵부스러기) → 무엇인지(제목)
 * → 누가 언제(메타) 순서다. 제목이 가장 크고 나머지는 확실히 물러난다.
 */
export default function PostMeta({ post }: { post: PostVM }) {
  const edited = post.updatedAt !== post.createdAt

  return (
    <header>
      <nav className="flex items-center gap-1.5 text-xs min-w-0">
        <Link
          href={`${ARCHIVE_BASE}?department=${encodeURIComponent(post.department)}`}
          className="text-zinc-500 hover:text-zinc-900 transition-colors truncate"
        >
          {post.department}
        </Link>
        {post.category && (
          <>
            <span className="text-zinc-300">/</span>
            <Link
              href={`${ARCHIVE_BASE}?department=${encodeURIComponent(post.department)}&category=${encodeURIComponent(post.category)}`}
              className="text-zinc-500 hover:text-zinc-900 transition-colors truncate"
            >
              {post.category}
            </Link>
          </>
        )}
      </nav>

      <h1 className="mt-2 text-xl font-semibold text-zinc-900 tracking-tight leading-snug">
        {post.title}
      </h1>

      <p className="mt-1.5 text-xs text-zinc-400">
        {post.author}
        <span className="mx-1.5 text-zinc-300">·</span>
        {formatFullDate(post.createdAt)} 등록
        {edited && (
          <>
            <span className="mx-1.5 text-zinc-300">·</span>
            {formatDateTime(post.updatedAt)} 수정
          </>
        )}
        {post.eventDate && (
          <>
            <span className="mx-1.5 text-zinc-300">·</span>
            {/* 저장된 값이 YYYY-MM-DD 다. 시간대 때문에 하루 밀리지 않도록
                Date 로 바꾸지 않고 구분자만 나머지 날짜와 맞춘다. */}
            행사일 {post.eventDate.replaceAll('-', '.')}
          </>
        )}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
