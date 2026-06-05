# ADR-0002 — Documentation & méthode de travail

- **Statut** : Accepté
- **Date** : 2026-06-05

## Contexte
Construire un SaaS proprement sur plusieurs sessions sans « perdre le fil » : besoin
d'une source de vérité unique pour l'état du projet, les décisions et les procédures.

## Décision
Adopter un dossier **`docs/`** comme colonne vertébrale du projet :
- **ROADMAP.md** = le fil conducteur par phases, coché à chaque tâche.
- **JOURNAL.md** = mémoire de session (état + prochaine étape).
- **ARCHITECTURE.md** = carte technique à jour.
- **ADR** (`decisions/`) = chaque choix d'archi tracé et daté, immuable.
- **Procédures** (`procedures/`) = runbooks reproductibles.
- **MONETISATION.md** parquée tant que l'app n'est pas finie.

Workflow imposé : *lire la doc + le guide Next → faire petit → vérifier → tracer*.

## Alternatives écartées
- *Tout en mémoire / commits seuls* — écarté : insuffisant pour le « pourquoi » et l'état courant.
- *Outil externe (Notion, etc.)* — écarté : la doc vit **dans le repo**, versionnée avec le code.

## Conséquences
- ➕ Reprise instantanée du contexte, décisions justifiées, onboarding facile.
- ➖ Discipline requise : la doc doit être mise à jour à chaque session (sinon elle ment).
