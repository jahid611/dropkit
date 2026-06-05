"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { slugify } from "@/app/lib/slug";
import { isValidBackground, DEFAULT_BACKGROUND } from "@/app/lib/backgrounds";
import { FIELD_TYPE_SET, MAX_FIELDS } from "@/app/lib/fields";

export interface ItemInput {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
}

export interface FieldInput {
  type: string;
  label: string;
  required: boolean;
  options: string[];
  role?: string | null;
}

export interface DropInput {
  title: string;
  subtitle?: string | null;
  accent: string;
  backgroundId: string;
  welcomeText?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  countdown: { show: boolean; style: string };
  items: ItemInput[];
  fields: FieldInput[];
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base);
  let slug = root;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await prisma.drop.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${root}-${i++}`;
  }
}

/** Crée un brouillon et ouvre l'éditeur. */
export async function createDraftDropAction() {
  const brand = await requireOnboardedBrand();
  const slug = await uniqueSlug("nouveau-drop");
  const drop = await prisma.drop.create({
    data: {
      brandId: brand.id,
      slug,
      title: "Nouveau drop",
      backgroundId: DEFAULT_BACKGROUND,
      accent: "#a6492f",
    },
  });
  redirect(`/dashboard/drops/${drop.id}`);
}

/** Sauvegarde complète d'un drop (méta + articles + champs). */
export async function saveDropAction(
  dropId: string,
  input: DropInput,
): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const brand = await requireOnboardedBrand();
  const drop = await prisma.drop.findFirst({
    where: { id: dropId, brandId: brand.id },
  });
  if (!drop) return { ok: false, error: "Drop introuvable." };

  const title = input.title.trim() || "Sans titre";
  if (!isValidBackground(input.backgroundId))
    return { ok: false, error: "Fond invalide." };

  // Slug : tant que le drop porte encore le slug auto du brouillon
  // (« nouveau-drop » / « nouveau-drop-N »), on le régénère depuis le vrai titre
  // pour que l'URL reflète le nom. Dès qu'un vrai slug existe, on le FIGE : le
  // changer casserait les QR codes et liens déjà partagés. `uniqueSlug` garantit
  // l'unicité globale (suffixe -2, -3… en cas de collision).
  let slug = drop.slug;
  const hasPlaceholderSlug = /^nouveau-drop(-\d+)?$/.test(drop.slug);
  if (hasPlaceholderSlug && title !== "Nouveau drop") {
    slug = await uniqueSlug(title, dropId);
  }

  const fields = input.fields.filter((f) => f.label.trim());
  if (fields.length > MAX_FIELDS)
    return { ok: false, error: `${MAX_FIELDS} champs maximum.` };
  if (fields.some((f) => !FIELD_TYPE_SET.has(f.type)))
    return { ok: false, error: "Type de champ invalide." };

  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (startsAt && endsAt && endsAt <= startsAt)
    return { ok: false, error: "La fermeture doit être après l'ouverture." };

  const items = input.items.filter((it) => it.title.trim());

  await prisma.$transaction([
    prisma.dropItem.deleteMany({ where: { dropId } }),
    prisma.fieldDef.deleteMany({ where: { dropId } }),
    prisma.drop.update({
      where: { id: dropId },
      data: {
        title,
        slug,
        subtitle: input.subtitle?.trim() || null,
        accent: input.accent,
        backgroundId: input.backgroundId,
        welcomeText: input.welcomeText?.trim() || null,
        startsAt,
        endsAt,
        countdownStyle: JSON.stringify(input.countdown ?? { show: true, style: "boxed" }),
        items: {
          create: items.map((it, i) => ({
            title: it.title.trim(),
            subtitle: it.subtitle?.trim() || null,
            imageUrl: it.imageUrl || null,
            position: i,
          })),
        },
        fields: {
          create: fields.map((f, i) => ({
            type: f.type,
            label: f.label.trim(),
            required: f.required,
            options: JSON.stringify(f.options ?? []),
            role: f.role || null,
            position: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/drops/${dropId}`);
  revalidatePath(`/d/${slug}`); // rafraîchit la page publique cachée
  if (slug !== drop.slug) revalidatePath(`/d/${drop.slug}`); // purge l'ancienne URL
  return { ok: true, slug };
}

/** Supprime un drop (cascade : articles, champs, inscriptions). */
export async function deleteDropAction(formData: FormData) {
  const brand = await requireOnboardedBrand();
  const dropId = String(formData.get("dropId") ?? "");
  await prisma.drop.deleteMany({ where: { id: dropId, brandId: brand.id } });
  revalidatePath("/dashboard");
}
