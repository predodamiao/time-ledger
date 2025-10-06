'use client'

import { useState } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { startOfDay } from 'date-fns'
import { Task, CreateTaskData, UpdateTaskData } from '@/types'
import { useUser } from '@/lib/user-context'

interface TaskFormProps {
  task?: Task | null
  date: Date
  onTaskCreated: (task: Task) => void
  onTaskUpdated: (task: Task) => void
  onClose: () => void
}

interface TaskTagInput {
  type: string
  value: string
  color: string
}

const TAG_TYPES = [
  { name: 'tipo', color: '#3b82f6', label: 'Tipo' },
  { name: 'chat', color: '#10b981', label: 'Chat' },
  { name: 'pessoa', color: '#f59e0b', label: 'Pessoa' },
  { name: 'urgencia', color: '#ef4444', label: 'Urgência' },
  { name: 'previsto', color: '#8b5cf6', label: 'Previsto' },
  { name: 'demandante', color: '#ec4899', label: 'Demandante' },
]

export default function TaskForm({
  task,
  date,
  onTaskCreated,
  onTaskUpdated,
  onClose
}: TaskFormProps) {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
  })
  
  const [tags, setTags] = useState<TaskTagInput[]>(
    task?.tags.map(tag => ({
      type: tag.type,
      value: tag.value,
      color: tag.color
    })) || []
  )
  
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState({ type: '', value: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !user) return

    setLoading(true)

    try {
      const taskData: CreateTaskData | UpdateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        date: startOfDay(date).toISOString().split('T')[0],
        tags: tags.map(tag => ({
          type: tag.type,
          value: tag.value,
          color: tag.color
        })),
        userId: user.id
      }

      const url = task ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = task ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const savedTask = await response.json()
        
        if (task) {
          onTaskUpdated(savedTask)
        } else {
          onTaskCreated(savedTask)
        }
        
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.type.trim() && newTag.value.trim()) {
      const colorInfo = TAG_TYPES.find(c => c.name === newTag.type.toLowerCase())
      const color = colorInfo?.color || '#6b7280'
      
      setTags(prev => [...prev, { ...newTag, color }])
      setNewTag({ type: '', value: '' })
    }
  }

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[100px] resize-none"
              placeholder="Adicione uma descrição (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="tag text-white text-xs font-medium flex items-center space-x-1"
                    style={{ backgroundColor: tag.color }}
                  >
                    <span>{tag.type}:{tag.value}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex space-x-2">
              <select
                value={newTag.type}
                onChange={(e) => setNewTag(prev => ({ ...prev, type: e.target.value }))}
                className="input flex-1"
              >
                <option value="">Selecione o tipo</option>
                {TAG_TYPES.map(tagType => (
                  <option key={tagType.name} value={tagType.name}>
                    {tagType.label}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={newTag.value}
                onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                className="input flex-1"
                placeholder="Valor da tag"
              />
              
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : (task ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
