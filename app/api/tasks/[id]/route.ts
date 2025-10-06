import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun, dbGet } from '@/lib/db'
import { getTaskWithRelations } from '@/lib/task-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, completed, tags, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await dbGet(
      'SELECT id FROM tasks WHERE id = ? AND userId = ?',
      [params.id, userId]
    )

    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Atualizar tarefa
    const updateFields = []
    const updateValues = []

    if (title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(title)
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description)
    }
    if (completed !== undefined) {
      updateFields.push('completed = ?')
      updateValues.push(completed)
    }

    if (updateFields.length > 0) {
      updateValues.push(params.id)
      await dbRun(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      // Deletar tags existentes
      await dbRun(
        'DELETE FROM task_tags WHERE taskId = ?',
        [params.id]
      )

      // Criar novas tags
      if (tags.length > 0) {
        for (const tag of tags) {
          const tagId = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await dbRun(
            'INSERT INTO task_tags (id, taskId, type, value, color) VALUES (?, ?, ?, ?, ?)',
            [tagId, params.id, tag.type, tag.value, tag.color]
          )
        }
      }
    }

    // Buscar tarefa atualizada
    const processedTask = await getTaskWithRelations(params.id)

    return NextResponse.json(processedTask)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await dbGet(
      'SELECT id FROM tasks WHERE id = ? AND userId = ?',
      [params.id, userId]
    )

    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Deletar tarefa (cascade vai deletar timers e tags automaticamente)
    await dbRun(
      'DELETE FROM tasks WHERE id = ?',
      [params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
