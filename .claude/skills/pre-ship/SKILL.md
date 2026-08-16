---
name: pre-ship
description: Checklist finale avant mise en production d'un site.
---
# Recette : livraison

> **Chaque point produit soit une case cochée, soit un arbitrage écrit —
> jamais un silence.** Sur agence-site, cinq points de cette liste n'avaient
> été ni faits ni arbitrés au moment du déploiement, et l'écart n'apparaissait
> nulle part. Une checklist qu'on ne parcourt pas point par point ne protège
> rien (voir agence-context/LEARNINGS.md).

1. `npm run check`, `npm run test`, `npm run test:e2e`,
   `npm run test:e2e:webkit`, `npm run build` — tout vert, **jugé sur le code
   de sortie**.
2. Zéro [DRAFT] : `grep -r "\[DRAFT\]" src/content/` doit être vide,
   et specs/CONTENT-STATUS.md tout à « validé client ».
3. Sous-agent qa sur l'ensemble des pages de la spec.
4. Technique : 404 personnalisée, favicon + icônes, sitemap.xml,
   robots.txt, redirections, liens morts (npx linkinator sur preview).
5. Sécurité : headers (CSP, X-Content-Type-Options, Referrer-Policy,
   HSTS) via astro-security-headers ou le fichier _headers de la
   plateforme ; formulaires protégés (honeypot + Turnstile) ;
   `npm audit --audit-level=high` propre.
6. Légal FR : mentions légales, politique de confidentialité, bandeau
   cookies si traceurs, lien RGPD au footer. (+ CGV si marchand.)
7. Lighthouse sur build de prod : 4 scores ≥ 95.
8. OBSERVABILITÉ (racine 14) — avant d'annoncer la livraison :
   - Sentry (plan gratuit) branché sur le site : les erreurs JS de
     prod remontent avec alerte email.
   - Uptime check 5 min (UptimeRobot ou équivalent) sur la home et
     une page critique.
   - Web Vitals réels (RUM) : script @vercel/analytics ou équivalent
     Cloudflare — le Lighthouse de labo ne voit pas les vrais mobiles
     des vrais visiteurs.
9. ACCESSIBILITÉ DES MÉDIAS — ce que les outils ne voient pas :
   - Les `alt` ont-ils été écrits **en regardant les images** ? Rédigés
     depuis les noms de fichiers, ils décrivent autre chose que le contenu
     réel. Un `alt` est du contenu visible pour qui utilise un lecteur
     d'écran.
   - Toute vidéo portant de la parole exige des **sous-titres** (WCAG
     1.2.2). Vérifier fichier par fichier la présence d'une piste audio, pas
     au jugé.
   - Le format annoncé dans le contenu décrit-il le fichier réel ? (« une
     image » qui est une vidéo, « carré » qui est vertical : trois écarts
     trouvés sur agence-site, tous corrigés côté contenu.)
10. GRAPHE À JOUR — le contrôle de fraîcheur passe-t-il ? Sinon
    reconstruire, puis relancer le post-traitement des ponts (l'ordre
    compte : graphify réécrit `graph.json`). Un graphe périmé ne bloque pas
    la production, mais il fait travailler la session suivante sur une carte
    fausse — c'est arrivé neuf jours d'affilée sur agence-site.
11. Cocher les critères de sortie dans specs/SPEC.md.
12. Commit + push → CI verte → merge → production. Vérifier le site
    EN PROD (pas le preview) : monitoring qui reçoit, formulaire réel.
