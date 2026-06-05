"use client";

import { useState, useTransition } from "react";
import { notifyRegistrantsAction } from "@/app/actions/notify";

export interface DropStats {
  id: string;
  slug: string;
  path: string;
  title: string;
  count: number;
  emailable: number;
  notifiedAt: string | null;
  columns: string[];
  rows: string[][];
}

function NotifyButton({
  dropId,
  emailable,
  notifiedAt,
}: {
  dropId: string;
  emailable: number;
  notifiedAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function send() {
    if (
      !confirm(
        `Envoyer le mail de fin de drop à ${emailable} inscrit(s) ayant renseigné un email ?`,
      )
    )
      return;
    setResult(null);
    startTransition(async () => {
      const res = await notifyRegistrantsAction(dropId);
      if (res.ok)
        setResult(
          res.simulated
            ? `✓ ${res.sent} email(s) — mode simulation (ajoutez une clé Resend pour l'envoi réel)`
            : `✓ ${res.sent} email(s) envoyé(s)`,
        );
      else setResult(res.error ?? "Erreur");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={send}
        disabled={pending || emailable === 0}
        className="rounded-sm border border-line px-4 py-2 eyebrow text-ink/60 transition hover:border-ink hover:text-ink disabled:opacity-40"
      >
        {pending ? "Envoi…" : `Notifier les inscrits (${emailable})`}
      </button>
      {notifiedAt && !result && (
        <span className="eyebrow text-ink/40">Notifié le {notifiedAt}</span>
      )}
      {result && <span className="text-xs text-ink/60">{result}</span>}
    </div>
  );
}

export default function InscritsAccordion({ drops }: { drops: DropStats[] }) {
  const [openId, setOpenId] = useState<string | null>(drops[0]?.id ?? null);

  return (
    <ul className="flex flex-col divide-y divide-line border-y border-line">
      {drops.map((d) => {
        const open = openId === d.id;
        return (
          <li key={d.id}>
            <button
              onClick={() => setOpenId(open ? null : d.id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className={`text-ink/40 transition ${open ? "rotate-90" : ""}`}>
                  ›
                </span>
                <span className="luxe text-lg text-ink">{d.title}</span>
                <span className="eyebrow text-ink/40">
                  {d.count} inscrit{d.count > 1 ? "s" : ""}
                </span>
              </div>
              <span className="eyebrow text-ink/35">{d.path}</span>
            </button>

            {open && (
              <div className="pb-6">
                <div className="qr-noprint mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/drops/${d.id}/export?format=csv`}
                      className="rounded-sm border border-line px-4 py-2 eyebrow text-ink/60 transition hover:border-ink hover:text-ink"
                    >
                      Export CSV
                    </a>
                    <a
                      href={`/api/drops/${d.id}/export?format=xlsx`}
                      className="rounded-sm bg-ink px-4 py-2 eyebrow text-paper transition hover:bg-ink/85"
                    >
                      Export Excel
                    </a>
                  </div>
                  <NotifyButton
                    dropId={d.id}
                    emailable={d.emailable}
                    notifiedAt={d.notifiedAt}
                  />
                </div>

                {d.count === 0 ? (
                  <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink/45">
                    Aucun inscrit pour ce drop pour l&apos;instant.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-sm border border-line">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-line bg-paper-deep/50">
                          {d.columns.map((c, i) => (
                            <th
                              key={i}
                              className="whitespace-nowrap px-4 py-2.5 text-left eyebrow text-ink/50"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {d.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-line/60 last:border-0">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="whitespace-nowrap px-4 py-2.5 text-ink/75"
                              >
                                {cell || <span className="text-ink/25">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
