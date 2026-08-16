---
name: content-intake
description: Collecter, structurer et intégrer les contenus client
  (textes, images, logos). À utiliser en début de projet et à chaque
  livraison de contenus.
---
# Recette : contenus client

0. **PRÉREQUIS DE CADRAGE — à vérifier AVANT toute rédaction**, avec les
   contenus, jamais au moment de les écrire :
   - **Statut juridique et SIRET du client.** Sans eux, aucune mention
     légale réelle n'est rédigeable et aucune prestation n'est facturable.
     Ce n'est pas une case de contenu, c'est une gate de projet — découvert
     en toute fin de parcours sur agence-site, alors que le site annonçait
     déjà des prestations payantes.
   - **Domaine arrêté.** Sans lui, aucune URL absolue publiable : ni
     canonique, ni OpenGraph, ni sitemap. Publier une canonique fausse est
     pire que l'omettre, et aucun audit ne la signale.
   Un prérequis manquant se note explicitement comme bloquant, il ne se
   contourne pas par une valeur inventée.
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
5. Images : conversion AVIF/WebP, dimensions explicites, **alt rédigé après
   avoir regardé l'image** — rédigé depuis le nom de fichier, il décrit autre
   chose que le contenu réel. Le format annoncé dans le texte doit décrire le
   fichier livré : c'est une promesse commerciale, pas une approximation.
Rappel : le pre-ship est BLOQUÉ tant qu'il reste un [DRAFT].
