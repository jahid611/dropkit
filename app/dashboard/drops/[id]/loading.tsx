// Squelette de l'éditeur de drop (affiché instantanément à l'ouverture / au retour).
export default function DropEditorLoading() {
  return (
    <div className="mx-auto w-[90%] max-w-6xl animate-pulse py-8">
      {/* Barre du haut : titre + actions */}
      <div className="flex items-center justify-between border-b border-line pb-5">
        <div>
          <div className="h-3 w-20 rounded bg-ink/10" />
          <div className="mt-3 h-7 w-56 rounded bg-ink/10" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded bg-ink/5" />
          <div className="h-9 w-28 rounded bg-ink/10" />
        </div>
      </div>

      {/* Deux colonnes : aperçu + réglages */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="aspect-[4/5] rounded-sm bg-ink/10" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-28 rounded bg-ink/10" />
              <div className="mt-2 h-10 w-full rounded-sm bg-ink/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
