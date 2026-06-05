"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { dropPath } from "@/app/lib/drop-url";
import { sendDropNotification } from "@/app/lib/email";

export interface NotifyActionResult {
  ok: boolean;
  sent?: number;
  simulated?: boolean;
  error?: string;
}

export async function notifyRegistrantsAction(
  dropId: string,
): Promise<NotifyActionResult> {
  const brand = await requireOnboardedBrand();

  const drop = await prisma.drop.findFirst({
    where: { id: dropId, brandId: brand.id },
    include: {
      submissions: { where: { email: { not: null } }, select: { email: true } },
    },
  });
  if (!drop) return { ok: false, error: "Drop introuvable." };

  const emails = drop.submissions
    .map((s) => s.email)
    .filter((e): e is string => Boolean(e));

  if (emails.length === 0)
    return {
      ok: false,
      error: "Aucun inscrit n'a renseigné d'email. Ajoutez un champ email à votre drop.",
    };

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  const dropUrl = `${proto}://${host}${dropPath(brand.profile?.brandName, drop.slug)}`;

  const res = await sendDropNotification({
    to: emails,
    brandName: brand.profile?.brandName ?? "La maison",
    dropTitle: drop.title,
    dropUrl,
  });

  if (res.error) return { ok: false, error: res.error };

  await prisma.drop.update({
    where: { id: dropId },
    data: { notifiedAt: new Date() },
  });
  revalidatePath("/dashboard/inscrits");

  return { ok: true, sent: res.sent, simulated: res.simulated };
}
