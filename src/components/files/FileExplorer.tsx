'use client'

import { useState } from 'react'
import FileList from './FileList'
import FileGrid from './FileGrid'
import FileDetailsPanel from './FileDetailsPanel'
import UploadDialog from '@/components/upload/UploadDialog'
import SkeletonList from '@/components/ui/SkeletonList'
import { useFolderCtx } from '@/lib/folder-context'
import { MOCK_FOLDERS } from '@/lib/mock-data'
import { getChildren, getFolderPath } from '@/lib/folder-utils'
import type { FileItem, FolderItem, ViewMode } from '@/lib/types'

type Action = 'preview' | 'download' | 'favorite' | 'rename' | 'move' | 'delete'

type Props = {
  files: FileItem[]
}

export default function FileExplorer({ files }: Props) {
  const { currentFolderId, navigate } = useFolderCtx()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const subfolders = getChildren(MOCK_FOLDERS, currentFolderId)
  const folderFiles = files.filter(f => f.folderId === currentFolderId)
  const breadcrumb = getFolderPath(MOCK_FOLDERS, currentFolderId)
  const currentFolder = MOCK_FOLDERS.find(f => f.id === currentFolderId)

  function handleSelect(file: FileItem) {
    setSelectedFile(prev => prev?.id === file.id ? null : file)
  }

  function handleAction(file: FileItem, action: Action) {
    if (action === 'preview') setSelectedFile(file)
  }

  return (
    <>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 flex-shrink-0 gap-4">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-zinc-900 truncate">
                {currentFolder?.name ?? '전체 자료'}
              </h1>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 mt-0.5 flex-wrap">
                {breadcrumb.map((folder, i) => (
                  <span key={folder.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-zinc-300 text-xs">›</span>}
                    <button
                      onClick={() => navigate(folder.id)}
                      className={`text-xs transition-colors ${
                        i === breadcrumb.length - 1
                          ? 'text-zinc-600 font-medium cursor-default'
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      {folder.name}
                    </button>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search */}
              <div className="relative hidden sm:block">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="검색"
                  className="h-8 w-40 pl-8 pr-3 text-sm bg-zinc-100 border border-transparent rounded-lg placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-300 transition-colors"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('list')}
                  className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-400 hover:text-zinc-600'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </button>
                <button onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-400 hover:text-zinc-600'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </button>
              </div>

              {/* Upload button */}
              <button onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">자료 업로드</span>
                <span className="sm:hidden">업로드</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              <FileList
                folders={subfolders}
                files={folderFiles}
                selectedId={selectedFile?.id ?? null}
                searchQuery={searchQuery}
                onSelect={handleSelect}
                onAction={handleAction}
              />
            ) : (
              <FileGrid
                files={folderFiles}
                selectedId={selectedFile?.id ?? null}
                searchQuery={searchQuery}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>

        {/* Details panel */}
        {selectedFile && (
          <FileDetailsPanel file={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </div>

      {uploadOpen && <UploadDialog onClose={() => setUploadOpen(false)} />}
    </>
  )
}
