import "server-only";

import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE = "dk_visitor_session";
const DAYS = 60;

/** Crée une session visiteur + pose le cookie httpOnly (distinct de la marque). */
export async function createVisitorSession(visitorId: string) {
  const expiresAt = new Date(Date.now() + DAYS * 86_400_000);
  const session = await prisma.visitorSession.create({
    data: { visitorId, expiresAt },
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

/** Visiteur connecté, ou null. */
export async function getCurrentVisitor() {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (!sid) return null;

  const session = await prisma.visitorSession.findUnique({
    where: { id: sid },
    include: { visitor: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.visitorSession.delete({ where: { id: sid } }).catch(() => {});
    return null;
  }
  return session.visitor;
}

export async function destroyVisitorSession() {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (sid) {
    await prisma.visitorSession.delete({ where: { id: sid } }).catch(() => {});
    store.delete(COOKIE);
  }
}
