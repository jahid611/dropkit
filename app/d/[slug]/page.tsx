import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getBackground } from "@/app/lib/backgrounds";
import VisitorExperience, {
  type VisitorDrop,
} from "@/app/components/VisitorExperience";

// Page publique mise en cache (CDN) : son contenu est identique pour tous.
// -> servie sans lambda au 1er rendu = plus de cold start sur le chemin critique.
// La personnalisation (« déjà inscrit ? ») est récupérée côté client via
// /api/drops/[id]/me. Revalidation instantanée à l'édition : revalidatePath
// dans saveDropAction ; backstop horaire ci-dessous par sécurité.
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

export default async function PublicDropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drop = await prisma.drop.findUnique({
    where: { slug },
    include: {
      brand: { include: { profile: true } },
      items: { orderBy: { position: "asc" } },
      fields: { orderBy: { position: "asc" } },
    },
  });
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
