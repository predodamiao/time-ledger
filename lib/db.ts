import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const globalForDb = globalThis as unknown as {
  db: sqlite3.Database | undefined
}

// Função para criar conexão SQLite
function createDatabase() {
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'time-ledger.db')
  const db = new sqlite3.Database(dbPath)
  
  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON')
  
  return db
}

export const db = globalForDb.db ?? createDatabase()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

// Promisificar métodos do SQLite
export const dbRun = promisify(db.run.bind(db))
export const dbGet = promisify(db.get.bind(db))
export const dbAll = promisify(db.all.bind(db))

// Função para executar queries com promisificação
export async function dbExecute(query: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}
