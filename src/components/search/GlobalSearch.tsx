'use client'

type Props = {
  value: string
  onChange: (v: string) => void
}

export default function GlobalSearch({ value, onChange }: Props) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="자료 이름, 부서, 태그 검색"
        className="w-full h-9 pl-9 pr-4 text-sm bg-zinc-100 border border-transparent rounded-lg
          placeholder:text-zinc-400 text-zinc-900
          focus:outline-none focus:bg-white focus:border-zinc-300 transition-colors"
      />
    </div>
  )
}
