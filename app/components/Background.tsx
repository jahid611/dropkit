import type { CSSProperties } from "react";

// Rend un fond de drop éditorial par id. Piloté en douceur par la couleur d'accent.
// Pas de hooks -> utilisable en Server ou Client Component.

function L({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`pointer-events-none absolute inset-0 ${className}`} style={style} />;
}

export default function Background({
  id,
  accent,
  className = "",
}: {
  id: string;
  accent: string;
  className?: string;
}) {
  return (
    <div
      style={{ ["--accent" as string]: accent }}
      className={`absolute inset-0 overflow-hidden bg-paper ${className}`}
    >
      {render(id)}
    </div>
  );
}

function render(id: string) {
  switch (id) {
    case "papier":
      return (
        <>
          <L style={{ background: "var(--paper)" }} />
          <L className="fx-paper-grain" style={{ opacity: 0.1 }} />
          <L className="fx-vignette" />
        </>
      );

    case "lin":
      return (
        <>
          <L style={{ background: "var(--paper-deep)" }} />
          <L
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(28,26,23,0.045) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(28,26,23,0.045) 0 1px, transparent 1px 3px)",
            }}
          />
          <L className="fx-vignette" />
        </>
      );

    case "aube":
      return (
        <>
          <L
            style={{
              background:
                "linear-gradient(180deg, #f6ead9 0%, #f4f0e8 45%, color-mix(in srgb, var(--accent) 16%, #f4f0e8) 100%)",
            }}
          />
          <L
            style={{
              background:
                "radial-gradient(ellipse 50% 35% at 50% 12%, #fff4e3, transparent 70%)",
            }}
          />
        </>
      );

    case "sable":
      return (
        <L
          style={{
            background:
              "linear-gradient(160deg, #efe7d6 0%, #e6dbc6 55%, #d9cab1 100%)",
          }}
        />
      );

    case "editorial-split":
      return (
        <>
          <L style={{ background: "var(--paper)" }} />
          <L
            style={{
              background:
                "linear-gradient(112deg, var(--paper) 0 54%, var(--ink) 54% 100%)",
            }}
          />
          <L
            style={{
              left: "auto",
              right: 0,
              width: "46%",
              background:
                "radial-gradient(circle at 70% 40%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%)",
            }}
          />
        </>
      );

    case "risograph":
      return (
        <>
          <L style={{ background: "var(--paper)" }} />
          <L
            style={{
              background:
                "radial-gradient(60% 60% at 35% 38%, color-mix(in srgb, var(--accent) 60%, transparent), transparent 70%)",
              mixBlendMode: "multiply",
              opacity: 0.75,
            }}
          />
          <L
            style={{
              background:
                "radial-gradient(55% 55% at 66% 64%, rgba(47,109,240,0.6), transparent 70%)",
              mixBlendMode: "multiply",
              opacity: 0.55,
            }}
          />
          <L className="fx-paper-grain" style={{ opacity: 0.14 }} />
        </>
      );

    case "aquarelle":
      return (
        <>
          <L style={{ background: "var(--paper)" }} />
          <L
            className="fx-drift"
            style={{
              background:
                "radial-gradient(40% 40% at 28% 32%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 70%)",
              filter: "blur(45px)",
            }}
          />
          <L
            className="fx-drift-slow"
            style={{
              background:
                "radial-gradient(45% 45% at 74% 68%, rgba(180,150,210,0.5), transparent 70%)",
              filter: "blur(55px)",
            }}
          />
        </>
      );

    case "marbre":
      return (
        <>
          <L style={{ background: "#efe9dd" }} />
          <L
            className="fx-turn"
            style={{
              background:
                "conic-gradient(from 0deg, #efe9dd, #e2dccd, #f3efe4, #e6dccb, #efe9dd)",
              filter: "blur(35px)",
              opacity: 0.85,
            }}
          />
          <L
            style={{
              backgroundImage:
                "repeating-linear-gradient(118deg, transparent 0 28px, rgba(28,26,23,0.05) 28px 29px)",
            }}
          />
          <L className="fx-vignette" />
        </>
      );

    case "champagne":
      return (
        <>
          <L
            style={{
              background:
                "radial-gradient(circle at 50% 38%, #f8edd7, #ecdcbd 58%, #e0caa0 100%)",
            }}
          />
          <L className="fx-soft-glow" style={{ opacity: 0.4 }} />
        </>
      );

    case "brume":
      return (
        <>
          <L
            style={{
              background:
                "linear-gradient(180deg, #eef0f1 0%, #e6e8ea 55%, #dde0e3 100%)",
            }}
          />
          <L
            className="fx-drift"
            style={{
              background:
                "radial-gradient(50% 40% at 42% 30%, rgba(255,255,255,0.7), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </>
      );

    case "terracotta":
      return (
        <L
          style={{
            background:
              "linear-gradient(158deg, color-mix(in srgb, var(--accent) 88%, #000) 0%, var(--accent) 58%, color-mix(in srgb, var(--accent) 72%, #f4f0e8) 100%)",
          }}
        />
      );

    case "encre":
      return (
        <>
          <L
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 30%, #26231f, var(--ink) 72%)",
            }}
          />
          <L
            className="fx-paper-grain"
            style={{ opacity: 0.07, mixBlendMode: "screen" }}
          />
          <L
            style={{
              background:
                "radial-gradient(ellipse 50% 35% at 50% 18%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
            }}
          />
        </>
      );

    case "argentique":
      return (
        <>
          <L style={{ background: "linear-gradient(180deg, #f1ece2, #e7dccb)" }} />
          <L className="fx-paper-grain" style={{ opacity: 0.16 }} />
          <L className="fx-vignette" />
        </>
      );

    case "ivoire":
    default:
      return (
        <>
          <L style={{ background: "var(--paper)" }} />
          <L className="fx-vignette" />
        </>
      );
  }
}
