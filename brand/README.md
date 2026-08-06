# brand/ — convention d'interchangeabilité du nom

Le nom d'un projet (agence ou client) est un **paramètre**, jamais une
constante codée en dur. Il peut changer avant l'achat du domaine ou le dépôt
de marque — le code ne doit jamais dépendre d'un nom précis.

## Source unique de vérité
`brand/tokens.json`, champ racine `"name"`. C'est le SEUL endroit où le nom
est décidé.

## Exposition au code
`src/config.ts` lit `brand/tokens.json` et exporte `SITE_NAME`. Toute
référence au nom dans le code (titres, meta title/description, OpenGraph,
JSON-LD, footer, mentions légales, contenus) importe `SITE_NAME` — jamais la
chaîne littérale.

## Exceptions documentées
Ces fichiers ont pour rôle de porter le nom en clair et ne sont PAS concernés
par la règle « jamais en dur » :
- `brand/identity.md` — narratif de marque (section « Le nom »).
- `brand/voice.md` — exemples de ton pouvant citer le nom.
- `brand/tokens.json` — la source unique elle-même.
- `brand/graph.json` — entité Organization pour le JSON-LD schema.org.
- `DECISIONS.md` (projet ou `agence-context/`) — un journal de décision cite
  nécessairement la valeur décidée à la date de la décision.

## Procédure de renommage
1. Changer uniquement la valeur du champ `"name"` dans `brand/tokens.json`.
2. Mettre à jour `brand/identity.md` (section « Le nom ») et `brand/graph.json`
   si le narratif du nom change.
3. Ajouter une entrée dans `DECISIONS.md` si le changement est structurant.
4. Vérifier : `grep -ri "<ancien nom>" .` (hors `node_modules/`, `dist/`,
   `.git/`) ne doit plus remonter que l'historique git et les exceptions
   ci-dessus. Un renommage non vérifié par ce grep n'est pas terminé.
5. Aucun renommage machine des identifiants techniques (dossiers, repos,
   noms de packages) sur la seule base du nom de marque.
