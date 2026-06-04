"use client";

import { useState } from "react";
import { submitDropAction } from "@/app/actions/visitor";

export interface VisitorField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
  role: string | null;
}

export default function VisitorForm({
  dropId,
  fields,
  accent,
  dark,
  initialEmail,
  onSuccess,
  onLocked,
}: {
  dropId: string;
  fields: VisitorField[];
  accent: string;
  dark: boolean;
  initialEmail: string | null;
  onSuccess: () => void;
  onLocked: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) {
      v[f.id] = f.role === "email" && initialEmail ? initialEmail : "";
    }
    return v;
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const inputCls = dark
    ? "w-full rounded-sm border border-paper/25 bg-paper/10 px-4 py-3 text-sm text-paper placeholder:text-paper/35 outline-none transition focus:border-paper/60"
    : "w-full rounded-sm border border-line bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/40";
  const labelCls = dark ? "text-paper/55" : "text-ink/45";

  function set(id: string, val: string) {
    setValues((v) => ({ ...v, [id]: val }));
    if (status === "error") setStatus("idle");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await submitDropAction(dropId, values);
    if (res.ok) return onSuccess();
    if (res.locked) return onLocked();
    setStatus("error");
    setError(res.error ?? "Une erreur est survenue.");
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-3">
      {fields.map((f) => (
        <label key={f.id} className="flex flex-col gap-1.5 text-left">
          <span className={`eyebrow ${labelCls}`}>
            {f.label}
            {f.required && " *"}
          </span>
          {f.type === "select" || f.type === "size" ? (
            <select
              required={f.required}
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
              className={`${inputCls} [&>option]:text-ink`}
            >
              <option value="">Choisir…</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              required={f.required}
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
              type={
                f.type === "email"
                  ? "email"
                  : f.type === "phone"
                    ? "tel"
                    : f.type === "number"
                      ? "number"
                      : f.type === "date"
                        ? "date"
                        : "text"
              }
              inputMode={f.type === "phone" ? "tel" : undefined}
              className={inputCls}
            />
          )}
        </label>
      ))}

      {fields.length === 0 && (
        <p className={`text-sm ${labelCls}`}>
          Aucun champ requis — un clic suffit pour rejoindre la liste.
        </p>
      )}

      {status === "error" && (
        <p className="rounded-sm border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 w-full rounded-sm px-4 py-3.5 eyebrow transition hover:brightness-110 disabled:opacity-50"
        style={{ background: accent, color: dark ? "#fff" : "#1c1a17" }}
      >
        {status === "loading" ? "…" : "Rejoindre la liste"}
      </button>
    </form>
  );
}
