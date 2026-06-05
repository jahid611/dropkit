// Seed idempotent du drop vitrine accessible sur /d/demo.
// Passe par l'API REST Supabase (HTTPS) -> fonctionne même quand les ports
// Postgres (5432/6543) sont bloqués en sortie. Rejouable sans doublon.
//   node prisma/seed-demo.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charge .env (Node ne le fait pas tout seul).
for (const line of readFileSync(join(__dirname, "..", ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const { createClient } = await import("@supabase/supabase-js");
const bcrypt = (await import("bcryptjs")).default;

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const DEMO_EMAIL = "demo@dropkit.app";
const DEMO_SLUG = "demo";

function ok(error, ctx) {
  if (error) throw new Error(`${ctx}: ${error.message ?? JSON.stringify(error)}`);
}

async function main() {
  // 1) Marque démo (mot de passe aléatoire : compte non destiné à la connexion).
  let { data: brand, error: e1 } = await sb
    .from("Brand").select("id").eq("email", DEMO_EMAIL).maybeSingle();
  ok(e1, "select Brand");

  let brandId;
  if (brand) {
    brandId = brand.id;
  } else {
    brandId = randomUUID();
    const passwordHash = await bcrypt.hash("demo-" + randomUUID(), 10);
    ok((await sb.from("Brand").insert({
      id: brandId, email: DEMO_EMAIL, passwordHash, onboardingCompleted: true,
    })).error, "insert Brand");
  }

  // 2) Profil de la maison (updatedAt obligatoire, pas de défaut SQL).
  const { data: prof, error: e2 } = await sb
    .from("BrandProfile").select("id").eq("brandId", brandId).maybeSingle();
  ok(e2, "select BrandProfile");
  const profilePayload = {
    brandId,
    brandName: "Maison Démo",
    category: "streetwear",
    country: "France",
    description: "Vitrine de démonstration DropKit.",
    updatedAt: new Date().toISOString(),
  };
  if (prof) {
    ok((await sb.from("BrandProfile").update(profilePayload).eq("id", prof.id)).error, "update BrandProfile");
  } else {
    ok((await sb.from("BrandProfile").insert({ id: randomUUID(), ...profilePayload })).error, "insert BrandProfile");
  }

  // 3) Drop vitrine : ouverture dans ~12 jours (montre le compte à rebours).
  const startsAt = new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString();
  const dropFields = {
    brandId,
    title: "Capsule 01 — Atelier",
    subtitle: "La première collection de la Maison Démo",
    status: "scheduled",
    startsAt,
    endsAt: null,
    backgroundId: "studio",
    accent: "#a6492f",
    countdownStyle: JSON.stringify({ show: true, style: "boxed" }),
    welcomeText:
      "Bienvenue dans l'atelier. Inscrivez-vous pour accéder au drop en avant-première.",
  };

  const { data: existing, error: e3 } = await sb
    .from("Drop").select("id").eq("slug", DEMO_SLUG).maybeSingle();
  ok(e3, "select Drop");

  let dropId;
  if (existing) {
    dropId = existing.id;
    ok((await sb.from("Drop").update(dropFields).eq("id", dropId)).error, "update Drop");
    ok((await sb.from("DropItem").delete().eq("dropId", dropId)).error, "clear DropItem");
    ok((await sb.from("FieldDef").delete().eq("dropId", dropId)).error, "clear FieldDef");
  } else {
    dropId = randomUUID();
    ok((await sb.from("Drop").insert({ id: dropId, slug: DEMO_SLUG, ...dropFields })).error, "insert Drop");
  }

  // Articles + champs du formulaire.
  ok((await sb.from("DropItem").insert([
    { id: randomUUID(), dropId, title: "Veste Atelier", subtitle: "Coton lourd, coupe oversize", imageUrl: "/home/IMG_1803.jpeg", position: 0 },
    { id: randomUUID(), dropId, title: "Pantalon Cargo", subtitle: "Édition limitée — 80 pièces", imageUrl: "/home/IMG_1804.jpeg", position: 1 },
    { id: randomUUID(), dropId, title: "Casquette Signature", subtitle: "Broderie maison", imageUrl: "/home/IMG_1802.jpeg", position: 2 },
  ])).error, "insert DropItem");

  ok((await sb.from("FieldDef").insert([
    { id: randomUUID(), dropId, type: "email", label: "Votre email", required: true, options: "[]", role: "email", position: 0 },
    { id: randomUUID(), dropId, type: "text", label: "Prénom", required: true, options: "[]", role: null, position: 1 },
    { id: randomUUID(), dropId, type: "size", label: "Taille souhaitée", required: false, options: JSON.stringify(["XS", "S", "M", "L", "XL"]), role: null, position: 2 },
  ])).error, "insert FieldDef");

  console.log(`✓ Drop démo prêt sur /d/${DEMO_SLUG} (${existing ? "mis à jour" : "créé"})`);
}

main().catch((e) => {
  console.error("✗ Seed démo échoué :", e.message);
  process.exitCode = 1;
});
