import { create } from 'zustand'
import type { PromptVariation } from '../types/skill'

interface PromptBuilderState {
  goal: string
  variationCount: number
  variations: PromptVariation[]
  isGenerating: boolean
  error: string | null

  setGoal: (goal: string) => void
  setVariationCount: (count: number) => void
  setVariations: (variations: PromptVariation[]) => void
  setIsGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  clearVariations: () => void
}

export const usePromptBuilderStore = create<PromptBuilderState>((set) => ({
  goal: '',
  variationCount: 2,
  variations: [],
  isGenerating: false,
  error: null,

  setGoal: (goal) => set({ goal }),
  setVariationCount: (count) => set({ variationCount: count }),
  setVariations: (variations) => set({ variations }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  clearVariations: () => set({ variations: [], error: null }),
}))
