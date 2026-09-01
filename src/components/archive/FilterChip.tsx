import Link from 'next/link'

type Props = {
  href: string
  active: boolean
  children: React.ReactNode
}

/**
 * 필터는 전부 링크다. 활성 표시에 강조색을 쓰지 않는다 —
 * 색은 등록 버튼 하나에만 남겨 두고, 여기서는 명도 차이로만 구분한다.
 */
export default function FilterChip({ href, active, children }: Props) {
  return (
    <Link
      href={href}
      className={`h-7 px-2.5 inline-flex items-center gap-1 rounded-md text-sm whitespace-nowrap transition-colors ${
        active
          ? 'bg-zinc-100 text-zinc-900 font-medium ring-1 ring-inset ring-zinc-200'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {children}
    </Link>
  )
}
