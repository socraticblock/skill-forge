import { create } from 'zustand'
import type { Skill, SkillFormData, TabId } from '../types/skill'

interface SkillsState {
  skills: Skill[]
  currentSkill: Skill | null
  editingSkill: SkillFormData | null
  isDirty: boolean
  activeTab: TabId
  searchQuery: string
  isLoading: boolean

  setSkills: (skills: Skill[]) => void
  setCurrentSkill: (skill: Skill | null) => void
  setEditingSkill: (data: SkillFormData | null) => void
  updateEditingField: (field: keyof SkillFormData, value: unknown) => void
  setIsDirty: (dirty: boolean) => void
  setActiveTab: (tab: TabId) => void
  setSearchQuery: (query: string) => void
  setIsLoading: (loading: boolean) => void

  newSkill: () => void
  deleteSkill: (name: string) => void
}

const emptyFormData: SkillFormData = {
  name: '',
  description: '',
  category: 'general',
  tags: '',
  body: '',
  steps: [],
  verification: '',
}

export const useSkillsStore = create<SkillsState>((set) => ({
  skills: [],
  currentSkill: null,
  editingSkill: null,
  isDirty: false,
  activeTab: 'skills',
  searchQuery: '',
  isLoading: false,

  setSkills: (skills) => set({ skills }),
  setCurrentSkill: (skill) => set({ currentSkill: skill }),
  setEditingSkill: (data) => set({ editingSkill: data, isDirty: false }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  updateEditingField: (field, value) =>
    set((state) => {
      if (!state.editingSkill) return state
      return {
        editingSkill: { ...state.editingSkill, [field]: value },
        isDirty: true,
      }
    }),

  newSkill: () =>
    set({
      currentSkill: null,
      editingSkill: { ...emptyFormData, steps: [] },
      isDirty: false,
      activeTab: 'editor',
    }),

  deleteSkill: (name) =>
    set((state) => ({
      skills: state.skills.filter((s) => s.frontmatter.name !== name),
      currentSkill:
        state.currentSkill?.frontmatter.name === name ? null : state.currentSkill,
    })),
}))
