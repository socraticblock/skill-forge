import { useState, useEffect } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSkillsStore } from '../../stores/skillsStore'
import { skillToFormData } from '../../lib/parseSkill'
import { SkillCard } from './SkillCard'
import type { Skill } from '../../types/skill'

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
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null)

  // Load demo skills on mount
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

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSkill(deleteTarget.frontmatter.name)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="skills-browser">
      <div className="browser-header">
        <h2 className="browser-title">Skills Library</h2>
        <div className="browser-actions">
          <div className="search-input">
            <Search size={14} />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-field"
            />
          </div>
          <Button onClick={handleNewSkill} className="btn-primary">
            <Plus size={15} />
            New Skill
          </Button>
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
          <Button onClick={handleNewSkill}>
            <Plus size={15} />
            New Skill
          </Button>
        </div>
      ) : (
        <div className="skills-grid">
          {filteredSkills.map((skill) => (
            <div key={skill.frontmatter.name} className="skill-card-wrapper">
              <SkillCard skill={skill} onClick={() => handleOpenSkill(skill)} />
              <Button
                variant="ghost"
                size="sm"
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(skill)
                }}
                title="Delete skill"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete skill?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.frontmatter.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
