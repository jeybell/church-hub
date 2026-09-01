'use client'

import { useEffect, useState } from 'react'
import ArchiveHeader from './ArchiveHeader'
import ArchiveSidebar from './ArchiveSidebar'
import type { Department } from '@/lib/post-view'

type Props = {
  departments: Department[]
  children: React.ReactNode
}

/**
 * 자료실 전체 뼈대.
 *
 * 부서 목록은 서버(레이아웃)에서 읽어 내려온다. 이 컴포넌트가 클라이언트인
 * 이유는 좁은 화면의 서랍 열림 상태 하나뿐이다.
 */
export default function ArchiveShell({ departments, children }: Props) {
  // 서랍은 안의 링크를 누를 때(onNavigate) 닫힌다. 서랍이 화면을 덮고 있어서
  // 그 밖의 경로로 이동할 길이 없으므로 따로 감시할 필요가 없다.
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <ArchiveHeader onMenuClick={() => setDrawerOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block flex-shrink-0 border-r border-zinc-200">
          <ArchiveSidebar departments={departments} />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-zinc-900/20"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative bg-white border-r border-zinc-200 h-full shadow-lg">
            <ArchiveSidebar
              departments={departments}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
