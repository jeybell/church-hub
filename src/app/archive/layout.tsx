import { Suspense } from 'react'
import ArchiveShell from '@/components/archive/ArchiveShell'
import { getDriveTree } from '@/lib/drive'
import { getDepartments } from '@/lib/post-view'

// 부서 목록을 매 요청마다 읽는다 (빌드 시점 호출 방지).
export const dynamic = 'force-dynamic'

export default async function ArchiveLayout({ children }: LayoutProps<'/archive'>) {
  // 드라이브가 안 열려도 목록 자체는 보여야 하므로 여기서는 실패를 삼킨다.
  // 페이지 쪽에서 사용자에게 알린다.
  const { tree } = await getDriveTree()

  return (
    <Suspense>
      <ArchiveShell departments={getDepartments(tree)}>{children}</ArchiveShell>
    </Suspense>
  )
}
