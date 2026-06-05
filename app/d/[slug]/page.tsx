import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getBackground } from "@/app/lib/backgrounds";
import { readFpToken, fingerprint } from "@/app/lib/fingerprint";
import { getCurrentVisitor } from "@/app/lib/visitor-auth";
import VisitorExperience, {
  type VisitorDrop,
} from "@/app/components/VisitorExperience";

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

  // Ces trois lectures sont indépendantes -> en parallèle (un seul aller-retour).
  const [drop, visitor, token] = await Promise.all([
    prisma.drop.findUnique({
      where: { slug },
      include: {
        brand: { include: { profile: true } },
        items: { orderBy: { position: "asc" } },
        fields: { orderBy: { position: "asc" } },
      },
    }),
    getCurrentVisitor(),
    readFpToken(),
  ]);
  if (!drop) notFound();

  // Verrouillage : déjà inscrit via empreinte navigateur OU compte visiteur ?
  const fp = token ? fingerprint(token) : null;

  let alreadySubmitted = false;
  if (fp || visitor) {
    const existing = await prisma.submission.findFirst({
      where: {
        dropId: drop.id,
        OR: [
          ...(fp ? [{ fingerprint: fp }] : []),
          ...(visitor ? [{ visitorId: visitor.id }] : []),
        ],
      },
    });
    alreadySubmitted = Boolean(existing);
  }

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
    ended: Boolean(drop.endsAt && drop.endsAt.getTime() < Date.now()),
  };

  return (
    <VisitorExperience
      drop={vd}
      dark={dark}
      alreadySubmitted={alreadySubmitted}
      loggedIn={Boolean(visitor)}
      visitorEmail={visitor?.email ?? null}
    />
  );
}
