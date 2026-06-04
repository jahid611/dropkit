import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f5f1ea] px-6 text-[#1a1611]">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 block text-center luxe text-3xl tracking-tight">
          DropKit
        </Link>
        <div className="border border-[#1a1611]/15 bg-[#faf7f1] p-8">{children}</div>
        <p className="mt-6 text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#1a1611]/40">
          Le studio des maisons
        </p>
      </div>
    </div>
  );
}
