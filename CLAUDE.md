# Projet — Site [NOM_CLIENT]

## Stack
Astro 7 + Tailwind CSS 4 + TypeScript strict. Îlots : Preact (riche) ou
Web Components natifs (léger). Wasm uniquement si justifié dans la spec.

## Commandes
- `npm run dev` — serveur local :4321 (`astro dev --background` pour le lancer en
  arrière-plan ; `astro dev stop`/`status`/`logs` pour le gérer)
- `npm run check` — **enchaîne quatre outils** (`wrangler types` si présent,
  `astro check`, `tsc`, `eslint`). Vert = condition de commit. **Se juge sur
  le code de sortie, jamais sur un extrait de la sortie** : filtrer sur le
  résumé d'un seul outil a déjà fait annoncer la commande verte alors qu'un
  autre sortait 37 erreurs. Et éditer un fichier hors des outils d'édition
  (par script) contourne le hook qui l'aurait signalé tout de suite.
- `npm run test` — Vitest (unitaires)
- `npm run test:e2e` — Playwright + axe-core sous **Chromium** ;
  `npm run test:e2e:webkit` pour Safari. **En e2e, poller la valeur observée,
  jamais d'attente fixe** — et poller la bonne : suivre un `transform` ne
  suffit pas quand c'est l'angle qui compte. Une attente fixe finit toujours
  par échouer en CI, et un test instable finit par être ignoré.
- `npm run build && npm run preview` — build de prod. **Ne jamais lancer un
  build pendant que le serveur de développement tourne** : le cache de
  dépendances Vite en sort corrompu.

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
- `src/config.ts` — expose `SITE_NAME`, `SITE_URL`/`HAS_SITE_URL` et
  `SITE_DESCRIPTION` (lus depuis `brand/tokens.json`). Le nom du projet ne se
  code JAMAIS en dur ailleurs (titres, meta, OpenGraph, footer, mentions
  légales, contenus) : voir `brand/README.md` pour les exceptions
  documentées et la procédure de renommage. Cette convention a payé — un
  renommage de marque a tenu en une session sur agence-site, son seul coût
  venant des tests qui avaient recopié la chaîne au lieu d'importer la
  constante.
- `scripts/` — outils lancés à la main, hors du build Astro. Sorties
  **commitées** : le script n'existe que pour rendre la transformation
  rejouable, jamais pour la refaire à chaque build.
  - `build-media.mjs` — décline images et vidéos aux largeurs de
    `src/lib/media-widths.json`, extrait les affiches, compresse.
    Requiert `npm i -D sharp ffmpeg-static` **par projet** : ces paquets ne
    sont pas dans le starter (`ffmpeg-static` télécharge un binaire à
    l'installation), on ne les paie que si le projet a des médias.
  - `build-og.mjs` — image OpenGraph 1200×630 aux tokens du projet, texte lu
    dans le contenu. Requiert `npm i -D sharp`.
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
- **Une règle écrite ne s'applique pas toute seule.** Sur agence-site, cette
  consigne de reconstruction n'a jamais été suivie de tout le projet : le
  graphe décrivait encore le starter neuf jours plus tard, 83 nœuds dont les
  plus connectés étaient les clés de `package.json`. Un artefact dérivé doit
  porter sa date de construction **et** quelque chose doit la lire — sinon
  personne ne regarde. Prévoir un contrôle de fraîcheur (commit du graphe vs
  commit des fichiers indexés) branché sur `pre-ship`, jamais sur la CI : un
  graphe périmé n'est pas un défaut du site livré.
- **Le graphe brut ne relie pas les décisions au code.** L'AST et
  l'extraction sémantique fabriquent des identifiants sans rapport : mesuré
  sur agence-site, zéro arête entre un `.ts` et un `.md`. Il répond donc à
  « qui appelle cette fonction ? » et à « quelles décisions parlent de X ? »,
  jamais à « quelle décision explique ce code ? ». Le remède est un
  post-traitement qui dérive les ponts des chemins de fichiers déjà cités en
  prose dans les documents — d'où l'intérêt de **toujours citer les chemins
  de fichiers dans `DECISIONS.md`**.

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
