import "server-only";

import { createClient } from "@supabase/supabase-js";

// Client admin (service_role) — UNIQUEMENT côté serveur (jamais exposé au client).
// Sert à uploader dans le bucket Storage.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // Évite un crash silencieux : on saura tout de suite si l'env n'est pas configuré.
  console.warn("[DropKit] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
}

export const supabaseAdmin = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const BUCKET = "dropkit";
