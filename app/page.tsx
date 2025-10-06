import { Suspense } from 'react'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'
import { UserProvider } from '@/lib/user-context'

export default function Home() {
  return (
    <UserProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
        <MainContent />
      </Suspense>
    </UserProvider>
  )
}

function MainContent() {
  return (
    <>
      <LoginPage />
      <Dashboard />
    </>
  )
}
