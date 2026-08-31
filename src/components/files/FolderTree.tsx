'use client'

import { useState, useEffect } from 'react'
import { useFolderCtx } from '@/lib/folder-context'
import { MOCK_FOLDERS } from '@/lib/mock-data'
import { getChildren, getAncestorIds } from '@/lib/folder-utils'
import type { FolderItem } from '@/lib/types'

function FolderIcon({ open, active }: { open: boolean; active: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
      className={active ? 'text-indigo-500' : 'text-zinc-400'}
    >
      {open ? (
        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 12h-15a4.483 4.483 0 0 0-3 1.146Z" />
      ) : (
        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 12h-15a4.483 4.483 0 0 0-3 1.146Z" />
      )}
    </svg>
  )
}

type NodeProps = {
  folder: FolderItem
  depth: number
  expanded: Set<string>
  currentFolderId: string
  onToggle: (id: string) => void
  onNavigate: (id: string) => void
}

function FolderNode({ folder, depth, expanded, currentFolderId, onToggle, onNavigate }: NodeProps) {
  const children = getChildren(MOCK_FOLDERS, folder.id)
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(folder.id)
  const isActive = currentFolderId === folder.id

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onNavigate(folder.id)
    if (hasChildren) onToggle(folder.id)
  }

  function handleChevronClick(e: React.MouseEvent) {
    e.stopPropagation()
    onToggle(folder.id)
  }

  return (
    <div>
      <div
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={handleClick}
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer text-sm transition-colors select-none ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        }`}
      >
        {/* Chevron */}
        <button
          onClick={handleChevronClick}
          className={`w-4 h-4 flex items-center justify-center flex-shrink-0 rounded transition-transform ${
            !hasChildren ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <FolderIcon open={isExpanded} active={isActive} />
        <span className="truncate flex-1">{folder.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              expanded={expanded}
              currentFolderId={currentFolderId}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FolderTree() {
  const { currentFolderId, navigate } = useFolderCtx()

  const [expanded, setExpanded] = useState<Set<string>>(() =>
    getAncestorIds(MOCK_FOLDERS, currentFolderId)
  )

  // auto-expand ancestors when currentFolderId changes
  useEffect(() => {
    setExpanded(prev => {
      const ancestors = getAncestorIds(MOCK_FOLDERS, currentFolderId)
      const next = new Set(prev)
      ancestors.forEach(id => next.add(id))
      return next
    })
  }, [currentFolderId])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const roots = getChildren(MOCK_FOLDERS, null)

  return (
    <div className="flex flex-col gap-0.5">
      {roots.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          expanded={expanded}
          currentFolderId={currentFolderId}
          onToggle={toggle}
          onNavigate={navigate}
        />
      ))}
    </div>
  )
}
