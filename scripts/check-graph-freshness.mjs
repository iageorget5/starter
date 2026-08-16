/**
 * Vérifie que `graphify-out/graph.json` décrit bien le dépôt tel qu'il est.
 * Lancé à la main (`npm run graph:check`) et par la skill `pre-ship`.
 * Voir agence-context/DECISIONS.md (2026-08-15) pour le raisonnement.
 *
 * Le graphe enregistre le commit sur lequel il a été construit
 * (`built_at_commit`) mais rien ne le lisait : il a décrit le starter pendant
 * neuf jours sans qu'aucun signal ne le dise. Ce script est ce signal.
 *
 * `built_at_commit` ne peut PAS servir de test à lui seul : graphify l'écrit
 * avant que le commit qui contient le graphe n'existe, il est donc en retard
 * d'un commit par construction. Le test porte donc sur l'historique — le
 * graphe a-t-il été commité au moins aussi tard que le dernier changement
 * d'un fichier qu'il indexe — et sur l'arbre de travail.
 *
 * Il n'est volontairement PAS branché sur la CI ni sur `npm run check` : un
 * graphe périmé n'est pas un défaut du site livré, et faire échouer un build
 * de production pour cela mettrait la barre au mauvais endroit.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const GRAPHE = path.join(RACINE, "graphify-out/graph.json");
const GRAPHE_REL = "graphify-out/graph.json";

// Ce que le graphe indexe réellement. Un changement hors de ces chemins
// (public/, dist/, .lighthouseci/…) ne le périme pas. `graphify-out/` en est
// évidemment absent : le graphe ne se périme pas lui-même.
const INDEXES = [
  "src",
  "scripts",
  "tests",
  "specs",
  "brand",
  ".claude",
  ".github",
  "docs",
  "CLAUDE.md",
  "DECISIONS.md",
  "README.md",
  "CHANGELOG.md",
  "package.json",
  "astro.config.mjs",
  "tsconfig.json",
  "playwright.config.ts",
  "vitest.config.ts",
  "eslint.config.js",
  "lighthouserc.json",
];

const git = (...args) =>
  execFileSync("git", args, { cwd: RACINE, encoding: "utf8" }).trim();

const echec = (...lignes) => {
  for (const l of lignes) console.error(l);
  console.error("  Reconstruire : /graphify . puis npm run graph:bridges");
  process.exit(1);
};

if (!existsSync(GRAPHE)) {
  echec("✗ graphify-out/graph.json est absent.");
}

const construitSur = JSON.parse(readFileSync(GRAPHE, "utf8")).built_at_commit;

// 1. L'arbre de travail. Des fichiers indexés modifiés et non commités
//    périment le graphe aussi sûrement qu'un commit.
const sales = git("status", "--porcelain", "--", ...INDEXES)
  .split("\n")
  .filter(Boolean);
if (sales.length > 0) {
  echec(
    `✗ Graphe périmé : ${sales.length} fichier(s) indexé(s) modifié(s) et non commité(s).`,
    ...sales.slice(0, 15).map((l) => `    ${l.trim()}`),
    ...(sales.length > 15 ? [`    … et ${sales.length - 15} autres`] : []),
  );
}

// 2. L'historique. On compare le dernier commit ayant touché un fichier
//    indexé au dernier commit ayant touché le graphe lui-même. Le graphe est
//    à jour s'il a été commité au moins aussi tard — même commit inclus, ce
//    qui est le cas normal quand on commite source et graphe ensemble.
const dernierSource = git("log", "-1", "--format=%H", "--", ...INDEXES);
const dernierGraphe = git("log", "-1", "--format=%H", "--", GRAPHE_REL);

if (!dernierGraphe) {
  echec("✗ graphify-out/graph.json n'a jamais été commité.");
}

let aJour = dernierGraphe === dernierSource;
if (!aJour && dernierSource) {
  try {
    // Le graphe est-il commité APRÈS le dernier changement de source ?
    git("merge-base", "--is-ancestor", dernierSource, dernierGraphe);
    aJour = true;
  } catch {
    aJour = false;
  }
}

if (aJour) {
  console.log(
    `✓ Graphe à jour (commité en ${dernierGraphe.slice(0, 7)}, ` +
      `dernière source en ${dernierSource.slice(0, 7)}).`,
  );
  if (construitSur && construitSur !== dernierGraphe) {
    // Attendu, pas une anomalie : graphify date le graphe avant le commit
    // qui le contient. Affiché pour que la valeur ne surprenne personne.
    console.log(`  (built_at_commit : ${construitSur.slice(0, 7)}, en retard par construction)`);
  }
  process.exit(0);
}

const depuis = git("log", "--format=%h %s", `${dernierGraphe}..HEAD`, "--", ...INDEXES)
  .split("\n")
  .filter(Boolean);
echec(
  `✗ Graphe périmé : dernier commit du graphe ${dernierGraphe.slice(0, 7)}, ` +
    `dernière source ${dernierSource.slice(0, 7)}.`,
  ...depuis.slice(0, 15).map((l) => `    ${l}`),
  ...(depuis.length > 15 ? [`    … et ${depuis.length - 15} autres commits`] : []),
);
