import PostListItem from './PostListItem'
import EmptyState from '@/components/ui/EmptyState'
import type { PostVM } from '@/lib/post-view'

type Props = {
  posts: PostVM[]
  query?: string
}

export default function PostList({ posts, query }: Props) {
  if (posts.length === 0) {
    return (
      <div className="border-t border-zinc-200">
        <EmptyState
          title={
            query
              ? `'${query}'에 대한 결과가 없습니다.`
              : '아직 등록된 자료가 없습니다.'
          }
          description={
            query
              ? '다른 검색어를 시도하거나 필터를 지워보세요.'
              : '자료 등록 버튼을 눌러 첫 자료를 남기세요.'
          }
        />
      </div>
    )
  }

  return (
    <div className="border-t border-zinc-200 divide-y divide-zinc-100">
      {posts.map(post => (
        <PostListItem key={post.id} post={post} />
      ))}
    </div>
  )
}
