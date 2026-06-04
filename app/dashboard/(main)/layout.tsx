import { requireOnboardedBrand } from "@/app/lib/guard";
import AppHeader from "@/app/components/AppHeader";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await requireOnboardedBrand();
  return (
    <>
      <AppHeader
        brandName={brand.profile?.brandName ?? brand.email}
        email={brand.email}
        avatarUrl={brand.profile?.avatarUrl ?? null}
      />
      <main className="mx-auto w-[80%] py-10">{children}</main>
    </>
  );
}
