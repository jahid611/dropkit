# 📚 Documentation DropKit

> La **boussole** du projet. Avant de coder, on lit ; après avoir codé, on met à jour.
> Objectif : ne jamais perdre le fil d'une création de SaaS faite proprement.

DropKit est un **studio de drops** pour créateurs de mode : composer une page de
lancement éditoriale, capturer des contacts avant l'ouverture, diffuser par QR code.
Cible finale : un **SaaS payant** (abonnement) qui génère du revenu récurrent.

## Carte de la documentation

| Fichier | À quoi ça sert | Quand le lire / l'écrire |
|---|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, carte du système, modèle de données | Avant toute modif structurante |
| [ROADMAP.md](./ROADMAP.md) | Le plan par phases jusqu'au SaaS payant. **Le fil conducteur.** | À chaque début/fin de tâche |
| [JOURNAL.md](./JOURNAL.md) | État courant + prochaines étapes, session par session | À chaque fin de session |
| [PERFORMANCE.md](./PERFORMANCE.md) | Audit de perf et journal des correctifs | Quand on touche à la vitesse |
| [MONETISATION.md](./MONETISATION.md) | Plan tarifs + Stripe (**parqué** : activé en fin de build) | Phase monétisation uniquement |
| [decisions/](./decisions/) | ADR — chaque décision d'archi tracée et datée | Quand on tranche un choix technique |
| [procedures/](./procedures/) | Runbooks reproductibles (deploy, feature, perf) | Quand on exécute une opération récurrente |

## Règle d'or (workflow pro)

1. **Lire** la doc concernée + le guide Next dans `node_modules/next/dist/docs/` (cf. AGENTS.md).
2. **Faire** la modif, la plus petite qui apporte de la valeur.
3. **Vérifier** (build, mesure, test manuel).
4. **Tracer** : cocher la ROADMAP, ajouter une ligne au JOURNAL, créer un ADR si on a tranché.

## Principes directeurs

- **Finir l'app avant de facturer.** Les tarifs ne sont posés qu'en fin de build (voir MONETISATION.md, parqué).
- **Mesurer avant d'optimiser.** Pas de perf « au feeling » — chiffres dans PERFORMANCE.md.
- **Petites étapes traçables** plutôt qu'un grand refactor opaque.
- **Une source de vérité par sujet.** Pas de doublon de doc.
