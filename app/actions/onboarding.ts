"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { requireBrand } from "@/app/lib/guard";

export interface OnboardingState {
  error?: string;
}

function str(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? "").trim();
  return v.length ? v : null;
}

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const brand = await requireBrand();

  const brandName = str(formData, "brandName");
  if (!brandName) return { error: "Le nom de la marque est obligatoire." };

  const foundedRaw = str(formData, "foundedYear");
  const foundedYear = foundedRaw ? Number(foundedRaw) : null;
  if (foundedYear !== null && (Number.isNaN(foundedYear) || foundedYear < 1900))
    return { error: "Année de création invalide." };

  const data = {
    brandName,
    legalName: str(formData, "legalName"),
    foundedYear,
    category: str(formData, "category"),
    instagram: str(formData, "instagram"),
    tiktok: str(formData, "tiktok"),
    audienceSize: str(formData, "audienceSize"),
    dropFrequency: str(formData, "dropFrequency"),
    website: str(formData, "website"),
    avatarUrl: str(formData, "avatarUrl"), // visuel unique de la maison (ex-logoUrl)
    description: str(formData, "description"),
    country: str(formData, "country"),
  };

  // Upsert : on peut repasser pour modifier le profil.
  await prisma.brandProfile.upsert({
    where: { brandId: brand.id },
    create: { brandId: brand.id, ...data },
    update: data,
  });

  await prisma.brand.update({
    where: { id: brand.id },
    data: { onboardingCompleted: true },
  });

  redirect("/dashboard");
}
