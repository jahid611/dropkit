"use client";

import { useState } from "react";

/**
 * Copie le lien public absolu d'un drop dans le presse-papier, avec retour visuel.
 * Reçoit le chemin relatif (`/d/<maison>/<drop>`) ; l'origine est ajoutée côté client.
 */
export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Repli si l'API presse-papier est indisponible.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copier le lien du drop"
      title="Copier le lien"
      className={`flex items-center gap-1.5 border px-3 py-1.5 eyebrow transition ${
        copied
          ? "border-ink text-ink"
          : "border-line text-ink/55 hover:border-ink hover:text-ink"
      }`}
    >
      {copied ? (
        <>
          <CheckIcon /> Copié
        </>
      ) : (
        <LinkIcon />
      )}
    </button>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
