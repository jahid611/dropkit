"use client";

import { useRef, useState } from "react";
import { uploadCompressed } from "@/app/lib/compress";

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File) {
    setBusy(true);
    setError("");
    try {
      const url = await uploadCompressed(file, { maxSize: 1280, quality: 0.82 });
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      {value ? (
        <div className="group relative aspect-square overflow-hidden rounded-sm border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 rounded-sm bg-paper/90 px-2 py-1 eyebrow text-ink opacity-0 transition group-hover:opacity-100"
          >
            Retirer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line text-ink/40 transition hover:border-ink/40 hover:text-ink/70 disabled:opacity-50"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="eyebrow">{busy ? "Envoi…" : "Image"}</span>
        </button>
      )}
      {error && <p className="mt-1 text-[0.65rem] text-accent">{error}</p>}
    </div>
  );
}
