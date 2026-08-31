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
  starred?: boolean
  description?: string
  appProperties?: Record<string, string>
  owners?: { displayName?: string }[]
  lastModifyingUser?: { displayName?: string }
}

async function getAccessToken(): Promise<string> {
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
  const json = (await res.json()) as { access_token?: string }
  if (!res.ok || !json.access_token) throw new Error('토큰 갱신 실패')
  return json.access_token
}

async function driveFetch(path: string, params: URLSearchParams, token: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`드라이브 조회 실패 (${res.status})`)
  return res.json()
}

/** 폴더 하나의 직계 자식을 모두 가져온다 (페이지네이션 포함). */
async function listChildren(folderId: string, token: string): Promise<RawFile[]> {
  const items: RawFile[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
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
    const results = await Promise.all(level.map(id => listChildren(id, token)))
    const nextLevel: string[] = []

    results.forEach((children, i) => {
      const parentId = level[i]
      for (const child of children) {
        if (child.mimeType === FOLDER_MIME) {
          folders.push({ id: child.id, name: child.name, parentId })
          nextLevel.push(child.id)
        } else {
          files.push(toFileItem(child, parentId))
        }
      }
    })

    level = nextLevel
  }

  folders.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return { root, folders, files }
}

/**
 * 렌더 한 번 안에서는 결과를 재사용한다.
 * 레이아웃(사이드바)과 페이지(파일 목록)가 각각 호출해도 드라이브는 한 번만 훑는다.
 */
export const getDriveTree = cache(
  async (): Promise<{ tree: DriveTree | null; error: string | null }> => {
    try {
      return { tree: await fetchDriveTree(), error: null }
    } catch (e) {
      return { tree: null, error: e instanceof Error ? e.message : String(e) }
    }
  },
)

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
