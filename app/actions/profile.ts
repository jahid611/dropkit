"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { requireOnboardedBrand } from "@/app/lib/guard";

export interface ProfileState {
  ok?: boolean;
  error?: string;
}

function str(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? "").trim();
  return v.length ? v : null;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const brand = await requireOnboardedBrand();

  const brandName = str(formData, "brandName");
  if (!brandName) return { error: "Le nom de la maison est obligatoire." };

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
    avatarUrl: str(formData, "avatarUrl"),
    description: str(formData, "description"),
    country: str(formData, "country"),
  };

  await prisma.brandProfile.upsert({
    where: { brandId: brand.id },
    create: { brandId: brand.id, ...data },
    update: data,
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
