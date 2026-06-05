# ADR-0005 — Un seul visuel de marque (logo = photo de profil)

- **Statut** : Accepté
- **Date** : 2026-06-05

## Contexte
`BrandProfile` avait **deux** champs image : `logoUrl` (écrit par l'onboarding, mais
**jamais affiché**) et `avatarUrl` (écrit par le profil, affiché dans le header). Résultat
incohérent : le logo uploadé à l'inscription n'apparaissait nulle part. Demande
utilisateur : « le logo et la photo de profil doivent devenir la même chose, partout ».

## Décision
**Champ canonique unique : `avatarUrl`.** Un seul visuel de maison, utilisé partout.
- Onboarding et profil écrivent et lisent `avatarUrl` (libellé « Logo / photo de la maison »).
- Affiché dans le **header du studio** ET sur les **pages de drop publiques** (`/d/[slug]`).
- **Repli de compatibilité** : partout où on lit le visuel, on fait `avatarUrl ?? logoUrl`.
  Les anciennes données (logo posé via l'ex-onboarding) restent visibles et **migrent
  automatiquement** vers `avatarUrl` à la prochaine sauvegarde du profil.

## Alternatives écartées
- *Migration DB + suppression de la colonne `logoUrl`* — écarté : DDL risqué (impossible
  via REST Supabase, ports PG bloqués en local) pour un gain nul vu le repli applicatif.
- *Garder deux champs distincts* — écarté : c'est précisément l'incohérence à supprimer.

## Conséquences
- ➕ Visuel cohérent partout ; logo d'inscription enfin affiché (studio + pages de drop).
- ➕ Aucune migration de données nécessaire (repli + auto-migration à la sauvegarde).
- ➖ La colonne `logoUrl` subsiste en base (orpheline, nullable) — dette mineure assumée,
  conservée comme source du repli. À retirer un jour si on fait une vraie migration de schéma.
