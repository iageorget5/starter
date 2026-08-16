/**
 * Génère les médias servis par le site depuis `brand/media-source/`.
 * Lancé à la main (`npm run build:media`), hors du build Astro, sorties
 * commitées — même contrat que `build-logo.mjs` et `build-owl-trace.mjs`.
 *
 * Pourquoi ce script existe : sous l'adaptateur Cloudflare, `astro:assets`
 * n'optimise pas au build et recopie l'original entier dans le bucket
 * client (110 ko livrés pour un logo affiché à 56 px, vérifié en Session 5
 * — DECISIONS.md du 2026-08-09). Les images sont donc pré-générées aux
 * tailles d'affichage réelles, relevées au navigateur.
 *
 * Les affiches de vidéo sont extraites avec Chrome via Playwright, et non
 * avec ffmpeg : ffmpeg n'est pas installé, alors que Chrome sait décoder du
 * H.264 et peindre une image sur un canvas. Deux détails l'ont rendu
 * nécessaire, tous deux trouvés à l'usage : le Chromium fourni par
 * Playwright n'embarque pas les codecs propriétaires (d'où `channel:
 * "chrome"`), et un `<video>` refuse une source `file://` depuis une page
 * `about:blank` — d'où le petit serveur HTTP, qui doit répondre aux
 * requêtes par plage sous peine de faire échouer le décodage.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
import { createServer } from "node:http";
import {
	createReadStream,
	mkdirSync,
	readdirSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import sharp from "sharp";
// Largeurs partagées avec MediaFigure.astro : voir le champ `_note` du JSON.
import LARGEURS_PARTAGEES from "../src/lib/media-widths.json" with { type: "json" };

const RACINE = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(RACINE, "brand/media-source");
const SORTIE_IMAGES = path.join(RACINE, "public/images");
const SORTIE_VIDEOS = path.join(RACINE, "public/videos");

const LARGEURS = {
	realisations: LARGEURS_PARTAGEES.wide,
	medias: LARGEURS_PARTAGEES.card,
};

const QUALITE_WEBP = 78;

/**
 * Facteur de qualité H.264. 27 est un compromis mesuré sur ces quatre
 * fichiers : les sources sortent à ~3,7 Mbit/s pour des vidéos affichées au
 * plus à 683 px de large, soit un débit sans rapport avec l'usage. À 27, la
 * réduction est d'un facteur 5 à 8 sans différence visible à cette taille.
 * Plus bas (23) le gain s'évapore, plus haut (32) les aplats du fond bleu du
 * reel produit se mettent à baver.
 */
const CRF = 27;

/** Une vidéo porte-t-elle une piste audio ? */
function aDeLAudio(fichier) {
	// `ffmpeg -i` écrit la description des flux sur stderr et sort en erreur
	// faute de sortie demandée : c'est le comportement attendu, pas un échec.
	// ffprobe n'est pas livré par `ffmpeg-static`, d'où cette lecture.
	try {
		execFileSync(ffmpeg, ["-hide_banner", "-i", fichier], {
			stdio: ["ignore", "ignore", "pipe"],
		});
		return false;
	} catch (erreur) {
		return /Stream #\d+:\d+.*: Audio:/.test(String(erreur.stderr ?? ""));
	}
}

/**
 * Recompresse une vidéo pour le web.
 * `+faststart` déplace l'index en tête du fichier : sans lui, un navigateur
 * doit télécharger la fin avant de pouvoir commencer la lecture, ce qui ruine
 * l'intérêt du préchargement.
 */
function compresser(source, destination) {
	const audio = aDeLAudio(source)
		? ["-c:a", "aac", "-b:a", "128k"]
		: // Pas de piste audio à conserver : `-an` évite d'en fabriquer une
			// vide, que certains lecteurs annoncent comme du son coupé.
			["-an"];
	execFileSync(
		ffmpeg,
		[
			"-hide_banner",
			"-loglevel", "error",
			"-y",
			"-i", source,
			"-c:v", "libx264",
			"-crf", String(CRF),
			"-preset", "slow",
			"-pix_fmt", "yuv420p",
			"-movflags", "+faststart",
			...audio,
			destination,
		],
		{ stdio: ["ignore", "ignore", "inherit"] },
	);
	return audio[0] === "-an" ? "muette" : "avec audio";
}

