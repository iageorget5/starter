/** Noms d'icônes disponibles dans `Icon.astro`.
 *
 * Déclarés ici, et non dans le composant, parce que deux consommateurs en
 * ont besoin sous deux formes : `content.config.ts` veut une valeur à
 * l'exécution (l'énumération Zod qui valide les JSON au build) et
 * `Icon.astro` veut le type. Une liste recopiée aurait laissé passer un
 * `icon` inconnu jusqu'au rendu, où il aurait produit une icône vide.
 */
export const ICON_NAMES = [
  "frame",
  "spark",
  "media",
  "dialogue",
  "pulse",
  "prism",
  "tag",
  "thread",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
