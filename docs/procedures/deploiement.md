# 🚀 Procédure — Déploiement

Hébergement : **Vercel** (déploiement auto sur push de la branche `main`).

## Avant de pousser
1. `npm run build` en local → doit passer (le build lance `prisma generate`).
2. Tester le parcours impacté en local (`npm run dev`).
3. Migrations de schéma déjà appliquées (voir ci-dessous) **avant** que le code qui en dépend n'arrive en prod.

## Variables d'environnement (Vercel → Project Settings → Environment Variables)
Mêmes clés que `.env.example`, **jamais commitées** :
`DATABASE_URL` (pooler, 6543, pgbouncer) · `DIRECT_URL` (direct, 5432) ·
`SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · clé Resend.

## Migrations de base (Supabase Postgres)
- Schéma dans `prisma/schema.prisma`.
- Appliquer via l'**URL directe** (`DIRECT_URL`, port 5432), pas le pooler :
  `prisma migrate deploy` (ou `prisma db push` pour les évolutions simples).
- Le SQL d'init de référence : `supabase_init.sql`.

## Après déploiement
- Vérifier prod : `curl -w "ttfb:%{time_starttransfer}s http:%{http_code}"` sur `/` et une page de drop.
- Tracer dans le JOURNAL si déploiement notable.
