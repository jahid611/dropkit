# 🧩 Procédure — Ajouter une fonctionnalité

Runbook standard. Le suivre garde la qualité constante et la trace intacte.

1. **Cadrer** — quelle case de la ROADMAP ? Sinon, l'ajouter d'abord. Une seule à la fois.
2. **Lire** — le guide Next concerné dans `node_modules/next/dist/docs/` (APIs Next 16
   ≠ versions connues, cf. AGENTS.md) + le code existant proche (réutiliser les conventions).
3. **Concevoir** — si choix structurant (modèle, dépendance, découpage) → écrire un **ADR**.
4. **Faire** — la plus petite modif qui apporte de la valeur. Respecter :
   - `server-only` sur les modules sensibles, gardes `requireBrand()` sur le dashboard,
   - libellés produit en français, singleton Prisma, validation des entrées.
5. **Schéma de données** — si `prisma/schema.prisma` change : `prisma generate` puis
   migration via l'URL directe (`DIRECT_URL`, port 5432), pas le pooler.
6. **Vérifier** — `npm run build` propre + test manuel du parcours (cf. procédures/run).
7. **Tracer** — cocher la ROADMAP, ligne dans le JOURNAL, ADR si décision.
8. **Commit** — message clair en français, une intention par commit. Push si demandé.
