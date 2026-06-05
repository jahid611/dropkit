# 📓 Journal de bord DropKit

> Une entrée par session. But : reprendre le fil instantanément.
> Format : **Date — ce qui a été fait — état — prochaine étape claire.**
> La plus récente en haut.

---

## 2026-06-06 (suite 2) — Aperçu d'un drop en modale depuis le dashboard

**Demande (utilisateur)** : sur « Mes drops », un bouton « œil » à côté de « Voir » →
modale d'aperçu du drop, animations d'ouverture/fermeture soignées + croix.

**Fait** : `app/components/DropPreviewModal.tsx` (client) :
- Bouton œil (SVG inline) inséré avant « Voir ↗ » dans la liste des drops.
- Modale = **iframe de la vraie page publique** (`dropPath` + ancre `#preview`) dans un
  **cadre téléphone** → aperçu 100 % fidèle, sans dupliquer le rendu ni recharger de data.
- **framer-motion** (déjà installé, plus utilisé depuis la suppression de LeadForm) :
  fond en fade, panneau en spring (scale/opacity/y) à l'ouverture, exit inversé via
  `AnimatePresence`. Croix qui pivote au survol.
- Échap pour fermer, clic sur le fond, **verrouillage du scroll** pendant l'ouverture.
- `VisitorExperience` : n'auto-ouvre plus sa modale d'accueil si `location.hash`
  contient `preview` (check client-only → **page reste statique**, pas de deopt).

**Vérifié** : `npm run build` ✅. **Non testable en local** (dashboard + iframe = DB,
ports PG bloqués) → valider le rendu/les animations en prod.

---

## 2026-06-06 (suite) — Nom de la maison dans l'URL : /d/<maison>/<drop>

**Demande (utilisateur)** : faire apparaître le nom de la maison dans l'URL, en plus
du drop. Format choisi : **imbriqué** `/d/maison/drop` (le plus lisible).

**Contrainte Next** : deux segments dynamiques au même niveau doivent porter le même
nom → impossible d'avoir `[slug]` et `[brand]` voisins. Structure retenue :
- `app/d/[brand]/[slug]/page.tsx` — la vraie page (`slug` = slug du drop, clé de lecture ;
  `brand` décoratif). **Reste statique/ISR** (CDN, perf préservée). `generateMetadata`
  canonical = `/d/<maison>/<drop>`.
- `app/d/[brand]/page.tsx` — compat : ancien `/d/<drop>` (1 segment) → **redirige** vers
  le canonique (préserve QR/liens déjà partagés + lien démo de la home). Dynamique.

**Centralisation** : `app/lib/drop-url.ts` (`brandSlug`, `dropPath`) — **toutes** les
constructions d'URL passent par là : liens dashboard, « Voir la page » + message de
l'éditeur, QR (`QrCode` prend désormais un `path` complet), OpenGraph, emails Resend,
`revalidatePath`. Le slug de maison est dérivé du nom (pas de migration DB).

**Vérifié** : `npm run build` ✅ ; table de routes = `ƒ /d/[brand]` + `○ /d/[brand]/[slug]`
(page toujours statique). Pages DB non testables en local (ports PG) → valider en prod :
`/d/<maison>/<drop>` s'affiche, et un ancien `/d/<drop>` redirige.

**Note** : si deux maisons ont le même nom, le segment maison est identique mais le slug
de drop (unique global) départage — pas de collision. Préfixe maison erroné = même page,
dédoublonnée par le `canonical`.

---

## 2026-06-06 — Fix : le slug du drop ne reflétait pas le nom (oubli)

**Signalé (utilisateur)** : un drop créé pointe sur `/d/nouveau-drop` ; crainte que
deux drops du même nom partagent la même URL.

**Diagnostic** :
- L'unicité était **déjà garantie** (`uniqueSlug` ajoute `-2`, `-3`… → jamais d'écrasement,
  unicité globale). Donc pas de collision possible.
- **Vrai bug** : `saveDropAction` mettait à jour le titre mais **jamais le slug** →
  il restait figé sur le `nouveau-drop` du brouillon. Indice d'oubli : le paramètre
  `excludeId` de `uniqueSlug` (utile seulement en update) n'était jamais utilisé.

**Fait** :
- `saveDropAction` : régénère le slug depuis le titre **tant que le slug est encore
  le placeholder du brouillon** (`/^nouveau-drop(-\d+)?$/`). Dès qu'un vrai slug existe,
  il est **figé** (ne pas casser QR codes / liens partagés). Revalidation de l'ancienne
  ET de la nouvelle URL `/d/...`.
- `DropEditor` : affiche l'URL réelle après save (`Enregistré ✓ — /d/<slug>`) et met à
  jour le lien « Voir la page ↗ ».
- `npm run build` ✅ vert.

**Pour l'utilisateur** : ouvrir le drop existant, vérifier le titre, **Enregistrer** →
l'URL devient `/d/<vrai-nom>` ; puis régénérer le QR. (Migration auto au prochain save ;
DB non touchée à la main — ports PG bloqués en local.)

**Piste future** (si besoin de contrôle total) : champ slug éditable dans l'éditeur
avec validation d'unicité en direct.

---

## 2026-06-05 (suite 8) — SEO + OpenGraph de la page de drop (Phase 2)

**Demande** : case Phase 2 « SEO de base + OpenGraph (partage de la page de drop) ».
Constat de la revue : `/d/[slug]` n'avait aucune métadonnée → un lien partagé
(QR / réseaux / SMS) affichait le titre générique du site, sans aperçu visuel.

**Fait** (doc lue : `node_modules/next/dist/docs/.../14-metadata-and-og-images.md`
+ référence `generate-metadata`) :
- **`generateMetadata`** sur `/d/[slug]/page.tsx` : titre `Drop — Maison` (`title.absolute`
  → pas de « · DropKit » sur la page de marque), description (subtitle → welcomeText →
  fallback), **OpenGraph + Twitter card**, image = 1er article illustré sinon logo
  (URL absolue Supabase, gardée par regex `^https?://`), `alternates.canonical`.
- **`app/lib/site.ts`** : `siteUrl()` (NEXT_PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL
  → VERCEL_URL → localhost). Sert `metadataBase`.
- **Root layout** : `metadataBase`, gabarit de titre `%s · DropKit`, OG par défaut
  (siteName/type/locale fr_FR).
- **`app/lib/public-drop.ts`** : `getPublicDrop` mémoïsé via `cache()` React →
  `generateMetadata` + la page partagent **une seule** requête DB (page = `force-static`).
- `.env.example` : `NEXT_PUBLIC_SITE_URL` documentée (optionnelle).

**Vérifié** : `npm run build` ✅ vert ; `/d/[slug]` reste statique. Balises OG racines
confirmées sur la home en local. **La page de drop n'est pas testable en local** (ports
PG bloqués) → vérifier en prod avec un vrai slug (ex. `/d/demo`) via un validateur OG.

**Aussi** : case « Revue UX bout-en-bout » cochée (parcours sain, reliquats reportés sur
leurs propres cases : `error.tsx`, modale sur drop terminé, CTA configurable).

**Prochaine étape** : reliquats Phase 2 — états vides/erreurs (`error.tsx`), validation,
emails Resend, responsive, page démo vitrine.

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
