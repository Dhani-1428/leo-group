const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

export function allowedOrigins() {
  const extra = (process.env.ADMIN_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

function isAllowedOrigin(origin: string) {
  if (allowedOrigins().includes(origin)) return true;
  // Allow deployed Next admin panels on Vercel
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const match = origin && isAllowedOrigin(origin) ? origin : allowedOrigins()[0];
  return {
    "Access-Control-Allow-Origin": match,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function json(data: unknown, request: Request, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  const cors = corsHeaders(request);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v as string);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function noContent(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** Optional write protection. Empty key = open (local/dev). */
export function assertAdminKey(request: Request): Response | null {
  const expected = process.env.CATALOG_ADMIN_KEY;
  if (!expected) return null;
  const got = request.headers.get("X-Admin-Key");
  if (got === expected) return null;
  return json({ error: "Unauthorized" }, request, { status: 401 });
}
