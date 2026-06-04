"use server";

import { prisma } from "@/app/lib/db";
import { ensureFpToken, fingerprint, getClientIp } from "@/app/lib/fingerprint";
import {
  createVisitorSession,
  destroyVisitorSession,
  getCurrentVisitor,
} from "@/app/lib/visitor-auth";
import { hashPassword, verifyPassword } from "@/app/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubmitResult {
  ok: boolean;
  error?: string;
  locked?: boolean;
}

/** Inscription d'un visiteur à un drop. Verrouillé à 1 par drop. */
export async function submitDropAction(
  dropId: string,
  values: Record<string, string>,
): Promise<SubmitResult> {
  const drop = await prisma.drop.findUnique({
    where: { id: dropId },
    include: { fields: true },
  });
  if (!drop) return { ok: false, error: "Drop introuvable." };
  if (drop.endsAt && drop.endsAt.getTime() < Date.now())
    return { ok: false, error: "Ce drop est terminé." };

  // Validation des champs
  for (const f of drop.fields) {
    const v = (values[f.id] ?? "").trim();
    if (f.required && !v)
      return { ok: false, error: `Le champ « ${f.label} » est obligatoire.` };
    if (v && (f.type === "email" || f.role === "email") && !EMAIL_RE.test(v))
      return { ok: false, error: `Email invalide (${f.label}).` };
  }

  const visitor = await getCurrentVisitor();
  const token = await ensureFpToken();
  const fp = fingerprint(token);
  const ip = await getClientIp();

  // Déjà inscrit ? (par empreinte navigateur OU par compte visiteur)
  const existing = await prisma.submission.findFirst({
    where: {
      dropId,
      OR: [
        { fingerprint: fp },
        ...(visitor ? [{ visitorId: visitor.id }] : []),
      ],
    },
  });
  if (existing)
    return { ok: false, locked: true, error: "Vous êtes déjà inscrit à ce drop." };

  // Dénormalisation email/téléphone pour le mailing de fin
  const emailField = drop.fields.find((f) => f.role === "email");
  const phoneField = drop.fields.find((f) => f.role === "phone");
  const email = emailField ? values[emailField.id]?.trim() || null : null;
  const phone = phoneField ? values[phoneField.id]?.trim() || null : null;

  const data: Record<string, string> = {};
  for (const f of drop.fields) {
    if (values[f.id] != null) data[f.id] = String(values[f.id]).trim();
  }

  try {
    await prisma.submission.create({
      data: {
        dropId,
        visitorId: visitor?.id ?? null,
        fingerprint: fp,
        data: JSON.stringify(data),
        email,
        phone,
      },
    });
  } catch {
    // Violation de contrainte unique (course) -> déjà inscrit
    return { ok: false, locked: true, error: "Vous êtes déjà inscrit à ce drop." };
  }

  // (ip stockée pour audit éventuel — pas exposée)
  void ip;
  return { ok: true };
}

export interface VisitorAuthResult {
  ok: boolean;
  error?: string;
  email?: string;
}

export async function visitorSignupAction(
  email: string,
  password: string,
): Promise<VisitorAuthResult> {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return { ok: false, error: "Email invalide." };
  if (password.length < 8)
    return { ok: false, error: "Mot de passe : 8 caractères minimum." };

  const existing = await prisma.visitor.findUnique({ where: { email: e } });
  if (existing) return { ok: false, error: "Un compte existe déjà avec cet email." };

  const visitor = await prisma.visitor.create({
    data: { email: e, passwordHash: await hashPassword(password) },
  });
  await createVisitorSession(visitor.id);
  return { ok: true, email: e };
}

export async function visitorLoginAction(
  email: string,
  password: string,
): Promise<VisitorAuthResult> {
  const e = email.trim().toLowerCase();
  const visitor = await prisma.visitor.findUnique({ where: { email: e } });
  if (!visitor || !visitor.passwordHash || !(await verifyPassword(password, visitor.passwordHash)))
    return { ok: false, error: "Email ou mot de passe incorrect." };

  await createVisitorSession(visitor.id);
  return { ok: true, email: e };
}

export async function visitorLogoutAction() {
  await destroyVisitorSession();
}
