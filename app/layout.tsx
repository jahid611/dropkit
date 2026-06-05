import type { Metadata } from "next";
import { Fraunces, Geist, Playfair_Display } from "next/font/google";
import { siteUrl } from "@/app/lib/site";
import "./globals.css";

// Audit fonts (Phase 1) : 3 polices, toutes réellement utilisées.
// (Geist Mono a été retirée : ses seuls consommateurs — LeadForm, MusicToggle —
// étaient du code mort, supprimés en même temps.)
// Déclarées ici (root layout), elles sont préchargées sur TOUTES les routes
// (cf. doc next/font « Preloading »).

// Serif éditoriale (display) — titre hero de la page visiteur /d/[slug] (page produit).
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Serif couture (maison de luxe) — hero de la home + titres du dashboard (classe .luxe).
const playfair = Playfair_Display({
  variable: "--font-luxe",
  subsets: ["latin"],
  display: "swap",
});

// Sans neutre pour l'UI et le corps de texte (appliquée au <body>, présente partout).
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "DropKit — Studio de drops pour créateurs de mode",
    template: "%s · DropKit",
  },
  description:
    "Composez en quelques minutes une page de drop éditoriale et capturez vos contacts avant l'ouverture.",
  openGraph: {
    type: "website",
    siteName: "DropKit",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${playfair.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
