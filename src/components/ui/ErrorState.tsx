'use client'

type Props = {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = '자료를 불러오는 중 오류가 발생했습니다.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" className="text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
