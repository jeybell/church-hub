/**
 * 구글 드라이브 조회 (서버 전용)
 *
 * refresh token 은 서버 환경변수에만 있으므로 클라이언트 컴포넌트에서
 * 이 모듈을 import 하면 안 된다. 서버 컴포넌트나 라우트 핸들러에서만 쓴다.
 */

import { cache } from 'react'
import type { FileItem, FolderItem } from './types'

export type DriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
}

export type DriveTree = {
  root: FolderItem
  folders: FolderItem[]
  files: FileItem[]
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'

const FILE_FIELDS = [
  'id',
  'name',
  'mimeType',
  'size',
  'parents',
  'modifiedTime',
  'version',
  'starred',
  'description',
  'appProperties',
  'owners(displayName)',
  'lastModifyingUser(displayName)',
].join(',')

type RawFile = {
  id: string
  name: string
  mimeType: string
  size?: string
  parents?: string[]
  modifiedTime: string
  version?: string
  starred?: boolean
  description?: string
  appProperties?: Record<string, string>
  owners?: { displayName?: string }[]
  lastModifyingUser?: { displayName?: string }
}

/**
 * 액세스 토큰은 보통 한 시간짜리인데 요청마다 새로 받고 있었다.
 * 만료 1분 전까지 재사용한다. 실패는 캐시하지 않는다.
 */
let tokenCache: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!res.ok || !json.access_token) throw new Error('토큰 갱신 실패')

  const ttlSeconds = json.expires_in ?? 3600
  tokenCache = {
    value: json.access_token,
    expiresAt: Date.now() + Math.max(ttlSeconds - 60, 30) * 1000,
  }
  return tokenCache.value
}

async function driveFetch(path: string, params: URLSearchParams, token: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`드라이브 조회 실패 (${res.status})`)
  return res.json()
}

/** q 파라미터가 너무 길어지지 않게 부모 id 를 이 개수로 나눠 묶는다. */
const PARENTS_PER_QUERY = 25

/**
 * 여러 폴더의 직계 자식을 한 번에 가져온다 (페이지네이션 포함).
 *
 * 폴더마다 따로 물으면 폴더 수만큼 왕복이 생긴다. 드라이브 질의는
 * `'a' in parents or 'b' in parents` 로 묶을 수 있어서, 같은 깊이를
 * 한 요청으로 처리한다.
 */
async function listChildren(folderIds: string[], token: string): Promise<RawFile[]> {
  const chunks: string[][] = []
  for (let i = 0; i < folderIds.length; i += PARENTS_PER_QUERY) {
    chunks.push(folderIds.slice(i, i + PARENTS_PER_QUERY))
  }

  const perChunk = await Promise.all(
    chunks.map(async chunk => {
      const parentClause = chunk.map(id => `'${id}' in parents`).join(' or ')
      const items: RawFile[] = []
      let pageToken: string | undefined

      do {
        const params = new URLSearchParams({
          q: `(${parentClause}) and trashed=false`,
          fields: `nextPageToken,files(${FILE_FIELDS})`,
          pageSize: '1000',
        })
        if (pageToken) params.set('pageToken', pageToken)

        const json = (await driveFetch('files', params, token)) as {
          files?: RawFile[]
          nextPageToken?: string
        }
        items.push(...(json.files ?? []))
        pageToken = json.nextPageToken
      } while (pageToken)

      return items
    }),
  )

  return perChunk.flat()
}

