import { useState, useEffect } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useSkillsStore } from '../../stores/skillsStore'
import { skillToFormData } from '../../lib/parseSkill'
import { SkillCard } from './SkillCard'
import type { Skill } from '../../types/skill'
// Demo skills to show when no real data is available
const DEMO_SKILLS: Skill[] = [
  {
    frontmatter: {
      name: 'code-review',
      description: 'Perform a thorough code review focusing on logic errors, security vulnerabilities, and code quality.',
      version: '1.0',
      tags: ['development', 'quality', 'security'],
      related_skills: [],
      content: 'You are an expert code reviewer. Analyze the provided code for issues.',
      path: '~/.hermes/skills/code-review.md',
      linked_files: null,
      usage_hint: null,
      required_environment_variables: [],
      required_commands: [],
      missing_required_environment_variables: [],
      missing_credential_files: [],
      missing_required_commands: [],
      setup_needed: false,
      setup_skipped: false,
      readiness_status: 'available',
    },
    body: 'You are an expert code reviewer.',
    raw: '',
  },
  {
    frontmatter: {
      name: 'debug-socratic',
      description: 'Help debug code using Socratic questioning — guide users to find answers through targeted questions.',
      version: '1.0',
      tags: ['debugging', 'teaching', 'socratic'],
      related_skills: [],
      content: 'When debugging, ask targeted questions to lead the user to discover the root cause themselves.',
      path: '~/.hermes/skills/debug-socratic.md',
      linked_files: null,
      usage_hint: null,
      required_environment_variables: [],
      required_commands: [],
      missing_required_environment_variables: [],
      missing_credential_files: [],
      missing_required_commands: [],
      setup_needed: false,
      setup_skipped: false,
      readiness_status: 'available',
    },
    body: 'When debugging, ask targeted questions...',
    raw: '',
  },
  {
    frontmatter: {
      name: 'root-cause-analysis',
      description: 'Systematic approach to finding root causes of bugs or system failures using the 5 Whys technique.',
      version: '1.0',
      tags: ['debugging', 'analysis', 'systematic'],
      related_skills: [],
      content: 'Use the 5 Whys technique to systematically trace problems back to their root cause.',
      path: '~/.hermes/skills/root-cause-analysis.md',
      linked_files: null,
      usage_hint: null,
      required_environment_variables: [],
      required_commands: [],
      missing_required_environment_variables: [],
      missing_credential_files: [],
      missing_required_commands: [],
      setup_needed: false,
      setup_skipped: false,
      readiness_status: 'available',
    },
    body: 'Use the 5 Whys technique...',
    raw: '',
  },
  {
    frontmatter: {
      name: 'rubber-duck',
      description: 'Explain your code line-by-line to uncover hidden assumptions and bugs. Classic rubber duck debugging.',
      version: '1.0',
      tags: ['debugging', 'explanation', 'clarity'],
      related_skills: [],
      content: 'Explain your code as if talking to a rubber duck. Line by line, describe what each part does.',
      path: '~/.hermes/skills/rubber-duck.md',
      linked_files: null,
      usage_hint: null,
      required_environment_variables: [],
      required_commands: [],
      missing_required_environment_variables: [],
      missing_credential_files: [],
      missing_required_commands: [],
      setup_needed: false,
      setup_skipped: false,
      readiness_status: 'available',
    },
    body: 'Explain your code as if talking to a rubber duck...',
    raw: '',
  },
]

export function SkillsBrowser() {
  const { skills, setSkills, setEditingSkill, setCurrentSkill, setActiveTab, deleteSkill, searchQuery, setSearchQuery } =
    useSkillsStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Load demo skills on mount (in real app, this would be Hermes MCP calls)
  useEffect(() => {
    if (skills.length === 0) {
      setSkills(DEMO_SKILLS)
    }
  }, [])

  const filteredSkills = skills.filter((s) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.frontmatter.name.toLowerCase().includes(q) ||
      s.frontmatter.description.toLowerCase().includes(q) ||
      s.frontmatter.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  const handleOpenSkill = (skill: Skill) => {
    setCurrentSkill(skill)
    setEditingSkill(skillToFormData(skill))
    setActiveTab('editor')
  }

  const handleNewSkill = () => {
    setCurrentSkill(null)
    setEditingSkill({
      name: '',
      description: '',
      category: 'general',
      tags: '',
      body: '',
      steps: [],
      verification: '',
    })
    setActiveTab('editor')
  }

  const handleDeleteSkill = (name: string) => {
    deleteSkill(name)
    setConfirmDelete(null)
  }

  return (
    <div className="skills-browser">
      <div className="browser-header">
        <h2 className="browser-title">Skills Library</h2>
        <div className="browser-actions">
          <div className="search-input">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleNewSkill}>
            <Plus size={15} />
            New Skill
          </button>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3>No skills found</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Create your first skill to get started'}</p>
          <button className="btn btn-primary" onClick={handleNewSkill}>
            <Plus size={15} />
            New Skill
          </button>
        </div>
      ) : (
        <div className="skills-grid">
          {filteredSkills.map((skill) => (
            <div key={skill.frontmatter.name} className="skill-card-wrapper" style={{ position: 'relative' }}>
              {confirmDelete === skill.frontmatter.name ? (
                <div className="skill-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    Delete <strong>{skill.frontmatter.name}</strong>?
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSkill(skill.frontmatter.name)}>
                      Delete
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SkillCard skill={skill} onClick={() => handleOpenSkill(skill)} />
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(skill.frontmatter.name)
                    }}
                    title="Delete skill"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
