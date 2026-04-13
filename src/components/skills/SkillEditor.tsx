import { useCallback } from 'react'
import { Save, RotateCcw, Eye, Edit3 } from 'lucide-react'
import { useSkillsStore } from '../../stores/skillsStore'
import { serializeSkill, skillToFilename } from '../../lib/parseSkill'
import { SkillPreview } from './SkillPreview'

export function SkillEditor() {
  const { editingSkill, isDirty, setIsDirty, setEditingSkill, currentSkill, skills, setSkills, setActiveTab } =
    useSkillsStore()

  const updateField = useCallback(
    (field: string, value: unknown) => {
      setEditingSkill(editingSkill ? { ...editingSkill, [field]: value } : null)
      setIsDirty(true)
    },
    [editingSkill, setEditingSkill, setIsDirty]
  )

  const handleBodyChange = useCallback(
    (value: string) => {
      updateField('body', value)
    },
    [updateField]
  )

  const handleSave = useCallback(() => {
    if (!editingSkill || !editingSkill.name.trim()) return

    const raw = serializeSkill(editingSkill)
    const newSkill = {
      frontmatter: {
        name: editingSkill.name,
        description: editingSkill.description,
        tags: editingSkill.tags.split(',').map((t) => t.trim()).filter(Boolean),
        related_skills: [],
        content: editingSkill.body,
        path: `~/.hermes/skills/${skillToFilename(editingSkill.name)}`,
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
      body: editingSkill.body,
      raw,
    }

    const existingIndex = skills.findIndex((s) => s.frontmatter.name === editingSkill.name)
    if (existingIndex >= 0) {
      const updated = [...skills]
      updated[existingIndex] = newSkill
      setSkills(updated)
    } else {
      setSkills([newSkill, ...skills])
    }

    setIsDirty(false)
  }, [editingSkill, skills, setSkills, setIsDirty])

  const handleReset = useCallback(() => {
    if (!currentSkill) {
      setEditingSkill({
        name: '',
        description: '',
        category: 'general',
        tags: '',
        body: '',
        steps: [],
        verification: '',
      })
    } else {
      setEditingSkill({
        name: currentSkill.frontmatter.name,
        description: currentSkill.frontmatter.description,
        category: 'general',
        tags: currentSkill.frontmatter.tags.join(', '),
        body: currentSkill.frontmatter.content || currentSkill.body,
        steps: [],
        verification: '',
      })
    }
    setIsDirty(false)
  }, [currentSkill, setEditingSkill, setIsDirty])

  const handleExportMarkdown = useCallback(() => {
    if (!editingSkill) return
    const raw = serializeSkill(editingSkill)
    const blob = new Blob([raw], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = skillToFilename(editingSkill.name || 'untitled-skill')
    a.click()
    URL.revokeObjectURL(url)
  }, [editingSkill])

  if (!editingSkill) {
    return (
      <div className="no-selection">
        <div className="no-selection-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <h3>No skill selected</h3>
        <p>Choose a skill from the library or create a new one.</p>
        <button className="btn btn-primary" onClick={() => setActiveTab('skills')}>
          <Edit3 size={15} />
          Browse Skills
        </button>
      </div>
    )
  }

  return (
    <div className="editor-container animate-fade-in">
      {/* Top bar */}
      <div className="editor-topbar">
        <h2>
          {currentSkill ? `Editing: ${currentSkill.frontmatter.name}` : 'New Skill'}
        </h2>
        <div className="editor-actions">
          {isDirty && <span className="dirty-indicator">● Unsaved changes</span>}
          <button className="btn btn-ghost btn-sm" onClick={handleExportMarkdown} title="Export as .md file">
            Export .md
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw size={13} />
            Reset
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!editingSkill.name.trim()}>
            <Save size={13} />
            Save Skill
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="split-pane">
        {/* Left: Edit pane */}
        <div className="pane">
          <div className="pane-header">
            <span><Edit3 size={12} /> Editor</span>
          </div>
          <div className="pane-content">
            {/* Metadata */}
            <div className="meta-form">
              <div className="form-field">
                <label className="form-label">Skill Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. code-review, debug-socratic"
                  value={editingSkill.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="What does this skill do? Who is it for?"
                  value={editingSkill.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input form-select"
                    value={editingSkill.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="development">Development</option>
                    <option value="debugging">Debugging</option>
                    <option value="analysis">Analysis</option>
                    <option value="writing">Writing</option>
                    <option value="research">Research</option>
                    <option value="creative">Creative</option>
                    <option value="teaching">Teaching</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="debugging, python, socratic"
                    value={editingSkill.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="form-field" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Skill Content (Markdown)</label>
              <textarea
                className="form-input body-editor"
                placeholder={'You are an expert code reviewer...\n\nFollow these steps:\n1. Read the code carefully\n2. Check for security issues\n3. Suggest improvements'}
                value={editingSkill.body}
                onChange={(e) => handleBodyChange(e.target.value)}
                spellCheck={false}
              />
            </div>

            {/* Verification */}
            <div className="verification-field">
              <div className="form-field">
                <label className="form-label">Verification (how to test this skill)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe how to verify this skill works correctly..."
                  value={editingSkill.verification}
                  onChange={(e) => updateField('verification', e.target.value)}
                  style={{ minHeight: '70px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview pane */}
        <div className="pane preview-pane">
          <div className="pane-header">
            <span><Eye size={12} /> Preview</span>
          </div>
          <div className="pane-content">
            <SkillPreview formData={editingSkill} />
          </div>
        </div>
      </div>
    </div>
  )
}
