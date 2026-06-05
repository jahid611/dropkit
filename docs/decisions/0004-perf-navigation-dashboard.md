# ADR-0004 — Accélérer la navigation du dashboard

- **Statut** : Accepté
- **Date** : 2026-06-05

## Contexte
Naviguer entre les pages du dashboard (ex. *Statistiques* → *Mes drops*) était « ultra
lent ». Deux causes :
1. À chaque navigation, la session était relue **2 fois** en base — une fois dans le
   `(main)/layout.tsx` (`requireOnboardedBrand`) et une fois dans la page — en plus de
   la requête de données. Soit **3 allers-retours DB séquentiels**, chacun pénalisé par
   le cold start.
2. **Aucun état de chargement** : l'écran restait figé sur la page précédente jusqu'à ce
   que tout le rendu serveur soit prêt → navigation perçue comme bloquée.

## Décision
1. **Mémoïsation par requête** : `getCurrentBrand` et `getCurrentVisitor` enveloppés
   dans **`cache()` de React**. Layout + page d'une même navigation partagent une
   **unique** requête de session (3 roundtrips → 2).
2. **`app/dashboard/(main)/loading.tsx`** : squelette affiché **instantanément** à
   chaque navigation. Le header (layout) reste en place ; seul le contenu passe en
   skeleton pendant le rendu → navigation **perçue comme immédiate**, et la coquille
   statique devient préchargeable par `<Link>`.

## Alternatives écartées
- *Mettre le dashboard en cache (comme `/d/[slug]`)* — impossible : pages **par
  utilisateur** (auth via cookie), non mutualisables.
- *Réduire le nombre de polices* — toutes utilisées ; gain LCP marginal avec `display:swap`.

## Conséquences
- ➕ Une requête DB de session en moins par navigation ; navigation perçue instantanée.
- ➕ `cache()` bénéficie aussi à `/api/drops/[id]/me` et à toute route lisant l'auth.
- ➖ Le skeleton doit rester cohérent visuellement avec les pages (à maintenir si l'UI évolue).
- ↪️ Le cold start « à froid » subsiste sur la 1ʳᵉ requête d'une lambda dashboard
  (intrinsèque au per-user) ; ici on réduit le coût par navigation + le ressenti.
