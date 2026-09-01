import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { formatDate } from '@/lib/file-utils'
import type { PostVM } from '@/lib/post-view'

/**
 * 목록의 한 줄.
 *
 * 위계는 셋뿐이다. 제목 → 부서·카테고리 → 나머지.
 * 같은 무게로 늘어놓으면 훑을 수가 없어서 크기와 색을 확실히 벌려 둔다.
 */
export default function PostListItem({ post }: { post: PostVM }) {
  return (
    <Link
      href={`/archive/${post.id}`}
      className="block px-4 py-3 hover:bg-zinc-50 transition-colors"
    >
      <p className="text-[15px] leading-snug font-medium text-zinc-900 truncate">
        {post.title}
      </p>

      <div className="mt-1 flex items-center gap-x-2 gap-y-1 flex-wrap text-xs">
        <span className="text-zinc-500">
          {post.department}
          {post.category && <span className="text-zinc-400"> · {post.category}</span>}
        </span>

        <span className="text-zinc-300">·</span>
        <span className="text-zinc-400">
          <StatusBadge status={post.status} variant="dot" />
        </span>

        {post.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-zinc-400 bg-zinc-100 px-1.5 rounded">
            {tag}
          </span>
        ))}

        {/* 넓은 화면에서는 오른쪽 끝으로 밀고, 좁은 화면에서는 줄을 따로 쓴다.
            한 줄에 다 밀어 넣으면 이름과 날짜가 서로 붙어 읽기 어려워진다. */}
        <span className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 text-zinc-400 flex-shrink-0">
          {post.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
              {post.attachments.length}
            </span>
          )}
          <span>{post.author}</span>
          <span>{formatDate(post.updatedAt)}</span>
        </span>
      </div>
    </Link>
  )
}
