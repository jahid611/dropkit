# 💰 Monétisation DropKit — DÉMARRÉE en surface (Phase 4)

> **État (2026-06-06)** : à la demande utilisateur, on a posé les **paliers** et les
> **limites appliquées** + une **page tarifs**, mais le **paiement n'est pas branché**
> (pas de prestataire choisi, pas de Stripe). Tout le monde est donc sur le plan gratuit.
>
> **Fait** :
> - `app/lib/plans.ts` — 3 plans (Découverte gratuit / Studio 29 € / Maison 89 €) + limites
>   (`maxDrops`, `maxFields`, `maxSubmissionsPerDrop`). Source unique pour quotas + page tarifs.
> - **Quota drops appliqué** : `createDraftDropAction` bloque au-delà de `plan.maxDrops`
>   → redirige vers `/tarifs?from=quota`. Indicateur d'usage (`X / N drops`) au dashboard.
> - **Page `/tarifs`** publique (3 plans, badge « Recommandé », bandeau quota). CTA → /signup.
>
> **Reste à faire (vrai Phase 4)** : choisir le prestataire, ajouter `plan`/`subscriptionStatus`
> sur `Brand` (migration DB), brancher Checkout + webhooks + portail, parcours d'upgrade,
> appliquer aussi `maxFields`/`maxSubmissionsPerDrop` si voulu. Le seul point à modifier pour
> activer les plans payants côté quotas = `planForBrand()` dans `app/lib/plans.ts`.

## Décisions encore ouvertes
- **Paliers & prix** : non figés. Pistes évoquées :
  - *Freemium 3 paliers* : Gratuit (1 drop, ~50 leads) → Pro (~19 €/mois, drops illimités,
    export, mailing) → Studio (~49 €/mois, multi-marques, branding custom, analytics).
  - *2 paliers* : Gratuit limité → Pro unique (~29 €/mois).
  - *Essai 14 j puis payant* (pas de gratuit permanent).
- **Prestataire de paiement** : non choisi.
  - *Stripe* : standard, CB+SEPA+wallets, portail client, idéal FR/UE (PCI géré côté Stripe).
  - *Lemon Squeezy / Paddle* : merchant of record (TVA UE gérée pour toi), commissions + élevées.

## Pré-requis avant d'activer la facturation (= sortie de Phase 3)
- Parcours produit complet et fiable (signup → drop → inscription → export).
- Performance acceptable (Phase 1 close).
- Robustesse : erreurs gérées, rate-limiting, RGPD (suppression de compte, mentions).
- Une vraie page démo vitrine.

## Esquisse technique (pour le jour J, non engageante)
- **Données** : ajouter sur `Brand` → `plan` (free|pro|studio), `subscriptionStatus`,
  `stripeCustomerId`, `currentPeriodEnd`, éventuels compteurs de quotas.
- **Flux Stripe** : Checkout Session (upgrade) → webhook (`checkout.session.completed`,
  `customer.subscription.updated/deleted`) → maj du plan en base → portail client pour gérer.
- **Quotas** : garde applicative (ex. `assertCanCreateDrop(brand)`) appelée dans les
  Server Actions de création, message d'upgrade si dépassement.
- **Page pricing** + bandeau d'upgrade contextuel dans le dashboard.

## Métriques à instrumenter dès l'activation
Conversion visiteur→signup, signup→1er drop (activation), free→payant, churn, MRR.

---
*Quand on entrera en Phase 4, repartir d'ici, trancher les décisions ouvertes (via
question à l'utilisateur), créer un ADR, puis dérouler l'esquisse technique.*
