import { db, dbRun } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function initializeDatabase() {
  try {
    console.log('Inicializando banco de dados SQLite...')
    
    // Ler o schema SQL
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Executar cada comando SQL separadamente
    const commands = schema.split(';').filter(cmd => cmd.trim())
    
    for (const command of commands) {
      if (command.trim()) {
        await dbRun(command.trim())
      }
    }
    
    console.log('✅ Banco de dados SQLite inicializado com sucesso!')
    console.log('📁 Arquivo do banco: time-ledger.db')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0)
  })
}

export default initializeDatabase
