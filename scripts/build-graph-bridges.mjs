/**
 * Enrichit `graphify-out/graph.json` après une reconstruction du graphe.
 * Lancé à la main (`npm run graph:bridges`), sortie commitée — même contrat
 * que les autres scripts de `scripts/`.
 * Voir agence-context/DECISIONS.md (2026-08-15) pour le raisonnement.
 *
 * Deux manques que graphify ne peut pas combler seul :
 *
 * 1. `brand/tokens.json` est exclu du corpus par le filtre « fichier
 *    sensible » (le radical `tokens` est un mot-clé porteur, et `.json` n'est
 *    pas exempté). Quatre arêtes de l'AST pointaient donc dans le vide. Le
 *    nœud est recréé ici avec ses clés racine — jamais ses valeurs : le
 *    graphe porte la structure de la charte, pas son contenu.
 *
 * 2. Le code et les documents formaient deux mondes disjoints : zéro arête
 *    entre un `.ts`/`.astro`/`.mjs` et un `.md`, parce que l'AST et
 *    l'extraction sémantique fabriquent des identifiants sans rapport. Les
 *    ponts sont dérivés des chemins de fichiers DÉJÀ cités en prose dans les
 *    documents, ce qui couvre l'existant au lieu des seules entrées futures.
 *
 * Une mention n'est pas une preuve, d'où deux niveaux de confiance : un
 * chemin complet est EXTRACTED, un nom de fichier seul est INFERRED. Un nom
 * porté par plusieurs fichiers du dépôt est ignoré plutôt que deviné.
 *
 * Le script est idempotent : il purge ses propres ajouts (`_origin: "bridge"`)
 * avant de les recalculer.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const GRAPHE = path.join(RACINE, "graphify-out/graph.json");
const TOKENS = path.join(RACINE, "brand/tokens.json");

// Marqueur porté par tout ce que ce script ajoute, pour pouvoir le retirer
// au run suivant sans toucher à ce que graphify a produit.
const ORIGINE = "bridge";

// Extensions cherchées dans la prose. Volontairement restreint aux formats
// que l'AST indexe : citer `public/og-image.png` ne doit pas créer d'arête
// vers un nœud qui n'existe pas.
const EXTENSIONS = "ts|tsx|astro|mjs|js|cjs|css|json|yml|yaml|sh";
const MENTION = new RegExp(String.raw`[\w@./-]*[\w.-]+\.(?:${EXTENSIONS})\b`, "g");

// Fenêtre maximale d'une section documentaire, quand aucun titre ne vient la
// fermer. Au-delà, on citerait des fichiers qui appartiennent à la section
// suivante.
const LIGNES_MAX = 60;

function lireGraphe() {
  if (!existsSync(GRAPHE)) {
    console.error(
      "graphify-out/graph.json est absent — reconstruire le graphe avant (/graphify .).",
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(GRAPHE, "utf8"));
}

/**
 * Transforme un titre Markdown en ancre, comme le fait un générateur de doc.
 * @param {string} titre
 * @returns {string}
 */
