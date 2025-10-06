'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { startOfDay } from 'date-fns'
import { Task } from '@/types'
import { useUser } from '@/lib/user-context'

interface MigrateTaskButtonProps {
  task: Task
  onTaskMigrated: () => void
}

export default function MigrateTaskButton({ task, onTaskMigrated }: MigrateTaskButtonProps) {
  const { user } = useUser()
  const [isMigrating, setIsMigrating] = useState(false)

  const handleMigrate = async () => {
    if (!user || isMigrating) return

    setIsMigrating(true)

    try {
      // Criar nova task no dia atual
      const today = startOfDay(new Date()).toISOString().split('T')[0]
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          date: today,
          tags: task.tags.map(tag => ({
            type: tag.type,
            value: tag.value,
            color: tag.color
          })),
          userId: user.id
        })
      })

      if (response.ok) {
        // Marcar task original como concluída parcialmente
        await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            completed: true, 
            userId: user.id 
          })
        })

        onTaskMigrated()
      }
    } catch (error) {
      console.error('Erro ao migrar tarefa:', error)
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <button
      onClick={handleMigrate}
      disabled={isMigrating}
      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Migrar para hoje"
    >
      {isMigrating ? (
        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <ArrowRight className="h-3 w-3" />
      )}
      <span>Migrar</span>
    </button>
  )
}
