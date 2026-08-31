import FileExplorer from '@/components/files/FileExplorer'
import ErrorState from '@/components/ui/ErrorState'
import { getDriveTree } from '@/lib/drive'

export default async function FilesPage() {
  const { tree, error } = await getDriveTree()

  if (error || !tree) {
    return (
      <ErrorState
        message={`드라이브를 불러오지 못했습니다. ${error ?? ''}`}
      />
    )
  }

  return <FileExplorer files={tree.files} />
}