function ancre(titre) {
  return titre
    .toLowerCase()
    // Pas de dépliage des accents : le filtre suivant remplace déjà tout ce
    // qui n'est pas [a-z0-9] par un tiret, diacritiques compris.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Retrouve la section d'origine d'un nœud documentaire.
 * `source_location` vaut soit `L823`, soit `SPEC.md#un-titre`. Tout autre
 * format est ignoré : mieux vaut aucun pont qu'un pont pris au hasard.
 * @param {string[]} lignes
 * @param {string | null | undefined} localisation
 * @param {string | null | undefined} libelle
 * @returns {string | null}
 */
function section(lignes, localisation, libelle) {
  let debut = -1;
  const parLigne = localisation ? /^L(\d+)$/.exec(localisation) : null;
  if (parLigne) {
    debut = Number(parLigne[1]) - 1;
  } else if (localisation && localisation.includes("#")) {
    const cible = ancre(localisation.slice(localisation.indexOf("#") + 1));
    if (cible) {
      debut = lignes.findIndex((l) => {
        const titre = /^#{1,6}\s+(.*)$/.exec(l);
        return titre ? ancre(titre[1]).includes(cible) : false;
      });
    }
  }

  // Repli : la moitié des nœuds n'ont qu'un nom de fichier pour localisation.
  // Leur libellé, lui, est souvent repris tel quel dans le document. On ne
  // s'en sert que s'il n'apparaît QU'UNE fois — deux occurrences et on ne
  // saurait pas laquelle est la bonne.
  if (debut < 0 && libelle && libelle.length >= 8) {
    const aiguille = ancre(libelle).slice(0, 48);
    if (aiguille.length >= 8) {
      const trouves = [];
      for (let i = 0; i < lignes.length; i += 1) {
        if (ancre(lignes[i]).includes(aiguille)) trouves.push(i);
        if (trouves.length > 1) break;
      }
      if (trouves.length === 1) debut = trouves[0];
    }
  }

  if (debut < 0 || debut >= lignes.length) return null;

  let fin = Math.min(debut + LIGNES_MAX, lignes.length);
  for (let i = debut + 1; i < fin; i += 1) {
    if (/^#{1,6}\s/.test(lignes[i])) {
      fin = i;
      break;
    }
  }
  return lignes.slice(debut, fin).join("\n");
}

const graphe = lireGraphe();

// --- Purge des ajouts du run précédent -------------------------------------
const avantNoeuds = graphe.nodes.length;
const avantLiens = graphe.links.length;
graphe.nodes = graphe.nodes.filter((n) => n._origin !== ORIGINE);
graphe.links = graphe.links.filter((l) => l._origin !== ORIGINE);
const purges = avantNoeuds - graphe.nodes.length + (avantLiens - graphe.links.length);

// --- 1. Réinjection de brand/tokens.json ------------------------------------
const idsExistants = new Set(graphe.nodes.map((n) => n.id));
let communauteCharte = null;
let noeudsCharte = 0;

if (existsSync(TOKENS)) {
  // Une communauté dédiée : ces nœuds n'ont pas été clusterisés avec les
  // autres, puisqu'ils n'existaient pas au moment du clustering.
  communauteCharte =
    Math.max(0, ...graphe.nodes.map((n) => n.community ?? 0)) + 1;
  const NOM_COMMUNAUTE = "Charte de marque (tokens)";
  const tokens = JSON.parse(readFileSync(TOKENS, "utf8"));

  const ajouter = (id, label) => {
    if (idsExistants.has(id)) return false;
    graphe.nodes.push({
      id,
      label,
      file_type: "code",
      source_file: "brand/tokens.json",
      source_location: "L1",
      community: communauteCharte,
      community_name: NOM_COMMUNAUTE,
      norm_label: label.toLowerCase(),
      _origin: ORIGINE,
    });
    idsExistants.add(id);
    noeudsCharte += 1;
    return true;
  };

  // `brand_tokens` est l'identifiant que l'AST aurait produit : le recréer
  // résout du même coup les arêtes qui pointaient dans le vide.
  ajouter("brand_tokens", "tokens.json");
  for (const cle of Object.keys(tokens)) {
    const id = `brand_tokens_${cle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    // Seule la CLÉ est écrite. La valeur reste dans le fichier.
    if (ajouter(id, cle)) {
      graphe.links.push({
        source: "brand_tokens",
        target: id,
        relation: "contains",
        confidence: "EXTRACTED",
        confidence_score: 1.0,
        source_file: "brand/tokens.json",
        source_location: "L1",
        weight: 1.0,
        _origin: ORIGINE,
      });
    }
  }
}

// --- 2. Ponts entre les documents et le code --------------------------------

// Nœuds « fichier » : ceux dont le libellé est exactement le nom du fichier.
const parChemin = new Map();
const parNom = new Map();
for (const n of graphe.nodes) {
  const src = n.source_file;
  if (!src) continue;
  if (n.label !== path.basename(src)) continue;
  if (!new RegExp(`\\.(?:${EXTENSIONS})$`).test(src)) continue;
  if (!parChemin.has(src)) parChemin.set(src, n.id);
  const nom = path.basename(src);
  if (!parNom.has(nom)) parNom.set(nom, []);
  parNom.get(nom).push(n.id);
}

// --- 1 bis. Les importateurs réels de la charte -----------------------------
// Les arêtes que l'AST avait produites vers `brand/tokens.json` ont été
// supprimées à la construction, leur cible étant alors absente. Sans elles le
// nœud n'est relié qu'aux documents, ce qui laisserait croire que la charte
// n'est lue par aucun code. Seul un vrai `import` compte : les nombreuses
// mentions en commentaire (global.css, Layout.astro…) ne sont pas des liens.
let importateurs = 0;
if (idsExistants.has("brand_tokens")) {
  for (const [chemin, id] of parChemin) {
    if (chemin === "brand/tokens.json") continue;
    const absolu = path.join(RACINE, chemin);
    if (!existsSync(absolu)) continue;
    const source = readFileSync(absolu, "utf8");
    if (!/^\s*import\b[^\n]*brand\/tokens\.json/m.test(source)) continue;
    graphe.links.push({
      source: id,
      target: "brand_tokens",
      relation: "imports",
      confidence: "EXTRACTED",
      confidence_score: 1.0,
      source_file: chemin,
      source_location: "L1",
      weight: 1.0,
      _origin: ORIGINE,
    });
    importateurs += 1;
  }
}

const contenus = new Map();
const lire = (fichier) => {
  if (!contenus.has(fichier)) {
    const chemin = path.join(RACINE, fichier);
    contenus.set(
      fichier,
      existsSync(chemin) ? readFileSync(chemin, "utf8").split("\n") : null,
    );
  }
  return contenus.get(fichier);
};

const dejaLies = new Set(
  graphe.links.map((l) => `${l.source} ${l.target}`),
);
let pontsExacts = 0;
let pontsDeduits = 0;
let sansSection = 0;

for (const n of graphe.nodes) {
  const src = n.source_file;
  if (!src || !src.endsWith(".md")) continue;
  const lignes = lire(src);
  if (!lignes) continue;

  const texte = section(lignes, n.source_location, n.label);
  if (texte === null) {
    sansSection += 1;
    continue;
  }

  for (const brut of texte.match(MENTION) ?? []) {
    const mention = brut.replace(/^\.\//, "");
    let cible = null;
    let confiance = null;

    if (parChemin.has(mention)) {
      cible = parChemin.get(mention);
      confiance = ["EXTRACTED", 1.0];
    } else {
      const candidats = parNom.get(path.basename(mention));
      // Un nom porté par plusieurs fichiers est ignoré : deviner lequel
      // fabriquerait une arête fausse, ce que les règles d'honnêteté du
      // graphe interdisent.
      if (candidats && candidats.length === 1) {
        cible = candidats[0];
        confiance = ["INFERRED", 0.85];
      }
    }
    if (!cible || cible === n.id) continue;

    const cle = `${n.id} ${cible}`;
    if (dejaLies.has(cle)) continue;
    dejaLies.add(cle);

    graphe.links.push({
      source: n.id,
      target: cible,
      relation: "references",
      confidence: confiance[0],
      confidence_score: confiance[1],
      source_file: src,
      source_location: n.source_location ?? null,
      weight: 1.0,
      _origin: ORIGINE,
    });
    if (confiance[0] === "EXTRACTED") pontsExacts += 1;
    else pontsDeduits += 1;
  }
}

writeFileSync(GRAPHE, JSON.stringify(graphe, null, 2), "utf8");

// `GRAPH_REPORT.md` est produit par graphify AVANT ce script : ses totaux
// décriraient donc un graphe qui n'existe plus. On y ajoute un bloc daté,
// délimité pour rester remplaçable au run suivant.
const RAPPORT = path.join(RACINE, "graphify-out/GRAPH_REPORT.md");
if (existsSync(RAPPORT)) {
  const MARQUEUR = "<!-- graph-bridges -->";
  const bloc = [
    MARQUEUR,
    "",
    "## Post-traitement (`npm run graph:bridges`)",
    "",
    "Les totaux ci-dessus décrivent le graphe **avant** ce post-traitement.",
    "Après :",
    "",
    `- ${graphe.nodes.length} nœuds · ${graphe.links.length} arêtes`,
    `- Charte de marque réinjectée : ${noeudsCharte} nœuds, ${importateurs} importateurs`,
    `- Ponts document → code : ${pontsExacts} exacts, ${pontsDeduits} déduits`,
    `- Limite connue : ${sansSection} nœuds documentaires n'ont pas de section`,
    "  localisable (ni ligne, ni ancre, ni libellé unique) et ne sont donc",
    "  reliés à aucun fichier.",
    "",
    "Voir DECISIONS.md (2026-08-16).",
  ].join("\n");
  const actuel = readFileSync(RAPPORT, "utf8");
  const base = actuel.includes(MARQUEUR)
    ? actuel.slice(0, actuel.indexOf(MARQUEUR))
    : `${actuel.trimEnd()}\n\n`;
  writeFileSync(RAPPORT, `${base}${bloc}\n`, "utf8");
}

console.log(`Ajouts du run précédent purgés : ${purges}`);
console.log(`Charte de marque réinjectée   : ${noeudsCharte} nœuds, ${importateurs} importateurs`);
console.log(`Ponts document → code         : ${pontsExacts} exacts (chemin complet)`);
console.log(`                                ${pontsDeduits} déduits (nom de fichier seul)`);
console.log(`Nœuds documentaires sans section exploitable : ${sansSection}`);
console.log(`Graphe : ${graphe.nodes.length} nœuds, ${graphe.links.length} arêtes`);
