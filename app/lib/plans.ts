// Plans & quotas DropKit.
// Source unique de vérité : limites appliquées (garde `assertCanCreateDrop`) + page /tarifs.
//
// ⚠️ Paiement non branché (monétisation parquée) : tout le monde est sur le plan gratuit.
// Le jour où Stripe est branché (Phase 4), ajouter `plan` sur `Brand` et le lire dans
// `planForBrand()` — c'est le SEUL point à changer ici.

export type PlanId = "decouverte" | "studio" | "maison";

export interface Plan {
  id: PlanId;
  name: string;
  /** Prix affiché (ex. "Gratuit", "29 €"). */
  price: string;
  /** Période (ex. "/ mois"). Absent pour le gratuit. */
  period?: string;
  tagline: string;
  /** `Infinity` = illimité. */
  maxDrops: number;
  maxFields: number;
  maxSubmissionsPerDrop: number;
  /** Puces affichées sur la carte. */
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "Gratuit",
    tagline: "Pour lancer votre premier drop et tester DropKit.",
    maxDrops: 3,
    maxFields: 5,
    maxSubmissionsPerDrop: 200,
    features: [
      "Jusqu'à 3 drops",
      "200 inscrits par drop",
      "5 champs de formulaire",
      "Page publique & QR code",
      "Export CSV",
      "Badge « propulsé par DropKit »",
    ],
    cta: "Commencer gratuitement",
  },
  {
    id: "studio",
    name: "Studio",
    price: "29 €",
    period: "/ mois",
    tagline: "Pour les marques qui lancent régulièrement.",
    maxDrops: 25,
    maxFields: 10,
    maxSubmissionsPerDrop: 5000,
    highlighted: true,
    features: [
      "Jusqu'à 25 drops",
      "5 000 inscrits par drop",
      "10 champs de formulaire",
      "E-mails de fin de drop (Resend)",
      "Export CSV & Excel",
      "Designs de QR premium",
      "Sans badge DropKit",
    ],
    cta: "Choisir Studio",
  },
  {
    id: "maison",
    name: "Maison",
    price: "89 €",
    period: "/ mois",
    tagline: "Pour les maisons établies, sans limite.",
    maxDrops: Infinity,
    maxFields: 15,
    maxSubmissionsPerDrop: Infinity,
    features: [
      "Drops illimités",
      "Inscrits illimités",
      "15 champs (maximum)",
      "Tout le plan Studio",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    cta: "Choisir Maison",
  },
];

export const DEFAULT_PLAN_ID: PlanId = "decouverte";

export function getPlan(id: PlanId = DEFAULT_PLAN_ID): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/**
 * Plan courant d'une marque. Tant que le paiement n'est pas branché, tout le monde
 * est sur le plan gratuit. Brancher ici la lecture de `brand.plan` en Phase 4.
 */
export function planForBrand(_brand?: unknown): Plan {
  return getPlan(DEFAULT_PLAN_ID);
}

/** Affichage d'une limite numérique (`Infinity` → « illimité »). */
export function formatLimit(n: number): string {
  return n === Infinity ? "illimité" : String(n);
}
