export interface Task {
  id: string
  title: string
  description?: string
  date: string
  completed: boolean
  userId: string
  timers: Timer[]
  tags: TaskTag[]
  createdAt: string
  updatedAt: string
}

export interface Timer {
  id: string
  taskId: string
  startTime: string
  endTime?: string
  duration?: number
  createdAt: string
  updatedAt: string
}

export interface TaskTag {
  id: string
  taskId: string
  type: string
  value: string
  color: string
}

export interface CreateTaskData {
  title: string
  description?: string
  date: string
  tags?: { type: string; value: string; color: string }[]
  userId: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean
}
