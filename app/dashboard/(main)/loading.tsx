// Squelette affiché instantanément pendant le chargement d'une page du dashboard.
// Le header (layout) reste en place -> la navigation paraît immédiate.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-line pb-6">
        <div className="h-3 w-24 rounded bg-ink/10" />
        <div className="mt-3 h-8 w-64 rounded bg-ink/10" />
        <div className="mt-2 h-3 w-40 rounded bg-ink/5" />
      </div>
      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-5">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-48 rounded bg-ink/10" />
              <div className="mt-2 h-3 w-32 rounded bg-ink/5" />
            </div>
            <div className="flex shrink-0 gap-2">
              <div className="h-8 w-14 rounded bg-ink/5" />
              <div className="h-8 w-14 rounded bg-ink/5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
