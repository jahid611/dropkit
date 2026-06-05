# ⚡ Performance DropKit

> **Mesurer avant d'optimiser.** Toute optimisation est chiffrée ici (avant/après).
> Outil de mesure rapide : `curl -w "ttfb:%{time_starttransfer}s"`.

## Audit initial — 2026-06-05 (prod `dropkit-five.vercel.app`)

| Route | TTFB à froid | TTFB à chaud | Verdict |
|---|---|---|---|
| `/` (statique) | 0,27 s | 0,27 s | ✅ OK |
| `/d/demo` (DB) | **3,57 s** | 0,69 s | ❌ cold start |
| `/dashboard` (redir) | — | 0,26 s | ✅ |
| `/login` | — | 0,20 s | ✅ |

### Causes racines (par impact décroissant)

1. **Cold start serverless + Prisma/Supabase** — 1ʳᵉ visite d'une page DB ≈ 3,5 s
   pendant l'init de la lambda Vercel + chargement du moteur Prisma + 1ʳᵉ connexion.
   C'est ce qui « fait lent ». À chaud, c'est correct.
   - Leviers : vérifier le pooling pgbouncer, réduire les allers-retours DB,
     alléger l'init, envisager Fluid Compute / keep-warm.
2. **Images home en `<img>` brut** — hero `IMG_1801.jpeg` = **552 Ko**, carousel 128–272 Ko.
   Pas de `next/image` ⇒ pas d'AVIF/WebP, pas de resize, pas de lazy-load. Mauvais LCP.
   - Levier : `next/image` (import statique = width/height/blur auto) + `next.config` images.
3. **`/d/[slug]` fait 2 requêtes DB séquentielles** (`drop.findUnique` puis
   `submission.findFirst`) — sur un chemin déjà pénalisé par le cold start.
   - Levier : fusionner / paralléliser.
4. **Google fonts** : passées de 4 à **3** (Geist, Playfair, Fraunces — toutes
   utilisées). Geist Mono **supprimée** : ses seuls consommateurs (`LeadForm`,
   `MusicToggle`) étaient du code mort. ⇒ une police de moins préchargée sur chaque route.

## Journal des correctifs

> (À remplir au fur et à mesure — chaque ligne = un correctif mesuré.)

| Date | Correctif | Avant | Après |
|---|---|---|---|
| 2026-06-05 | Home en `next/image` (hero + carousel) + `next.config` AVIF/WebP | hero JPEG 552 Ko brut | optimisé/resizé en prod (à mesurer Lighthouse post-deploy) |
| 2026-06-05 | `/d/[slug]` : 3 lectures séquentielles → `Promise.all` | drop + visitor + token en série | 1 aller-retour parallèle |
| 2026-06-05 | Audit fonts : Geist Mono **supprimée** (consommateurs = code mort) | 4 polices / route | 3 polices (build vérifié) |

| 2026-06-05 | Seed du drop `/d/demo` (lien vitrine réparé) | 404 | 200 (TTFB 3,7 s froid / 1,4 s chaud) |
| 2026-06-05 | `/d/[slug]` passée en **statique/ISR** (CDN), état perso via `/me` ([ADR-0003](./decisions/0003-cache-pages-de-drop.md)) | TTFB **~3,7 s** à froid | TTFB **~65 ms** (CDN HIT) — **≈ 50× plus rapide**, mesuré en prod |

> ✅ **Confirmé en prod le 2026-06-05** : après déploiement, `/d/demo` répond en
> ~0,06–0,19 s (`x-vercel-cache: HIT`) au lieu de ~3,7 s. Le cold start n'est plus sur
> le chemin critique de la page la plus exposée (QR / partage). Bout-en-bout validé :
> contenu servi statiquement + `GET /api/drops/[id]/me` → 200 JSON.

> **Reste à mesurer après déploiement** (l'optimisation `next/image` n'agit qu'en prod) :
> LCP de `/` via Lighthouse, et TTFB chaud de `/d/<slug>`.

### ⏭️ Prochain chantier : le cold start (gain ressenti #1)
`/d/demo` à 3,7 s à froid le confirme. Pistes à instruire :
- Vérifier que `DATABASE_URL` pointe bien le pooler pgbouncer (6543) et `DIRECT_URL` le direct (5432).
- Réduire l'init Prisma au démarrage de la lambda (imports, taille du bundle serveur).
- Évaluer Fluid Compute / réduction du nombre de fonctions, ou un cache court sur les pages de drop.

## Méthode de mesure (reproductible)

```bash
# TTFB à froid vs à chaud (lancer 2x, le 2e est chaud)
curl -s -o /dev/null -w "ttfb:%{time_starttransfer}s total:%{time_total}s http:%{http_code}\n" <URL>
```
Pour le rendu réel (LCP, CLS) : Lighthouse / PageSpeed Insights sur l'URL prod.
