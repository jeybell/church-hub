import type { FolderItem } from './types'

export function getChildren(folders: FolderItem[], parentId: string | null): FolderItem[] {
  return folders.filter(f => f.parentId === parentId)
}

export function getFolderPath(folders: FolderItem[], folderId: string): FolderItem[] {
  const path: FolderItem[] = []
  let current = folders.find(f => f.id === folderId)
  while (current) {
    path.unshift(current)
    if (current.parentId === null) break
    current = folders.find(f => f.id === current!.parentId)
  }
  return path
}

export function getAncestorIds(folders: FolderItem[], folderId: string): Set<string> {
  const ids = new Set<string>()
  let current = folders.find(f => f.id === folderId)
  while (current) {
    ids.add(current.id)
    if (current.parentId === null) break
    current = folders.find(f => f.id === current!.parentId)
  }
  return ids
}

export function countDescendantFiles(
  folders: FolderItem[],
  folderId: string,
  fileFolderIds: string[],
): number {
  const stack = [folderId]
  const visited = new Set<string>()
  let count = 0
  while (stack.length > 0) {
    const id = stack.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    count += fileFolderIds.filter(fid => fid === id).length
    getChildren(folders, id).forEach(c => stack.push(c.id))
  }
  return count
}

export function getFolderName(folders: FolderItem[], folderId: string): string {
  return folders.find(f => f.id === folderId)?.name ?? '알 수 없음'
}
