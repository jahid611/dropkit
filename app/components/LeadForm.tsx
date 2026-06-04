"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LeadFormProps {
  slug: string;
  ctaLabel: string;
  shopUrl: string;
}

const COUNTRIES = [
  { code: "+33", flag: "🇫🇷" },
  { code: "+32", flag: "🇧🇪" },
  { code: "+41", flag: "🇨🇭" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+44", flag: "🇬🇧" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function LeadForm({ slug, ctaLabel, shopUrl }: LeadFormProps) {
  const [dial, setDial] = useState("+33");
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = number.replace(/[^\d]/g, "");
    if (cleaned.length < 6) {
      setStatus("error");
      setError("Numéro trop court.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, phone: `${dial}${cleaned}` }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Oups, réessaie dans un instant.");
    }
  }

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-accent/40 bg-accent/5 p-6 text-center"
          >
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
              ✓ Tu es sur la liste
            </p>
            <p className="mt-2 text-sm text-white/60">
              On t&apos;envoie le lien par SMS dès l&apos;ouverture. Reste prêt.
            </p>
            <a
              href={shopUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              Voir la boutique →
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-stretch gap-2 rounded-full border border-white/15 bg-black/40 p-1.5 backdrop-blur focus-within:border-accent/60 transition">
              <select
                value={dial}
                onChange={(e) => setDial(e.target.value)}
                aria-label="Indicatif pays"
                className="rounded-full bg-transparent px-3 font-mono text-sm text-white/80 outline-none [&>option]:bg-black"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="6 12 34 56 78"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="min-w-0 flex-1 bg-transparent px-2 font-mono text-sm text-white placeholder:text-white/30 outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {status === "loading" ? "..." : ctaLabel}
              </button>
            </div>
            <p className="px-2 font-mono text-[0.65rem] leading-relaxed text-white/35">
              {status === "error" ? (
                <span className="text-red-400">{error}</span>
              ) : (
                "Accès prioritaire par SMS. Zéro spam, désinscription à tout moment."
              )}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
