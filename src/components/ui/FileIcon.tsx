import type { FileType } from '@/lib/types'

type Props = {
  type: FileType
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<FileType, { className: string; label: string }> = {
  pdf:    { className: 'bg-red-100 text-red-700',    label: 'PDF' },
  image:  { className: 'bg-purple-100 text-purple-700', label: 'IMG' },
  video:  { className: 'bg-pink-100 text-pink-700',  label: 'VID' },
  audio:  { className: 'bg-orange-100 text-orange-700', label: 'AUD' },
  doc:    { className: 'bg-blue-100 text-blue-700',  label: 'DOC' },
  sheet:  { className: 'bg-green-100 text-green-700', label: 'XLS' },
  slide:  { className: 'bg-amber-100 text-amber-700', label: 'PPT' },
  zip:    { className: 'bg-zinc-100 text-zinc-500',  label: 'ZIP' },
  folder: { className: 'bg-indigo-100 text-indigo-600', label: '' },
  other:  { className: 'bg-zinc-100 text-zinc-500',  label: 'FILE' },
}

const SIZE = {
  sm: { wrap: 'w-8 h-8 rounded', text: 'text-[9px]', svg: 14 },
  md: { wrap: 'w-10 h-10 rounded-md', text: 'text-[10px]', svg: 18 },
  lg: { wrap: 'w-14 h-14 rounded-lg', text: 'text-xs', svg: 24 },
}

export default function FileIcon({ type, size = 'md' }: Props) {
  const { className, label } = CONFIG[type]
  const s = SIZE[size]

  if (type === 'folder') {
    return (
      <div className={`${s.wrap} ${className} flex items-center justify-center flex-shrink-0`}>
        <svg width={s.svg} height={s.svg} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`${s.wrap} ${className} flex items-center justify-center flex-shrink-0`}>
      <span className={`${s.text} font-bold tracking-tight leading-none`}>{label}</span>
    </div>
  )
}
