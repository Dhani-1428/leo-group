/** Client helpers for storefront account auth + transactional emails. */

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function registerAccount(input: {
  email: string;
  password: string;
  name?: string;
}) {
  return postJson<{ user: AuthUser; message: string }>("/api/auth/register", input);
}

export function loginAccount(input: { email: string; password: string }) {
  return postJson<{ user: AuthUser; message: string }>("/api/auth/login", input);
}

export function forgotPassword(email: string) {
  return postJson<{ message: string }>("/api/auth/forgot-password", { email });
}

export function resetPassword(token: string, password: string) {
  return postJson<{ user: AuthUser; message: string }>("/api/auth/reset-password", {
    token,
    password,
  });
}
