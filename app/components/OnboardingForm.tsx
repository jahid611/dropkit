"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  completeOnboardingAction,
  type OnboardingState,
} from "@/app/actions/onboarding";

export interface OnboardingDefaults {
  brandName?: string | null;
  legalName?: string | null;
  foundedYear?: number | null;
  category?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  audienceSize?: string | null;
  dropFrequency?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  country?: string | null;
}

const CATEGORIES = [
  "Prêt-à-porter",
  "Streetwear",
  "Sneakers",
  "Accessoires",
  "Maroquinerie",
  "Bijoux",
  "Vintage / Friperie",
  "Autre",
];
const AUDIENCE = ["< 5k", "5k – 10k", "10k – 50k", "50k – 100k", "> 100k"];
const FREQUENCY = ["Hebdomadaire", "Mensuel", "Trimestriel", "Ponctuel / Saisonnier"];

const STEPS = ["La maison", "Audience & canaux", "Identité"];

const inputCls =
  "w-full rounded-sm border border-line bg-paper/60 px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/40 focus:bg-paper";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-ink/45">{label}</span>
      {children}
    </label>
  );
}

function FinishButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-ink px-6 py-3 eyebrow text-paper transition hover:bg-ink/85 disabled:opacity-50"
    >
      {pending ? "…" : "Terminer →"}
    </button>
  );
}

export default function OnboardingForm({
  defaults,
}: {
  defaults: OnboardingDefaults;
}) {
  const [state, formAction] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    {},
  );
  const [step, setStep] = useState(0);
  const [brandName, setBrandName] = useState(defaults.brandName ?? "");

  const canNext = step !== 0 || brandName.trim().length > 0;

  return (
    <form action={formAction} className="flex flex-col">
      {/* Barre de progression */}
      <div className="mb-8 flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-px transition-colors ${
                i <= step ? "bg-ink" : "bg-line"
              }`}
            />
            <span
              className={`eyebrow transition-colors ${
                i === step ? "text-ink" : "text-ink/30"
              }`}
            >
              {i + 1} · {s}
            </span>
          </div>
        ))}
      </div>

      {/* Étape 1 — La maison */}
      <div className={step === 0 ? "flex flex-col gap-4" : "hidden"}>
        <Field label="Nom de la marque *">
          <input
            name="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Maison Atelier"
            className={inputCls}
          />
        </Field>
        <Field label="Raison sociale (optionnel)">
          <input
            name="legalName"
            defaultValue={defaults.legalName ?? ""}
            placeholder="Atelier SAS"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Année de création">
            <input
              name="foundedYear"
              type="number"
              min={1900}
              max={2100}
              defaultValue={defaults.foundedYear ?? ""}
              placeholder="2023"
              className={inputCls}
            />
          </Field>
          <Field label="Catégorie">
            <select
              name="category"
              defaultValue={defaults.category ?? ""}
              className={`${inputCls} [&>option]:bg-paper`}
            >
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Étape 2 — Audience & canaux */}
      <div className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Instagram">
            <input
              name="instagram"
              defaultValue={defaults.instagram ?? ""}
              placeholder="@maison"
              className={inputCls}
            />
          </Field>
          <Field label="TikTok">
            <input
              name="tiktok"
              defaultValue={defaults.tiktok ?? ""}
              placeholder="@maison"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Taille d'audience">
            <select
              name="audienceSize"
              defaultValue={defaults.audienceSize ?? ""}
              className={`${inputCls} [&>option]:bg-paper`}
            >
              <option value="">—</option>
              {AUDIENCE.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fréquence des drops">
            <select
              name="dropFrequency"
              defaultValue={defaults.dropFrequency ?? ""}
              className={`${inputCls} [&>option]:bg-paper`}
            >
              <option value="">—</option>
              {FREQUENCY.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Site web">
          <input
            name="website"
            defaultValue={defaults.website ?? ""}
            placeholder="https://maison.com"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Étape 3 — Identité */}
      <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <Field label="Logo — URL (l'upload arrive avec l'éditeur de drop)">
          <input
            name="logoUrl"
            defaultValue={defaults.logoUrl ?? ""}
            placeholder="https://…/logo.png"
            className={inputCls}
          />
        </Field>
        <Field label="Pays">
          <input
            name="country"
            defaultValue={defaults.country ?? ""}
            placeholder="France"
            className={inputCls}
          />
        </Field>
        <Field label="Décrivez votre maison en une phrase">
          <textarea
            name="description"
            defaultValue={defaults.description ?? ""}
            rows={3}
            placeholder="Pièces couture en séries confidentielles, façonnées à la main."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      {state.error && (
        <p className="mt-5 rounded-sm border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-accent">
          {state.error}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`eyebrow text-ink/45 transition hover:text-ink ${
            step === 0 ? "invisible" : ""
          }`}
        >
          ← Retour
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="rounded-sm border border-ink bg-transparent px-6 py-3 eyebrow text-ink transition hover:bg-ink hover:text-paper disabled:opacity-30"
          >
            Suivant →
          </button>
        ) : (
          <FinishButton />
        )}
      </div>
    </form>
  );
}
