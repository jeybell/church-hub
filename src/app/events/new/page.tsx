import BoardHeader from '@/components/layout/BoardHeader'
import EventForm from '@/components/events/EventForm'
import ErrorState from '@/components/ui/ErrorState'
import { getDriveTree } from '@/lib/drive'
import { getChildren } from '@/lib/folder-utils'
import { createEventAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const { tree, error } = await getDriveTree()

  if (error || !tree) {
    return (
      <>
        <BoardHeader />
        <ErrorState
          message={`부서 목록을 불러오지 못했습니다. ${error ?? ''}`}
        />
      </>
    )
  }

  return (
    <>
      <BoardHeader />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-lg font-semibold text-zinc-900 mb-1">행사 등록</h1>
        <p className="text-sm text-zinc-400 mb-6">
          드라이브에 이미 올려둔 자료를 이 행사에 묶을 수 있습니다.
        </p>

        <EventForm
          departments={getChildren(tree.folders, tree.root.id)}
          folders={tree.folders}
          files={tree.files}
          action={createEventAction}
        />
      </main>
    </>
  )
}
