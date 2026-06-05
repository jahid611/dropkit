import { slugify } from "@/app/lib/slug";

/**
 * Slug d'affichage de la maison dans l'URL.
 * Décoratif : la vraie clé d'un drop reste son `slug` (unique globalement).
 * Dérivé du nom de la maison, donc pas de colonne en base.
 */
export function brandSlug(brandName: string | null | undefined): string {
  return slugify(brandName || "maison");
}

/**
 * Chemin canonique relatif d'un drop : `/d/<maison>/<drop>`.
 * Utilisé partout (liens, QR, OpenGraph, emails, revalidation) pour rester cohérent.
 */
export function dropPath(
  brandName: string | null | undefined,
  dropSlug: string,
): string {
  return `/d/${brandSlug(brandName)}/${dropSlug}`;
}
