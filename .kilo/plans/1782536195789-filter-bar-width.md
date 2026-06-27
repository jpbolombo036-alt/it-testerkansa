# Plan : Réduire la largeur de la barre de tri/filtres des sessions

## Contexte
Dans `src/pages/Tests/index.tsx` (lignes 524-551), la barre de tri/filtres située sous la recherche utilise deux `<select>` avec les classes `flex-1 min-w-[140px]`. Sur grand écran, `flex-1` répartit équitablement l'espace disponible, rendant les champs trop larges et désagréables.

## Décisions
- Modifier les deux `<select>` pour qu'ils adoptent leur largeur naturelle au lieu de s'étirer.
- Conserver le wrapping sur mobile via `flex-wrap` déjà présent sur le parent.
- Aucun changement de layout global, seulement les classes des deux selects.

## Changements à appliquer
Dans `src/pages/Tests/index.tsx` :

1. Ligne ~528 : remplacer `className="flex-1 min-w-[140px] ..."` par `className="w-full sm:w-auto min-w-[180px] ..."` pour le select "Trier par...".
2. Ligne ~537 : remplacer `className="flex-1 min-w-[140px] ..."` par `className="w-full sm:w-auto min-w-[180px] ..."` pour le select "Tous les créateurs".

Le bouton de tri (↑/↓) conserve ses classes actuelles, il restera aligné à droite des selects.

## Validation
- Ouvrir la page `/tests` sur desktop large : les selects doivent prendre leur largeur naturelle et ne plus occuper toute la ligne.
- Ouvrir sur petit écran mobile : les selects doivent passer en pleine largeur et wraper proprement grâce à `flex-wrap` + `w-full`.
- Vérifier que le tri et le filtre par créateur continuent de fonctionner.

## Risques
- Aucun risque métier ; changement purement CSS.
- Si un label plus long est ajouté plus tard, ajuster `min-w-[180px]` si nécessaire.
