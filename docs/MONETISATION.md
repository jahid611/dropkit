# 💰 Monétisation DropKit — PARQUÉ (Phase 4)

> ⚠️ **Ne pas implémenter maintenant.** Décision utilisateur : on **finit l'app**
> (Phases 1-3 de la ROADMAP) **avant** de poser les tarifs. Ce fichier conserve la
> réflexion pour ne pas la reperdre, pas un plan à exécuter aujourd'hui.

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
