import { redirect } from "next/navigation";
import { requireBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import OnboardingForm from "@/app/components/OnboardingForm";

export default async function OnboardingPage() {
  const brand = await requireBrand();
  if (brand.onboardingCompleted) redirect("/dashboard");

  const profile = await prisma.brandProfile.findUnique({
    where: { brandId: brand.id },
  });

  return (
    <div className="app-shell min-h-dvh">
      <div className="mx-auto w-full max-w-lg px-6 py-16">
        <p className="eyebrow text-ink/45">Bienvenue sur DropKit</p>
        <h1 className="mt-3 luxe text-3xl font-semibold tracking-tight text-ink">
          Parlez-nous de votre maison
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          Deux minutes. Cela personnalise votre studio et vos pages de drop.
        </p>

        <div className="mt-8 rounded-sm border border-line bg-paper p-8">
          <OnboardingForm defaults={profile ?? {}} />
        </div>
      </div>
    </div>
  );
}
