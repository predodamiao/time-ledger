import { NextRequest, NextResponse } from 'next/server'
import { dbRun, dbGet } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, displayName } = body

    if (!username) {
      return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = await dbGet(
      'SELECT id, username, displayName FROM users WHERE username = ?',
      [username]
    )

    if (existingUser) {
      // Usuário já existe, retornar dados
      return NextResponse.json(existingUser)
    }

    // Criar novo usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await dbRun(
      'INSERT INTO users (id, username, displayName) VALUES (?, ?, ?)',
      [userId, username, displayName || username]
    )

    // Buscar usuário criado
    const newUser = await dbGet(
      'SELECT id, username, displayName FROM users WHERE id = ?',
      [userId]
    )

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
