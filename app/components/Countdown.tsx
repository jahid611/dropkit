"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** Timestamp cible (ms epoch). null tant que non monté côté client. */
  target: number | null;
  /** Texte clair (sur fond sombre) ou encre (sur fond clair). */
  dark?: boolean;
  variant?: "boxed" | "plain" | "minimal";
}

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export default function Countdown({ target, dark = false, variant = "boxed" }: CountdownProps) {
  const [parts, setParts] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    if (target == null) return;
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const p = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
  const textCls = dark ? "text-paper" : "text-ink";
  const subCls = dark ? "text-paper/50" : "text-ink/45";

  if (p.done) {
    return (
      <p className={`font-serif text-2xl font-light italic ${textCls}`}>
        Le drop est ouvert
      </p>
    );
  }

  const units = [
    { v: p.days, l: "Jours" },
    { v: p.hours, l: "Heures" },
    { v: p.minutes, l: "Min" },
    { v: p.seconds, l: "Sec" },
  ];

  if (variant === "minimal") {
    return (
      <p className={`font-serif text-3xl font-light tabular-nums ${textCls}`}>
        {pad(p.days)}:{pad(p.hours)}:{pad(p.minutes)}:{pad(p.seconds)}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-5 sm:gap-8">
      {units.map((u, i) => (
        <div key={u.l} className="flex flex-col items-center">
          <span
            className={`font-serif font-light tabular-nums leading-none text-[clamp(2rem,7vw,4rem)] ${textCls} ${
              variant === "boxed"
                ? `border-b ${dark ? "border-paper/20" : "border-line"} pb-2`
                : ""
            }`}
          >
            {pad(u.v)}
          </span>
          <span className={`eyebrow mt-2.5 ${subCls}`}>{u.l}</span>
          {variant === "plain" && i < units.length - 1 && null}
        </div>
      ))}
    </div>
  );
}
