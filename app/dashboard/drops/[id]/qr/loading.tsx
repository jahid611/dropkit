// Squelette de la page QR (transition depuis l'éditeur).
export default function QrLoading() {
  return (
    <div className="mx-auto flex w-[90%] max-w-md animate-pulse flex-col items-center py-16">
      <div className="h-3 w-24 rounded bg-ink/10" />
      <div className="mt-3 h-7 w-40 rounded bg-ink/10" />
      <div className="mt-8 aspect-square w-64 rounded-sm bg-ink/10" />
      <div className="mt-6 h-10 w-40 rounded-sm bg-ink/5" />
    </div>
  );
}
