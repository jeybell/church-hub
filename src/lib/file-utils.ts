import type { FileType } from './types'

export function getFileType(mimeType: string): FileType {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('msword')) return 'doc'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('sheet')) return 'sheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('slide')) return 'slide'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('x-rar')) return 'zip'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function getFileTypeLabel(type: FileType): string {
  const labels: Record<FileType, string> = {
    pdf: 'PDF',
    image: '이미지',
    video: '동영상',
    audio: '오디오',
    doc: '문서',
    sheet: '스프레드시트',
    slide: '프레젠테이션',
    zip: '압축파일',
    folder: '폴더',
    other: '파일',
  }
  return labels[type]
}
