'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { format, addDays, subDays, isToday, isYesterday, isTomorrow, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, LogOut, Calendar, Clock } from 'lucide-react'
import { Task, Timer, TaskTag } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import ThemeToggle from '@/components/ThemeToggle'
import DaySummary from '@/components/DaySummary'

export default function Dashboard() {
  const { user, logout } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState(0)

  // Helper function to normalize dates and avoid timezone issues
  const normalizeDate = (date: Date) => {
    const normalized = startOfDay(date)
    return normalized.toISOString().split('T')[0]
  }

  const fetchTasks = async (date: Date) => {
    if (!user) return

    try {
      const normalizedDate = normalizeDate(date)
      const response = await fetch(`/api/tasks?date=${normalizedDate}&userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(currentDate)
  }, [currentDate, user])

  // Atualizar tempo em tempo real quando há timers rodando
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (runningTimers.size > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
    } else {
      setCurrentTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [runningTimers])

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task])
    setShowTaskForm(false)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
    setEditingTask(null)
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoje'
    if (isYesterday(date)) return 'Ontem'
    if (isTomorrow(date)) return 'Amanhã'
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const getWeekdayLabel = (date: Date) => {
    return format(date, 'EEEE', { locale: ptBR })
  }

  const getTotalTimeForDay = (tasks: Task[]) => {
    const totalSeconds = tasks.reduce((acc, task) => {
      return acc + task.timers.reduce((timerAcc, timer) => {
        const baseTime = timer.duration || 0
        // Se o timer está rodando, adicionar o tempo atual
        if (runningTimers.has(timer.id)) {
          return timerAcc + baseTime + currentTime
        }
        return timerAcc + baseTime
      }, 0)
    }, 0)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!user) {
    return null // LoginPage será mostrado pelo componente pai
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Time Ledger</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Olá, {user.displayName || user.username}
              </span>
              <ThemeToggle />
              <button
                onClick={logout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
                  {/* Date Navigation */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      {/* Botão Hoje - Esquerda */}
                      <div className="flex-shrink-0 w-20">
                        {!isToday(currentDate) && (
                          <button
                            onClick={goToToday}
                            className="btn btn-secondary px-4 py-2 text-sm font-medium"
                          >
                            Hoje
                          </button>
                        )}
                      </div>

                      {/* Data e Dia - Centro */}
                      <div className="flex-1 text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {getDateLabel(currentDate)}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {getWeekdayLabel(currentDate)}
                        </p>
                      </div>

                      {/* Tempo Total - Direita */}
                      <div className="flex-shrink-0 w-20 flex justify-end">
                        {tasks.length > 0 && (
                          <div className="flex items-center space-x-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {getTotalTimeForDay(tasks)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navegação de Data - Abaixo */}
                    <div className="flex items-center justify-center mt-3 space-x-2">
                      <button
                        onClick={() => navigateDate('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Dia anterior"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>

                      <div className="w-8 h-0.5 bg-gray-300"></div>

                      <button
                        onClick={() => navigateDate('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Próximo dia"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Day Summary */}
                  <DaySummary 
                    tasks={tasks} 
                    totalTime={tasks.reduce((acc, task) => {
                      return acc + task.timers.reduce((timerAcc, timer) => {
                        const baseTime = timer.duration || 0
                        if (runningTimers.has(timer.id)) {
                          return timerAcc + baseTime + currentTime
                        }
                        return timerAcc + baseTime
                      }, 0)
                    }, 0)}
                  />

          {/* Tasks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tarefas ({tasks.length})
                </h3>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn btn-primary flex items-center space-x-2 px-3 py-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Tarefa</span>
                </button>
              </div>
            </div>
            
            <div className="p-4">
                      <TaskList
                        tasks={tasks}
                        onEdit={handleEditTask}
                        onDelete={handleTaskDeleted}
                        onTaskUpdate={handleTaskUpdated}
                        onRefresh={() => fetchTasks(currentDate)}
                        onTimerStart={(timerId) => {
                          setRunningTimers(prev => new Set(prev).add(timerId))
                        }}
                        onTimerStop={(timerId) => {
                          setRunningTimers(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(timerId)
                            return newSet
                          })
                        }}
                        currentDate={currentDate}
                      />
            </div>
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          date={currentDate}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