/** @param {string} dossier */
const lister = (dossier, ext) =>
	readdirSync(path.join(SOURCE, dossier))
		.filter((nom) => ext.some((e) => nom.toLowerCase().endsWith(e)))
		.sort();

const ko = (fichier) => Math.round(statSync(fichier).size / 1024);

/** Sert `brand/media-source/medias` en HTTP, avec support des plages. */
function servirMedias() {
	const dossier = path.join(SOURCE, "medias");
	const serveur = createServer((req, res) => {
		if (!req.url || req.url === "/") {
			res.writeHead(200, { "Content-Type": "text/html" });
			res.end("<!doctype html><meta charset=utf-8><body>");
			return;
		}
		const fichier = path.join(dossier, decodeURIComponent(req.url.slice(1)));
		let stat;
		try {
			stat = statSync(fichier);
		} catch {
			res.writeHead(404);
			res.end();
			return;
		}
		const plage = req.headers.range;
		if (plage) {
			const trouve = /bytes=(\d+)-(\d*)/.exec(plage);
			const debut = Number(trouve?.[1] ?? 0);
			const fin = trouve?.[2] ? Number(trouve[2]) : stat.size - 1;
			res.writeHead(206, {
				"Content-Type": "video/mp4",
				"Accept-Ranges": "bytes",
				"Content-Range": `bytes ${debut}-${fin}/${stat.size}`,
				"Content-Length": fin - debut + 1,
			});
			createReadStream(fichier, { start: debut, end: fin }).pipe(res);
			return;
		}
		res.writeHead(200, {
			"Content-Type": "video/mp4",
			"Accept-Ranges": "bytes",
			"Content-Length": stat.size,
		});
		createReadStream(fichier).pipe(res);
	});
	return new Promise((resoudre) => {
		serveur.listen(0, () => {
			const adresse = serveur.address();
			resoudre({
				serveur,
				port: typeof adresse === "object" && adresse ? adresse.port : 0,
			});
		});
	});
}

/** Décline une image source en WebP aux largeurs demandées. */
async function declinerImage(source, base, sousDossier, largeurs) {
	mkdirSync(path.join(SORTIE_IMAGES, sousDossier), { recursive: true });
	const meta = await sharp(source).metadata();
	const sorties = [];
	for (const largeur of largeurs) {
		const nom = `${base}-${String(largeur)}.webp`;
		const chemin = path.join(SORTIE_IMAGES, sousDossier, nom);
		await sharp(source)
			.resize({ width: largeur, withoutEnlargement: true })
			.webp({ quality: QUALITE_WEBP })
			.toFile(chemin);
		sorties.push({ nom, chemin, largeur });
	}
	return { meta, sorties };
}

const lignes = [];

// ---------------------------------------------------------------- captures
for (const nom of lister("realisations", [".png", ".jpg", ".jpeg", ".webp"])) {
	const source = path.join(SOURCE, "realisations", nom);
	const base = nom.replace(/\.[^.]+$/, "");
	const { meta, sorties } = await declinerImage(
		source,
		base,
		"realisations",
		LARGEURS.realisations,
	);
	for (const s of sorties) {
		lignes.push({
			source: nom,
			sortie: `images/realisations/${s.nom}`,
			dimensions: `${String(s.largeur)}x${String(
				Math.round((s.largeur * (meta.height ?? 1)) / (meta.width ?? 1)),
			)}`,
			poids: `${String(ko(s.chemin))} ko`,
		});
	}
}

// ------------------------------------------------------- images de médias
for (const nom of lister("medias", [".png", ".jpg", ".jpeg", ".webp"])) {
	const source = path.join(SOURCE, "medias", nom);
	const base = nom.replace(/\.[^.]+$/, "");
	const { meta, sorties } = await declinerImage(
		source,
		base,
		"medias",
		LARGEURS.medias,
	);
	for (const s of sorties) {
		lignes.push({
			source: nom,
			sortie: `images/medias/${s.nom}`,
			dimensions: `${String(s.largeur)}x${String(
				Math.round((s.largeur * (meta.height ?? 1)) / (meta.width ?? 1)),
			)}`,
			poids: `${String(ko(s.chemin))} ko`,
		});
	}
}

