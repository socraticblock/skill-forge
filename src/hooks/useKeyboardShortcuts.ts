import { useEffect } from 'react'

interface Shortcut {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.metaKey && !e.ctrlKey
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey && !e.ctrlKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey

        if (keyMatch && (ctrlMatch || metaMatch) && shiftMatch) {
          // Allow Cmd+S / Ctrl+S even in inputs (browser default save)
          const isSaveShortcut = shortcut.key === 's' && (shortcut.meta || shortcut.ctrl)

          if (!isEditing || isSaveShortcut) {
            e.preventDefault()
            shortcut.action()
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}
