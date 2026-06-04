import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
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
      </div>

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
