// Squelette de l'onboarding (transition depuis l'inscription).
export default function OnboardingLoading() {
  return (
    <div className="app-shell min-h-dvh">
      <div className="mx-auto w-full max-w-lg animate-pulse px-6 py-16">
        <div className="h-3 w-40 rounded bg-ink/10" />
        <div className="mt-3 h-8 w-72 rounded bg-ink/10" />
        <div className="mt-2 h-3 w-56 rounded bg-ink/5" />
        <div className="mt-8 rounded-sm border border-line bg-paper p-8">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-28 rounded bg-ink/10" />
                <div className="mt-2 h-10 w-full rounded-sm bg-ink/5" />
              </div>
            ))}
            <div className="mt-2 h-11 w-full rounded-sm bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
