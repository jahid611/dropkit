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
- [x] **Page de drop `/d/[slug]` cachée (CDN/ISR)** — cold start retiré du chemin critique ([ADR-0003](./decisions/0003-cache-pages-de-drop.md)). État perso via `/api/drops/[id]/me`.
- [x] **Navigation fluide partout** : session mémoïsée (React `cache()`) + `loading.tsx` sur **tous** les écrans authentifiés (dashboard, éditeur de drop, QR, onboarding, auth) → squelette instantané à chaque navigation ([ADR-0004](./decisions/0004-perf-navigation-dashboard.md))
- [ ] (optionnel) Réduire encore le cold start des routes DB si besoin
- [x] Corriger le lien démo cassé (`/d/demo` → 404) : seed d'un drop démo (`npm run seed:demo`, via REST Supabase)
- [x] **Audit fonts** : 4 → **3 polices**. Geist Mono **supprimée** (ses seuls consommateurs — `LeadForm`, `MusicToggle` — étaient du code mort, supprimés avec la route `/api/leads` et la dépendance `howler`). Restent Geist (corps), Playfair (`.luxe`), Fraunces (hero visiteur), toutes réellement utilisées.
- [~] Mesure avant/après consignée dans PERFORMANCE.md (après = post-déploiement)

## Phase 2 — Finition produit (rendre l'app « finie »)  `[~]`
- [x] Onboarding : champ « logo URL » remplacé par un **upload** (compression auto) + aides par étape
- [x] Densité éditoriale : textes explicatifs sur dashboard, inscrits, réglages, profil
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
