# Changelog — starter

## v1.1.0 — 2026-08-16
Remontées de la rétrospective d'**agence-site**, premier projet réel bâti sur
ce starter (voir `agence-context/LEARNINGS.md` et `DECISIONS.md` du 2026-08-15
pour le détail et les mesures).

**Infrastructure web, systématiquement oubliée jusqu'ici**
- `src/pages/sitemap.xml.ts` et `robots.txt.ts` en endpoints, sans
  dépendance : les URL absolues qu'ils exigent ne doivent apparaître que si
  le domaine est connu.
- `src/config.ts` expose `SITE_URL`/`HAS_SITE_URL` et `SITE_DESCRIPTION` ;
  `brand/tokens.json` gagne la clé `site`. Sans domaine renseigné, Astro
  grave `http://localhost:4321` dans les canoniques du build de production et
  aucun audit ne le signale.
- `lighthouserc.json` versionné : seuils par page et **URL énumérées** —
  `lhci` plafonne à 5 URL en découverte automatique et tronque en silence.
  La CI se réduit à `lhci autorun`.

**Deux moteurs de navigateur**
- Projet `webkit` dans `playwright.config.ts`, `test:e2e` fixé à Chromium,
  `test:e2e:webkit` ajouté, et un job CI **séparé** (deux suites contre la
  même preview épuisent un runner partagé).

**Garde-fous génériques**
- `[hidden] { display: none !important }` dans `global.css` : la règle du
  navigateur perd contre toute classe d'auteur posant un `display`, et
  Tailwind émet ses utilitaires par ordre alphabétique.
- `tests/e2e/design-system.spec.ts` : débordement horizontal aux quatre
  largeurs, `aria-current`, et vérification de la normalisation `hidden`.

**Composants et outils réutilisables**
- `src/components/MediaFigure.astro` + `src/lib/media-widths.json` : largeurs
  lues **à la fois** par le composant et par le script, et `poster` pointé sur
  la plus grande variante (`<video poster>` n'a pas de `srcset`).
- `src/components/Icon.astro` + `src/lib/icons.ts` : pictogrammes maison,
  énumération validée par Zod — évite d'ajouter une librairie d'icônes.
- `scripts/build-media.mjs` et `scripts/build-og.mjs`, avec leurs
  dépendances laissées **optionnelles par projet** (`sharp`,
  `ffmpeg-static`) : le starter reste léger.

**Doctrine**
- `CLAUDE.md` : `npm run check` enchaîne quatre outils et se juge sur le code
  de sortie ; en e2e poller la valeur observée, jamais d'attente fixe ; ne
  jamais builder pendant que le serveur de développement tourne ; le graphe
  doit être contrôlé en fraîcheur et ses ponts document↔code reconstruits.
- `pre-ship` : accessibilité des médias (alt regardés, sous-titres WCAG
  1.2.2, format annoncé = fichier réel) et contrôle du graphe. Chaque point
  produit une case cochée ou un arbitrage écrit, jamais un silence.
- `content-intake` : prérequis de cadrage **statut juridique / SIRET /
  domaine**, à vérifier avant toute rédaction.
- `eslint.config.js` : règles typées désactivées sur `scripts/**` (JS pur,
  paquets sans déclarations) avec les globales Node déclarées.

## v1.0.0 — 2026-08-05
- Mise en place initiale de l'architecture agentique (GUIDE-ARCHITECTURE-AGENTIQUE-v2.md,
  Phase 2) : Astro 7 + Tailwind 4 + Preact + TypeScript strict, ESLint blocklist,
  hooks `check-file.sh`, 2 sous-agents (reviewer, qa), 5 skills (new-page, new-island,
  pre-ship, content-intake, retro), CI GitHub Actions, gabarits brand/specs/DECISIONS.
