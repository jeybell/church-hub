import FileExplorer from '@/components/files/FileExplorer'
import { MOCK_FILES } from '@/lib/mock-data'

export default function FilesPage() {
  return <FileExplorer files={MOCK_FILES} />
}
