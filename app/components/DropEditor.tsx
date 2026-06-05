"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveDropAction, type DropInput } from "@/app/actions/drops";
import { FIELD_TYPES, MAX_FIELDS, ROLE_OPTIONS } from "@/app/lib/fields";
import { dropPath } from "@/app/lib/drop-url";
import BackgroundPicker from "./BackgroundPicker";
import ImageUpload from "./ImageUpload";
import DropPreview from "./DropPreview";

interface ItemState {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
}
interface FieldState {
  type: string;
  label: string;
  required: boolean;
  options: string[];
  role: string | null;
}

export interface EditorDrop {
  id: string;
  slug: string;
  brandName: string;
  title: string;
  subtitle: string | null;
  accent: string;
  backgroundId: string;
  welcomeText: string | null;
  startsAt: string | null;
  endsAt: string | null;
  countdown: { show: boolean; style: string };
  items: ItemState[];
  fields: FieldState[];
}

const ACCENTS = ["#a6492f", "#1c1a17", "#6b7256", "#2d3a52", "#c98a86", "#c8922b"];

const input =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/40";
const labelCls = "eyebrow text-ink/45";

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="border-t border-line pt-6">
      <h3 className="luxe text-lg font-medium text-ink">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-ink/45">{hint}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function DropEditor({ drop }: { drop: EditorDrop }) {
  const [title, setTitle] = useState(drop.title);
  const [subtitle, setSubtitle] = useState(drop.subtitle ?? "");
  const [accent, setAccent] = useState(drop.accent);
  const [backgroundId, setBackgroundId] = useState(drop.backgroundId);
  const [welcomeText, setWelcomeText] = useState(drop.welcomeText ?? "");
  const [startsAt, setStartsAt] = useState(drop.startsAt ?? "");
  const [endsAt, setEndsAt] = useState(drop.endsAt ?? "");
  const [cdShow, setCdShow] = useState(drop.countdown.show);
  const [cdStyle, setCdStyle] = useState(drop.countdown.style || "boxed");
  const [items, setItems] = useState<ItemState[]>(drop.items);
  const [fields, setFields] = useState<FieldState[]>(drop.fields);

  const [slug, setSlug] = useState(drop.slug);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function save() {
    setMsg(null);
    const payload: DropInput = {
      title,
      subtitle,
      accent,
      backgroundId,
      welcomeText,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      countdown: { show: cdShow, style: cdStyle },
      items,
      fields,
    };
    startTransition(async () => {
      const res = await saveDropAction(drop.id, payload);
      if (res.ok) {
        // Le slug peut avoir été dérivé du titre (brouillon) → URL mise à jour.
        const changed = Boolean(res.slug && res.slug !== slug);
        if (res.slug) setSlug(res.slug);
        setMsg({
          ok: true,
          text: changed
            ? `Enregistré ✓ — ${dropPath(drop.brandName, res.slug!)}`
            : "Enregistré ✓",
        });
      } else {
        setMsg({ ok: false, text: res.error ?? "Erreur" });
      }
    });
  }

  // Articles
  const addItem = () =>
    setItems((x) => [...x, { title: "", subtitle: null, imageUrl: null }]);
  const updItem = (i: number, patch: Partial<ItemState>) =>
    setItems((x) => x.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const delItem = (i: number) => setItems((x) => x.filter((_, j) => j !== i));

  // Champs
  const addField = () =>
    setFields((x) =>
      x.length >= MAX_FIELDS
        ? x
        : [...x, { type: "text", label: "", required: false, options: [], role: null }],
    );
  const updField = (i: number, patch: Partial<FieldState>) =>
    setFields((x) => x.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const delField = (i: number) => setFields((x) => x.filter((_, j) => j !== i));

  const preview = {
    brandName: drop.brandName,
    title,
    subtitle: subtitle || null,
    accent,
    backgroundId,
    startsAt: startsAt || null,
    countdown: { show: cdShow, style: cdStyle },
    items,
    fields,
  };

  return (
    <div className="min-h-dvh">
      {/* Barre du haut */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-6 py-3.5 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="eyebrow text-ink/45 transition hover:text-ink">
            ← Studio
          </Link>
          <span className="text-sm text-ink/30">/</span>
          <span className="luxe text-base text-ink">{title || "Sans titre"}</span>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`eyebrow ${msg.ok ? "text-ink/55" : "text-accent"}`}>
              {msg.text}
            </span>
          )}
          <Link
            href={dropPath(drop.brandName, slug)}
            target="_blank"
            className="rounded-sm border border-line px-4 py-2 eyebrow text-ink/55 transition hover:border-ink hover:text-ink"
          >
            Voir la page ↗
          </Link>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-sm bg-ink px-5 py-2 eyebrow text-paper transition hover:bg-ink/85 disabled:opacity-50"
          >
            {pending ? "…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,42%)]">
        {/* Contrôles */}
        <div className="max-h-[calc(100dvh-57px)] overflow-y-auto px-6 py-8">
          <div className="mx-auto flex max-w-xl flex-col gap-7">
            {/* Le drop */}
            <section>
              <h3 className="luxe text-lg font-medium text-ink">Le drop</h3>
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Titre</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Collection 03"
                    className={input}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Sous-titre</span>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="48 pièces numérotées"
                    className={input}
                  />
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className={labelCls}>Couleur d&apos;accent</span>
                  <div className="flex items-center gap-2">
                    {ACCENTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAccent(a)}
                        aria-label={a}
                        className={`h-7 w-7 rounded-full border transition ${
                          accent === a ? "border-ink scale-110" : "border-line"
                        }`}
                        style={{ background: a }}
                      />
                    ))}
                    <input
                      type="color"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="h-7 w-9 cursor-pointer rounded-sm border border-line bg-paper"
                      aria-label="Couleur personnalisée"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Fond */}
            <Section title="Le fond" hint="Choisi pendant la création — 15 styles éditoriaux.">
              <BackgroundPicker value={backgroundId} accent={accent} onChange={setBackgroundId} />
            </Section>

            {/* Calendrier */}
            <Section title="Calendrier" hint="L'ouverture pilote le compte à rebours.">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Ouverture</span>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Fermeture</span>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className={input}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={cdShow}
                    onChange={(e) => setCdShow(e.target.checked)}
                    className="accent-ink"
                  />
                  Afficher le compte à rebours
                </label>
                <select
                  value={cdStyle}
                  onChange={(e) => setCdStyle(e.target.value)}
                  className={`${input} w-auto [&>option]:bg-paper`}
                >
                  <option value="boxed">Style — Souligné</option>
                  <option value="plain">Style — Épuré</option>
                  <option value="minimal">Style — Minimal</option>
                </select>
              </div>
            </Section>

            {/* Articles */}
            <Section title="Articles" hint="Une ou plusieurs pièces : image, titre, sous-titre.">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3 rounded-sm border border-line p-3">
                  <div className="w-20 shrink-0">
                    <ImageUpload
                      value={it.imageUrl}
                      onChange={(url) => updItem(i, { imageUrl: url })}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      value={it.title}
                      onChange={(e) => updItem(i, { title: e.target.value })}
                      placeholder="Nom de la pièce"
                      className={input}
                    />
                    <input
                      value={it.subtitle ?? ""}
                      onChange={(e) => updItem(i, { subtitle: e.target.value || null })}
                      placeholder="Matière, coloris…"
                      className={input}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => delItem(i)}
                    className="self-start text-ink/30 transition hover:text-accent"
                    aria-label="Retirer l'article"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="rounded-sm border border-dashed border-line py-2.5 eyebrow text-ink/50 transition hover:border-ink/40 hover:text-ink"
              >
                ＋ Ajouter un article
              </button>
            </Section>

            {/* Champs visiteurs */}
            <Section
              title={`Champs visiteurs · ${fields.length}/${MAX_FIELDS}`}
              hint="Ce que le visiteur doit remplir. Marquez un email/téléphone pour le mail de fin de drop."
            >
              {fields.map((f, i) => {
                const needsOptions = f.type === "select" || f.type === "size";
                return (
                  <div key={i} className="flex flex-col gap-2 rounded-sm border border-line p-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={f.label}
                        onChange={(e) => updField(i, { label: e.target.value })}
                        placeholder="Libellé (ex : Prénom)"
                        className={input}
                      />
                      <button
                        type="button"
                        onClick={() => delField(i)}
                        className="shrink-0 text-ink/30 transition hover:text-accent"
                        aria-label="Retirer le champ"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={f.type}
                        onChange={(e) => updField(i, { type: e.target.value })}
                        className={`${input} w-auto [&>option]:bg-paper`}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={f.role ?? ""}
                        onChange={(e) => updField(i, { role: e.target.value || null })}
                        className={`${input} w-auto [&>option]:bg-paper`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-ink/60">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => updField(i, { required: e.target.checked })}
                          className="accent-ink"
                        />
                        Obligatoire
                      </label>
                    </div>
                    {needsOptions && (
                      <input
                        value={f.options.join(", ")}
                        onChange={(e) =>
                          updField(i, {
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Options séparées par des virgules (XS, S, M, L)"
                        className={input}
                      />
                    )}
                  </div>
                );
              })}
              {fields.length < MAX_FIELDS && (
                <button
                  type="button"
                  onClick={addField}
                  className="rounded-sm border border-dashed border-line py-2.5 eyebrow text-ink/50 transition hover:border-ink/40 hover:text-ink"
                >
                  ＋ Ajouter un champ
                </button>
              )}
            </Section>

            {/* Accueil */}
            <Section title="Modal d'accueil" hint="Le message d'accueil du visiteur à l'arrivée.">
              <textarea
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                rows={3}
                placeholder="Bienvenue sur le drop de la maison. Inscrivez-vous pour un accès prioritaire."
                className={`${input} resize-none`}
              />
            </Section>
          </div>
        </div>

        {/* Aperçu en direct */}
        <div className="sticky top-[57px] hidden h-[calc(100dvh-57px)] border-l border-line bg-paper-deep p-5 lg:block">
          <p className="mb-3 eyebrow text-ink/40">Aperçu en direct</p>
          <div className="h-[calc(100%-2rem)]">
            <DropPreview state={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
