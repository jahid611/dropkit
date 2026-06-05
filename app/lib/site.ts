/**
 * URL de base publique du site (sans slash final).
 * Sert à `metadataBase`, aux URLs OpenGraph et aux liens canoniques.
 *
 * Ordre de résolution :
 *  1. `NEXT_PUBLIC_SITE_URL` — domaine choisi explicitement (recommandé en prod).
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — domaine de prod stable fourni par Vercel.
 *  3. `VERCEL_URL` — URL du déploiement courant (preview).
 *  4. localhost en dev.
 */
const FALLBACK = "http://localhost:3000";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const deploy = process.env.VERCEL_URL;
  if (deploy) return `https://${deploy}`;

  return FALLBACK;
}
