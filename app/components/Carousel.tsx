"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface Slide {
  img: string;
  title: string;
  text: string;
}

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const go = (d: number) => setI((p) => (p + d + n) % n);

  useEffect(() => {
    if (paused || n <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="group relative aspect-[16/10] overflow-hidden bg-[#ece6da]">
        {slides.map((s, idx) => (
          <Image
            key={idx}
            src={s.img}
            alt={s.title}
            fill
            priority={idx === 0}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className={`object-cover transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Flèches */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Précédent"
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5f1ea]/85 text-[#1a1611] opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-[#f5f1ea]"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Suivant"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5f1ea]/85 text-[#1a1611] opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-[#f5f1ea]"
        >
          →
        </button>

        {/* Numéro */}
        <span className="absolute left-4 top-4 bg-[#f5f1ea]/85 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.25em] text-[#1a1611]/70 backdrop-blur-sm">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
      </div>

      {/* Légende + pagination */}
      <div className="mt-6 flex items-end justify-between gap-6">
        <div>
          <h3 className="luxe text-2xl text-[#1a1611]">{slides[i].title}</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#1a1611]/60">
            {slides[i].text}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Aller à l'image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-7 bg-[#1a1611]" : "w-1.5 bg-[#1a1611]/25 hover:bg-[#1a1611]/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
