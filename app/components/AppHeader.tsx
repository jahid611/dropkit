"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "Mes drops", exact: true },
  { href: "/dashboard/inscrits", label: "Statistiques", exact: false },
];

export default function AppHeader({
  brandName,
  email,
  avatarUrl,
}: {
  brandName: string;
  email: string;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = (brandName?.[0] ?? email[0] ?? "?").toUpperCase();

  const avatar = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
  ) : (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-medium text-paper">
      {initial}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-[80%] items-center justify-between py-4">
        {/* Gauche : logo + nav */}
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="luxe text-xl tracking-tight text-ink">
            DropKit
          </Link>
          <nav className="hidden items-center gap-7 sm:flex">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`text-[0.7rem] uppercase tracking-[0.18em] transition ${
                    active ? "text-ink" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Droite : menu compte */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3 transition hover:border-ink/40"
          >
            {avatar}
            <span className="hidden max-w-[10rem] truncate text-xs text-ink/80 sm:block">
              {brandName}
            </span>
            <span className="text-[0.6rem] text-ink/40">▾</span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 border border-line bg-paper shadow-[0_20px_50px_-20px_rgba(26,22,17,0.35)]">
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm text-ink">{brandName}</p>
                  <p className="truncate text-xs text-ink/45">{email}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink/75 transition hover:bg-paper-deep hover:text-ink"
                >
                  Profil de la maison
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink/75 transition hover:bg-paper-deep hover:text-ink"
                >
                  Réglages
                </Link>
                <form action={logoutAction} className="border-t border-line">
                  <button className="block w-full px-4 py-2.5 text-left text-sm text-ink/75 transition hover:bg-paper-deep hover:text-ink">
                    Déconnexion
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