function toFileItem(raw: RawFile, fallbackFolderId: string): FileItem {
  const tags = (raw.appProperties?.tags ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  return {
    id: raw.id,
    name: raw.name,
    mimeType: raw.mimeType,
    // 구글 문서(Docs/Sheets/Slides)는 size 가 없다.
    size: raw.size ? Number(raw.size) : 0,
    folderId: raw.parents?.[0] ?? fallbackFolderId,
    uploadedBy:
      raw.owners?.[0]?.displayName ?? raw.lastModifyingUser?.displayName ?? '알 수 없음',
    updatedAt: raw.modifiedTime,
    starred: raw.starred ?? false,
    version: raw.version ? Number(raw.version) : undefined,
    tags,
    description: raw.description,
  }
}

/**
 * 루트 폴더(DRIVE_ROOT_FOLDER_ID) 아래를 전부 훑어서 폴더/파일 목록을 만든다.
 * 같은 깊이의 폴더는 병렬로 조회해 왕복 횟수만큼 느려지지 않게 한다.
 */
async function fetchDriveTree(): Promise<DriveTree> {
  const rootId = process.env.DRIVE_ROOT_FOLDER_ID
  if (!rootId) throw new Error('DRIVE_ROOT_FOLDER_ID 가 설정되지 않았습니다')

  const token = await getAccessToken()

  const rootMeta = (await driveFetch(
    `files/${rootId}`,
    new URLSearchParams({ fields: 'id,name' }),
    token,
  )) as { id: string; name: string }

  const root: FolderItem = { id: rootMeta.id, name: rootMeta.name, parentId: null }
  const folders: FolderItem[] = [root]
  const files: FileItem[] = []

  let level = [rootId]
  while (level.length > 0) {
    const inLevel = new Set(level)
    const children = await listChildren(level, token)
    const nextLevel: string[] = []

    for (const child of children) {
      // 한 파일이 여러 폴더에 걸쳐 있을 수 있어, 이번 깊이에 속한 부모를 고른다.
      const parentId = child.parents?.find(p => inLevel.has(p)) ?? child.parents?.[0] ?? rootId

      if (child.mimeType === FOLDER_MIME) {
        folders.push({ id: child.id, name: child.name, parentId })
        nextLevel.push(child.id)
      } else {
        files.push(toFileItem(child, parentId))
      }
    }

    level = nextLevel
  }

  folders.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return { root, folders, files }
}

/**
 * 폴더 구조는 자주 바뀌지 않는데 요청마다 전부 다시 훑고 있었다.
 * 짧게 캐시해 연속된 조회에서는 드라이브를 건드리지 않는다.
 *
 * 실패는 캐시하지 않는다. 토큰 만료 같은 일시적 오류가 이 시간만큼
 * 굳어버리면 고친 뒤에도 화면이 안 돌아온다.
 *
 * 드라이브에 파일을 올린 뒤 목록에 뜨기까지 최대 이 시간만큼 걸린다.
 */
const TREE_TTL_MS = 60_000

let treeCache: { value: DriveTree; expiresAt: number } | null = null

/**
 * 렌더 한 번 안에서는 결과를 재사용한다.
 * 레이아웃(사이드바)과 페이지(파일 목록)가 각각 호출해도 드라이브는 한 번만 훑는다.
 */
export const getDriveTree = cache(
  async (): Promise<{ tree: DriveTree | null; error: string | null }> => {
    if (treeCache && Date.now() < treeCache.expiresAt) {
      return { tree: treeCache.value, error: null }
    }

    try {
      const tree = await fetchDriveTree()
      treeCache = { value: tree, expiresAt: Date.now() + TREE_TTL_MS }
      return { tree, error: null }
    } catch (e) {
      return { tree: null, error: e instanceof Error ? e.message : String(e) }
    }
  },
)

/** 자료를 올리거나 지운 직후처럼 곧바로 최신 목록이 필요할 때 캐시를 버린다. */
export function invalidateDriveTree(): void {
  treeCache = null
}

/** 연결 확인용 — 드라이브 전체에서 최근 파일 20건. */
export async function listDriveFiles(): Promise<DriveFile[]> {
  const token = await getAccessToken()

  const params = new URLSearchParams({
    q: 'trashed=false',
    fields: 'files(id,name,mimeType,modifiedTime)',
    pageSize: '20',
    orderBy: 'modifiedTime desc',
  })

  const json = (await driveFetch('files', params, token)) as { files?: DriveFile[] }
  return json.files ?? []
}

export type FileRevision = {
  id: string
  /** 오래된 것부터 1, 2, 3 … 사용자가 보는 "버전" 번호 */
  number: number
  modifiedTime: string
  size: number
  author: string
}

/**
 * 파일 하나의 변경 이력.
 *
 * 파일 메타데이터의 version 필드는 이름 변경 같은 수정에도 올라가서 사용자가
 * 이해하는 "버전"과 어긋난다. 그래서 실제 리비전 목록을 받아 번호를 다시 매긴다.
 * 글마다 부르면 호출 수가 폭발하므로 상세에서 펼칠 때만 쓴다.
 */
export async function listFileRevisions(fileId: string): Promise<FileRevision[]> {
  const token = await getAccessToken()

  const params = new URLSearchParams({
    fields: 'revisions(id,modifiedTime,size,lastModifyingUser(displayName))',
    pageSize: '1000',
  })

  const json = (await driveFetch(`files/${fileId}/revisions`, params, token)) as {
    revisions?: {
      id: string
      modifiedTime: string
      size?: string
      lastModifyingUser?: { displayName?: string }
    }[]
  }

  return (json.revisions ?? []).map((r, i) => ({
    id: r.id,
    number: i + 1,
    modifiedTime: r.modifiedTime,
    size: r.size ? Number(r.size) : 0,
    author: r.lastModifyingUser?.displayName ?? '알 수 없음',
  }))
}
