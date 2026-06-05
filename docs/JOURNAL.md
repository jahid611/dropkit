# 📓 Journal de bord DropKit

> Une entrée par session. But : reprendre le fil instantanément.
> Format : **Date — ce qui a été fait — état — prochaine étape claire.**
> La plus récente en haut.

---

## 2026-06-05 (suite 7) — Phase 2 démarre : nettoyage du code mort (suite de l'audit fonts)

**Contexte** : début de la revue UX bout-en-bout (Phase 2). En cartographiant le
parcours, découverte que **`LeadForm` (capture SMS) et `MusicToggle` (musique
d'ambiance) ne sont importés nulle part** — code mort depuis le 1er commit. Or
c'étaient les **seuls** consommateurs de Geist Mono et de la dépendance `howler`.

**Décision (utilisateur)** : tout supprimer. Ce qui **clôt mieux l'audit fonts** que
le `preload: false` de la suite 6 : on ne précharge plus une police inutile, on la retire.

**Fait** :
- Supprimés : `app/components/LeadForm.tsx`, `app/components/MusicToggle.tsx`,
  `app/api/leads/route.ts` (endpoint « legacy jsonl » noté dans ARCHITECTURE).
- **Geist Mono retirée** de `layout.tsx` + mapping `--font-mono` de `globals.css`.
  Police passe de 4 → **3** (Geist, Playfair, Fraunces).
- Dépendance **`howler` + `@types/howler` désinstallées** (retrait chirurgical de
  `package.json` + `package-lock.json` pour **ne pas** réécrire les métadonnées `libc`
  Linux du lockfile — npm macOS les prune, ce qui casserait le build Vercel).
- `npm run build` ✅ vert ; route `/api/leads` disparue (13 → 12 routes). ARCHITECTURE
  mise à jour.

**À retenir** : `npm install/uninstall` sur ce poste (macOS) prune les entrées `libc`
du lockfile → toujours éditer `package-lock.json` à la main pour les retraits de deps,
ou regénérer en CI.

**Prochaine étape** : poursuivre la **revue UX bout-en-bout** — parcours réel
signup → onboarding → drop → QR → inscription visiteur → export, états vides/erreurs.

---

## 2026-06-05 (suite 5) — Visuel de marque unifié partout

**Demande** : « le logo et la photo de profil doivent devenir la même chose partout ».

**Fait** ([ADR-0005](./decisions/0005-visuel-unique-maison.md))
- Champ canonique unique = **`avatarUrl`**. Onboarding + profil écrivent/lisent ce champ
  (libellé « Logo / photo de la maison »).
- Affiché **partout** : header du studio (déjà) **+ pages de drop publiques** (`/d/[slug]`,
  petit médaillon rond au-dessus du nom de la maison).
- **Repli `avatarUrl ?? logoUrl`** partout (affichage + pré-remplissage) → anciennes
  données visibles, auto-migrées à la prochaine sauvegarde. Pas de migration DB.
- `logoUrl` reste en base (orphelin, source du repli). `npm run build` ✅ vert.

**Prochaine étape** : Phase 2 (revue UX bout-en-bout, SEO/OG des pages de drop).

---

## 2026-06-05 (suite 4) — Upload logo onboarding + densité éditoriale (Phase 2)

**Demande** : à l'inscription, remplacer le champ « logo URL » par un upload ; ajouter
du texte explicatif sur les pages pour densifier.

**Fait**
- **Onboarding** : champ texte `logoUrl` → composant `AvatarUpload` (compression WebP
  auto via `/api/upload`, champ caché `logoUrl` pour la soumission). + **aide
  contextuelle par étape** (STEP_HINTS) expliquant pourquoi on demande chaque info.
- **Texte explicatif (densité)** :
  - Dashboard *Mes drops* : bande « Composer / Diffuser / Collecter ».
  - *Inscrits* : paragraphe + bande « Consulter / Exporter / Notifier ».
  - *Réglages* : note sécurité (email de connexion, changement de mot de passe).
  - *Profil* : note « ce qui est public vs privé » sur les pages de drop.
- `npm run build` ✅ vert.

**Prochaine étape** : poursuivre Phase 2 (revue UX bout-en-bout, états vides/erreurs, SEO/OG).

---

## 2026-06-05 (suite 3) — Navigation dashboard + LCP

**Signalé** : LCP ~2,88 s et navigation dashboard (inscrits → dashboard) « ultra lente ».

**Cause** : session relue 2×/navigation (layout + page) + aucune UI de chargement.

**Fait** ([ADR-0004](./decisions/0004-perf-navigation-dashboard.md))
- `getCurrentBrand` / `getCurrentVisitor` enveloppés dans **`cache()` React** :
  1 requête DB de session partagée par navigation au lieu de 2.
- **`app/dashboard/(main)/loading.tsx`** : squelette instantané → navigation perçue immédiate.
- Polices : les 4 sont réellement utilisées (Geist Mono, Fraunces inclus) → non retirées
  (gain LCP marginal avec `display:swap`, risque design). Levier LCP réel = TTFB dynamique.
- `npm run build` ✅ vert.

**Note** : dashboard authentifié non mesurable au curl (redirige sans session) ;
vérif côté navigation utilisateur.

**Étendu** (demande « rends tout fluide ») : `loading.tsx` ajouté sur **tous** les
écrans authentifiés — éditeur de drop (`drops/[id]`), page QR (`drops/[id]/qr`),
onboarding, auth (`(auth)`). Chaque navigation a désormais un squelette instantané.
Build ✅ vert.

**Prochaine étape** : déployé ; tester la fluidité en prod. Si LCP home reste élevé,
Lighthouse ciblé sur `/`.

---

## 2026-06-05 (suite 2) — Cold start : pages de drop cachées (CDN/ISR)

**Fait** ([ADR-0003](./decisions/0003-cache-pages-de-drop.md))
- `/d/[slug]` refactorée : retrait des lectures de cookies → **`force-static` + ISR**.
  Build confirme : la route passe de `ƒ` (dynamique) à **`○` (statique)**, servie CDN.
- Nouvel endpoint `GET /api/drops/[id]/me` (dynamique, léger) : renvoie
  `{ alreadySubmitted, loggedIn, visitorEmail }` ; appelé côté client après l'affichage.
- `VisitorExperience` : récupère l'état perso via `/me`, n'ouvre le modal qu'une fois
  l'état connu (pas de flash), `ended` calculé côté client depuis `endsAt`.
- `saveDropAction` : `revalidatePath('/d/<slug>')` → rafraîchissement instantané à l'édition.
- `npm run build` ✅ vert.

**Effet attendu** : cold start retiré du 1er rendu de la page la plus exposée (QR/partage).
À confirmer en prod après déploiement (TTFB froid de `/d/demo` devrait chuter).

**Trade-off assumé** : léger flash possible pour un visiteur déjà inscrit (verrou
toujours garanti serveur à la soumission).

**Déployé + mesuré en prod ✅** : `/d/demo` passe de **~3,7 s** à **~65 ms** (CDN HIT),
soit ≈ 50× plus rapide. `/api/drops/[id]/me` → 200 JSON, contenu servi statiquement. OK.

**Prochaine étape** : Phase 1 quasi close (reste audit fonts, optionnel). On peut passer
à la **Phase 2 — finition produit** (revue UX bout-en-bout, états vides/erreurs, SEO/OG).

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
