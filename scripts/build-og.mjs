/**
 * Génère `public/og-image.png` (1200 × 630), l'image de partage social.
 * Lancé à la main (`npm run build:og`), sortie commitée — même contrat que
 * les autres scripts de `scripts/`.
 *
 * Rendue par Chrome et non composée avec sharp : le texte doit être en Space
 * Grotesk, et faire du texte dans un SVG passé à sharp dépend des polices
 * installées sur la machine — ce qui donne un rendu différent d'un poste à
 * l'autre. Chrome charge les fichiers de `@fontsource` depuis node_modules et
 * garantit le même résultat partout.
 *
 * Le texte n'est pas recopié ici : il est lu dans `accueil.json` et
 * `brand/tokens.json`, comme le reste du site (règle 4). Une image de partage
 * qui contredit la page qu'elle annonce est pire qu'une absence d'image.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import tokens from "../brand/tokens.json" with { type: "json" };
import accueil from "../src/content/pages/accueil.json" with { type: "json" };

const RACINE = path.resolve(import.meta.dirname, "..");
const SORTIE = path.join(RACINE, "public/og-image.png");

// Police en base64 et non en `file://` : le chargement des polices est
// soumis au CORS, y compris depuis une page locale, et Chrome retombait
// silencieusement sur Helvetica — exactement la police que les skills de
// design bannissent. Un `document.fonts.ready` résolu ne prouve rien : il se
// résout aussi quand le chargement a échoué.
const police = (fichier) => {
	const brut = readFileSync(path.join(RACINE, "node_modules", fichier));
	return `data:font/woff2;base64,${brut.toString("base64")}`;
};

const { heroEyebrow, heroSubheading } = accueil.accueil;
const nom = tokens.name;
const primaire = tokens.color.primary.value;
const surface = tokens.color.surface.value;
const encre = tokens.color.ink.value;
const secondaire = tokens.color.secondary.value;
const peche = tokens.color.blobPeche.value;
const corail = tokens.color.blobCorail.value;

// Le grain du site, même bitmap que `.grain` dans global.css.
const GRAIN =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E";

const html = `<!doctype html>
<meta charset="utf-8">
<style>
	@font-face {
		font-family: "Space Grotesk";
		font-weight: 600;
		src: url("${police("@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2")}") format("woff2");
	}
	@font-face {
		font-family: "Manrope";
		font-weight: 500;
		src: url("${police("@fontsource/manrope/files/manrope-latin-500-normal.woff2")}") format("woff2");
	}
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		width: 1200px; height: 630px; overflow: hidden;
		background: ${surface};
		position: relative;
		font-family: "Manrope", sans-serif;
	}
	/* Meme matiere que le hero : un degrade radial irise, attenue par un
	   voile vers la couleur de surface, puis le grain. Sans accent ni
	   backtick : ce bloc vit dans un template literal JS. */
	.blob {
		position: absolute; inset: 0;
		background:
			radial-gradient(circle 420px at 78% 38%,
				color-mix(in oklab, ${peche}, transparent 40%) 0%,
				color-mix(in oklab, ${corail}, transparent 55%) 32%,
				color-mix(in oklab, ${primaire}, transparent 68%) 62%,
				transparent 82%);
	}
	.voile {
		position: absolute; inset: 0;
		background: linear-gradient(90deg, ${surface} 4%, color-mix(in oklab, ${surface}, transparent 25%) 48%, transparent 78%);
	}
	.grain { position: absolute; inset: 0; background-image: url("${GRAIN}"); opacity: 0.045; }
	.contenu { position: relative; padding: 84px 96px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
	.marque { font-family: "Space Grotesk", sans-serif; font-weight: 600; font-size: 28px; color: ${encre}; letter-spacing: -0.01em; margin-bottom: auto; }
	.surtitre { font-size: 19px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: ${secondaire}; margin-bottom: 26px; }
	h1 {
		font-family: "Space Grotesk", sans-serif; font-weight: 600;
		font-size: 76px; line-height: 0.98; letter-spacing: -0.03em;
		color: ${encre}; max-width: 15ch;
	}
	p { margin-top: 26px; font-size: 24px; line-height: 1.45; color: color-mix(in oklab, ${encre}, ${surface} 25%); max-width: 46ch; }
	.trait { width: 76px; height: 3px; background: ${primaire}; margin-top: 34px; border-radius: 999px; }
</style>
<body>
	<div class="blob"></div>
	<div class="voile"></div>
	<div class="grain"></div>
	<div class="contenu">
		<div class="marque">${nom}</div>
		<div class="surtitre">${heroEyebrow}</div>
		<h1>Rayonnez auprès de vos clients.</h1>
		<p>${heroSubheading}</p>
		<div class="trait"></div>
	</div>
</body>`;

const navigateur = await chromium.launch();
const page = await navigateur.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
// Contrôle explicite : sans lui, une police non chargée passe inaperçue et
// l'image partirait en Helvetica.
const policesChargees = await page.evaluate(() => ({
	titre: document.fonts.check('600 76px "Space Grotesk"'),
	corps: document.fonts.check('500 24px "Manrope"'),
}));
if (!policesChargees.titre || !policesChargees.corps) {
	throw new Error(
		`Polices non chargées (titre: ${String(policesChargees.titre)}, corps: ${String(policesChargees.corps)}) — l'image serait rendue dans une police de repli.`,
	);
}
mkdirSync(path.dirname(SORTIE), { recursive: true });
// La capture brute pèse ~550 ko pour un aplat et un dégradé. Repassée par
// sharp en palette réduite, elle tombe sous 100 ko sans différence visible :
// une image de partage est téléchargée par chaque aperçu de lien.
const brut = await page.screenshot();
await navigateur.close();
await sharp(brut).png({ quality: 90, compressionLevel: 9, palette: true }).toFile(SORTIE);

console.log(
	`public/og-image.png — 1200x630, ${String(Math.round(statSync(SORTIE).size / 1024))} ko`,
);
