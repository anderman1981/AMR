import DatabaseFactory from './database-factory.js'

let dbInstance = null

// Función para ejecutar consultas
export const query = async (text, params = []) => {
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.getConnection()
  }
  
  const start = Date.now()
  try {
    // Convertir parámetros de estilo PostgreSQL ($1, $2) a SQLite (?, ?)
    let sqliteQuery = text
    
    // Convertir parámetros si es SQLite
    if (process.env.DB_TYPE === 'sqlite' && params.length > 0) {
      sqliteQuery = text.replace(/\$\d+/g, '?')
      // Replace Postgres NOW() with SQLite datetime('now')
      sqliteQuery = sqliteQuery.replace(/NOW\(\)/gi, "datetime('now')")
    }
    
    // Check for RETURNING clause (Postgres style supported by some SQLite builds or just generic logic)
    // Actually better-sqlite3 supports RETURNING in .get() or .all()
    const isReturning = /RETURNING/i.test(text)
    
    // Adaptar la consulta para que sea compatible con SQLite/PostgreSQL
    let result
    if (text.trim().toLowerCase().startsWith('select') || isReturning) {
      if (text.trim().toLowerCase().startsWith('select') && text.toLowerCase().includes('limit 1') && !text.toLowerCase().includes('count(*)')) {
         // Optimization: use get() for single row fetches if trivial, but .all() is safer for general use
         result = await dbInstance.all(sqliteQuery, params)
      } else {
         result = await dbInstance.all(sqliteQuery, params)
      }
      // Formatear resultado para que sea compatible con el código existente
      return { rows: result || [], rowCount: result ? result.length : 0 }
    } else if (text.trim().toLowerCase().startsWith('insert')) {
      // Para INSERT sin RETURNING
      result = await dbInstance.run(sqliteQuery, params)
      return { 
          rows: [], 
          rowCount: result.changes,
          insertId: result.lastInsertRowid || result.id // Expose ID for callers who don't use RETURNING
      }
    } else {
      result = await dbInstance.run(sqliteQuery, params)
      return { rows: [], rowCount: result.changes }
    }
  } catch (error) {
    console.error('Error en query:', error)
    console.error('Query original:', text)
    console.error('Parámetros:', params)
    throw error
  } finally {
    const duration = Date.now() - start
    console.log('Query ejecutada', { text, duration })
  }
}

// Función para obtener un cliente (para compatibilidad)
export const getClient = async () => {
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.getConnection()
  }
  return dbInstance
}

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    // Conectar a la base de datos (las tablas se crean automáticamente)
    dbInstance = await DatabaseFactory.getConnection()
    console.log('✅ Base de datos inicializada correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error)
    throw error
  }
}

