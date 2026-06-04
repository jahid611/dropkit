import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Capture d'un numéro de téléphone avant le drop.
// Démo : on stocke en JSONL dans /data/leads.jsonl pour pouvoir l'inspecter.
// v2 : insertion en base (Supabase) + déclenchement WhatsApp/SMS via Twilio.

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.jsonl");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { slug, phone } = (body ?? {}) as { slug?: string; phone?: string };

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug manquant" }, { status: 400 });
  }

  // Normalisation : on garde le + initial et les chiffres uniquement.
  const normalized =
    typeof phone === "string" ? phone.replace(/(?!^\+)\D/g, "") : "";
  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "numéro invalide" }, { status: 422 });
  }

  const lead = {
    slug,
    phone: normalized,
    ts: new Date().toISOString(),
    ua: request.headers.get("user-agent") ?? "",
  };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LEADS_FILE, JSON.stringify(lead) + "\n", "utf8");
  } catch (err) {
    console.error("Échec d'écriture du lead:", err);
    return NextResponse.json({ error: "stockage indisponible" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
