import { ExternalLink } from 'lucide-react'
import type { Skill } from '../../types/skill'

interface SkillCardProps {
  skill: Skill
  onClick: () => void
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  const fm = skill.frontmatter
  const tags = fm.tags?.slice(0, 3) || []

  return (
    <div className="skill-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="skill-card-header">
        <h3 className="skill-card-name">{fm.name}</h3>
        <ExternalLink size={13} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
      </div>

      <p className="skill-card-desc">
        {fm.description || 'No description provided.'}
      </p>

      {tags.length > 0 && (
        <div className="skill-card-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
