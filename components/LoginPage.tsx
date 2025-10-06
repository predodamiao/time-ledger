'use client'

import { useState } from 'react'
import { Clock, Calendar, CheckSquare, User } from 'lucide-react'
import { useUser } from '@/lib/user-context'

export default function LoginPage() {
  const { user, login, loading } = useUser()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoggingIn(true)
    setError('')

    try {
      await login(username.trim(), displayName.trim() || undefined)
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Dashboard será mostrado pelo componente pai
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 p-4 rounded-full">
              <Clock className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Time Ledger
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Gerencie suas tarefas e acompanhe seu tempo de forma eficiente
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Organize por dia</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Clock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cronometre tempo</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <CheckSquare className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Gerencie tarefas</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário de Rede *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Digite seu usuário de rede"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome para Exibição (opcional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Seu nome completo"
                disabled={isLoggingIn}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !username.trim()}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="h-5 w-5" />
              <span>{isLoggingIn ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Digite seu usuário de rede para começar</p>
        </div>
      </div>
    </div>
  )
}
