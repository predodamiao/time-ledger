import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun, dbGet } from '@/lib/db'
import { getTaskWithRelations } from '@/lib/task-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')

    if (!date || !userId) {
      return NextResponse.json({ error: 'Data e userId são obrigatórios' }, { status: 400 })
    }

    // Buscar tarefas
    const tasks = await dbAll(
      'SELECT * FROM tasks WHERE userId = ? AND date = ? ORDER BY createdAt DESC',
      [userId, date]
    )

    // Para cada tarefa, buscar timers e tags separadamente
    const processedTasks = []
    for (const task of tasks as any[]) {
      // Buscar timers da tarefa
      const timers = await dbAll(
        'SELECT * FROM timers WHERE taskId = ? ORDER BY createdAt DESC',
        [task.id]
      )

      // Buscar tags da tarefa
      const tags = await dbAll(
        'SELECT * FROM task_tags WHERE taskId = ?',
        [task.id]
      )

      processedTasks.push({
        ...task,
        timers,
        tags
      })
    }

    return NextResponse.json(processedTasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, tags, userId } = body

    if (!title || !date || !userId) {
      return NextResponse.json({ error: 'Título, data e userId são obrigatórios' }, { status: 400 })
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Criar tarefa
    await dbRun(
      'INSERT INTO tasks (id, title, description, date, userId) VALUES (?, ?, ?, ?, ?)',
      [taskId, title, description || null, date, userId]
    )

    // Criar tags se fornecidas
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const tagId = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await dbRun(
          'INSERT INTO task_tags (id, taskId, type, value, color) VALUES (?, ?, ?, ?, ?)',
          [tagId, taskId, tag.type, tag.value, tag.color]
        )
      }
    }

    // Buscar tarefa criada com timers e tags
    const processedTask = await getTaskWithRelations(taskId)

    return NextResponse.json(processedTask)
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
