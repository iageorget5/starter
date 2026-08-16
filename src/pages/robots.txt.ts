import type { APIRoute } from "astro";
import { HAS_SITE_URL, SITE_URL } from "../config";

// Écrit en endpoint plutôt qu'en fichier statique dans `public/` : la ligne
// `Sitemap:` réclame une URL absolue, et elle ne doit apparaître que si le
// domaine est arrêté (`brand/tokens.json` → `site.url`). Un `public/robots.txt`
// figé aurait annoncé un sitemap injoignable.
//
// Pas de dépendance `@astrojs/sitemap` : elle ferait le même travail au prix
// d'un paquet supplémentaire, et elle exige de toute façon `site` dans
// `astro.config`, que ce projet ne peut pas encore renseigner.
export const GET: APIRoute = () => {
  const lignes = [
    "User-agent: *",
    "Allow: /",
    // Les endpoints serveur n'ont rien à faire dans un index : ils ne
    // répondent souvent qu'en POST et n'ont aucun contenu. À retirer si le
    // projet n'expose pas de route sous `/api/`.
    "Disallow: /api/",
  ];
  if (HAS_SITE_URL) {
    lignes.push("", `Sitemap: ${SITE_URL}/sitemap.xml`);
  }
  return new Response(`${lignes.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
