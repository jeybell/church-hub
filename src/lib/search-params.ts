/**
 * 목록 화면의 필터는 전부 URL 에 담긴다. 링크를 공유하면 같은 화면이 열리고
 * 뒤로가기가 그대로 동작한다. 그래서 필터를 바꾸는 UI 는 버튼이 아니라 링크다.
 */

export const ARCHIVE_BASE = '/archive'

type Patch = Record<string, string | undefined>

/**
 * 지금 걸린 필터를 유지한 채 몇 항목만 바꾼 주소를 만든다.
 * 값이 undefined 면 그 항목을 뺀다.
 */
export function withParams(
  current: URLSearchParams | { get(key: string): string | null },
  patch: Patch,
  base: string = ARCHIVE_BASE,
): string {
  const keys = ['department', 'category', 'status', 'author', 'year', 'q', 'sort', 'recent']
  const next = new URLSearchParams()

  for (const key of keys) {
    const value = key in patch ? patch[key] : (current.get(key) ?? undefined)
    if (value) next.set(key, value)
  }

  const qs = next.toString()
  return qs ? `${base}?${qs}` : base
}

/** searchParams 는 같은 이름이 여러 번 올 수 있다. 첫 값만 쓴다. */
export function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}
