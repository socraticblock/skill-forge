import { useEffect } from 'react'
import { Layers, BookOpen, Wand2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSkillsStore } from './stores/skillsStore'
import { SkillsBrowser } from './components/skills/SkillsBrowser'
import { SkillEditor } from './components/skills/SkillEditor'
import { PromptBuilder } from './components/prompts/PromptBuilder'
import type { TabId } from './types/skill'
import './App.css'

function App() {
  const { activeTab, setActiveTab } = useSkillsStore()

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

          {/* Links */}
          <div className="header-links">
            <a
              href="https://hermes-agent.nousresearch.com/docs/skills/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
            >
              Docs
            </a>
            <a
              href="https://github.com/nousresearch/hermes-agent"
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
    </div>
  )
}

export default App
