import yaml from 'js-yaml'
import type { Skill, SkillFrontmatter, SkillFormData } from '../types/skill'

/**
 * Parse a raw skill markdown file into a Skill object.
 * Splits YAML frontmatter from markdown body.
 */
export function parseSkill(raw: string, filePath?: string): Skill {
  const fence = '---'
  const lines = raw.split('\n')

  let bodyStart = 0
  let inFrontmatter = false
  let frontmatterLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i === 0 && line.trim() === fence) {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter && line.trim() === fence) {
      bodyStart = i + 1
      break
    }
    if (inFrontmatter) {
      frontmatterLines.push(line)
    }
  }

  const frontmatterStr = frontmatterLines.join('\n')
  let frontmatter: SkillFrontmatter

  try {
    frontmatter = yaml.load(frontmatterStr) as SkillFrontmatter
  } catch {
    frontmatter = {
      name: filePath ? filePath.split('/').pop()?.replace('.md', '') || '' : '',
      description: '',
      tags: [],
      related_skills: [],
      content: '',
      path: filePath,
      linked_files: null,
      required_environment_variables: [],
      required_commands: [],
      missing_required_environment_variables: [],
      missing_credential_files: [],
      missing_required_commands: [],
      setup_needed: false,
      setup_skipped: false,
      readiness_status: 'available',
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim()

  return {
    frontmatter: { ...frontmatter, path: filePath },
    body,
    raw,
  }
}

/**
 * Serialize a SkillFormData back into markdown string with YAML frontmatter.
 */
export function serializeSkill(form: SkillFormData): string {
  const frontmatter: Record<string, unknown> = {
    name: form.name,
    description: form.description,
    tags:
      form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    related_skills: [],
    content: form.body,
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
  }

  if (form.category && form.category !== 'general') {
    frontmatter.category = form.category
  }

  const verification = form.verification.trim()
  if (verification) {
    frontmatter.metadata = {
      hermes: {
        verification: verification,
      },
    }
  }

  const yamlStr = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true })
  return `---\n${yamlStr}---\n\n${form.body}`
}

/**
 * Convert a parsed Skill into form data for editing.
 */
export function skillToFormData(skill: Skill): SkillFormData {
  const fm = skill.frontmatter
  const verification = (fm.metadata as { hermes?: { verification?: string } } | undefined)

  return {
    name: fm.name || '',
    description: fm.description || '',
    category: (fm['category'] as string | undefined) || 'general',
    tags: fm.tags?.join(', ') || '',
    body: fm.content || skill.body || '',
    steps: [],
    verification: verification?.hermes?.verification || '',
  }
}

/**
 * Generate a skill filename from the name.
 */
export function skillToFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '.md'
}
