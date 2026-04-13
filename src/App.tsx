import { useEffect } from 'react'
import { BookOpen, Wand2, Layers } from 'lucide-react'
import { useSkillsStore } from './stores/skillsStore'
import { SkillsBrowser } from './components/skills/SkillsBrowser'
import { SkillEditor } from './components/skills/SkillEditor'
import { PromptBuilder } from './components/prompts/PromptBuilder'
import type { TabId } from './types/skill'
import './App.css'

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'skills', label: 'Skills', icon: Layers },
  { id: 'editor', label: 'Editor', icon: BookOpen },
  { id: 'prompts', label: 'Prompts', icon: Wand2 },
]

function App() {
  const { activeTab, setActiveTab } = useSkillsStore()

  useEffect(() => {
    document.title = 'SkillForge — Hermes Skill Builder'
  }, [])

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#7c6fff" />
              <path d="M8 10.5L14 7L20 10.5V17.5L14 21L8 17.5V10.5Z" stroke="white" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2.5" fill="white" />
            </svg>
            <span className="brand-name">SkillForge</span>
            <span className="brand-tag">Hermes</span>
          </div>

          {/* Tab nav */}
          <nav className="tab-nav">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

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
