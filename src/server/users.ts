import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  dbConfigured,
  ensureSchema,
  getPool,
  type ResultSetHeader,
  type RowDataPacket,
} from "@/server/db";

export type UserRecord = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  resetToken?: string | null;
  resetExpires?: string | null;
};

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
let cache: UserRecord[] | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  if (hashBuf.length !== test.length) return false;
  return timingSafeEqual(hashBuf, test);
}

function rowToUser(row: RowDataPacket): UserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : undefined,
    passwordHash: String(row.password_hash),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    resetToken: row.reset_token ? String(row.reset_token) : null,
    resetExpires: row.reset_expires ? new Date(row.reset_expires).toISOString() : null,
  };
}

async function ensureDir() {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
}

async function saveUsersFile(users: UserRecord[]) {
  cache = users;
  try {
    await ensureDir();
    await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.warn("[users] file persistence unavailable:", err);
  }
}

async function listUsersFile(): Promise<UserRecord[]> {
  if (!cache) {
    try {
      const raw = await fs.readFile(USERS_PATH, "utf-8");
      cache = JSON.parse(raw) as UserRecord[];
    } catch {
      cache = [];
      await saveUsersFile(cache);
    }
  }
  return cache;
}

export async function listUsers(): Promise<UserRecord[]> {
  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [rows] = await getPool().query<RowDataPacket[]>("SELECT * FROM users ORDER BY created_at DESC");
      return rows.map(rowToUser);
    } catch (err) {
      console.warn("[users] MySQL list failed, falling back to file:", err);
    }
  }
  return listUsersFile();
}

export async function findUserByEmail(email: string) {
  const key = normalizeEmail(email);
  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [rows] = await getPool().query<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [key],
      );
      if (rows[0]) return rowToUser(rows[0]);
      return undefined;
    } catch (err) {
      console.warn("[users] MySQL find failed, falling back to file:", err);
    }
  }
  const all = await listUsersFile();
  return all.find((u) => u.email === key);
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !input.password || input.password.length < 6) {
    throw new Error("Valid email and password (min 6 chars) are required");
  }
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists");

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomBytes(12).toString("hex"),
    email,
    name: input.name?.trim() || undefined,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  if (dbConfigured()) {
    try {
      await ensureSchema();
      await getPool().query(
        `INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, user.email, user.name ?? null, user.passwordHash, new Date(now), new Date(now)],
      );
      return user;
    } catch (err) {
      console.warn("[users] MySQL create failed, falling back to file:", err);
    }
  }

  const all = await listUsersFile();
  await saveUsersFile([...all, user]);
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function createPasswordResetToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (dbConfigured()) {
    try {
      await ensureSchema();
      await getPool().query(
        `UPDATE users SET reset_token = ?, reset_expires = ?, updated_at = ? WHERE id = ?`,
        [token, new Date(expires), new Date(), user.id],
      );
      return { user: { ...user, resetToken: token, resetExpires: expires }, token, expires };
    } catch (err) {
      console.warn("[users] MySQL reset token failed, falling back to file:", err);
    }
  }

  const all = await listUsersFile();
  const next = all.map((u) =>
    u.id === user.id
      ? { ...u, resetToken: token, resetExpires: expires, updatedAt: new Date().toISOString() }
      : u,
  );
  await saveUsersFile(next);
  return { user: { ...user, resetToken: token, resetExpires: expires }, token, expires };
}

export async function resetPasswordWithToken(token: string, password: string) {
  if (!token || !password || password.length < 6) {
    throw new Error("Valid token and password (min 6 chars) are required");
  }

  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [rows] = await getPool().query<RowDataPacket[]>(
        "SELECT * FROM users WHERE reset_token = ? LIMIT 1",
        [token],
      );
      const row = rows[0];
      if (!row || !row.reset_expires) throw new Error("Invalid or expired reset link");
      if (new Date(row.reset_expires).getTime() < Date.now()) {
        throw new Error("Invalid or expired reset link");
      }
      const user = rowToUser(row);
      const passwordHash = hashPassword(password);
      await getPool().query<ResultSetHeader>(
        `UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL, updated_at = ? WHERE id = ?`,
        [passwordHash, new Date(), user.id],
      );
      return user;
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid or expired")) throw err;
      console.warn("[users] MySQL reset failed, falling back to file:", err);
    }
  }

  const all = await listUsersFile();
  const user = all.find((u) => u.resetToken === token);
  if (!user || !user.resetExpires) throw new Error("Invalid or expired reset link");
  if (new Date(user.resetExpires).getTime() < Date.now()) {
    throw new Error("Invalid or expired reset link");
  }
  const next = all.map((u) =>
    u.id === user.id
      ? {
          ...u,
          passwordHash: hashPassword(password),
          resetToken: null,
          resetExpires: null,
          updatedAt: new Date().toISOString(),
        }
      : u,
  );
  await saveUsersFile(next);
  return user;
}

export function publicUser(u: UserRecord) {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    createdAt: u.createdAt,
  };
}
