import { initializeDatabase } from './config/database.js'
import app from './index.js'
import { fork } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Inicializar base de datos antes de iniciar el servidor
const startServer = async () => {
  try {
    await initializeDatabase()
    
    console.log('✅ AMROIS Backend iniciado correctamente')
    console.log(`📊 API disponible en: http://localhost:${process.env.PORT || 3467}`)
    console.log(`🏥 Health check: http://localhost:${process.env.PORT || 3467}/health`)
    
    // Start Agent Worker
    console.log('🚀 Starting Agent Worker...')
    const agentWorker = fork(path.join(__dirname, 'agents/index.js'))
    
    agentWorker.on('error', (err) => {
        console.error('❌ Agent Worker Failed:', err)
    })
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

startServer()