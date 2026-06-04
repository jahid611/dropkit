"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bouton son. Pour la démo, on synthétise un pad ambient sombre via la
 * Web Audio API (aucun asset requis). En v2 : remplacer par la vraie piste
 * de la marque (drop.audioUrl) jouée avec Howler.js.
 *
 * L'AudioContext est créé au clic (politique d'autoplay des navigateurs).
 */
export default function MusicToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ master: GainNode; stop: () => void } | null>(null);

  function buildPad(ctx: AudioContext) {
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Filtre passe-bas pour un son feutré / sombre
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 6;
    filter.connect(master);

    // Accord mineur sombre (A2, C3, E3, A3) légèrement désaccordé
    const freqs = [110, 130.81, 164.81, 220];
    const detunes = [-6, 4, -3, 7];
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sawtooth" : "triangle";
      o.frequency.value = f;
      o.detune.value = detunes[i];
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.18 : 0.1;
      o.connect(g).connect(filter);
      o.start();
      return o;
    });

    // LFO lent qui ouvre/ferme le filtre → mouvement "vivant"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    // Fade-in doux
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);

    return {
      master,
      stop: () => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      },
    };
  }

  async function toggle() {
    if (!on) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = ctxRef.current ?? new Ctx();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      nodesRef.current = buildPad(ctx);
      setOn(true);
    } else {
      const ctx = ctxRef.current;
      const nodes = nodesRef.current;
      if (ctx && nodes) {
        // Fade-out puis stop
        nodes.master.gain.cancelScheduledValues(ctx.currentTime);
        nodes.master.gain.setValueAtTime(nodes.master.gain.value, ctx.currentTime);
        nodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        const toStop = nodes.stop;
        setTimeout(toStop, 700);
        nodesRef.current = null;
      }
      setOn(false);
    }
  }

  // Nettoyage si le composant est démonté pendant la lecture
  useEffect(() => {
    return () => {
      nodesRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Couper le son" : "Activer le son"}
      className="group flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/70 backdrop-blur transition hover:border-accent/60 hover:text-white"
    >
      <span className="flex h-4 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-accent transition-all duration-300"
            style={{
              height: on ? `${[40, 100, 65, 85][i]}%` : "20%",
              animation: on ? `eq 0.9s ${i * 0.12}s ease-in-out infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      {on ? "Son activé" : "Activer le son"}
      <style>{`@keyframes eq { from { transform: scaleY(0.4) } to { transform: scaleY(1) } }`}</style>
    </button>
  );
}
