const sqlite3 = require('sqlite3').verbose();
const pg = require('pg');
const path = require('path');
require('dotenv').config();

let dbInstance = null;

class DatabaseFactory {
  static async getConnection() {
    if (dbInstance) {
      return dbInstance;
    }

    const dbType = process.env.DB_TYPE || 'postgres';
    
    if (dbType === 'sqlite') {
      const SQLiteDatabase = require('./sqlite');
      const dbPath = process.env.DB_PATH || './data/amrois.db';
      dbInstance = new SQLiteDatabase(dbPath);
      await dbInstance.connect();
      console.log('🗄️ Usando SQLite para desarrollo local');
    } else {
      // PostgreSQL
      const pool = new pg.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'amrois_system',
        user: process.env.DB_USER || 'amrois_user',
        password: process.env.DB_PASSWORD || 'secure_password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('error', (err) => {
        console.error('Error en pool PostgreSQL:', err);
      });

      // Adaptar la interfaz para que sea compatible
      dbInstance = {
        pool,
        async run(sql, params = []) {
          const client = await this.pool.connect();
          try {
            const res = await client.query(sql, params);
            return { id: res.rows[0]?.id, changes: res.rowCount };
          } finally {
            client.release();
          }
        },
        
        async get(sql, params = []) {
          const client = await this.pool.connect();
          try {
            const res = await client.query(sql, params);
            return res.rows[0];
          } finally {
            client.release();
          }
        },
        
        async all(sql, params = []) {
          const client = await this.pool.connect();
          try {
            const res = await client.query(sql, params);
            return res.rows;
          } finally {
            client.release();
          }
        },
        
        async close() {
          await this.pool.end();
          console.log('✅ Pool PostgreSQL cerrado');
        }
      };

      console.log('🗄️ Usando PostgreSQL');
    }

    return dbInstance;
  }

  static async closeConnection() {
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
  }
}

module.exports = DatabaseFactory;