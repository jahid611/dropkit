import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBackground } from "@/app/lib/backgrounds";
import { getPublicDrop } from "@/app/lib/public-drop";
import { dropPath } from "@/app/lib/drop-url";
import VisitorExperience, {
  type VisitorDrop,
} from "@/app/components/VisitorExperience";

// Page publique mise en cache (CDN) : son contenu est identique pour tous.
// -> servie sans lambda au 1er rendu = plus de cold start sur le chemin critique.
// La personnalisation (« déjà inscrit ? ») est récupérée côté client via
// /api/drops/[id]/me. Revalidation instantanée à l'édition : revalidatePath
// dans saveDropAction ; backstop horaire ci-dessous par sécurité.
//
// URL : /d/<maison>/<drop>. Le segment <maison> est décoratif ; la clé de lecture
// reste le slug du drop (unique globalement). Le lien canonique pointe toujours
// vers la maison réelle, donc un préfixe erroné ne crée pas de doublon SEO.
export const dynamic = "force-static";
export const revalidate = 3600;

function parseOptions(raw: string): string[] {
  try {
    const o = JSON.parse(raw);
    return Array.isArray(o) ? o.map(String) : [];
  } catch {
    return [];
  }
}

// SEO / partage : titre, description et image OpenGraph dérivés du drop.
// C'est la page diffusée par QR / réseaux / SMS → l'aperçu doit être soigné.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getPublicDrop(slug);
  if (!drop) return { title: "Drop introuvable" };

  const brandName = drop.brand.profile?.brandName ?? "Maison";
  const title = `${drop.title} — ${brandName}`;
  const description =
    drop.subtitle?.trim() ||
    drop.welcomeText?.trim() ||
    `Inscrivez-vous pour un accès prioritaire au drop « ${drop.title} » de ${brandName}.`;

  // Image de partage : 1er article illustré, sinon le logo de la maison.
  // Doit être une URL absolue (les images Supabase Storage le sont).
  const candidate =
    drop.items.find((it) => it.imageUrl)?.imageUrl ??
    drop.brand.profile?.avatarUrl ??
    drop.brand.profile?.logoUrl ??
    null;
  const image = candidate && /^https?:\/\//.test(candidate) ? candidate : null;
  const url = dropPath(brandName, drop.slug);

  return {
    // `absolute` : la page de drop porte l'identité de la marque, pas « · DropKit ».
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: brandName,
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PublicDropPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { slug } = await params;
  const drop = await getPublicDrop(slug);
  if (!drop) notFound();

  const dark = Boolean(getBackground(drop.backgroundId)?.dark);
  let cd = { show: true, style: "boxed" };
  try {
    const o = JSON.parse(drop.countdownStyle);
    cd = { show: o.show ?? true, style: o.style ?? "boxed" };
  } catch {}

  const vd: VisitorDrop = {
    id: drop.id,
    slug: drop.slug,
    brandName: drop.brand.profile?.brandName ?? "Maison",
    logo: drop.brand.profile?.avatarUrl ?? drop.brand.profile?.logoUrl ?? null,
    title: drop.title,
    subtitle: drop.subtitle,
    accent: drop.accent,
    backgroundId: drop.backgroundId,
    welcomeText: drop.welcomeText,
    target: drop.startsAt ? drop.startsAt.getTime() : null,
    countdown: cd,
    items: drop.items.map((it) => ({ title: it.title, imageUrl: it.imageUrl })),
    fields: drop.fields.map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label,
      required: f.required,
      options: parseOptions(f.options),
      role: f.role,
    })),
    // Timestamp de fin : « terminé ? » est calculé côté client (le HTML est caché).
    endsAt: drop.endsAt ? drop.endsAt.getTime() : null,
  };

  return <VisitorExperience drop={vd} dark={dark} />;
}
