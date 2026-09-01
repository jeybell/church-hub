/**
 * 환경변수만 바꿨을 때 배포를 다시 굽는다.
 *
 *   npm run redeploy
 *
 * Vercel 은 환경변수를 배포 시점에 함수 환경으로 굽는다. 대시보드에서 값만
 * 바꾸면 이미 만들어진 배포에는 반영되지 않아서, 코드 변경 없이 재배포를
 * 한 번 돌려야 한다. 커밋을 만들지 않고 그 일만 한다.
 *
 * 준비 (한 번만):
 *   Vercel 프로젝트 → Settings → Git → Deploy Hooks 에서 훅을 만들고
 *   (이름 아무거나, 브랜치는 main) 생성된 URL 을 .env.local 의
 *   VERCEL_DEPLOY_HOOK_URL 에 넣는다.
 *
 * 훅 URL 은 그 자체가 배포 트리거 권한이라 저장소에 커밋하면 안 된다.
 */

export {}

const HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL

function die(message: string): never {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

async function main() {
  if (!HOOK_URL) {
    die(
      '.env.local 에 VERCEL_DEPLOY_HOOK_URL 이 없습니다.\n' +
        '  Vercel → Settings → Git → Deploy Hooks 에서 훅을 만들어 URL 을 넣으세요.',
    )
  }
  if (!HOOK_URL.startsWith('https://api.vercel.com/')) {
    die(`Deploy Hook URL 형태가 아닙니다: ${HOOK_URL}`)
  }

  const res = await fetch(HOOK_URL, { method: 'POST' })
  const json = (await res.json().catch(() => null)) as {
    job?: { id?: string; state?: string; createdAt?: number }
  } | null

  if (!res.ok) {
    die(`재배포 요청 실패 (${res.status}): ${JSON.stringify(json)}`)
  }

  console.log('\n✓ 재배포를 요청했습니다.')
  if (json?.job?.id) console.log(`  job id: ${json.job.id}`)
  console.log('  Vercel 대시보드의 Deployments 에서 진행 상황을 볼 수 있습니다.')
  console.log('  빌드가 끝나면 새 환경변수가 적용된 배포가 프로덕션이 됩니다.\n')
}

main().catch(e => die(String(e)))
