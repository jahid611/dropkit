import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import { dropPath } from "@/app/lib/drop-url";
import InscritsAccordion, {
  type DropStats,
} from "@/app/components/InscritsAccordion";

function safeParse(raw: string): Record<string, string> {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export default async function InscritsPage() {
  const brand = await requireOnboardedBrand();
  const drops = await prisma.drop.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    include: {
      fields: { orderBy: { position: "asc" } },
      submissions: { orderBy: { createdAt: "desc" } },
    },
  });

  const stats: DropStats[] = drops.map((d) => ({
    id: d.id,
    slug: d.slug,
    path: dropPath(brand.profile?.brandName, d.slug),
    title: d.title,
    count: d.submissions.length,
    emailable: d.submissions.filter((s) => s.email).length,
    notifiedAt: d.notifiedAt ? d.notifiedAt.toISOString().slice(0, 16).replace("T", " ") : null,
    columns: ["Date", ...d.fields.map((f) => f.label)],
    rows: d.submissions.map((s) => {
      const data = safeParse(s.data);
      return [
        s.createdAt.toISOString().slice(0, 16).replace("T", " "),
        ...d.fields.map((f) => data[f.id] ?? ""),
      ];
    }),
  }));

  const totalInscrits = stats.reduce((n, d) => n + d.count, 0);

  return (
    <div>
      <div className="border-b border-line pb-6">
        <p className="eyebrow text-ink/45">Statistiques</p>
        <h1 className="mt-2 luxe text-3xl tracking-tight text-ink">
          Inscrits &amp; statistiques
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          {totalInscrits} inscrit{totalInscrits > 1 ? "s" : ""} au total ·{" "}
          {stats.length} drop{stats.length > 1 ? "s" : ""}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/55">
          Tous vos contacts capturés, regroupés par drop. Dépliez un drop pour consulter
          le détail des réponses, exporter votre liste, ou prévenir les inscrits par email
          à l&apos;ouverture. Une seule inscription par personne et par drop est conservée.
        </p>
      </div>

      {/* Ce que vous pouvez faire ici — densité + clarté */}
      <section className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
        {[
          { t: "Consulter", d: "Le détail de chaque inscription : date et réponses à tous vos champs." },
          { t: "Exporter", d: "Téléchargez votre liste en CSV ou Excel pour vos outils marketing." },
          { t: "Notifier", d: "Envoyez un email à tous les inscrits au moment d'ouvrir le drop." },
        ].map((s) => (
          <div key={s.t} className="bg-paper p-5">
            <h3 className="luxe text-lg text-ink">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/55">{s.d}</p>
          </div>
        ))}
      </section>

      <div className="mt-8">
        {stats.length === 0 ? (
          <p className="border border-dashed border-line p-12 text-center luxe text-lg text-ink/60">
            Aucun drop pour l&apos;instant.
          </p>
        ) : (
          <InscritsAccordion drops={stats} />
        )}
      </div>
    </div>
  );
}
