import AttachmentItem from './AttachmentItem'
import type { AttachmentVM } from '@/lib/post-view'

export default function AttachmentList({ files }: { files: AttachmentVM[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-zinc-900">
        첨부파일
        {files.length > 0 && <span className="ml-1.5 text-zinc-400 font-normal">{files.length}</span>}
      </h2>

      {files.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-md px-3 py-5 text-center">
          묶인 자료가 없습니다.
        </p>
      ) : (
        <ul className="mt-2 border border-zinc-200 rounded-md divide-y divide-zinc-100 overflow-hidden">
          {files.map(file => (
            <AttachmentItem key={file.id} file={file} />
          ))}
        </ul>
      )}
    </section>
  )
}
