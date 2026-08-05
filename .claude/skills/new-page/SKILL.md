---
name: new-page
description: Créer une nouvelle page du site à partir de specs/SPEC.md.
  À utiliser pour chaque route de la table des pages.
---
# Recette : nouvelle page

1. Lire la ligne correspondante dans specs/SPEC.md (objectif, contenus,
   îlot interactif ?). Ligne absente ou incomplète → poser la question,
   ne pas coder.
2. Composer la page dans `src/pages/` : squelette minimal, composition
   de composants de `src/components/` (props typées, UI pure).
   Le data fetching et la logique vivent dans `src/lib/` ou le
   frontmatter Astro — jamais dans un composant.
3. Contenu depuis `src/content/` (Markdown/JSON), jamais de texte en
   dur dans le composant. Contenu manquant → [DRAFT] (skill
   content-intake), jamais de lorem ipsum.
4. SEO : meta title/description, OpenGraph, JSON-LD via le Layout
   commun — pas de duplication par page.
5. Un seul `<h1>` par page, HTML sémantique, alt sur toutes les images,
   contrastes AA, focus visible.
6. Si la page a besoin d'interactivité : skill `new-island` séparément,
   pas d'îlot improvisé dans la page.
7. Couleurs/typos/ton exclusivement depuis `brand/` — jamais de valeur
   arbitraire.
8. `npm run check` vert, puis sous-agent reviewer, puis sous-agent qa
   (Definition of Done du CLAUDE.md : Lighthouse ≥ 95, zéro violation
   axe-core, responsive 375/768/1440, zéro [DRAFT] restant si la page
   est censée être finale).
9. Commit dédié à la page.
