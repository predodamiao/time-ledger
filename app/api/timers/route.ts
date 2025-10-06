import { NextRequest, NextResponse } from 'next/server'
import { dbRun, dbGet } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, userId } = body

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'ID da tarefa e userId são obrigatórios' }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário
    const task = await dbGet(
      'SELECT id FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    )

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Verificar se já existe um timer para esta tarefa
    const existingTimer = await dbGet(
      'SELECT id FROM timers WHERE taskId = ?',
      [taskId]
    )

    if (existingTimer) {
      return NextResponse.json({ error: 'Já existe um timer para esta tarefa' }, { status: 400 })
    }

    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Criar timer
    await dbRun(
      'INSERT INTO timers (id, taskId, startTime, duration) VALUES (?, ?, datetime("now"), 0)',
      [timerId, taskId]
    )

    // Buscar timer criado
    const timer = await dbGet(
      'SELECT * FROM timers WHERE id = ?',
      [timerId]
    )

    return NextResponse.json(timer)
  } catch (error) {
    console.error('Erro ao criar timer:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
