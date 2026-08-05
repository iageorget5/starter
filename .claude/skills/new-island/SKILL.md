---
name: new-island
description: Créer un îlot interactif en respectant la hiérarchie des
  technos (CSS → Web Component → Preact → Wasm). À utiliser pour toute
  fonctionnalité nécessitant du JavaScript côté client.
---
# Recette : nouvel îlot

1. Vérifier dans specs/SPEC.md que l'interactivité est justifiée
   (comportement attendu, cas limites, états vide/chargement/erreur).
   Pas de justification écrite → poser la question, ne pas coder.
2. Choisir le niveau le plus bas qui suffit, dans l'ordre :
   1. CSS seul / éléments natifs (`<details>`, `<dialog>`) → zéro JS.
   2. Web Component natif dans un `.astro` → micro-interaction sans
      état partagé. Fichier `.ts` dans `src/islands/`.
   3. Preact (état riche : formulaires complexes, panier, filtres).
      Composant fonction `.tsx` dans `src/islands/`, jamais de classe.
   4. WebAssembly → uniquement si calcul client lourd justifié dans la
      spec (image, 3D, recherche client) et que TypeScript ne tient
      pas en < 16 ms. Module Rust + wasm-pack, chargé lazy dans l'îlot.
   Ne jamais sauter un niveau sans justification écrite dans
   DECISIONS.md.
3. Props typées, jamais de `any`. Validation des entrées (formulaires,
   API) avec `zod`.
4. Couvrir explicitement les états : vide, chargement, erreur, succès.
5. Jamais de style inline : classes Tailwind, tokens de `brand/`.
6. Formulaires exposés publiquement : protection anti-spam (honeypot +
   Turnstile), voir skill pre-ship pour la vérification finale.
7. Choix de techno d'îlot = décision structurante → entrée dans
   DECISIONS.md avant l'implémentation.
8. `npm run check` vert, puis sous-agent reviewer, puis sous-agent qa
   (qui écrit la spec Playwright manquante couvrant le parcours de
   l'îlot si elle n'existe pas encore).
9. Commit dédié à l'îlot.
