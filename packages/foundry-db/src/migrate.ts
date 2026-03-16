import fs from 'fs';
import path from 'path';
import { getPool } from './connection.js';

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  const conn = await getPool().getConnection();
  try {
    for (const stmt of statements) {
      await conn.execute(stmt);
    }
  } finally {
    conn.release();
  }
}