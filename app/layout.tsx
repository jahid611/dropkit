import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

// Audit fonts (Phase 1) : les 4 polices servent réellement, aucune n'est retirée.
// Levier restant = périmètre de préchargement. Déclarées ici (root layout), elles
// seraient préchargées sur TOUTES les routes (cf. doc next/font « Preloading »).
// On ne précharge donc que les polices visibles au-dessus de la ligne de flottaison
// sur les routes les plus exposées ; les autres restent en `preload: false`
// (toujours chargées et appliquées, mais sans <link rel=preload> sur chaque page).

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

// Mono — uniquement de petits libellés du formulaire visiteur (LeadForm, MusicToggle),
// jamais un hero → pas de préchargement (évite un <link rel=preload> inutile partout).
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "DropKit — Studio de drops pour créateurs de mode",
  description:
    "Composez en quelques minutes une page de drop éditoriale et capturez vos contacts avant l'ouverture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
