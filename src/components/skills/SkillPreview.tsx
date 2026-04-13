import ReactMarkdown from 'react-markdown'
import type { SkillFormData } from '../../types/skill'
import { serializeSkill } from '../../lib/parseSkill'

interface SkillPreviewProps {
  formData: SkillFormData
}

export function SkillPreview({ formData }: SkillPreviewProps) {
  const rawMarkdown = serializeSkill(formData)

  return (
    <div className="markdown-preview">
      <ReactMarkdown>{rawMarkdown}</ReactMarkdown>
    </div>
  )
}
