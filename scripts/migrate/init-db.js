import { initializeDatabase } from '../src/config/database.js'
import crypto from 'crypto'

const createDeploymentToken = async () => {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  
  try {
    const { query } = await import('../src/config/database.js')
    
    await query(
      'INSERT INTO deployment_tokens (token, max_uses, expires_at, is_active) VALUES ($1, $2, $3, $4)',
      [token, 10, expiresAt, true]
    )
    
    console.log('✅ Deployment token creado:')
    console.log(`Token: ${token}`)
    console.log(`Expires: ${expiresAt.toISOString()}`)
    console.log(`Max uses: 10`)
    
  } catch (error) {
    console.error('❌ Error creando deployment token:', error)
  }
}

const initDatabase = async () => {
  try {
    console.log('🔧 Inicializando base de datos...')
    await initializeDatabase()
    console.log('✅ Base de datos inicializada exitosamente')
    
    // Crear un deployment token para pruebas
    await createDeploymentToken()
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error)
    process.exit(1)
  }
}

initDatabase()