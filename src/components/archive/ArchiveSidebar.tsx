'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import DepartmentNav from './DepartmentNav'
import { ARCHIVE_BASE } from '@/lib/search-params'
import type { Department } from '@/lib/post-view'

type Props = {
  departments: Department[]
  /** 서랍에서 항목을 고르면 서랍을 닫는다. */
  onNavigate?: () => void
}

export default function ArchiveSidebar({ departments, onNavigate }: Props) {
  const params = useSearchParams()
  const recent = params.get('recent') === '1'
  const scoped = params.get('department') || params.get('category') || params.get('q')
  const all = !recent && !scoped

  return (
    <div className="w-[var(--sidebar-width)] h-full flex flex-col py-3 px-2 overflow-y-auto">
      <div className="flex flex-col gap-px">
        <ShortcutLink href={ARCHIVE_BASE} active={all} onClick={onNavigate}>
          전체 자료
        </ShortcutLink>
        <ShortcutLink href={`${ARCHIVE_BASE}?recent=1`} active={recent} onClick={onNavigate}>
          최근 자료
        </ShortcutLink>
      </div>

      <p className="text-[11px] font-medium text-zinc-400 px-2 mt-5 mb-1.5">부서</p>
      <DepartmentNav departments={departments} onNavigate={onNavigate} />
    </div>
  )
}

function ShortcutLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string
  active: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {children}
    </Link>
  )
}
