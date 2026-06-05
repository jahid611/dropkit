"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Aperçu d'un drop depuis le dashboard : bouton « œil » → modal contenant la vraie
 * page publique (iframe) dans un cadre téléphone, avec animations d'ouverture/fermeture.
 * L'ancre `#preview` demande à la page visiteur de ne pas auto-ouvrir sa modale d'accueil.
 */
export default function DropPreviewModal({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  // Échap pour fermer + verrouillage du scroll de la page sous la modale.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Prévisualiser le drop ${title}`}
        title="Prévisualiser"
        className="flex items-center justify-center border border-line px-3 py-1.5 text-ink/55 transition hover:border-ink hover:text-ink"
      >
        <EyeIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-modal="true"
            role="dialog"
          >
            {/* Fond */}
            <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />

            {/* Cadre téléphone */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Croix de fermeture */}
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer l'aperçu"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-lg ring-1 ring-ink/10"
              >
                <CrossIcon />
              </motion.button>

              <div className="overflow-hidden rounded-[2.25rem] border-[6px] border-ink bg-ink shadow-2xl">
                {/* Encoche */}
                <div className="relative flex h-6 items-center justify-center bg-ink">
                  <span className="h-1.5 w-16 rounded-full bg-paper/25" />
                </div>
                {/* Écran : la vraie page publique */}
                <div className="h-[min(78dvh,760px)] w-[min(86vw,380px)] overflow-hidden bg-paper">
                  <iframe
                    src={`${path}#preview`}
                    title={`Aperçu — ${title}`}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Légende sous le téléphone */}
              <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.25em] text-paper/70">
                {path}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
