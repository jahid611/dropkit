# 📓 Journal de bord DropKit

> Une entrée par session. But : reprendre le fil instantanément.
> Format : **Date — ce qui a été fait — état — prochaine étape claire.**
> La plus récente en haut.

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
