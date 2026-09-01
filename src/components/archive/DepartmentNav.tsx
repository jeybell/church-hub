'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { withParams } from '@/lib/search-params'
import type { Department } from '@/lib/post-view'

type Props = {
  departments: Department[]
  onNavigate?: () => void
}

/**
 * 부서 → 카테고리 2단 내비게이션.
 *
 * 예전 폴더 트리와 달리 클릭이 클라이언트 상태를 바꾸지 않고 주소를 바꾼다.
 * 목록을 거르는 주체가 서버라 필터가 URL 에 있어야 하기 때문이다.
 */
export default function DepartmentNav({ departments, onNavigate }: Props) {
  const params = useSearchParams()
  const current = params.get('department')
  const currentCategory = params.get('category')

  // 사용자가 직접 접거나 편 부서만 기록한다. 지금 보고 있는 부서는 아래에서
  // 자동으로 펼치므로 상태로 따라갈 필요가 없다.
  const [manual, setManual] = useState<Map<string, boolean>>(new Map())

  function isOpen(name: string) {
    return manual.get(name) ?? name === current
  }

  function toggle(name: string) {
    setManual(prev => new Map(prev).set(name, !isOpen(name)))
  }

  return (
    <nav className="flex flex-col gap-px">
      {departments.map(dept => {
        const active = current === dept.name && !currentCategory
        const open = isOpen(dept.name)

        return (
          <div key={dept.name}>
            <div
              className={`group flex items-center rounded-md transition-colors ${
                active ? 'bg-zinc-100' : 'hover:bg-zinc-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(dept.name)}
                aria-label={`${dept.name} ${open ? '접기' : '펼치기'}`}
                className={`w-5 h-7 flex items-center justify-center flex-shrink-0 text-zinc-400 hover:text-zinc-700 ${
                  dept.categories.length === 0 ? 'invisible' : ''
                }`}
              >
                <svg
                  width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3"
                  className={`transition-transform ${open ? 'rotate-90' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <Link
                href={withParams(params, { department: dept.name, category: undefined })}
                onClick={onNavigate}
                className={`flex-1 min-w-0 py-1.5 pr-2 text-sm truncate transition-colors ${
                  active ? 'text-zinc-900 font-medium' : 'text-zinc-600 group-hover:text-zinc-900'
                }`}
              >
                {dept.name}
              </Link>
            </div>

            {open && dept.categories.length > 0 && (
              <div className="flex flex-col gap-px">
                {dept.categories.map(cat => {
                  const catActive = current === dept.name && currentCategory === cat
                  return (
                    <Link
                      key={cat}
                      href={withParams(params, { department: dept.name, category: cat })}
                      onClick={onNavigate}
                      className={`pl-7 pr-2 py-1.5 rounded-md text-sm truncate transition-colors ${
                        catActive
                          ? 'bg-zinc-100 text-zinc-900 font-medium'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      {cat}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
