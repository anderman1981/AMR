import Database from 'better-sqlite3'
import path from 'path'
import { promises as fs } from 'fs'

class SQLiteDatabase {
  constructor(dbPath = './data/amrois.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    try {
      // Asegurar que el directorio existe
      const dbDir = path.dirname(this.dbPath)
      await fs.mkdir(dbDir, { recursive: true })

      this.db = new Database(this.dbPath)
      console.log('✅ Conectado a SQLite con better-sqlite3')
      
      this.initTables()
      return this.db
    } catch (err) {
      console.error('Error conectando a SQLite:', err)
      throw err
    }
  }

  initTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        status TEXT DEFAULT 'offline',
        device_token TEXT NOT NULL,
        security_score INTEGER DEFAULT 0,
        is_banned BOOLEAN DEFAULT 0,
        last_heartbeat DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        batch_id TEXT,
        device_id TEXT,
        agent_type TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending',
        payload TEXT,
        result TEXT,
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS security_violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        violation_type TEXT NOT NULL,
        severity INTEGER DEFAULT 1,
        request_data TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS ai_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        version TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS deployment_tokens (
        token TEXT PRIMARY KEY,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        category TEXT,
        format TEXT,
        size INTEGER,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      this.db.exec(table);
    }
    
    console.log('✅ Tablas de SQLite inicializadas');
  }

  run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);
      return { id: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
      throw err;
    }
  }

  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(params);
    } catch (err) {
      throw err;
    }
  }

  all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    } catch (err) {
      throw err;
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Conexión SQLite cerrada');
    }
  }
}

export default SQLiteDatabase