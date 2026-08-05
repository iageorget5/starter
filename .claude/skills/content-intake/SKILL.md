---
name: content-intake
description: Collecter, structurer et intégrer les contenus client
  (textes, images, logos). À utiliser en début de projet et à chaque
  livraison de contenus.
---
# Recette : contenus client

1. Début de projet : générer le questionnaire de brief depuis
   templates/brief-client.md (activité, cible, pages, textes existants,
   photos/logos disponibles, ton souhaité, exemples aimés/détestés)
   et le remplir avec les réponses du client.
2. Contenus manquants : rédiger des provisoires plausibles à partir de
   brand/ et du brief, TOUS préfixés [DRAFT] dans src/content/.
   Jamais de lorem ipsum : un provisoire réaliste permet au client de
   réagir, un lorem ipsum ne déclenche rien.
3. Tenir specs/CONTENT-STATUS.md : table route → contenu → statut
   (draft / reçu / intégré / validé client).
4. À chaque réception : remplacer les [DRAFT], mettre à jour la table.
5. Images : conversion AVIF/WebP, dimensions explicites, alt rédigé.
Rappel : le pre-ship est BLOQUÉ tant qu'il reste un [DRAFT].
