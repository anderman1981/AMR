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
        cpu_usage INTEGER DEFAULT 0,
        memory_usage INTEGER DEFAULT 0,
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
        progress INTEGER DEFAULT 0,
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
        processed BOOLEAN DEFAULT 0,
        processing_error TEXT,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        keywords TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS generated_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER,
        category_id INTEGER,
        type TEXT,
        content TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`,

      `CREATE TABLE IF NOT EXISTS agent_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        execution_time INTEGER,
        success BOOLEAN DEFAULT 1,
        metrics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS book_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS book_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES book_chats(id)
      )`
    ];

    for (const table of tables) {
      this.db.exec(table);
    }

    // Try to add columns if they don't exist (Migration logic)
    const migrations = [
      "ALTER TABLE books ADD COLUMN processed BOOLEAN DEFAULT 0",
      "ALTER TABLE books ADD COLUMN processing_error TEXT",
      "ALTER TABLE books ADD COLUMN category_id INTEGER",
      "ALTER TABLE devices ADD COLUMN cpu_usage INTEGER DEFAULT 0",
      "ALTER TABLE devices ADD COLUMN memory_usage INTEGER DEFAULT 0",
      "ALTER TABLE deployment_tokens ADD COLUMN is_active BOOLEAN DEFAULT 1",
      "ALTER TABLE categories ADD COLUMN slug TEXT UNIQUE",
      "ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0"
    ]

    for (const migration of migrations) {
      try {
        this.db.exec(migration)
      } catch (err) {
        // Ignore error if column already exists
        if (!err.message.includes('duplicate column name')) {
             // console.log('Migration note:', err.message)
        }
      }
    }

    // Seed Data
    try {
      const tokenCount = this.db.prepare('SELECT COUNT(*) as count FROM deployment_tokens').get();
      if (tokenCount.count === 0) {
        this.db.prepare('INSERT INTO deployment_tokens (token, max_uses, expires_at, is_active) VALUES (?, ?, ?, ?)').run(
          'dev-token', 999, '2030-01-01 00:00:00', 1
        );
        console.log('✅ Seeded default deployment token: dev-token');
      }

      // Seed Categories
      const catCount = this.db.prepare('SELECT COUNT(*) as count FROM categories').get();
      if (catCount.count === 0) {
        this.db.prepare('INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)').run(
          1, 'General', 'general', 'Default category'
        );
        console.log('✅ Seeded default category: General');
      }
    } catch (err) {
      console.error('Error seeding data:', err.message);
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

// Singleton instance
const dbInstance = new SQLiteDatabase()
let connectionPromise = null

export const query = async (sql, params = []) => {
  if (!dbInstance.db) {
    if (!connectionPromise) {
      connectionPromise = dbInstance.connect()
    }
    await connectionPromise
  }
  
  try {
    const trimmedSql = sql.trim().toLowerCase()
    
    if (trimmedSql.startsWith('select') || trimmedSql.startsWith('pragma') || trimmedSql.startsWith('with')) {
       const rows = dbInstance.all(sql, params)
       return { rows, rowCount: rows.length }
    } else {
       const result = dbInstance.run(sql, params)
       return { 
         rows: [], 
         rowCount: result.changes, 
         insertId: result.id 
       }
    }
  } catch (error) {
    console.error('SQL Error:', error.message)
    throw error
  }
}

export default SQLiteDatabase