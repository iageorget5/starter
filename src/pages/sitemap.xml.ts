import type { APIRoute } from "astro";
import { HAS_SITE_URL, SITE_URL } from "../config";

// Les chemins publics du site, écrits une seule fois. La 404 en est
// volontairement absente : un plan de site n'a pas à proposer une page
// d'erreur à l'indexation.
// À compléter au fil des routes créées.
const CHEMINS = ["/"];

/**
 * Le protocole sitemap exige des URL **absolues**. Tant que le domaine n'est
 * pas arrêté, le plan sort donc vide plutôt que rempli d'adresses
 * `localhost` : un sitemap faux est plus nuisible qu'un sitemap absent, il
 * fait indexer des URL injoignables.
 */
export const GET: APIRoute = () => {
  const entrees = HAS_SITE_URL
    ? CHEMINS.map(
        (chemin) => `\t<url>\n\t\t<loc>${SITE_URL}${chemin}</loc>\n\t</url>`,
      ).join("\n")
    : "\t<!-- brand/tokens.json → site.url est vide : aucune URL absolue ne peut être produite. -->";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entrees}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
