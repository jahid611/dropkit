"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/app/lib/auth";

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "Adresse email invalide." };
  if (password.length < 8)
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== confirm)
    return { error: "Les mots de passe ne correspondent pas." };

  const existing = await prisma.brand.findUnique({ where: { email } });
  if (existing) return { error: "Un compte existe déjà avec cet email." };

  const brand = await prisma.brand.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  await createSession(brand.id);
  redirect("/onboarding"); // nouveau compte -> questionnaire
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const brand = await prisma.brand.findUnique({ where: { email } });
  // Message générique : on ne révèle pas si l'email existe.
  if (!brand || !(await verifyPassword(password, brand.passwordHash)))
    return { error: "Email ou mot de passe incorrect." };

  await createSession(brand.id);
  redirect(brand.onboardingCompleted ? "/dashboard" : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
