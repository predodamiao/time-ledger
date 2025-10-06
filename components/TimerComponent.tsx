'use client'

import { useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { Timer } from '@/types'
import { useUser } from '@/lib/user-context'

interface TimerComponentProps {
  timer: Timer
  taskId: string
  isRunning: boolean
  onTimerUpdate: (timer: Timer) => void
  onTimerStart: () => void
  onTimerStop: () => void
}

export default function TimerComponent({
  timer,
  taskId,
  isRunning,
  onTimerUpdate,
  onTimerStart,
  onTimerStop
}: TimerComponentProps) {
  const { user } = useUser()
  const [isActive, setIsActive] = useState(isRunning)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      if (!startTime) {
        setStartTime(Date.now())
      }
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
    } else {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (isActive || !user) return

    setIsActive(true)
    setStartTime(Date.now())
    onTimerStart()

    try {
      const response = await fetch(`/api/timers/${timer.id}/start?userId=${user.id}`, {
        method: 'POST',
      })

      if (response.ok) {
        const updatedTimer = await response.json()
        onTimerUpdate(updatedTimer)
      }
    } catch (error) {
      console.error('Erro ao iniciar timer:', error)
    }
  }

  const handleStop = async () => {
    if (!isActive || !user) return

    const totalDuration = (timer.duration || 0) + currentTime

    setIsActive(false)
    onTimerStop()

    try {
      const response = await fetch(`/api/timers/${timer.id}/stop?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: totalDuration }),
      })

      if (response.ok) {
        const updatedTimer = await response.json()
        onTimerUpdate(updatedTimer)
        setCurrentTime(0)
        setStartTime(null)
      }
    } catch (error) {
      console.error('Erro ao parar timer:', error)
    }
  }

  const totalTime = (timer.duration || 0) + currentTime

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-sm font-mono text-gray-600">
        {formatTime(totalTime)}
      </div>
      
      <div className="flex gap-1">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
            title="Iniciar timer"
          >
            <Play size={14} />
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
            title="Parar timer"
          >
            <Pause size={14} />
          </button>
        )}
      </div>
    </div>
  )
}