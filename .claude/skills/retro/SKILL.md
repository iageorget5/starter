---
name: retro
description: Rétrospective de fin de projet — proposer les leçons et
  décisions à capitaliser, sous validation humaine, puis reconstruire
  le knowledge graph. À utiliser à chaque fin de projet.
---
# Recette : rétro (≈ 30 min, ne jamais sauter)

## 1. Générer les propositions → retro/PROPOSALS.md
Analyser DECISIONS.md, l'historique git, et la session courante.
Produire UNIQUEMENT des faits durables, en trois sections :
- **Leçons** (→ agence-context/LEARNINGS.md) : erreurs répétées,
  patterns qui marchent, estimations vs réel.
- **Décisions réutilisables** (→ agence-context/DECISIONS.md) : choix
  techniques valables au-delà de ce projet.
- **Fiche client** (→ agence-context/clients/<nom>.md) : contexte,
  préférences, historique, contrat de maintenance.
Chaque proposition : le fait (2 lignes max) + sa justification + son
fichier de destination. Exclure tout bavardage de session.

## 2. Proposer les remontées au starter
Lister : composants généralisables, amendements à CLAUDE.md/skills/
agents, tests réutilisables. Format : élément → bénéfice → effort.

## 3. STOP — validation humaine
Présenter PROPOSALS.md et attendre l'arbitrage ligne à ligne.
Ne RIEN écrire dans agence-context/ ni dans le starter sans accord
explicite (le gate de permissions le bloque de toute façon).

## 4. Appliquer le lot approuvé
Écrire dans les fichiers de destination, committer avec un message
`chore(retro): capitalize <projet>`.

## 5. Reconstruire le graphe
`cd ~/agence/agence-context && graphify .` puis committer graphify-out/.
Le graphe dérive ainsi à 100 % de sources validées par un humain.

## 6. Clore
Ajouter au rapport : coût estimé du projet (sessions, temps humain,
consommation d'abonnement) vs prix vendu → agence-context/LEARNINGS.md,
section Économie. C'est la donnée qui dira si le système devient moins
cher site après site (racine 17).
