"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Design {
  name: string;
  dots: string;
  corners: string;
  cornerDot: string;
  bg: string;
  dotType: "rounded" | "dots" | "classy-rounded" | "square" | "extra-rounded";
}

export default function QrCode({
  slug,
  accent,
  filename = "dropkit-qr",
}: {
  slug: string;
  accent: string;
  filename?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);
  const [url, setUrl] = useState("");
  const [designIdx, setDesignIdx] = useState(0);

  const designs = useMemo<Design[]>(
    () => [
      { name: "Marque", dots: accent, corners: "#1c1a17", cornerDot: accent, bg: "#f4f0e8", dotType: "rounded" },
      { name: "Encre", dots: "#1c1a17", corners: "#1c1a17", cornerDot: "#1c1a17", bg: "#f4f0e8", dotType: "rounded" },
      { name: "Nuit", dots: "#f4f0e8", corners: accent, cornerDot: "#f4f0e8", bg: "#1c1a17", dotType: "dots" },
      { name: "Sauge", dots: "#6b7256", corners: "#1c1a17", cornerDot: "#6b7256", bg: "#f4f0e8", dotType: "classy-rounded" },
      { name: "Nuit bleue", dots: "#2d3a52", corners: "#1c1a17", cornerDot: "#2d3a52", bg: "#f4f0e8", dotType: "rounded" },
      { name: "Or", dots: "#c8922b", corners: "#1c1a17", cornerDot: "#c8922b", bg: "#f4f0e8", dotType: "dots" },
    ],
    [accent],
  );

  function buildOptions(fullUrl: string, d: Design) {
    return {
      width: 300,
      height: 300,
      type: "svg" as const,
      data: fullUrl,
      margin: 10,
      qrOptions: { errorCorrectionLevel: "H" as const },
      dotsOptions: { type: d.dotType, color: d.dots },
      cornersSquareOptions: { type: "extra-rounded" as const, color: d.corners },
      cornersDotOptions: { type: "dot" as const, color: d.cornerDot },
      backgroundOptions: { color: d.bg },
    };
  }

  useEffect(() => {
    const fullUrl = `${window.location.origin}/d/${slug}`;
    setUrl(fullUrl);
    let cancelled = false;

    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !ref.current) return;
      const QRCodeStyling = mod.default;
      const options = buildOptions(fullUrl, designs[designIdx]);

      if (qrRef.current) {
        qrRef.current.update(options);
      } else {
        qrRef.current = new QRCodeStyling(options);
        ref.current.innerHTML = "";
        qrRef.current.append(ref.current);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, designIdx, designs]);

  async function print() {
    if (!qrRef.current) return;
    const blob: Blob = await qrRef.current.getRawData("png");
    const objUrl = URL.createObjectURL(blob);
    const w = window.open("", "_blank", "width=420,height=520");
    if (!w) return;
    w.document.write(
      `<!doctype html><title>QR — ${slug}</title>` +
        `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff">` +
        `<img src="${objUrl}" style="width:340px;height:340px" onload="window.focus();window.print();">` +
        `</body>`,
    );
    w.document.close();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="qr-printable rounded-sm border border-line bg-paper p-4">
        <div ref={ref} aria-label={`QR code vers ${url}`} />
      </div>

      <p className="max-w-xs break-all text-center text-xs text-ink/45">{url}</p>

      {/* Designs de couleur */}
      <div className="qr-noprint flex flex-col items-center gap-2">
        <span className="eyebrow text-ink/40">Design</span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {designs.map((d, i) => (
            <button
              key={d.name}
              onClick={() => setDesignIdx(i)}
              title={d.name}
              aria-pressed={designIdx === i}
              className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 transition ${
                designIdx === i ? "border-ink" : "border-line hover:border-ink/40"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-line"
                style={{ background: d.dots }}
              />
              <span className="eyebrow text-ink/60">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="qr-noprint flex items-center gap-2.5">
        <button
          onClick={() => qrRef.current?.download({ name: filename, extension: "png" })}
          className="rounded-sm bg-ink px-5 py-2.5 eyebrow text-paper transition hover:bg-ink/85"
        >
          Télécharger PNG
        </button>
        <button
          onClick={() => qrRef.current?.download({ name: filename, extension: "svg" })}
          className="rounded-sm border border-line px-5 py-2.5 eyebrow text-ink/60 transition hover:border-ink hover:text-ink"
        >
          SVG
        </button>
        <button
          onClick={print}
          className="rounded-sm border border-line px-5 py-2.5 eyebrow text-ink/60 transition hover:border-ink hover:text-ink"
        >
          Imprimer
        </button>
      </div>
    </div>
  );
}
