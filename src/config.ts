import tokens from "../brand/tokens.json";

// Source unique de vérité du nom du projet : brand/tokens.json → ce module.
// Ne jamais coder le nom en dur ailleurs (voir brand/README.md).
export const SITE_NAME: string = tokens.name;

// URL publique du site (brand/tokens.json → site.url). Vide tant que le
// domaine n'est pas arrêté.
//
// Rien d'absolu ne doit être publié avant qu'elle soit renseignée : sans
// `site` dans `astro.config`, Astro grave `http://localhost:4321` dans les
// balises `canonical` et `og:url` du build de PRODUCTION, et aucun audit ne
// le signale — Lighthouse note qu'une balise existe, pas qu'elle dit vrai.
// Une canonique erronée demande aux moteurs d'indexer une adresse
// injoignable : mieux vaut omettre la balise que la publier fausse.
// Voir agence-context/DECISIONS.md (2026-08-15).
export const SITE_URL: string = tokens.site.url;
export const HAS_SITE_URL: boolean = SITE_URL.length > 0;

// Description fixe de l'organisation (brand/tokens.json → site.description).
// Volontairement identique sur toutes les pages : si elle sert dans un
// JSON-LD inline, une description qui varie par page change le hash de ce
// script, donc oblige à autant de hashes CSP qu'il y a de pages.
export const SITE_DESCRIPTION: string = tokens.site.description;
