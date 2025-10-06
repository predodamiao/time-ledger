'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3, PieChart } from 'lucide-react'
import { Task } from '@/types'

interface DaySummaryProps {
  tasks: Task[]
  totalTime: number
}

interface TagStats {
  type: string
  value: string
  color: string
  time: number
  percentage: number
}

export default function DaySummary({ tasks, totalTime }: DaySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Calcular estatísticas por tag
  const getTagStats = (): TagStats[] => {
    const tagMap = new Map<string, { time: number; color: string }>()

    tasks.forEach(task => {
      task.tags.forEach(tag => {
        const key = `${tag.type}:${tag.value}`
        const currentTime = tagMap.get(key)?.time || 0
        const taskTime = task.timers.reduce((acc, timer) => acc + (timer.duration || 0), 0)
        
        tagMap.set(key, {
          time: currentTime + taskTime,
          color: tag.color
        })
      })
    })

    return Array.from(tagMap.entries())
      .map(([key, data]) => {
        const [type, value] = key.split(':')
        const percentage = totalTime > 0 ? (data.time / totalTime) * 100 : 0
        
        return {
          type,
          value,
          color: data.color,
          time: data.time,
          percentage
        }
      })
      .sort((a, b) => b.time - a.time)
  }

  const tagStats = getTagStats()
  const filteredStats = selectedTag 
    ? tagStats.filter(stat => stat.type === selectedTag)
    : tagStats

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getUniqueTagTypes = () => {
    const types = new Set(tagStats.map(stat => stat.type))
    return Array.from(types)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Resumo do Dia
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tasks.length} tarefas • {formatTime(totalTime)} total
            </p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t dark:border-gray-700">
          {/* Filtro por tipo de tag */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por tipo:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              {getUniqueTagTypes().map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedTag(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTag === type
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-3">
              <PieChart className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Distribuição por Tag
              </span>
            </div>
            
            {filteredStats.length > 0 ? (
              <div className="space-y-2">
                {filteredStats.map((stat, index) => (
                  <div key={`${stat.type}-${stat.value}-${index}`} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {stat.type}: {stat.value}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatTime(stat.time)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          ({stat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: stat.color,
                          width: `${stat.percentage}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma tag encontrada
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
