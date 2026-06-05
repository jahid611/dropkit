import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import ProfileForm from "@/app/components/ProfileForm";

export default async function ProfilePage() {
  const brand = await requireOnboardedBrand();
  const profile = await prisma.brandProfile.findUnique({
    where: { brandId: brand.id },
  });

  return (
    <div className="max-w-3xl">
      <div className="border-b border-line pb-6">
        <p className="eyebrow text-ink/45">Compte</p>
        <h1 className="mt-2 luxe text-3xl tracking-tight text-ink">
          Profil de la maison
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Ces informations personnalisent votre studio et vos pages de drop.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/55">
          Le nom, le logo et la description de votre maison apparaissent sur vos pages de
          drop publiques — c&apos;est la première impression de vos visiteurs. Les autres
          informations (réseaux, audience, raison sociale) restent privées et servent à
          affiner votre studio.
        </p>
      </div>
      <div className="mt-8">
        <ProfileForm defaults={profile ?? {}} />
      </div>
    </div>
  );
}
