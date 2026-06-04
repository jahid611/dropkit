"use client";

import { useRef, useState } from "react";
import { uploadCompressed } from "@/app/lib/compress";

export default function AvatarUpload({
  value,
  onChange,
  initial,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  initial: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File) {
    setBusy(true);
    setError("");
    try {
      // Avatar : compressé en 512px max
      const url = await uploadCompressed(file, { maxSize: 512, quality: 0.85 });
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-paper-deep">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center luxe text-2xl text-ink/60">
            {initial}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="border border-ink px-4 py-2 eyebrow text-ink transition hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {busy ? "…" : value ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-2 py-2 eyebrow text-ink/45 transition hover:text-ink"
            >
              Retirer
            </button>
          )}
        </div>
        <p className="text-xs text-ink/40">JPG, PNG ou WebP — compressé automatiquement.</p>
        {error && <p className="text-xs text-[#9a3b2c]">{error}</p>}
      </div>
    </div>
  );
}
