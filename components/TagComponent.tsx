'use client'

import { TaskTag } from '@/types'

interface TagComponentProps {
  tag: TaskTag
}

const getTagColor = (type: string) => {
  const colorMap: Record<string, string> = {
    tipo: '#3b82f6',
    chat: '#10b981',
    pessoa: '#f59e0b',
    urgencia: '#ef4444',
    previsto: '#8b5cf6',
    demandante: '#ec4899',
    default: '#6b7280'
  }
  
  return colorMap[type.toLowerCase()] || colorMap.default
}

export default function TagComponent({ tag }: TagComponentProps) {
  const backgroundColor = getTagColor(tag.type)
  
  return (
    <span
      className="tag text-white text-xs font-medium"
      style={{ backgroundColor }}
    >
      {tag.type}:{tag.value}
    </span>
  )
}
