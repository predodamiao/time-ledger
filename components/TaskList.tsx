'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isBefore, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Play, Pause, Square, Tag, Edit, Trash2, Check, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Task, Timer, TaskTag } from '@/types'
import { useUser } from '@/lib/user-context'
import TagComponent from '@/components/TagComponent'
import TimerComponent from '@/components/TimerComponent'
import MigrateTaskButton from '@/components/MigrateTaskButton'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onTaskUpdate: (task: Task) => void
  onRefresh?: () => void
  onTimerStart?: (timerId: string) => void
  onTimerStop?: (timerId: string) => void
  currentDate: Date // Added prop for date comparison
}

export default function TaskList({ tasks, onEdit, onDelete, onTaskUpdate, onRefresh, onTimerStart, onTimerStop, currentDate }: TaskListProps) {
  const { user } = useUser()
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set())
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  // Memoized comparison to avoid unnecessary recalculations
  const isDateBeforeToday = useMemo(() => {
    const today = startOfDay(new Date())
    const compareDate = startOfDay(currentDate)
    return isBefore(compareDate, today)
  }, [currentDate])

  const handleToggleComplete = async (task: Task) => {
    if (!user) return

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed, userId: user.id }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdate(updatedTask)
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!user) return

    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}?userId=${user.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          onDelete(taskId)
        }
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error)
      }
    }
  }

  const handleCreateTimer = async (taskId: string) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId: user.id }),
      })

      if (response.ok) {
        const newTimer = await response.json()
        // Recarregar a lista de tarefas
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const error = await response.json()
        console.error('Erro ao criar timer:', error.error)
      }
    } catch (error) {
      console.error('Erro ao criar timer:', error)
    }
  }

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => {
        const isExpanded = expandedTasks.has(task.id)
        const hasDetails = task.description || task.tags.length > 0
        
        return (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                      task.completed ? 'opacity-75 bg-gray-50 dark:bg-gray-900' : 'hover:shadow-md'
                    }`}
                  >
            {/* Header - Sempre visível */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white shadow-sm hover:bg-green-600 hover:border-green-600'
                              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                        >
                          {task.completed ? <Check className="h-4 w-4" /> : null}
                        </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                            <h4 className={`text-base font-medium ${
                              task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                      {task.title}
                    </h4>
                    
                    {/* Expand/Collapse button - só aparece se tem detalhes */}
                    {hasDetails && (
                      <button
                        onClick={() => toggleExpanded(task.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={isExpanded ? 'Ocultar detalhes' : 'Mostrar detalhes'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Timer */}
                <div className="flex-shrink-0">
                  {task.timers.length > 0 ? (
                            <TimerComponent
                              timer={task.timers[0]}
                              taskId={task.id}
                              isRunning={runningTimers.has(task.timers[0].id)}
                              onTimerUpdate={(updatedTimer) => {
                                const updatedTask = {
                                  ...task,
                                  timers: [updatedTimer]
                                }
                                onTaskUpdate(updatedTask)
                              }}
                              onTimerStart={() => {
                                setRunningTimers(prev => new Set(prev).add(task.timers[0].id))
                                onTimerStart?.(task.timers[0].id)
                              }}
                              onTimerStop={() => {
                                setRunningTimers(prev => {
                                  const newSet = new Set(prev)
                                  newSet.delete(task.timers[0].id)
                                  return newSet
                                })
                                onTimerStop?.(task.timers[0].id)
                              }}
                            />
                  ) : (
                    <button
                      onClick={() => handleCreateTimer(task.id)}
                      className="bg-gray-50 rounded-lg px-3 py-2 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Timer</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                {/* Botão de migração - só aparece em dias anteriores */}
                {isDateBeforeToday && (
                  <MigrateTaskButton 
                    task={task} 
                    onTaskMigrated={() => {
                      if (onRefresh) onRefresh()
                    }} 
                  />
                )}
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEdit(task)
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors relative z-10"
                  title="Editar tarefa"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Deletar tarefa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && hasDetails && (
              <div className="px-3 pb-3 border-t border-gray-100">
                {/* Description */}
                {task.description && (
                  <div className="mt-3">
                            <p className={`text-sm whitespace-pre-wrap ${
                              task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <TagComponent key={tag.id} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}