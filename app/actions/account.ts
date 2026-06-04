"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { hashPassword, verifyPassword } from "@/app/lib/auth";

export interface AccountState {
  ok?: boolean;
  error?: string;
  scope?: "email" | "password";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateEmailAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const brand = await requireOnboardedBrand();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email))
    return { scope: "email", error: "Adresse email invalide." };
  if (email === brand.email) return { scope: "email", ok: true };

  const existing = await prisma.brand.findUnique({ where: { email } });
  if (existing) return { scope: "email", error: "Cet email est déjà utilisé." };

  await prisma.brand.update({ where: { id: brand.id }, data: { email } });
  revalidatePath("/dashboard/settings");
  return { scope: "email", ok: true };
}

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const brand = await requireOnboardedBrand();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!(await verifyPassword(current, brand.passwordHash)))
    return { scope: "password", error: "Mot de passe actuel incorrect." };
  if (next.length < 8)
    return { scope: "password", error: "Le nouveau mot de passe doit faire 8 caractères minimum." };

  await prisma.brand.update({
    where: { id: brand.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { scope: "password", ok: true };
}
