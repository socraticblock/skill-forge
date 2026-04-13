import { Copy, Check, Save } from 'lucide-react'
import type { PromptVariation } from '../../types/skill'

interface PromptCardProps {
  variation: PromptVariation
  onCopy: (id: string, text: string) => void
  onSaveAsSkill: (variation: PromptVariation) => void
  copied: boolean
}

export function PromptCard({ variation, onCopy, onSaveAsSkill, copied }: PromptCardProps) {
  return (
    <div className="variation-card">
      <div className="variation-card-header">
        <h4>{variation.title}</h4>
        <div className="variation-meta">
          <span>{variation.tone}</span>
          <span>{variation.structure}</span>
        </div>
      </div>

      <pre className="variation-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {variation.prompt}
      </pre>

      <div className="variation-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onCopy(variation.id, variation.prompt)}
          style={{ flex: 1 }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onSaveAsSkill(variation)}
        >
          <Save size={13} />
          Save as Skill
        </button>
      </div>
    </div>
  )
}
