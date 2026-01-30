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
    if (params.length > 0) {
      sqliteQuery = text.replace(/\$\d+/g, '?')
    }
    
    // Adaptar la consulta para que sea compatible con SQLite/PostgreSQL
    let result
    if (text.trim().toLowerCase().startsWith('select')) {
      result = await dbInstance.all(sqliteQuery, params)
      // Formatear resultado para que sea compatible con el código existente
      return { rows: result, rowCount: result.length }
    } else if (text.trim().toLowerCase().startsWith('insert')) {
      result = await dbInstance.run(sqliteQuery, params)
      // Para INSERT, necesitamos obtener los datos del resultado
      if (result.lastInsertRowid) {
        const insertedRow = await dbInstance.get('SELECT * FROM books WHERE rowid = ?', [result.lastInsertRowid])
        return { rows: [insertedRow], rowCount: result.changes }
      }
      return { rows: [], rowCount: result.changes }
    } else if (text.trim().toLowerCase().startsWith('update')) {
      result = await dbInstance.run(sqliteQuery, params)
      return { rows: [], rowCount: result.changes }
    } else if (text.trim().toLowerCase().startsWith('delete')) {
      result = await dbInstance.run(sqliteQuery, params)
      return { rows: [], rowCount: result.changes }
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

