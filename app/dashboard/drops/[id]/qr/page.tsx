import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboardedBrand } from "@/app/lib/guard";
import { prisma } from "@/app/lib/db";
import { slugify } from "@/app/lib/slug";
import QrCode from "@/app/components/QrCode";

export default async function DropQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await requireOnboardedBrand();
  const drop = await prisma.drop.findFirst({
    where: { id, brandId: brand.id },
  });
  if (!drop) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <div className="qr-noprint mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="eyebrow text-ink/45 transition hover:text-ink">
          ← Studio
        </Link>
        <span className="text-sm text-ink/30">/</span>
        <span className="luxe text-base text-ink">{drop.title}</span>
      </div>

      <div className="qr-noprint mb-8 text-center">
        <p className="eyebrow text-ink/45">QR code du drop</p>
        <h1 className="mt-2 luxe text-3xl font-semibold text-ink">
          Scannez. Partagez. Affichez.
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          Sur Instagram, en boutique, sur une affiche — il mène directement à la
          page du drop.
        </p>
      </div>

      <QrCode
        slug={drop.slug}
        accent={drop.accent}
        filename={`drop-${slugify(drop.title)}-qr`}
      />
    </div>
  );
}
