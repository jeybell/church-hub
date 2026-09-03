/**
 * Supabase PostgREST 접근 (서버 전용)
 *
 * service role 키를 쓰므로 클라이언트 컴포넌트에서 import 하면 안 된다.
 * 테이블은 RLS 가 켜져 있고 정책이 없어, 공개 anon 키로는 아무것도
 * 읽거나 쓸 수 없다. 접근 경로는 이 모듈뿐이다.
 *
 * 드라이브 쪽(lib/drive.ts)과 같은 방식으로 fetch 를 직접 쓴다.
 */

const URL_BASE = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** 응답 본문을 돌려받고 싶을 때 (INSERT 결과 등) */
  returning?: boolean
}

export async function postgrest<T>(path: string, options: Options = {}): Promise<T> {
  if (!URL_BASE || !SERVICE_KEY) {
    throw new Error('SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다')
  }

  const headers: Record<string, string> = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
  if (options.returning) headers.Prefer = 'return=representation'

  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text()
    // PostgREST 는 테이블이 없을 때도 404 를 준다. 그대로 흘리면 "페이지 없음"으로
    // 읽히기 쉬워서, 마이그레이션 미적용이라는 진짜 원인을 짚어준다.
    if (res.status === 404) {
      throw new Error(
        `테이블을 찾을 수 없습니다. supabase/migrations 의 SQL 을 Supabase SQL Editor 에서 실행했는지 확인하세요. (${detail})`,
      )
    }
    throw new Error(`데이터 조회 실패 (${res.status}): ${detail}`)
  }

  // PostgREST 는 Prefer: return=representation 이 없는 PATCH/DELETE 에서
  // 상태 코드 200 을 주면서 본문은 비워 둘 수 있다. 204 만 예외 처리하면
  // 정상 수정 뒤 빈 문자열을 JSON 으로 읽다가 "Unexpected end" 가 난다.
  const text = await res.text()
  if (!text.trim()) return undefined as T
  return JSON.parse(text) as T
}
