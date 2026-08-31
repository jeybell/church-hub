'use client'

import { createContext, useContext, useState } from 'react'
import type { FolderItem } from './types'

type FolderCtxValue = {
  folders: FolderItem[]
  rootId: string
  currentFolderId: string
  navigate: (id: string) => void
}

const FolderCtx = createContext<FolderCtxValue>({
  folders: [],
  rootId: '',
  currentFolderId: '',
  navigate: () => {},
})

export function FolderProvider({
  folders,
  rootId,
  children,
}: {
  folders: FolderItem[]
  rootId: string
  children: React.ReactNode
}) {
  const [currentFolderId, setCurrentFolderId] = useState(rootId)
  return (
    <FolderCtx.Provider
      value={{ folders, rootId, currentFolderId, navigate: setCurrentFolderId }}
    >
      {children}
    </FolderCtx.Provider>
  )
}

export function useFolderCtx() {
  return useContext(FolderCtx)
}
