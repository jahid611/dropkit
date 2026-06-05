"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileState } from "@/app/actions/profile";
import type { OnboardingDefaults } from "./OnboardingForm";
import AvatarUpload from "./AvatarUpload";

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

const inputCls =
  "w-full border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/50";
const labelCls = "eyebrow text-ink/45";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink px-7 py-3 eyebrow text-paper transition hover:opacity-85 disabled:opacity-50"
    >
      {pending ? "…" : "Enregistrer"}
    </button>
  );
}

export default function ProfileForm({ defaults }: { defaults: OnboardingDefaults }) {
  const [state, formAction] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {},
  );
  // Visuel unique de la maison (logo = photo de profil). Repli sur l'ancien logoUrl.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    defaults.avatarUrl ?? defaults.logoUrl ?? null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

      <div className="border-b border-line pb-8">
        <span className={`${labelCls} mb-3 block`}>Logo / photo de la maison</span>
        <AvatarUpload
          value={avatarUrl}
          onChange={setAvatarUrl}
          initial={(defaults.brandName?.[0] ?? "?").toUpperCase()}
        />
        <p className="mt-3 text-xs leading-relaxed text-ink/40">
          Un seul visuel, utilisé partout : dans votre studio et sur vos pages de drop publiques.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nom de la maison *">
          <input name="brandName" defaultValue={defaults.brandName ?? ""} className={inputCls} />
        </Field>
        <Field label="Raison sociale">
          <input name="legalName" defaultValue={defaults.legalName ?? ""} className={inputCls} />
        </Field>
        <Field label="Année de création">
          <input
            name="foundedYear"
            type="number"
            min={1900}
            max={2100}
            defaultValue={defaults.foundedYear ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Catégorie">
          <select name="category" defaultValue={defaults.category ?? ""} className={inputCls}>
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Instagram">
          <input name="instagram" defaultValue={defaults.instagram ?? ""} placeholder="@maison" className={inputCls} />
        </Field>
        <Field label="TikTok">
          <input name="tiktok" defaultValue={defaults.tiktok ?? ""} placeholder="@maison" className={inputCls} />
        </Field>
        <Field label="Taille d'audience">
          <select name="audienceSize" defaultValue={defaults.audienceSize ?? ""} className={inputCls}>
            <option value="">—</option>
            {AUDIENCE.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fréquence des drops">
          <select name="dropFrequency" defaultValue={defaults.dropFrequency ?? ""} className={inputCls}>
            <option value="">—</option>
            {FREQUENCY.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Site web">
          <input name="website" defaultValue={defaults.website ?? ""} placeholder="https://…" className={inputCls} />
        </Field>
        <Field label="Pays">
          <input name="country" defaultValue={defaults.country ?? ""} className={inputCls} />
        </Field>
      </section>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={defaults.description ?? ""}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="flex items-center gap-4">
        <SaveButton />
        {state.ok && <span className="eyebrow text-ink/55">Enregistré ✓</span>}
        {state.error && <span className="text-sm text-accent">{state.error}</span>}
      </div>
    </form>
  );
}
