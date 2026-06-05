// Squelette des écrans d'authentification (rendu dans la carte du layout auth).
export default function AuthLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded bg-[#1a1611]/10" />
      <div className="mt-6 flex flex-col gap-4">
        <div className="h-10 w-full rounded-sm bg-[#1a1611]/5" />
        <div className="h-10 w-full rounded-sm bg-[#1a1611]/5" />
        <div className="mt-2 h-11 w-full rounded-sm bg-[#1a1611]/10" />
      </div>
    </div>
  );
}
