# 📓 Journal de bord DropKit

> Une entrée par session. But : reprendre le fil instantanément.
> Format : **Date — ce qui a été fait — état — prochaine étape claire.**
> La plus récente en haut.

---

## 2026-06-05 (suite) — Déploiement confirmé + réparation de la démo

**Fait**
- Commits poussés sur `main` (docs + perf), **déployés en prod** sur Vercel (confirmé utilisateur).
- **Réparé le lien démo cassé** : `/d/demo` renvoyait 404 (aucun drop en base).
  - Seed idempotent `prisma/seed-demo.mjs` (+ script `npm run seed:demo`).
  - **Contrainte réseau** : ports Postgres 5432/6543 bloqués en sortie depuis le poste
    (TCP timeout, DNS OK) → le seed passe par l'**API REST Supabase (HTTPS)** avec la
    clé service_role, et génère lui-même les ids (colonnes TEXT sans défaut SQL).
  - Vérifié : `/d/demo` → **200**, contenu « Maison Démo / Capsule 01 — Atelier » servi.

**Mesure** : `/d/demo` TTFB 3,7 s à froid / 1,4 s à chaud → le **cold start** reste le gros sujet.

**À retenir** : toute opération DB en local doit passer par REST Supabase (ports PG bloqués ici).

**Prochaine étape** : attaquer le **cold start Prisma** (init/pooling) — plus gros gain de perf ressenti.

---

## 2026-06-05 — Mise en place de la méthode + diagnostic perf

**Fait**
- Création du dossier `docs/` complet : README (boussole), ARCHITECTURE, ROADMAP
  (le fil conducteur par phases), JOURNAL, PERFORMANCE, MONETISATION (parquée),
  ADR initiaux et procédures.
- **Audit de performance du site déployé** (mesures réelles, voir PERFORMANCE.md) :
  - Home `/` : TTFB 0,27 s (statique, OK).
  - `/d/demo` : **3,5 s à froid**, 0,69 s à chaud → cold start serverless + Prisma/Supabase.
  - Lien « Voir la démo » de la home **cassé** (404, aucun drop démo en base).
  - Hero home = JPEG **552 Ko** servi en `<img>` brut (pas d'optimisation Next).

**Décisions produit (utilisateur)**
- Ordre : **perf d'abord**, monétisation plus tard (app finie avant les tarifs).
- Tarifs & prestataire de paiement : **non décidés**, parqués dans MONETISATION.md.
- Demande explicite : structure d'archi/procédures pro pour « ne jamais perdre le fil ». → faite.

**Fait (perf, Phase 1)**
- Home migrée vers `next/image` : hero + carousel en `fill` + `sizes` + `priority`
  (avant : `<img>` brut, hero JPEG 552 Ko).
- `next.config.ts` : `images.formats` AVIF/WebP + `minimumCacheTTL` long.
- `/d/[slug]` : `drop.findUnique` + `getCurrentVisitor` + `readFpToken` passés en
  `Promise.all` (3 lectures séquentielles → 1 aller-retour).
- `npm run build` ✅ vert (Next 16, Turbopack). Home toujours statique.

**État** : Phase 0 terminée. Phase 1 (perf) bien avancée — restent cold start Prisma,
fix démo `/d/demo` (404), audit fonts, et **mesure post-déploiement** (Lighthouse + TTFB chaud).

**Prochaine étape** : décider commit + déploiement de ces gains, puis seed d'un drop
« demo » pour réparer le lien vitrine cassé, puis mesurer en prod.
