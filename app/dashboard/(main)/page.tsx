import Link from "next/link";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import { createDraftDropAction, deleteDropAction } from "@/app/actions/drops";
import { dropPath } from "@/app/lib/drop-url";

function statusLabel(starts: Date | null, ends: Date | null) {
  const now = Date.now();
  if (ends && ends.getTime() < now) return { text: "Terminé", cls: "text-ink/40" };
  if (starts && starts.getTime() > now) return { text: "Programmé", cls: "text-ink/70" };
  if (starts && starts.getTime() <= now) return { text: "En cours", cls: "text-accent" };
  return { text: "Brouillon", cls: "text-ink/40" };
}

export default async function DashboardPage() {
  const brand = await requireOnboardedBrand();
  const brandName = brand.profile?.brandName;
  const drops = await prisma.drop.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div>
      <div className="flex items-end justify-between border-b border-line pb-6">
        <div>
          <p className="eyebrow text-ink/45">Studio</p>
          <h1 className="mt-2 luxe text-3xl tracking-tight text-ink">Mes drops</h1>
        </div>
        <form action={createDraftDropAction}>
          <button className="bg-ink px-5 py-2.5 eyebrow text-paper transition hover:opacity-85">
            ＋ Nouveau drop
          </button>
        </form>
      </div>

      {/* Comment ça marche — pédagogie + densité, visible en permanence */}
      <section className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
        {[
          {
            n: "01",
            t: "Composer",
            d: "Choisissez un fond, ajoutez vos articles et les champs à demander à vos visiteurs (email, taille, téléphone…).",
          },
          {
            n: "02",
            t: "Diffuser",
            d: "Partagez le lien ou le QR code — en boutique, en story, sur vos réseaux. La page publique s'ouvre instantanément.",
          },
          {
            n: "03",
            t: "Collecter",
            d: "Chaque visiteur s'inscrit en un geste. Retrouvez vos contacts dans Statistiques et exportez-les quand vous voulez.",
          },
        ].map((s) => (
          <div key={s.n} className="bg-paper p-5">
            <span className="eyebrow text-ink/35">{s.n}</span>
            <h3 className="mt-1 luxe text-lg text-ink">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/55">{s.d}</p>
          </div>
        ))}
      </section>

      {drops.length === 0 ? (
        <div className="mt-8 border border-dashed border-line p-16 text-center">
          <p className="luxe text-xl text-ink/70">Aucun drop pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-ink/45">
            Créez votre premier drop pour commencer à capturer vos contacts.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
          {drops.map((d) => {
            const st = statusLabel(d.startsAt, d.endsAt);
            return (
              <li key={d.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/drops/${d.id}`}
                      className="truncate luxe text-lg text-ink underline-offset-4 hover:underline"
                    >
                      {d.title}
                    </Link>
                    <span className={`eyebrow ${st.cls}`}>{st.text}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {dropPath(brandName, d.slug)} · {d._count.submissions} inscrit
                    {d._count.submissions > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={dropPath(brandName, d.slug)}
                    target="_blank"
                    className="border border-line px-3 py-1.5 eyebrow text-ink/55 transition hover:border-ink hover:text-ink"
                  >
                    Voir ↗
                  </Link>
                  <Link
                    href={`/dashboard/drops/${d.id}/qr`}
                    className="border border-line px-3 py-1.5 eyebrow text-ink/55 transition hover:border-ink hover:text-ink"
                  >
                    QR
                  </Link>
                  <Link
                    href={`/dashboard/drops/${d.id}`}
                    className="border border-line px-3 py-1.5 eyebrow text-ink/55 transition hover:border-ink hover:text-ink"
                  >
                    Éditer
                  </Link>
                  <form action={deleteDropAction}>
                    <input type="hidden" name="dropId" value={d.id} />
                    <button className="border border-line px-3 py-1.5 eyebrow text-ink/40 transition hover:border-accent hover:text-accent">
                      Suppr.
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
