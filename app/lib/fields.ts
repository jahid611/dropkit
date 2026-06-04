// Types de champs que la marque peut demander aux visiteurs.

export const FIELD_TYPES = [
  { type: "text", label: "Texte", help: "Nom, prénom, ville…" },
  { type: "email", label: "Email", help: "Adresse email" },
  { type: "phone", label: "Téléphone", help: "Numéro de téléphone" },
  { type: "size", label: "Taille", help: "XS–XXL, pointures…" },
  { type: "select", label: "Choix", help: "Liste déroulante d'options" },
  { type: "number", label: "Nombre", help: "Quantité, âge…" },
  { type: "date", label: "Date", help: "Une date" },
] as const;

export type FieldType = (typeof FIELD_TYPES)[number]["type"];

export const FIELD_TYPE_SET = new Set<string>(FIELD_TYPES.map((f) => f.type));

export const MAX_FIELDS = 15;

// Champs dont la valeur sert au mailing de fin de drop.
export const ROLE_OPTIONS = [
  { role: "", label: "Aucun rôle" },
  { role: "email", label: "📧 Email de contact" },
  { role: "phone", label: "📱 Téléphone de contact" },
] as const;
