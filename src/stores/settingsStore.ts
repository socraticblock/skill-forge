import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  proxyUrl: string
  setProxyUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      proxyUrl: 'http://localhost:8080',
      setProxyUrl: (url) => set({ proxyUrl: url }),
    }),
    { name: 'skillforge-settings' }
  )
)
