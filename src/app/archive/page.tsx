import PostToolbar from '@/components/archive/PostToolbar'
import PostList from '@/components/archive/PostList'
import ErrorState from '@/components/ui/ErrorState'
import { getDriveTree } from '@/lib/drive'
import { listEvents, daysAgo, SORT_KEYS, type SortKey } from '@/lib/events'
import {
  toPostVM,
  getDepartments,
  matchesQuery,
  matchesYear,
  countByYear,
  type PostVM,
} from '@/lib/post-view'
import { one } from '@/lib/search-params'

export const dynamic = 'force-dynamic'

const RECENT_DAYS = 30

function asSort(v: string | undefined): SortKey | undefined {
  return v && (SORT_KEYS as readonly string[]).includes(v) ? (v as SortKey) : undefined
}

export default async function ArchivePage({ searchParams }: PageProps<'/archive'>) {
  const sp = await searchParams

  const department = one(sp.department)
  const category = one(sp.category)
  const year = one(sp.year)
  const query = one(sp.q)?.trim() ?? ''
  const sort = asSort(one(sp.sort))
  const recent = one(sp.recent) === '1'

  const { tree } = await getDriveTree()

  let posts: PostVM[] = []
  let error: string | null = null

  try {
    const events = await listEvents({
      department,
      author: one(sp.author),
      sort,
      updatedAfter: recent ? daysAgo(RECENT_DAYS) : undefined,
    })
    posts = events.map(e => toPostVM(e, tree))
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  // 연도 칩은 연도를 고르기 전 전체를 기준으로 세야 개수가 흔들리지 않는다.
  const years = countByYear(posts)

  // 카테고리·연도·검색은 첨부와 집계가 필요해서 여기서 거른다 (lib/post-view.ts 참고).
  const visible = posts
    .filter(p => !category || p.category === category)
    .filter(p => !year || matchesYear(p, year))
    .filter(p => matchesQuery(p, query))

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      {/* 목록을 못 불러와도 툴바는 남긴다. 여기가 막히면 자료 등록으로도 못 간다. */}
      <PostToolbar departments={getDepartments(tree)} years={years} count={visible.length} />

      {error ? (
        <div className="border-t border-zinc-200">
          <ErrorState message={`자료 목록을 불러오지 못했습니다. ${error}`} />
        </div>
      ) : (
        <PostList posts={visible} query={query} />
      )}
    </div>
  )
}
