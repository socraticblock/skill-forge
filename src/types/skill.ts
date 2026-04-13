export interface SkillFrontmatter {
  name: string
  description: string
  version?: string
  author?: string
  license?: string
  tags: string[]
  related_skills: string[]
  content: string
  path?: string
  linked_files?: unknown | null
  usage_hint?: string | null
  required_environment_variables: string[]
  required_commands: string[]
  missing_required_environment_variables: string[]
  missing_credential_files: string[]
  missing_required_commands: string[]
  setup_needed: boolean
  setup_skipped: boolean
  readiness_status: string
  metadata?: {
    hermes?: {
      tags?: string[]
      related_skills?: string[]
      verification?: string
    }
  }
  [key: string]: unknown
}

export interface SkillStep {
  id: string
  title: string
  content: string
}

export interface Skill {
  frontmatter: SkillFrontmatter
  body: string
  raw: string
}

export interface SkillFormData {
  name: string
  description: string
  category: string
  tags: string
  body: string
  steps: SkillStep[]
  verification: string
}

export interface PromptVariation {
  id: string
  title: string
  prompt: string
  tone: string
  structure: string
}

export type TabId = 'skills' | 'editor' | 'prompts'
