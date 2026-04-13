import { useState, useCallback } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { usePromptBuilderStore } from '../../stores/promptBuilderStore'
import { useSkillsStore } from '../../stores/skillsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { PromptCard } from './PromptCard'
import type { PromptVariation } from '../../types/skill'

const VARIATION_DESCRIPTIONS: Record<number, string> = {
  1: 'One focused, refined prompt',
  2: 'Two distinct approaches to compare',
  3: 'Three variations for maximum exploration',
  4: 'Four diverse styles to find your perfect fit',
}

async function generateFromServer(goal: string, count: number, proxyUrl: string): Promise<PromptVariation[]> {
  const res = await fetch(`${proxyUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, variation_count: count }),
  })

  if (!res.ok) {
    let msg = `Server error ${res.status}`
    try {
      const err = await res.json()
      msg = err.error || msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const data = await res.json()
  return data.variations as PromptVariation[]
}

export function PromptBuilder() {
  const {
    goal,
    setGoal,
    variationCount,
    setVariationCount,
    variations,
    setVariations,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    clearVariations,
  } = usePromptBuilderStore()

  const { setEditingSkill, setActiveTab } = useSkillsStore()
  const { proxyUrl } = useSettingsStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) return

    setIsGenerating(true)
    setError(null)
    clearVariations()

    try {
      const newVariations = await generateFromServer(goal, variationCount, proxyUrl)
      setVariations(newVariations)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed'
      setError(msg)
    } finally {
      setIsGenerating(false)
    }
  }, [goal, variationCount, setIsGenerating, setError, clearVariations, setVariations, proxyUrl])

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleSaveAsSkill = useCallback(
    (variation: PromptVariation) => {
      setEditingSkill({
        name: `prompt-${variation.tone.toLowerCase()}-${variation.structure.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Generated ${variation.tone} prompt with ${variation.structure} structure for: ${goal.slice(0, 60)}${goal.length > 60 ? '...' : ''}`,
        category: 'general',
        tags: `prompt,${variation.tone.toLowerCase()},${variation.structure.toLowerCase()}`,
        body: variation.prompt,
        steps: [],
        verification: '',
      })
      setActiveTab('editor')
    },
    [goal, setEditingSkill, setActiveTab]
  )

  return (
    <div className="prompt-builder animate-fade-in">
      <div className="prompt-builder-header">
        <h2>Prompt Builder</h2>
        <p>Describe what you want your AI to do, and generate multiple prompt variations to compare.</p>
      </div>

      <div className="prompt-input-section">
        <label className="input-label">What do you want your AI to help you with?</label>
        <Textarea
          placeholder="e.g. Debug my Python code and help me find the bug, or Review my pull request for security issues, or Teach me how neural networks work..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="goal-textarea"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleGenerate()
            }
          }}
        />

        <div className="variation-row">
          <span className="variation-label">
            Generate {variationCount} {variationCount === 1 ? 'variation' : 'variations'} —{' '}
            {VARIATION_DESCRIPTIONS[variationCount]}
          </span>
          <div className="variation-pills">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`variation-pill ${variationCount === n ? 'active' : ''}`}
                onClick={() => setVariationCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!goal.trim() || isGenerating}
          className="generate-btn"
          data-generate-btn
        >
          {isGenerating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={15} />
              Generate Prompts
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="error-state">
          {error}
          <br />
          <small>Make sure the Python proxy server is running at <code>{proxyUrl}</code></small>
        </div>
      )}

      {!isGenerating && variations.length > 0 && (
        <>
          <h3 className="variations-heading">
            {variations.length} Prompt {variations.length === 1 ? 'Variation' : 'Variations'} — pick your favorite
          </h3>
          <div className="variations-grid">
            {variations.map((v) => (
              <PromptCard
                key={v.id}
                variation={v}
                onCopy={handleCopy}
                onSaveAsSkill={handleSaveAsSkill}
                copied={copiedId === v.id}
              />
            ))}
          </div>
        </>
      )}

      {!isGenerating && variations.length === 0 && !error && (
        <div className="empty-prompt-state">
          <Wand2 size={24} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>Enter a goal above and generate prompt variations</p>
        </div>
      )}
    </div>
  )
}
