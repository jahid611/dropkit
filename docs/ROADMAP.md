# 🗺️ Roadmap DropKit — du studio au SaaS payant

> **Le fil conducteur.** On coche au fur et à mesure. Aucune tâche ne se perd ici.
> Ordre stratégique validé : **1) finir & fiabiliser l'app → 2) performance → 3) monétisation.**
> Les tarifs ne sont posés qu'en Phase 4 (voir MONETISATION.md, parqué).

Légende : `[ ]` à faire · `[~]` en cours · `[x]` fait · `→` voir détail

---

## Phase 0 — Socle & méthode  `[x]`
- [x] Stack en place (Next 16, Prisma/Postgres Supabase, Storage, auth maison)
- [x] Déploiement Vercel fonctionnel
- [x] **Documentation d'architecture & procédures** (ce dossier `docs/`)

## Phase 1 — Performance (priorité immédiate)  `[~]`
> Diagnostic complet : voir [PERFORMANCE.md](./PERFORMANCE.md). Lenteur réelle = cold start DB (~3,5 s à froid).
- [x] Images de la home en `next/image` (hero + carousel, `fill` + `sizes` + `priority`)
- [x] `next.config.ts` : optimisation d'images, formats AVIF/WebP, cache long
- [x] Fusionner les requêtes DB de `/d/[slug]` (3 lectures séquentielles → `Promise.all`)
- [ ] Réduire le coût du cold start Prisma (pooling vérifié, init allégée)
- [x] Corriger le lien démo cassé (`/d/demo` → 404) : seed d'un drop démo (`npm run seed:demo`, via REST Supabase)
- [ ] Audit fonts (4 Google fonts chargées — en garder le strict nécessaire)
- [~] Mesure avant/après consignée dans PERFORMANCE.md (après = post-déploiement)

## Phase 2 — Finition produit (rendre l'app « finie »)  `[ ]`
- [ ] Revue UX bout-en-bout : signup → onboarding → créer drop → QR → inscription visiteur → export
- [ ] États vides, erreurs et chargements soignés partout
- [ ] Validation robuste des formulaires (marque + visiteur)
- [ ] Emails transactionnels propres (Resend) : confirmation, fin de drop
- [ ] Responsive mobile vérifié sur les parcours clés
- [ ] SEO de base + OpenGraph (partage de la page de drop)
- [ ] Page démo publique réellement vitrine

## Phase 3 — Confiance & robustesse (pré-requis pour facturer)  `[ ]`
- [ ] Gestion d'erreurs serveur (pages `error.tsx`, logs)
- [ ] Rate-limiting sur les routes publiques sensibles (inscription, upload)
- [ ] Sauvegarde / export des données marque
- [ ] RGPD : mentions, consentement, suppression de compte effective
- [ ] Tests des parcours critiques (au moins manuels documentés)

## Phase 4 — Monétisation (déclenchée quand Phases 1-3 OK)  `[ ]`
> ⚠️ **Parquée.** Détails et décisions ouvertes dans [MONETISATION.md](./MONETISATION.md).
- [ ] Choix définitif des paliers et des prix (décision produit à venir)
- [ ] Choix prestataire paiement (Stripe vs Lemon Squeezy/Paddle)
- [ ] Modèle de données abonnement sur `Brand` (plan, statut, quotas)
- [ ] Intégration paiement (Checkout + portail client + webhooks)
- [ ] Application des quotas par plan (limites drops / leads / features)
- [ ] Page pricing + parcours d'upgrade
- [ ] Facturation, TVA, factures

## Phase 5 — Croissance  `[ ]`
- [ ] Analytics produit (conversion, activation, rétention)
- [ ] Onboarding activant (time-to-first-drop minimal)
- [ ] Référencement / contenu / cas clients
- [ ] Programme de parrainage / affiliation

---

### Comment utiliser cette roadmap
À chaque session : on prend la **première case non cochée** d'une phase active, on la
fait proprement (cf. `procedures/nouvelle-fonctionnalite.md`), on la coche, on logue
dans JOURNAL.md. On n'ouvre pas la Phase N+1 avant d'avoir solidifié la Phase N.
