"use client";

import Background from "./Background";
import Countdown from "./Countdown";
import { getBackground } from "@/app/lib/backgrounds";

export interface PreviewState {
  brandName: string;
  title: string;
  subtitle: string | null;
  accent: string;
  backgroundId: string;
  startsAt: string | null;
  countdown: { show: boolean; style: string };
  items: { title: string; imageUrl: string | null }[];
  fields: { label: string; required: boolean }[];
}

export default function DropPreview({ state }: { state: PreviewState }) {
  const dark = Boolean(getBackground(state.backgroundId)?.dark);
  const target = state.startsAt ? new Date(state.startsAt).getTime() : null;
  const ink = dark ? "text-paper" : "text-ink";
  const inkSoft = dark ? "text-paper/60" : "text-ink/55";

  const withImages = state.items.filter((i) => i.imageUrl);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm">
      <Background id={state.backgroundId} accent={state.accent} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-10 text-center">
        <p className={`eyebrow ${inkSoft}`}>{state.brandName || "Votre maison"}</p>

        <h2 className={`mt-4 max-w-md font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-light leading-tight tracking-tight ${ink}`}>
          {state.title || "Titre du drop"}
        </h2>

        {state.subtitle && (
          <p className={`mt-3 max-w-sm text-sm ${inkSoft}`}>{state.subtitle}</p>
        )}

        {withImages.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {withImages.slice(0, 3).map((it, i) => (
              <div
                key={i}
                className="h-16 w-14 overflow-hidden rounded-sm border border-line/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageUrl!} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {state.countdown.show && target && (
          <div className="mt-7">
            <Countdown
              target={target}
              dark={dark}
              variant={(state.countdown.style as "boxed" | "plain" | "minimal") ?? "boxed"}
            />
          </div>
        )}

        <div className="mt-8 w-full max-w-xs">
          <div
            className={`rounded-sm border px-4 py-3 text-left text-xs ${
              dark ? "border-paper/20 text-paper/55" : "border-line text-ink/45"
            }`}
          >
            {state.fields.length > 0
              ? `${state.fields.length} champ${state.fields.length > 1 ? "s" : ""} à remplir`
              : "Aucun champ — ajoutez-en à droite"}
          </div>
          <button
            type="button"
            className="mt-2.5 w-full rounded-sm px-4 py-3 eyebrow"
            style={{ background: state.accent, color: dark ? "#fff" : "#1c1a17" }}
          >
            Rejoindre la liste
          </button>
        </div>
      </div>
    </div>
  );
}
