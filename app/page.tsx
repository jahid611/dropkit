import Link from "next/link";
import Carousel from "./components/Carousel";

const INK = "#1a1611";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#f5f1ea] text-[#1a1611]">
      {/* Bandeau */}
      <div className="bg-[#1a1611] py-2 text-center">
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-[#f5f1ea]/80">
          Le studio des maisons — nouvelle saison
        </span>
      </div>

      {/* Nav */}
      <header className="grid grid-cols-2 items-center px-6 py-6 sm:grid-cols-3 sm:px-10">
        <nav className="hidden items-center gap-7 sm:flex">
          <Link href="#collection" className="text-[0.65rem] uppercase tracking-[0.22em] text-[#1a1611]/70 transition hover:text-[#1a1611]">
            Le studio
          </Link>
          <Link href="/d/demo" className="text-[0.65rem] uppercase tracking-[0.22em] text-[#1a1611]/70 transition hover:text-[#1a1611]">
            Démo
          </Link>
        </nav>
        <Link href="/" className="luxe text-center text-2xl tracking-tight">
          DropKit
        </Link>
        <nav className="flex items-center justify-end gap-7">
          <Link href="/login" className="text-[0.65rem] uppercase tracking-[0.22em] text-[#1a1611]/70 transition hover:text-[#1a1611]">
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden border-b border-[#1a1611] pb-0.5 text-[0.65rem] uppercase tracking-[0.22em] sm:inline"
          >
            Commencer
          </Link>
        </nav>
      </header>

      {/* Hero éditorial (texte + visuel campagne) */}
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:py-32">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#1a1611]/50">
            Mode · Création
          </p>
          <h1 className="luxe mt-7 text-[clamp(3rem,7vw,6rem)] font-medium leading-[0.95] tracking-[-0.01em]">
            L&apos;art de lancer
            <br />
            <span className="italic">un drop.</span>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-[#1a1611]/65 sm:text-base">
            La plateforme des créateurs de mode pour composer des pages de
            lancement d&apos;exception, capturer leur communauté et faire de
            chaque drop un événement.
          </p>
          <div className="mt-11 flex items-center gap-8">
            <Link
              href="/signup"
              className="bg-[#1a1611] px-8 py-4 text-[0.65rem] uppercase tracking-[0.25em] text-[#f5f1ea] transition hover:opacity-85"
            >
              Créer mon studio
            </Link>
            <Link
              href="/d/demo"
              className="border-b border-[#1a1611] pb-1 text-[0.65rem] uppercase tracking-[0.25em] transition hover:opacity-60"
            >
              Voir la démo
            </Link>
          </div>
        </div>

        <div className="relative min-h-[58vh] lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/IMG_1801.jpeg"
            alt="Campagne"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end p-8">
            <span className="luxe text-3xl italic text-white">Saison 01</span>
          </div>
        </div>
      </section>

      {/* La "collection" (fonctionnalités en lookbook) */}
      <section id="collection" className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between border-b border-[#1a1611]/15 pb-6">
            <h2 className="luxe text-3xl font-medium sm:text-4xl">La collection</h2>
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[#1a1611]/45">
              En images
            </span>
          </div>

          <div className="mt-12">
            <Carousel slides={SLIDES} />
          </div>
        </div>
      </section>

      {/* Manifeste */}
      <section className="border-y border-[#1a1611]/15 px-6 py-28 text-center sm:px-10">
        <p className="mx-auto max-w-4xl luxe text-[clamp(1.75rem,4.5vw,3.25rem)] font-medium italic leading-[1.15]">
          Chaque drop, mis en scène comme une pièce de collection.
        </p>
      </section>

      {/* CTA final */}
      <section className="px-6 py-28 text-center sm:px-10">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#1a1611]/50">
          Ouvrez votre maison
        </p>
        <h2 className="luxe mx-auto mt-6 max-w-2xl text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1.05]">
          Votre prochain drop commence ici.
        </h2>
        <div className="mt-10 flex justify-center">
          <Link
            href="/signup"
            className="bg-[#1a1611] px-10 py-4 text-[0.65rem] uppercase tracking-[0.25em] text-[#f5f1ea] transition hover:opacity-85"
          >
            Créer mon studio
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1611]/15 px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-10 sm:flex-row">
            <span className="luxe text-2xl tracking-tight">DropKit</span>
            <div className="flex gap-16">
              <div className="flex flex-col gap-3">
                <span className="text-[0.6rem] uppercase tracking-[0.3em] text-[#1a1611]/40">
                  Studio
                </span>
                <Link href="/signup" className="text-sm text-[#1a1611]/70 transition hover:text-[#1a1611]">
                  Commencer
                </Link>
                <Link href="/login" className="text-sm text-[#1a1611]/70 transition hover:text-[#1a1611]">
                  Connexion
                </Link>
                <Link href="/d/demo" className="text-sm text-[#1a1611]/70 transition hover:text-[#1a1611]">
                  Démo
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-12 text-[0.6rem] uppercase tracking-[0.3em] text-[#1a1611]/35">
            © DropKit — Le studio des drops · mode &amp; création
          </p>
        </div>
      </footer>
    </div>
  );
}

const SLIDES = [
  { img: "/home/IMG_1803.jpeg", title: "Composer", text: "Des pages de drop d'exception — 15 fonds, articles, champs sur mesure." },
  { img: "/home/IMG_1804.jpeg", title: "Anticiper", text: "Compte à rebours et modal d'accueil pour créer le désir." },
  { img: "/home/IMG_1802.jpeg", title: "Diffuser", text: "Des QR codes raffinés, à scanner en boutique comme en ligne." },
];
