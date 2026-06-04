import { requireOnboardedBrand } from "@/app/lib/guard";
import AccountSettings from "@/app/components/AccountSettings";

export default async function SettingsPage() {
  const brand = await requireOnboardedBrand();

  return (
    <div className="max-w-2xl">
      <div className="border-b border-line pb-6">
        <p className="eyebrow text-ink/45">Compte</p>
        <h1 className="mt-2 luxe text-3xl tracking-tight text-ink">Réglages</h1>
        <p className="mt-1 text-sm text-ink/50">
          Gérez votre connexion et votre compte.
        </p>
      </div>
      <div className="mt-8">
        <AccountSettings email={brand.email} />
      </div>
    </div>
  );
}
