import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/app/lib/plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Trois plans pour composer et diffuser vos drops : Découverte (gratuit), Studio et Maison.",
};

export default async function TarifsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const fromQuota = from === "quota";

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* En-tête */}
      <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-10">
        <Link href="/" className="luxe text-xl tracking-tight">
          DropKit
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/login" className="eyebrow text-ink/55 transition hover:text-ink">
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="bg-ink px-4 py-2 eyebrow text-paper transition hover:opacity-85"
          >
            Créer un studio
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <div className="text-center">
          <p className="eyebrow text-ink/45">Tarifs</p>
          <h1 className="mt-3 luxe text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[1.05]">
            Un plan pour chaque maison.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/55">
            Commencez gratuitement, passez à la vitesse supérieure quand vos drops décollent.
            Sans engagement, résiliable à tout moment.
          </p>
        </div>

        {fromQuota && (
          <div className="mx-auto mt-8 max-w-2xl rounded-sm border border-accent/30 bg-accent/5 px-5 py-4 text-center text-sm text-ink/70">
            Vous avez atteint la limite de drops de votre plan actuel. Choisissez un plan
            supérieur pour continuer à en créer.
          </div>
        )}

        {/* Plans */}
        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-sm border bg-paper p-7 ${
                plan.highlighted
                  ? "border-ink shadow-xl lg:-my-2 lg:py-9"
                  : "border-line"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 bg-ink px-3 py-1 eyebrow text-paper">
                  Recommandé
                </span>
              )}

              <h2 className="luxe text-2xl text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-ink/55">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="luxe text-4xl font-medium text-ink">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-ink/45">{plan.period}</span>
                )}
              </div>

              <Link
                href="/signup"
                className={`mt-6 w-full rounded-sm px-4 py-3 text-center eyebrow transition ${
                  plan.highlighted
                    ? "bg-ink text-paper hover:opacity-85"
                    : "border border-ink text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Paiement à venir */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-ink/45">
          Le paiement en ligne arrive bientôt. Créez dès maintenant votre studio
          gratuitement — vous pourrez passer à un plan supérieur dès son ouverture.
        </p>
      </main>

      <footer className="border-t border-line px-6 py-10 text-center sm:px-10">
        <Link href="/" className="eyebrow text-ink/45 transition hover:text-ink">
          ← Retour à l'accueil
        </Link>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-ink"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
