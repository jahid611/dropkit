import { notFound, redirect } from "next/navigation";
import { getPublicDrop } from "@/app/lib/public-drop";
import { dropPath } from "@/app/lib/drop-url";

// Compatibilité : ancien format à un seul segment `/d/<dropSlug>` (liens et QR
// déjà partagés, lien démo de la home). Le segment est ici un slug de drop →
// on redirige vers le canonique `/d/<maison>/<drop>`. Route dynamique (pas de cache).
export default async function LegacyDropRedirect({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: dropSlug } = await params;
  const drop = await getPublicDrop(dropSlug);
  if (!drop) notFound();
  redirect(dropPath(drop.brand.profile?.brandName, drop.slug));
}
