import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

// Serif éditoriale (display) — la signature "atelier de styliste"
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Serif couture (maison de luxe) — pour la home façon Jacquemus / Dior / LV
const playfair = Playfair_Display({
  variable: "--font-luxe",
  subsets: ["latin"],
  display: "swap",
});

// Sans neutre pour l'UI et le corps de texte
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Mono conservée pour quelques détails techniques
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
