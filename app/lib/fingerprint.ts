import "server-only";

import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "node:crypto";

const FP_COOKIE = "dk_fp";

/** IP cliente (best-effort derrière proxy). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

/** Lecture seule du token d'empreinte (ne pose pas de cookie). */
export async function readFpToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(FP_COOKIE)?.value ?? null;
}

/** Dans une action : renvoie le token, en le créant et le posant si absent. */
export async function ensureFpToken(): Promise<string> {
  const store = await cookies();
  let token = store.get(FP_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    store.set(FP_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 ans
    });
  }
  return token;
}

/** Empreinte stable par navigateur (verrouillage 1 inscription / drop). */
export function fingerprint(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
