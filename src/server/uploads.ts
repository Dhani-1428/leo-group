import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function extFor(mime: string, fallbackName: string) {
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  const fromName = path.extname(fallbackName).toLowerCase();
  return fromName || ".jpg";
}

export async function saveUpload(file: File): Promise<{ url: string; filename: string }> {
  if (!ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed (JPG, PNG, WebP, GIF)");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8MB");
  }

  await ensureUploadDir();
  const ext = extFor(file.type, file.name);
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  return { url: `/api/uploads/${filename}`, filename };
}

export async function readUpload(filename: string): Promise<{ data: Buffer; contentType: string } | null> {
  const safe = path.basename(filename);
  if (safe !== filename || safe.includes("..")) return null;
  const full = path.join(UPLOAD_DIR, safe);
  try {
    const data = await fs.readFile(full);
    const ext = path.extname(safe).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";
    return { data, contentType };
  } catch {
    return null;
  }
}
