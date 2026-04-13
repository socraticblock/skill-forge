'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SkillStep } from '../../types/skill'

interface SortableStepProps {
  step: SkillStep
  index: number
  onUpdate: (id: string, field: 'title' | 'content', value: string) => void
  onRemove: (id: string) => void
}

function SortableStep({ step, index, onUpdate, onRemove }: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`step-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="step-card-header">
        {/* Drag handle */}
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>

        <span className="step-number">{index + 1}</span>

        <Input
          className="step-title-input"
          placeholder="Step title..."
          value={step.title}
          onChange={(e) => onUpdate(step.id, 'title', e.target.value)}
        />

        <Button
          variant="ghost"
          size="sm"
          className="step-delete-btn"
          onClick={() => onRemove(step.id)}
          aria-label="Remove step"
        >
          <Trash2 size={13} />
        </Button>
      </div>

      <Textarea
        className="step-content-input"
        placeholder="Describe what to do in this step..."
        value={step.content}
        onChange={(e) => onUpdate(step.id, 'content', e.target.value)}
        rows={2}
      />
    </div>
  )
}

interface StepListProps {
  steps: SkillStep[]
  onStepsChange: (steps: SkillStep[]) => void
}

export function StepList({ steps, onStepsChange }: StepListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = steps.findIndex((s) => s.id === active.id)
      const newIndex = steps.findIndex((s) => s.id === over.id)

      const reordered = [...steps]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      onStepsChange(reordered)
    },
    [steps, onStepsChange]
  )

  const handleUpdate = useCallback(
    (id: string, field: 'title' | 'content', value: string) => {
      onStepsChange(
        steps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      )
    },
    [steps, onStepsChange]
  )

  const handleRemove = useCallback(
    (id: string) => {
      onStepsChange(steps.filter((s) => s.id !== id))
    },
    [steps, onStepsChange]
  )

  const handleAdd = useCallback(() => {
    const newStep: SkillStep = {
      id: `step-${Date.now()}`,
      title: '',
      content: '',
    }
    onStepsChange([...steps, newStep])
  }, [steps, onStepsChange])

  if (steps.length === 0) {
    return (
      <div className="steps-empty">
        <p>No steps yet. Add steps to build a structured skill.</p>
        <Button variant="secondary" size="sm" onClick={handleAdd}>
          <Plus size={14} />
          Add First Step
        </Button>
      </div>
    )
  }

  return (
    <div className="step-list">
      <div className="step-list-header">
        <span className="step-list-title">Steps</span>
        <span className="step-list-hint">Drag to reorder</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="step-cards">
            {steps.map((step, index) => (
              <SortableStep
                key={step.id}
                step={step}
                index={index}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="ghost" size="sm" className="add-step-btn" onClick={handleAdd}>
        <Plus size={14} />
        Add Step
      </Button>
    </div>
  )
}
