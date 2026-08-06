# Projet — Site [NOM_CLIENT]

## Stack
Astro 7 + Tailwind CSS 4 + TypeScript strict. Îlots : Preact (riche) ou
Web Components natifs (léger). Wasm uniquement si justifié dans la spec.

## Commandes
- `npm run dev` — serveur local :4321 (`astro dev --background` pour le lancer en
  arrière-plan ; `astro dev stop`/`status`/`logs` pour le gérer)
- `npm run check` — astro check + tsc + eslint (vert = condition de commit)
- `npm run test` — Vitest (unitaires) ; `npm run test:e2e` — Playwright
- `npm run build && npm run preview` — build de prod

## Règles absolues (blocklist)
1. Jamais `any`. Typage exhaustif. (enforcé par ESLint)
2. Composants fonction uniquement, jamais de classes. (enforcé par ESLint)
3. Jamais de CSS inline ni de <style> ad hoc : Tailwind exclusivement.
   Exception : les design tokens dans le thème (global.css).
4. Un composant = un rôle. Data fetching dans src/lib/ ou le frontmatter
   Astro ; les composants UI reçoivent des props typées, jamais de fetch.
5. Commenter le POURQUOI des choix complexes, jamais le QUOI.
6. Tout bug trouvé devient un test AVANT d'être corrigé. Sans exception.
7. Tout contenu provisoire est marqué [DRAFT]. Un [DRAFT] bloque le ship.

## Architecture
- `src/pages/` — routes (.astro, composition, contenu minimal)
- `src/layouts/` — Layout.astro unique : SEO, OpenGraph, JSON-LD
- `src/components/` — UI pure, props typées
- `src/islands/` — interactif : Preact (.tsx) ou Web Components (.ts)
- `src/lib/` — logique : fetch, transformations, validation zod (testée)
- `src/content/` — textes/données en Markdown/JSON, jamais de texte en dur
- `brand/` — source de vérité identité + tokens. NE JAMAIS inventer une
  couleur, une police, un ton ou un nom : tout vient de brand/.
- `src/config.ts` — expose `SITE_NAME` (lu depuis `brand/tokens.json`).
  Le nom du projet ne se code JAMAIS en dur ailleurs (titres, meta,
  OpenGraph, footer, mentions légales, contenus) : voir `brand/README.md`
  pour les exceptions documentées et la procédure de renommage.
- `tests/` — unitaires (Vitest) et e2e (Playwright). Capital cumulable.
- `DECISIONS.md` — journal des décisions structurantes (format ADR léger).

## Knowledge graph (Graphify)
- Question structurelle (« qu'est-ce qui dépend de X ? », « où ce champ
  est-il transformé ? ») → interroger le graphe (outils MCP Graphify),
  ne pas grepper à l'aveugle.
- Après toute fonctionnalité touchant > 3 fichiers : relancer /graphify .
  et lire GRAPH_REPORT.md (god nodes, connexions inattendues = dette
  architecturale naissante).
- Les arêtes INFERRED ou AMBIGUOUS ne sont pas des faits : vérifier dans
  le code avant de s'y appuyer.

## Workflow obligatoire
1. Lire specs/SPEC.md avant toute fonctionnalité. Spec absente ou
   incomplète → poser la question, ne pas coder.
2. Plan Mode pour toute tâche > 1 fichier.
3. Toute décision structurante (choix de lib, d'architecture, de techno
   d'îlot) → entrée dans DECISIONS.md AVANT l'implémentation.
4. Après chaque fonctionnalité : sous-agent reviewer, puis qa.
5. `npm run check` + `npm run test` verts = condition de commit.

## Definition of Done (par page)
- Lighthouse ≥ 95 (perf, a11y, best practices, SEO) sur build de prod
- Zéro violation axe-core ; responsive vérifié : 375 / 768 / 1440 px
- HTML sémantique, un seul h1, alt sur les images, contrastes AA
- Meta title/description + OpenGraph + JSON-LD renseignés
- Zéro erreur console ; zéro contenu [DRAFT]

## Documentation Astro
Consulter avant toute tâche liée : routing (docs.astro.build/en/guides/routing/),
composants Astro (docs.astro.build/en/basics/astro-components/), îlots de
framework (docs.astro.build/en/guides/framework-components/), content
collections (docs.astro.build/en/guides/content-collections/), styles/Tailwind
(docs.astro.build/en/guides/styling/), i18n (docs.astro.build/en/guides/internationalization/).
