import { FolderProvider } from '@/lib/folder-context'
import { getDriveTree } from '@/lib/drive'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// 드라이브를 매 요청마다 조회한다 (빌드 시점 호출 방지).
export const dynamic = 'force-dynamic'

export default async function FilesLayout({ children }: { children: React.ReactNode }) {
  const { tree } = await getDriveTree()

  return (
    <FolderProvider folders={tree?.folders ?? []} rootId={tree?.root.id ?? ''}>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>

          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden flex border-t border-zinc-200 bg-white">
          {[
            { label: '자료', href: '/files', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            )},
            { label: '즐겨찾기', href: '/files/starred', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            )},
            { label: '내정보', href: '/profile', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            )},
          ].map(item => (
            <a key={item.label} href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-zinc-500">
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </FolderProvider>
  )
}
