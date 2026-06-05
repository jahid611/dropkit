# ADR-0003 — Mise en cache CDN des pages de drop publiques

- **Statut** : Accepté
- **Date** : 2026-06-05

## Contexte
`/d/[slug]` était rendue dynamiquement (lambda à chaque requête) car elle lisait les
cookies du visiteur pour savoir s'il était déjà inscrit. Résultat : **cold start
serverless ~3,5 s** sur le 1er affichage, alors que le contenu d'un drop est **identique
pour tous** et change rarement. C'est la page la plus exposée (QR code, partage).

## Décision
Séparer le **contenu partagé** (caché) de l'**état personnel** (dynamique), sans activer
Cache Components (qui impacterait toute l'app — dashboard, onboarding… toutes liseuses de cookies) :

1. `/d/[slug]` passe en **`force-static` + ISR** (`revalidate = 3600` en backstop) :
   plus aucune lecture de cookie dans la page → **servie depuis le CDN, sans lambda**.
2. La vérif « déjà inscrit ? / connecté ? » part dans **`GET /api/drops/[id]/me`**
   (route dynamique légère), appelée **côté client après l'affichage**.
3. `ended` (« drop terminé ») est **calculé côté client** depuis `endsAt` (sinon il
   serait figé dans le HTML mis en cache).
4. **`revalidatePath('/d/<slug>')`** dans `saveDropAction` → la page se rafraîchit
   instantanément à l'édition, sans attendre le backstop.

## Alternatives écartées
- **`cacheComponents: true` + PPR** (modèle natif Next 16) — plus élégant, mais
  rayon d'impact trop large : toutes les routes lisant des cookies devraient être
  refactorées d'un coup. Reporté.
- **Garder la page dynamique + `unstable_cache` sur la requête** — n'enlève pas le
  cold start (la route reste une lambda à cause des cookies).

## Conséquences
- ➕ Page de drop servie instantanément depuis le CDN ; cold start retiré du chemin critique.
- ➕ Charge DB réduite (le contenu n'est plus requêté à chaque visite).
- ➖ **Léger flash possible** pour un visiteur *déjà inscrit* : le formulaire s'affiche
  une fraction de seconde avant de basculer sur « Vous êtes sur la liste ✓ » (le verrou
  reste garanti côté serveur à la soumission). Le modal d'accueil, lui, ne flashe pas
  (attente de l'état perso).
- ➖ Données dérivées non issues du drop (ex. nom de la maison) ne se rafraîchissent
  qu'au backstop horaire ou à la prochaine édition du drop. Acceptable.
- ⚠️ À surveiller : si on active Cache Components plus tard, `dynamic/revalidate`
  disparaissent — il faudra migrer vers `use cache`.
