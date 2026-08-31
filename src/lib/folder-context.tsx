'use client'

import { createContext, useContext, useState } from 'react'

type FolderCtxValue = {
  currentFolderId: string
  navigate: (id: string) => void
}

const FolderCtx = createContext<FolderCtxValue>({
  currentFolderId: 'root',
  navigate: () => {},
})

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState('root')
  return (
    <FolderCtx.Provider value={{ currentFolderId, navigate: setCurrentFolderId }}>
      {children}
    </FolderCtx.Provider>
  )
}

export function useFolderCtx() {
  return useContext(FolderCtx)
}
