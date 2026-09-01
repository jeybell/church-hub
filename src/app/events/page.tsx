import { redirect } from 'next/navigation'

// 행사 게시판은 자료실로 합쳐졌다. 행사는 이제 자료의 한 갈래다.
// 예전 주소를 눌러온 사람이 막히지 않게 필터를 그대로 넘겨준다.
export default async function EventsRedirect({ searchParams }: PageProps<'/events'>) {
  const sp = await searchParams
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(sp)) {
    const v = Array.isArray(value) ? value[0] : value
    if (v) qs.set(key, v)
  }

  redirect(qs.toString() ? `/archive?${qs}` : '/archive')
}
