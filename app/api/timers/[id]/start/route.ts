import { NextRequest, NextResponse } from 'next/server'
import { dbRun, dbGet } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // Verificar se o timer pertence ao usuário
    const timer = await dbGet(`
      SELECT t.id 
      FROM timers tm
      JOIN tasks t ON tm.taskId = t.id
      WHERE tm.id = ? AND t.userId = ?
    `, [params.id, userId])

    if (!timer) {
      return NextResponse.json({ error: 'Timer não encontrado' }, { status: 404 })
    }

    // Atualizar timer com startTime
    await dbRun(
      'UPDATE timers SET startTime = datetime("now") WHERE id = ?',
      [params.id]
    )

    // Buscar timer atualizado
    const updatedTimer = await dbGet(
      'SELECT * FROM timers WHERE id = ?',
      [params.id]
    )

    return NextResponse.json(updatedTimer)
  } catch (error) {
    console.error('Erro ao iniciar timer:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
