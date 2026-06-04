import "server-only";

import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "DropKit <onboarding@resend.dev>";

export interface NotifyResult {
  sent: number;
  simulated: boolean;
  error?: string;
}

function template(opts: {
  brandName: string;
  dropTitle: string;
  dropUrl: string;
  message?: string;
}) {
  const { brandName, dropTitle, dropUrl, message } = opts;
  return `
  <div style="background:#f4f0e8;padding:40px 0;font-family:Georgia,serif;color:#1c1a17">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid rgba(28,26,23,.12);padding:40px">
      <p style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#1c1a17aa;margin:0 0 20px">${brandName}</p>
      <h1 style="font-weight:300;font-size:30px;line-height:1.15;margin:0 0 16px">${dropTitle}</h1>
      <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1a17cc;margin:0 0 28px">
        ${message ?? "C'est le moment. Le drop pour lequel vous vous êtes inscrit·e est désormais disponible. Vous étiez sur la liste — voici votre accès."}
      </p>
      <a href="${dropUrl}" style="display:inline-block;background:#1c1a17;color:#f4f0e8;text-decoration:none;padding:14px 28px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase">
        Accéder au drop
      </a>
      <p style="font-family:Arial,sans-serif;font-size:11px;color:#1c1a1766;margin:32px 0 0">
        Vous recevez cet email car vous vous êtes inscrit·e à ce drop via DropKit.
      </p>
    </div>
  </div>`;
}

/** Envoie (ou simule) le mail de fin de drop aux inscrits. */
export async function sendDropNotification(opts: {
  to: string[];
  brandName: string;
  dropTitle: string;
  dropUrl: string;
  subject?: string;
  message?: string;
}): Promise<NotifyResult> {
  const recipients = [...new Set(opts.to.filter(Boolean))];
  if (recipients.length === 0) return { sent: 0, simulated: true };

  const subject = opts.subject ?? `${opts.dropTitle} — c'est le moment`;
  const html = template(opts);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Mode simulation : aucun envoi réel (pas de clé configurée).
    console.log(
      `[DropKit · email simulé] ${recipients.length} destinataire(s) pour « ${opts.dropTitle} »`,
    );
    return { sent: recipients.length, simulated: true };
  }

  try {
    const resend = new Resend(key);
    // Envoi unique en BCC pour protéger la confidentialité des inscrits.
    const { error } = await resend.emails.send({
      from: FROM,
      to: FROM,
      bcc: recipients,
      subject,
      html,
    });
    if (error) return { sent: 0, simulated: false, error: error.message };
    return { sent: recipients.length, simulated: false };
  } catch (e) {
    return {
      sent: 0,
      simulated: false,
      error: e instanceof Error ? e.message : "Échec de l'envoi",
    };
  }
}
