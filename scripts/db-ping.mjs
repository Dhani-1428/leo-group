/**
 * Quick MySQL connectivity check.
 * Usage: node --env-file=.env.local scripts/db-ping.mjs
 */
import mysql from "mysql2/promise";

function parseUrl(raw) {
  if (!raw) return null;
  const u = new URL(raw);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: (u.pathname || "/defaultdb").replace(/^\//, "") || "defaultdb",
  };
}

const cfg =
  parseUrl(process.env.DATABASE_URL) ||
  {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "defaultdb",
  };

if (!cfg?.host || !cfg?.user || !cfg?.password) {
  console.error("Missing DATABASE_URL or MYSQL_* env vars");
  process.exit(1);
}

console.log("Connecting to", `${cfg.host}:${cfg.port}/${cfg.database}`, "as", cfg.user);

try {
  const conn = await mysql.createConnection({
    ...cfg,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 20000,
  });
  const [rows] = await conn.query(
    "SELECT 1 AS ok, DATABASE() AS db, VERSION() AS version, USER() AS db_user",
  );
  console.log("CONNECTION_OK", rows[0]);
  const [tables] = await conn.query("SHOW TABLES");
  console.log(
    "TABLES",
    tables.map((t) => Object.values(t)[0]),
  );
  await conn.end();
  process.exit(0);
} catch (err) {
  console.error("CONNECTION_FAILED");
  console.error(err?.code || "", err?.message || err);
  process.exit(2);
}
