import pkg from 'pg'
const { Pool } = pkg

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'amrois_system',
  user: process.env.DB_USER || 'amrois_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo de espera para clientes inactivos
  connectionTimeoutMillis: 2000, // tiempo de espera para conexión
})

// Manejo de errores de conexión
pool.on('error', (err, client) => {
  console.error('Error inesperado en el pool de PostgreSQL', err)
})

// Función para ejecutar consultas
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Query ejecutada', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error en query:', error)
    throw error
  }
}

// Función para obtener un cliente del pool (para transacciones)
export const getClient = () => {
  return pool.connect()
}

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    // Crear tablas si no existen
    await createTables()
    console.log('✅ Base de datos inicializada correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error)
    throw error
  }
}

// Función para crear las tablas
const createTables = async () => {
  const createDevicesTable = `
    CREATE TABLE IF NOT EXISTS devices (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'banned')),
      device_token VARCHAR(500) UNIQUE,
      security_score INTEGER DEFAULT 0,
      is_banned BOOLEAN DEFAULT false,
      last_heartbeat TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      batch_id VARCHAR(255),
      device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
      agent_type VARCHAR(100) NOT NULL,
      priority INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'running', 'completed', 'failed')),
      payload JSONB,
      result JSONB,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  const createSecurityViolationsTable = `
    CREATE TABLE IF NOT EXISTS security_violations (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES devices(id) ON DELETE CASCADE,
      violation_type VARCHAR(100) NOT NULL,
      severity INTEGER CHECK (severity >= 1 AND severity <= 10),
      request_data JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  const createAIPromptsTable = `
    CREATE TABLE IF NOT EXISTS ai_prompts (
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(255) NOT NULL,
      version VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(agent_id, version)
    )
  `

  const createDeploymentTokensTable = `
    CREATE TABLE IF NOT EXISTS deployment_tokens (
      token VARCHAR(255) PRIMARY KEY,
      max_uses INTEGER DEFAULT 1,
      current_uses INTEGER DEFAULT 0,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true
    )
  `

  const createBooksTable = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      file_path VARCHAR(1000) NOT NULL,
      category VARCHAR(100),
      format VARCHAR(10) NOT NULL,
      size BIGINT,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'error')),
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      metadata JSONB,
      content_summary TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  const createAgentPerformanceTable = `
    CREATE TABLE IF NOT EXISTS agent_performance (
      id SERIAL PRIMARY KEY,
      agent_name VARCHAR(100) NOT NULL,
      task_type VARCHAR(100),
      execution_time INTEGER,
      success BOOLEAN,
      error TEXT,
      metrics JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  // Crear índices para optimizar rendimiento
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status)',
    'CREATE INDEX IF NOT EXISTS idx_devices_last_heartbeat ON devices(last_heartbeat)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_device_id ON tasks(device_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC)',
    'CREATE INDEX IF NOT EXISTS idx_security_violations_device_id ON security_violations(device_id)',
    'CREATE INDEX IF NOT EXISTS idx_security_violations_created_at ON security_violations(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)',
    'CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)',
    'CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_name ON agent_performance(agent_name)'
  ]

  // Ejecutar todas las creaciones de tablas
  await query(createDevicesTable)
  await query(createTasksTable)
  await query(createSecurityViolationsTable)
  await query(createAIPromptsTable)
  await query(createDeploymentTokensTable)
  await query(createBooksTable)
  await query(createAgentPerformanceTable)

  // Ejecutar todos los índices
  for (const indexQuery of createIndexes) {
    await query(indexQuery)
  }
}

// Función para cerrar el pool
export const closePool = async () => {
  await pool.end()
  console.log('Pool de PostgreSQL cerrado')
}

export default pool