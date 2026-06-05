"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { deleteDropAction } from "@/app/actions/drops";

/**
 * Suppression d'un drop avec confirmation : bouton « Suppr. » → modale animée
 * (avertissement explicite si des inscrits seront perdus) → action serveur.
 */
export default function DeleteDropModal({
  dropId,
  title,
  count,
}: {
  dropId: string;
  title: string;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, pending]);

  function confirm() {
    startTransition(async () => {
      await deleteDropAction(dropId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-line px-3 py-1.5 eyebrow text-ink/40 transition hover:border-accent hover:text-accent"
      >
        Suppr.
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !pending && setOpen(false)}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />

            <motion.div
              className="relative w-full max-w-md rounded-sm border border-line bg-paper p-7 shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="eyebrow text-accent">Supprimer le drop</p>
              <h2 className="mt-3 luxe text-2xl text-ink">{title || "Sans titre"}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                Cette action est <strong className="text-ink">irréversible</strong>. La page
                publique, le QR code et les articles seront supprimés
                {count > 0 ? (
                  <>
                    , ainsi que{" "}
                    <strong className="text-ink">
                      {count} inscrit{count > 1 ? "s" : ""}
                    </strong>
                    .
                  </>
                ) : (
                  "."
                )}
              </p>

              <div className="mt-7 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-sm border border-line px-4 py-2.5 eyebrow text-ink/60 transition hover:border-ink hover:text-ink disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={pending}
                  className="rounded-sm bg-accent px-4 py-2.5 eyebrow text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {pending ? "Suppression…" : "Supprimer définitivement"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
