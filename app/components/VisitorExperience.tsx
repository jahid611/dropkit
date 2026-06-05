"use client";

import { useEffect, useState } from "react";
import Background from "./Background";
import Countdown from "./Countdown";
import VisitorForm, { type VisitorField } from "./VisitorForm";
import { visitorLoginAction, visitorSignupAction } from "@/app/actions/visitor";

export interface VisitorDrop {
  id: string;
  slug: string;
  brandName: string;
  logo: string | null;
  title: string;
  subtitle: string | null;
  accent: string;
  backgroundId: string;
  welcomeText: string | null;
  target: number | null;
  countdown: { show: boolean; style: string };
  items: { title: string; imageUrl: string | null }[];
  fields: VisitorField[];
  endsAt: number | null;
}

export default function VisitorExperience({
  drop,
  dark,
}: {
  drop: VisitorDrop;
  dark: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"choices" | "signup" | "login">("choices");
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  // L'état perso (inscrit ? connecté ?) arrive après coup via /me : on attend
  // de le connaître avant d'ouvrir le modal d'accueil, pour éviter tout flash.
  const [checked, setChecked] = useState(false);

  const ink = dark ? "text-paper" : "text-ink";
  const inkSoft = dark ? "text-paper/60" : "text-ink/55";
  const withImages = drop.items.filter((i) => i.imageUrl);
  const ended = drop.endsAt !== null && Date.now() >= drop.endsAt;

  // Récupère l'état personnel du visiteur (la page elle-même est cachée côté CDN).
  useEffect(() => {
    let active = true;
    fetch(`/api/drops/${drop.id}/me`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!active) return;
        if (s) {
          setSubmitted(Boolean(s.alreadySubmitted));
          setLoggedIn(Boolean(s.loggedIn));
          if (s.visitorEmail) setEmail(s.visitorEmail);
        }
        setChecked(true);
      })
      .catch(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, [drop.id]);

  // Ouvre le modal d'accueil au premier passage (une fois l'état connu, pas si déjà inscrit / déjà vu)
  useEffect(() => {
    if (!checked || submitted) return;
    const seen = localStorage.getItem(`dk_welcome_${drop.slug}`);
    if (!seen) setModalOpen(true);
  }, [checked, submitted, drop.slug]);

  function closeWelcome() {
    localStorage.setItem(`dk_welcome_${drop.slug}`, "1");
    setModalOpen(false);
  }

  return (
    <main className="relative min-h-dvh">
      <Background id={drop.backgroundId} accent={drop.accent} />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        {drop.logo && (
          <div className="mb-5 h-16 w-16 overflow-hidden rounded-full border border-line/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={drop.logo} alt={drop.brandName} className="h-full w-full object-cover" />
          </div>
        )}
        <p className={`eyebrow ${inkSoft}`}>{drop.brandName}</p>
        <h1 className={`mt-4 max-w-2xl font-serif text-[clamp(2.25rem,7vw,4.5rem)] font-light leading-[1.05] tracking-tight ${ink}`}>
          {drop.title}
        </h1>
        {drop.subtitle && (
          <p className={`mt-4 max-w-md text-base ${inkSoft}`}>{drop.subtitle}</p>
        )}

        {withImages.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {withImages.slice(0, 4).map((it, i) => (
              <div key={i} className="h-28 w-24 overflow-hidden rounded-sm border border-line/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageUrl!} alt={it.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {drop.countdown.show && drop.target && (
          <div className="mt-9">
            <Countdown
              target={drop.target}
              dark={dark}
              variant={drop.countdown.style as "boxed" | "plain" | "minimal"}
            />
          </div>
        )}

        <div className="mt-10 w-full max-w-sm">
          {submitted ? (
            <LockedCard dark={dark} />
          ) : ended ? (
            <p className={`font-serif text-xl font-light italic ${ink}`}>
              Ce drop est terminé.
            </p>
          ) : (
            <VisitorForm
              dropId={drop.id}
              fields={drop.fields}
              accent={drop.accent}
              dark={dark}
              initialEmail={email}
              onSuccess={() => setSubmitted(true)}
              onLocked={() => setSubmitted(true)}
            />
          )}
        </div>

        {!submitted && !loggedIn && (
          <p className={`mt-6 text-xs ${inkSoft}`}>
            Vous avez un compte ?{" "}
            <button
              onClick={() => {
                setView("login");
                setModalOpen(true);
              }}
              className={`underline underline-offset-4 ${ink}`}
            >
              Se connecter
            </button>
          </p>
        )}
      </div>

      {/* Modal d'accueil */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-sm border border-line bg-paper p-8">
            {view === "choices" && (
              <>
                <p className="eyebrow text-ink/45">{drop.brandName}</p>
                <h2 className="mt-3 font-serif text-2xl font-light text-ink">
                  Bienvenue sur ce drop
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">
                  {drop.welcomeText ??
                    "Inscrivez-vous pour un accès prioritaire à l'ouverture."}
                </p>

                <ul className="mt-5 flex flex-col gap-1.5 text-xs text-ink/55">
                  <li>· Retrouvez toutes vos inscriptions</li>
                  <li>· Accès prioritaire aux prochains drops</li>
                  <li>· Champs pré-remplis la prochaine fois</li>
                </ul>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={() => setView("signup")}
                    className="w-full rounded-sm bg-ink px-4 py-3 eyebrow text-paper transition hover:bg-ink/85"
                  >
                    Créer un compte
                  </button>
                  <button
                    onClick={() => setView("login")}
                    className="w-full rounded-sm border border-ink px-4 py-3 eyebrow text-ink transition hover:bg-ink hover:text-paper"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={closeWelcome}
                    className="mt-1 w-full py-2 eyebrow text-ink/45 transition hover:text-ink"
                  >
                    Continuer sans compte
                  </button>
                </div>
              </>
            )}

            {(view === "signup" || view === "login") && (
              <VisitorAuth
                mode={view}
                onBack={() => setView("choices")}
                onDone={(e) => {
                  setLoggedIn(true);
                  setEmail(e);
                  closeWelcome();
                }}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function LockedCard({ dark }: { dark: boolean }) {
  return (
    <div
      className={`rounded-sm border px-6 py-7 text-center ${
        dark ? "border-paper/25 bg-paper/10" : "border-line bg-paper/70"
      }`}
    >
      <p className={`font-serif text-xl font-light ${dark ? "text-paper" : "text-ink"}`}>
        Vous êtes sur la liste ✓
      </p>
      <p className={`mt-2 text-sm ${dark ? "text-paper/60" : "text-ink/55"}`}>
        Une seule inscription par personne. On vous prévient à l&apos;ouverture.
      </p>
    </div>
  );
}

function VisitorAuth({
  mode,
  onBack,
  onDone,
}: {
  mode: "signup" | "login";
  onBack: () => void;
  onDone: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const input =
    "w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/40";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const action = mode === "signup" ? visitorSignupAction : visitorLoginAction;
    const res = await action(email, password);
    setBusy(false);
    if (res.ok) onDone(res.email ?? email);
    else setError(res.error ?? "Erreur.");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h2 className="font-serif text-2xl font-light text-ink">
        {mode === "signup" ? "Créer un compte" : "Se connecter"}
      </h2>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={input}
      />
      <input
        type="password"
        required
        minLength={mode === "signup" ? 8 : undefined}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={input}
      />
      {error && (
        <p className="rounded-sm border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded-sm bg-ink px-4 py-3 eyebrow text-paper transition hover:bg-ink/85 disabled:opacity-50"
      >
        {busy ? "…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="py-1 eyebrow text-ink/45 transition hover:text-ink"
      >
        ← Retour
      </button>
    </form>
  );
}
