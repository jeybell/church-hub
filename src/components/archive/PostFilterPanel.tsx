'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import FilterChip from './FilterChip'
import { withParams, ARCHIVE_BASE } from '@/lib/search-params'
import { EVENT_STATUSES, STATUS_LABEL } from '@/lib/events'

type Props = {
  /** 지금 고른 부서의 카테고리. 부서를 안 골랐으면 비어 있다. */
  categories: string[]
  years: { year: string; count: number }[]
}

/**
 * 자주 안 쓰는 필터는 접어 둔다. 예전 화면은 부서·상태·연도를 항상 펼쳐놔서
 * 목록보다 필터가 커 보였다.
 */
export default function PostFilterPanel({ categories, years }: Props) {
  const params = useSearchParams()
  const department = params.get('department')
  const category = params.get('category')
  const status = params.get('status')
  const year = params.get('year')

  return (
    <div className="mt-2 pt-3 border-t border-zinc-100 flex flex-col gap-2.5">
      <Row label="카테고리">
        {department ? (
          <>
            <FilterChip
              href={withParams(params, { category: undefined })}
              active={!category}
            >
              전체
            </FilterChip>
            {categories.map(c => (
              <FilterChip
                key={c}
                href={withParams(params, { category: c })}
                active={category === c}
              >
                {c}
              </FilterChip>
            ))}
          </>
        ) : (
          <span className="text-sm text-zinc-400 px-1">부서를 먼저 고르세요.</span>
        )}
      </Row>

      <Row label="상태">
        <FilterChip href={withParams(params, { status: undefined })} active={!status}>
          전체
        </FilterChip>
        {EVENT_STATUSES.map(s => (
          <FilterChip key={s} href={withParams(params, { status: s })} active={status === s}>
            {STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </Row>

      {years.length > 0 && (
        <Row label="연도">
          <FilterChip href={withParams(params, { year: undefined })} active={!year}>
            전체
          </FilterChip>
          {years.map(({ year: y, count }) => (
            <FilterChip key={y} href={withParams(params, { year: y })} active={year === y}>
              {y}
              <span className="text-zinc-400 font-normal">{count}</span>
            </FilterChip>
          ))}
        </Row>
      )}

      {(department || category || status || year || params.get('q')) && (
        <div className="pt-0.5">
          <Link
            href={ARCHIVE_BASE}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            필터 모두 지우기
          </Link>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-zinc-400 w-14 flex-shrink-0 pt-1.5">{label}</span>
      <div className="flex items-center gap-1 flex-wrap min-w-0">{children}</div>
    </div>
  )
}
