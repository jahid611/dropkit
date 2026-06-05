# ADR-0001 — Stack technique

- **Statut** : Accepté (constaté — décision antérieure au journal)
- **Date** : 2026-06-05 (formalisation)

## Contexte
DropKit doit servir des pages de drop publiques rapides, un back-office marque, de
l'auth, de l'upload d'images et de l'email, en visant un déploiement simple et un futur
modèle SaaS payant.

## Décision
- **Next.js 16 (App Router)** sur **Vercel** — SSR + Server Actions, déploiement zéro-config.
- **PostgreSQL via Supabase** + **Prisma 6** — base managée, pooler pgbouncer en runtime.
- **Supabase Storage** (bucket `dropkit`) pour les images, au lieu du FS local (incompatible serverless).
- **Auth maison** (cookies httpOnly + sessions en base), deux mondes : Brand et Visitor.
- **Resend** pour l'email transactionnel.

## Alternatives écartées
- *Stockage fichiers sur le FS local* — écarté : éphémère en serverless Vercel (migré vers Supabase Storage, commit `1c8ed3a`).
- *SQLite en prod* — gardé seulement en dev historique ; prod = Postgres pour la concurrence et le scaling.

## Conséquences
- ➕ Déploiement simple, stack cohérente Supabase (DB + Storage).
- ➖ **Cold start serverless + Prisma** = principal enjeu de perf (voir PERFORMANCE.md).
- ➖ Auth maison = à maintenir et sécuriser nous-mêmes (sessions, RGPD).
