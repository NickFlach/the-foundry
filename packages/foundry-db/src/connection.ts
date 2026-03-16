import mysql from 'mysql2/promise';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
}

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) throw new Error('Database not initialized. Call initDb() first.');
  return pool;
}

export async function initDb(config?: Partial<DbConfig>): Promise<void> {
  const cfg: DbConfig = {
    host: config?.host ?? process.env.FOUNDRY_DB_HOST ?? '127.0.0.1',
    port: config?.port ?? parseInt(process.env.FOUNDRY_DB_PORT ?? '3307'),
    database: config?.database ?? process.env.FOUNDRY_DB_NAME ?? 'the_foundry',
    user: config?.user ?? process.env.FOUNDRY_DB_USER ?? 'root',
  };

  pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Verify connection
  const conn = await pool.getConnection();
  conn.release();
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}