// ------------------------------------------ vidéos : copie + affiche fixe
const videos = lister("medias", [".mp4"]);
if (videos.length > 0) {
	mkdirSync(SORTIE_VIDEOS, { recursive: true });
	const { serveur, port } = await servirMedias();
	const navigateur = await chromium.launch({ channel: "chrome" });
	const page = await navigateur.newPage();
	await page.goto(`http://localhost:${String(port)}/`);

	for (const nom of videos) {
		const source = path.join(SOURCE, "medias", nom);
		const base = nom.replace(/\.[^.]+$/, "");

		// Recompression (2026-08-12, `ffmpeg-static` ajouté en dépendance de
		// développement). Les sources étaient servies telles quelles faute de
		// ffmpeg, soit 17 Mo au total : acceptable en `preload="none"`, mais
		// incompatible avec le préchargement complet demandé, qui ferait payer
		// ce volume à tout visiteur qui fait défiler la page.
		const destination = path.join(SORTIE_VIDEOS, nom);
		const piste = compresser(source, destination);

		const capture = await page.evaluate(async (src) => {
			const video = document.createElement("video");
			video.src = src;
			video.muted = true;
			video.preload = "auto";
			document.body.append(video);
			await new Promise((resoudre, rejeter) => {
				video.onloadedmetadata = () => resoudre(undefined);
				video.onerror = () =>
					rejeter(new Error(`décodage impossible (code ${String(video.error?.code)})`));
				setTimeout(() => rejeter(new Error("délai dépassé")), 20000);
			});
			// 12 % de la durée : la première image est souvent noire ou en
			// cours de fondu, et une affiche noire ne dit rien du contenu.
			video.currentTime = Math.max(0.1, video.duration * 0.12);
			await new Promise((resoudre, rejeter) => {
				video.onseeked = () => resoudre(undefined);
				setTimeout(() => rejeter(new Error("recherche d'image dépassée")), 20000);
			});
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("canvas 2d indisponible");
			ctx.drawImage(video, 0, 0);
			return {
				width: video.videoWidth,
				height: video.videoHeight,
				duree: video.duration,
				data: canvas.toDataURL("image/png"),
			};
		}, `http://localhost:${String(port)}/${encodeURIComponent(nom)}`);

		const brut = Buffer.from(capture.data.split(",")[1] ?? "", "base64");
		const tampon = path.join(SORTIE_IMAGES, "medias", `${base}-poster-source.png`);
		mkdirSync(path.join(SORTIE_IMAGES, "medias"), { recursive: true });
		writeFileSync(tampon, brut);
		const { sorties } = await declinerImage(
			tampon,
			`${base}-poster`,
			"medias",
			LARGEURS.medias,
		);
		// Le PNG intermédiaire n'a pas à être servi ni commité.
		const { rmSync } = await import("node:fs");
		rmSync(tampon);

		const avant = ko(source);
		const apres = ko(destination);
		lignes.push({
			source: nom,
			sortie: `videos/${nom}`,
			dimensions: `${String(capture.width)}x${String(capture.height)} (${capture.duree.toFixed(1)}s, ${piste})`,
			poids: `${String(avant)} → ${String(apres)} ko (−${String(Math.round((1 - apres / avant) * 100))} %)`,
		});
		for (const s of sorties) {
			lignes.push({
				source: nom,
				sortie: `images/medias/${s.nom}`,
				dimensions: `affiche ${String(s.largeur)}px`,
				poids: `${String(ko(s.chemin))} ko`,
			});
		}
	}

	await navigateur.close();
	serveur.close();
}

console.table(lignes);
const poidsVideos = videos.reduce(
	(total, nom) => total + statSync(path.join(SORTIE_VIDEOS, nom)).size,
	0,
);
if (poidsVideos > 0) {
	console.log(
		`\nVidéos recompressées : ${String(Math.round(poidsVideos / 1024))} ko au total.`,
	);
}
