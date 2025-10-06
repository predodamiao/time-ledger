import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/lib/user-context'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Time Ledger - Gestão de Tarefas',
  description: 'Aplicação para acompanhamento de tarefas e gestão de tempo pessoal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <html lang="pt-BR">
          <body className={inter.className}>
            <ThemeProvider>
              <UserProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                  {children}
                </div>
              </UserProvider>
            </ThemeProvider>
          </body>
        </html>
  )
}
