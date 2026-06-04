// Catalogue des 15 fonds de drop — direction "atelier éditorial".
// L'id est stocké sur Drop.backgroundId. Rendu visuel : app/components/Background.tsx.

export type BackgroundCategory =
  | "Minimal"
  | "Dégradé"
  | "Texture"
  | "Éditorial"
  | "Couleur";

export interface BackgroundDef {
  id: string;
  name: string;
  category: BackgroundCategory;
  /** true si le fond est sombre (le texte par-dessus doit passer en clair) */
  dark?: boolean;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: "ivoire", name: "Ivoire", category: "Minimal" },
  { id: "papier", name: "Papier", category: "Texture" },
  { id: "lin", name: "Lin", category: "Texture" },
  { id: "aube", name: "Aube", category: "Dégradé" },
  { id: "sable", name: "Sable", category: "Dégradé" },
  { id: "editorial-split", name: "Éditorial", category: "Éditorial", dark: true },
  { id: "risograph", name: "Risograph", category: "Éditorial" },
  { id: "aquarelle", name: "Aquarelle", category: "Dégradé" },
  { id: "marbre", name: "Marbre", category: "Texture" },
  { id: "studio", name: "Studio", category: "Minimal" },
  { id: "champagne", name: "Champagne", category: "Dégradé" },
  { id: "brume", name: "Brume", category: "Dégradé" },
  { id: "terracotta", name: "Terracotta", category: "Couleur", dark: true },
  { id: "encre", name: "Encre", category: "Minimal", dark: true },
  { id: "argentique", name: "Argentique", category: "Texture" },
];

export const DEFAULT_BACKGROUND = "studio";

export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);

export function getBackground(id: string) {
  return BACKGROUNDS.find((b) => b.id === id);
}

export function isValidBackground(id: string) {
  return BACKGROUND_IDS.includes(id);
}
