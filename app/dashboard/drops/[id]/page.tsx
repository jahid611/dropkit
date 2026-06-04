import { redirect } from "next/navigation";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import DropEditor, { type EditorDrop } from "@/app/components/DropEditor";

function toLocalInput(d: Date | null): string | null {
  if (!d) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function parseCountdown(raw: string): { show: boolean; style: string } {
  try {
    const o = JSON.parse(raw);
    return { show: o.show ?? true, style: o.style ?? "boxed" };
  } catch {
    return { show: true, style: "boxed" };
  }
}

function parseOptions(raw: string): string[] {
  try {
    const o = JSON.parse(raw);
    return Array.isArray(o) ? o.map(String) : [];
  } catch {
    return [];
  }
}

export default async function DropEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await requireOnboardedBrand();

  const drop = await prisma.drop.findFirst({
    where: { id, brandId: brand.id },
    include: {
      items: { orderBy: { position: "asc" } },
      fields: { orderBy: { position: "asc" } },
    },
  });
  if (!drop) redirect("/dashboard");

  const editorDrop: EditorDrop = {
    id: drop.id,
    slug: drop.slug,
    brandName: brand.profile?.brandName ?? brand.email,
    title: drop.title,
    subtitle: drop.subtitle,
    accent: drop.accent,
    backgroundId: drop.backgroundId,
    welcomeText: drop.welcomeText,
    startsAt: toLocalInput(drop.startsAt),
    endsAt: toLocalInput(drop.endsAt),
    countdown: parseCountdown(drop.countdownStyle),
    items: drop.items.map((it) => ({
      title: it.title,
      subtitle: it.subtitle,
      imageUrl: it.imageUrl,
    })),
    fields: drop.fields.map((f) => ({
      type: f.type,
      label: f.label,
      required: f.required,
      options: parseOptions(f.options),
      role: f.role,
    })),
  };

  return <DropEditor drop={editorDrop} />;
}
