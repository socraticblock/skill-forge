import { useEffect, useState, useCallback } from 'react'
import { Layers, BookOpen, Wand2, Sun, Moon, Settings2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSkillsStore } from './stores/skillsStore'
import { usePromptBuilderStore } from './stores/promptBuilderStore'
import { SkillsBrowser } from './components/skills/SkillsBrowser'
import { SkillEditor } from './components/skills/SkillEditor'
import { PromptBuilder } from './components/prompts/PromptBuilder'
import { Settings } from './components/Settings'
import type { TabId } from './types/skill'
import './App.css'

function App() {
  const { activeTab, setActiveTab } = useSkillsStore()
  const { isGenerating } = usePromptBuilderStore()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // ── Theme ──────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useKeyboardShortcuts([
    {
      key: 's',
      meta: true,
      action: () => {
        if (activeTab === 'editor') {
          document.querySelector<HTMLButtonElement>('[data-save-btn]')?.click()
        }
      },
      description: 'Save skill (Cmd+S)',
    },
    {
      key: 'n',
      meta: true,
      action: () => {
        setActiveTab('editor')
        setTimeout(() => {
          document.querySelector<HTMLButtonElement>('[data-new-skill-btn]')?.click()
        }, 50)
      },
      description: 'New skill (Cmd+N)',
    },
    {
      key: 'Enter',
      meta: true,
      action: () => {
        if (activeTab === 'prompts' && !isGenerating) {
          document.querySelector<HTMLButtonElement>('[data-generate-btn]')?.click()
        }
      },
      description: 'Generate prompts (Cmd+Enter)',
    },
    {
      key: ',',
      meta: true,
      action: () => setSettingsOpen(true),
      description: 'Open settings (Cmd+,)',
    },
  ])

  useEffect(() => {
    document.title = 'SkillForge — Hermes Skill Builder'
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          {/* Brand */}
          <div className="header-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#7c6fff" />
              <path d="M8 10.5L14 7L20 10.5V17.5L14 21L8 17.5V10.5Z" stroke="white" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2.5" fill="white" />
            </svg>
            <span className="brand-name">SkillForge</span>
            <span className="brand-tag">Hermes</span>
          </div>

          {/* Tab navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="tab-nav">
            <TabsList variant="line" className="tab-list">
              <TabsTrigger value="skills" className="tab-trigger">
                <Layers size={15} />
                Skills
              </TabsTrigger>
              <TabsTrigger value="editor" className="tab-trigger">
                <BookOpen size={15} />
                Editor
              </TabsTrigger>
              <TabsTrigger value="prompts" className="tab-trigger">
                <Wand2 size={15} />
                Prompts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Right actions */}
          <div className="header-links">
            <Button
              variant="ghost"
              size="sm"
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="settings-toggle"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings2 size={15} />
            </Button>

            <a
              href="https://github.com/socraticblock/skill-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {activeTab === 'skills' && <SkillsBrowser />}
        {activeTab === 'editor' && <SkillEditor />}
        {activeTab === 'prompts' && <PromptBuilder />}
      </main>

      {/* Settings dialog */}
      <Settings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export default App
