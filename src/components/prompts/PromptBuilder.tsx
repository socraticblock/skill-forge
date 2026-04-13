import { useState, useCallback } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { usePromptBuilderStore } from '../../stores/promptBuilderStore'
import { useSkillsStore } from '../../stores/skillsStore'
import { PromptCard } from './PromptCard'
import type { PromptVariation } from '../../types/skill'

const VARIATION_DESCRIPTIONS: Record<number, string> = {
  1: 'One focused, refined prompt',
  2: 'Two distinct approaches to compare',
  3: 'Three variations for maximum exploration',
  4: 'Four diverse styles to find your perfect fit',
}

const TONES = ['Socratic', 'Directive', 'Collaborative', 'Expert']
const STRUCTURES = ['Step-by-step', 'Conversational', 'Checklist', 'Narrative']

function generateVariation(id: string, goal: string, index: number): PromptVariation {
  const toneIdx = index % TONES.length
  const structIdx = (index + 2) % STRUCTURES.length
  const tone = TONES[toneIdx]
  const structure = STRUCTURES[structIdx]

  const toneInstructions: Record<string, string> = {
    Socratic: 'Guide the user through questions. Ask targeted questions that lead them to discover the answer themselves. Use phrases like "What have you tried?", "What do you think causes...", "If we looked at it from..."',
    Directive: 'Be direct and authoritative. Provide clear instructions and definitive guidance. Take charge of the problem-solving process with confidence.',
    Collaborative: 'Work alongside the user as a partner. Share your thinking process openly. Use "Let\'s", "We can", "I suggest we try..."',
    Expert: 'Draw on deep expertise. Reference specific patterns, principles, or past cases. Explain the "why" behind recommendations with technical depth.',
  }

  const structureInstructions: Record<string, string> = {
    'Step-by-step': 'Present your response as a numbered sequence of clear, actionable steps.',
    Conversational: 'Engage in a natural back-and-forth dialogue. Check understanding before proceeding to the next step.',
    Checklist: 'Use a clear checklist format so the user can track their progress item by item.',
    Narrative: 'Tell a story about how this problem was solved or how this approach came to be. Make it engaging and memorable.',
  }

  const prompt = `You are a helpful AI assistant with a ${tone.toLowerCase()} communication style.

When helping with: ${goal}

${toneInstructions[tone]}

${structureInstructions[structure]}

Focus on understanding the user's actual goal, not just the immediate request. Ask clarifying questions when the problem is ambiguous.`

  return {
    id,
    title: `${tone} ${structure}`,
    prompt: prompt.trim(),
    tone,
    structure,
  }
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) return

    setIsGenerating(true)
    setError(null)
    clearVariations()

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const newVariations: PromptVariation[] = Array.from({ length: variationCount }, (_, i) =>
      generateVariation(`var-${Date.now()}-${i}`, goal, i)
    )

    setVariations(newVariations)
    setIsGenerating(false)
  }, [goal, variationCount, setIsGenerating, setError, clearVariations, setVariations])

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
        <textarea
          className="goal-textarea"
          placeholder="e.g. Debug my Python code and help me find the bug, or Review my pull request for security issues, or Teach me how neural networks work..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
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

        <button
          className="btn btn-primary generate-btn"
          onClick={handleGenerate}
          disabled={!goal.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 size={15} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={15} />
              Generate Prompts
            </>
          )}
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {isGenerating && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Generating prompt variations...</p>
        </div>
      )}

      {!isGenerating && variations.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: '1.5rem 0 0.75rem' }}>
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
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
          <Wand2 size={24} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>Enter a goal above and generate prompt variations</p>
        </div>
      )}
    </div>
  )
}
