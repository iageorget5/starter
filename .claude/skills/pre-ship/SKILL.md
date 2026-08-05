---
name: pre-ship
description: Checklist finale avant mise en production d'un site.
---
# Recette : livraison

1. `npm run check`, `npm run test`, `npm run test:e2e`, `npm run build`
   — tout vert.
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
9. Cocher les critères de sortie dans specs/SPEC.md.
10. Commit + push → CI verte → merge → production. Vérifier le site
    EN PROD (pas le preview) : monitoring qui reçoit, formulaire réel.
