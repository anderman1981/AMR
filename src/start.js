import { initializeDatabase } from './config/database.js'
import app from './index.js'

// Inicializar base de datos antes de iniciar el servidor
const startServer = async () => {
  try {
    await initializeDatabase()
    
    console.log('✅ AMROIS Backend iniciado correctamente')
    console.log(`📊 API disponible en: http://localhost:${process.env.PORT || 4123}`)
    console.log(`🏥 Health check: http://localhost:${process.env.PORT || 4123}/health`)
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

startServer()