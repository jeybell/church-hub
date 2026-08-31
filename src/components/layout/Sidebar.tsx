'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import FolderTree from '@/components/files/FolderTree'

type UtilItem = { href: string; label: string; icon: React.ReactNode }

function IconRecent() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function UtilLink({ href, label, icon }: UtilItem) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-indigo-50 text-indigo-700 font-medium'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
      }`}
    >
      <span className={active ? 'text-indigo-500' : 'text-zinc-400'}>{icon}</span>
      {label}
    </Link>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-[var(--sidebar-width)] h-full border-r border-zinc-200 flex flex-col py-3 px-2 bg-white overflow-y-auto flex-shrink-0">
      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto">
        <FolderTree />
      </div>

      {/* Utility links */}
      <div className="pt-3 mt-3 border-t border-zinc-100 flex flex-col gap-0.5">
        <UtilLink href="/files/recent"  label="최근 자료"  icon={<IconRecent />} />
        <UtilLink href="/files/starred" label="즐겨찾기"   icon={<IconStar />} />
        <UtilLink href="/files/trash"   label="휴지통"     icon={<IconTrash />} />
      </div>
    </aside>
  )
}
