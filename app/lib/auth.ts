import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "dk_session";
const SESSION_DAYS = 30;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Crée une session en base + pose le cookie httpOnly. */
export async function createSession(brandId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const session = await prisma.session.create({
    data: { brandId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Marque actuellement connectée (avec son profil), ou null.
 * Mémoïsée par requête (React cache) : le layout et la page partagent une seule
 * requête DB de session au lieu de la rejouer à chaque appel d'une même navigation.
 */
export const getCurrentBrand = cache(async () => {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { brand: { include: { profile: true } } },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    return null;
  }
  return session.brand;
});

/** Détruit la session courante (DB + cookie). */
export async function destroySession() {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    store.delete(COOKIE);
  }
}
