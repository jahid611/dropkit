# 🏗️ Architecture DropKit

> Carte du système. Mise à jour à chaque changement structurant (nouveau modèle,
> nouvelle dépendance externe, nouveau découpage de routes).

## Stack

| Couche | Choix | Notes |
|---|---|---|
| Framework | **Next.js 16.2.7** (App Router) | ⚠️ APIs différentes des versions connues — lire `node_modules/next/dist/docs/` avant de coder (cf. AGENTS.md) |
| UI | React 19.2 + Tailwind v4 + framer-motion | Thème « maison de luxe » crème + variante landing dark/violet (voir `globals.css`) |
| Base de données | **PostgreSQL (Supabase)** via Prisma 6 | Pooler pgbouncer (port 6543) en runtime, URL directe (5432) pour les migrations |
| Stockage fichiers | **Supabase Storage** (bucket `dropkit`) | Images uploadées (avatars, articles) — voir `app/lib/supabase.ts` |
| Auth | Maison (cookies httpOnly + sessions en base) | 2 mondes séparés : **Brand** (créateur) et **Visitor** (inscrit au drop) |
| Email | Resend | Mailing de fin de drop aux inscrits |
| Hébergement | Vercel (serverless) | Cold start = enjeu de perf #1, voir PERFORMANCE.md |

## Carte des routes (`app/`)

```
/                       Landing publique (statique, rapide)
/d/[slug]               Page publique d'un drop (DB) — l'expérience visiteur
/login /signup          Auth marque                      (groupe (auth))
/onboarding             Questionnaire 1ère connexion marque
/dashboard              Espace marque (drops, inscrits, profil, réglages)
  /dashboard/drops/[id]       Éditeur de drop
  /dashboard/drops/[id]/qr    Générateur de QR
  /dashboard/(main)/inscrits  Liste des inscrits
/api/upload             Upload image -> Supabase Storage
/api/drops/[id]/export  Export CSV/XLSX des inscrits
```

Server Actions dans `app/actions/` : `auth`, `drops`, `account`, `profile`,
`onboarding`, `notify`, `visitor`.

## Modèle de données (Prisma)

Deux comptes distincts, deux systèmes de session :

- **Brand** (le client payant à terme) → `BrandProfile` (1-1), `Drop[]`, `Session[]`
- **Visitor** (le public qui s'inscrit) → `Submission[]`, `VisitorSession[]`

Un **Drop** = un événement de lancement :
- `DropItem[]`  — les articles présentés
- `FieldDef[]`  — les champs du formulaire d'inscription (max 15, type email/phone/size…)
- `Submission[]` — les inscriptions (1 par `fingerprint` = hash(ip+token navigateur))

Champs « JSON » stockés en `String` sérialisé (portabilité). Schéma complet : `prisma/schema.prisma`.

## Conventions clés

- **`server-only`** sur les modules sensibles (ex. `app/lib/guard.ts`).
- **Prisma en singleton** (`app/lib/db.ts`) pour éviter N connexions en dev.
- **Garde d'accès** : `requireBrand()` / `requireOnboardedBrand()` en tête des pages dashboard.
- **Verrouillage 1 inscription / drop** via `@@unique([dropId, fingerprint])`.
- **SEO / partage** : `generateMetadata` sur `/d/[slug]` (OpenGraph + Twitter, image =
  1er article ou logo, canonical). URL de base via `app/lib/site.ts` (`siteUrl()` →
  `metadataBase`). Lecture du drop mutualisée par `app/lib/public-drop.ts` (`cache()`).
- Commentaires et libellés produit en **français**.

## Frontières & dépendances externes

```
Navigateur ─▶ Vercel (Next SSR/Server Actions) ─▶ Supabase Postgres (Prisma)
                                              └──▶ Supabase Storage (images)
                                              └──▶ Resend (emails)
```

Secrets (jamais commités) : `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, clé Resend. Template : `.env.example`.
