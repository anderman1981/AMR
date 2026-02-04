import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Importar rutas
import devicesRoutes from './routes/devices.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import booksRoutes from './routes/books.routes.js'
import llmRoutes from './routes/llm.routes.js'
import agentsRoutes from './routes/agents.routes.js'
import statsRoutes from './routes/stats.routes.js'
import chatRoutes from './routes/chat.routes.js'

// Importar middlewares
import { getDevice, verifyHMAC, deviceRateLimit } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3467

// Configuración básica
app.use(cors())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", "http://localhost:3465", "http://localhost:3466", "https:", "http:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(morgan('dev'))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configurar directorio estático
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, '../public')))

// Rutas API
app.use('/api/devices', devicesRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/books', booksRoutes)
app.use('/api/llm', llmRoutes)
app.use('/api/agents', agentsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/chat', chatRoutes)

// Rutas que requieren autenticación de dispositivo
app.use('/api/devices', deviceRateLimit())
app.post('/api/devices/*/heartbeat', getDevice, verifyHMAC)
app.post('/api/devices/*/report', getDevice, verifyHMAC)

// Ruta de salud del sistema
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    system: 'AMROIS',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'AMROIS - Sistema Maestro de Orquestación Distribuida',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      devices: '/api/devices',
      tasks: '/api/tasks',
      books: '/api/books',
      llm: '/api/llm',
      agents: '/api/agents',
      stats: '/api/stats'
    }
  })
})

// Middleware para manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  })
})

// Middleware para manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error global:', error)
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Iniciar servidor
// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 AMROIS Server iniciado en puerto ${PORT}`)
  console.log(`📖 Dashboard disponible en: http://localhost:${process.env.DASHBOARD_PORT || (PORT === 4126 ? 4127 : PORT - 1)}`)
  console.log(`🔗 API disponible en: http://localhost:${PORT}`)
  console.log(`📊 Endpoint de salud: http://localhost:${PORT}/health`)
})

// Manejo elegante de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
  })
})

export default app