"use client";

import Background from "./Background";
import { BACKGROUNDS } from "@/app/lib/backgrounds";

export default function BackgroundPicker({
  value,
  accent,
  onChange,
}: {
  value: string;
  accent: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {BACKGROUNDS.map((b) => {
        const selected = b.id === value;
        return (
          <button
            type="button"
            key={b.id}
            onClick={() => onChange(b.id)}
            aria-pressed={selected}
            className={`group relative aspect-[4/5] overflow-hidden rounded-sm border transition ${
              selected ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/40"
            }`}
          >
            <Background id={b.id} accent={accent} />
            <span className="absolute inset-x-0 bottom-0 z-10 bg-paper/80 px-1.5 py-1 text-center font-serif text-[0.7rem] text-ink backdrop-blur-sm">
              {b.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
