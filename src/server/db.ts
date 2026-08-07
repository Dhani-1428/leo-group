import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export function parseDatabaseUrl(url = process.env.DATABASE_URL ?? ""): DbConfig | null {
  const raw = url.trim();
  if (!raw) {
    const host = process.env.MYSQL_HOST?.trim();
    const user = process.env.MYSQL_USER?.trim();
    const password = process.env.MYSQL_PASSWORD ?? "";
    const database = process.env.MYSQL_DATABASE?.trim() || "defaultdb";
    const port = Number(process.env.MYSQL_PORT || 3306);
    if (!host || !user || !password) return null;
    return { host, port, user, password, database };
  }

  try {
    const u = new URL(raw);
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: (u.pathname || "/defaultdb").replace(/^\//, "") || "defaultdb",
    };
  } catch {
    return null;
  }
}

export function dbConfigured() {
  return Boolean(parseDatabaseUrl());
}

export function getPool() {
  if (pool) return pool;
  const cfg = parseDatabaseUrl();
  if (!cfg) {
    throw new Error("DATABASE_URL / MYSQL_* is not configured");
  }

  const sslRequired =
    /ssl-mode=REQUIRED/i.test(process.env.DATABASE_URL ?? "") ||
    process.env.MYSQL_SSL === "REQUIRED" ||
    process.env.MYSQL_SSL === "true" ||
    cfg.host.includes("aivencloud.com");

  pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool();
      await p.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NULL,
          password_hash VARCHAR(255) NOT NULL,
          reset_token VARCHAR(128) NULL,
          reset_expires DATETIME(3) NULL,
          created_at DATETIME(3) NOT NULL,
          updated_at DATETIME(3) NOT NULL,
          INDEX idx_users_reset_token (reset_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await p.query(`
        CREATE TABLE IF NOT EXISTS catalog_products (
          id VARCHAR(128) PRIMARY KEY,
          category VARCHAR(32) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'published',
          stock INT NOT NULL DEFAULT 0,
          price DECIMAL(12,2) NOT NULL DEFAULT 0,
          name VARCHAR(255) NOT NULL,
          data JSON NOT NULL,
          updated_at DATETIME(3) NOT NULL,
          INDEX idx_catalog_category (category),
          INDEX idx_catalog_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await p.query(`
        CREATE TABLE IF NOT EXISTS orders (
          session_id VARCHAR(255) PRIMARY KEY,
          payment_status VARCHAR(64) NOT NULL,
          customer_email VARCHAR(255) NULL,
          amount_total INT NULL,
          currency VARCHAR(16) NULL,
          line_items JSON NOT NULL,
          fulfilled_at DATETIME(3) NOT NULL,
          INDEX idx_orders_email (customer_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function withConnection<T>(fn: (conn: PoolConnection) => Promise<T>) {
  const p = getPool();
  const conn = await p.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

export async function pingDatabase() {
  const cfg = parseDatabaseUrl();
  if (!cfg) {
    return {
      ok: false as const,
      configured: false,
      error: "DATABASE_URL / MYSQL_* not set",
    };
  }

  try {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT 1 AS ok, DATABASE() AS db, VERSION() AS version, USER() AS db_user, @@hostname AS host",
    );
    await ensureSchema();
    const [tables] = await p.query<RowDataPacket[]>("SHOW TABLES");
    return {
      ok: true as const,
      configured: true,
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      info: rows[0],
      tables: tables.map((t) => Object.values(t)[0]),
    };
  } catch (err) {
    return {
      ok: false as const,
      configured: true,
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      error: err instanceof Error ? err.message : String(err),
      code: err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : undefined,
    };
  }
}

export type { ResultSetHeader, RowDataPacket };
