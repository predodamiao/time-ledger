import { dbGet, dbAll } from '@/lib/db'

export async function getTaskWithRelations(taskId: string) {
  const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [taskId])
  const timers = await dbAll('SELECT * FROM timers WHERE taskId = ? ORDER BY createdAt DESC', [taskId])
  const tags = await dbAll('SELECT * FROM task_tags WHERE taskId = ?', [taskId])

  return {
    ...task,
    timers,
    tags
  }
}
