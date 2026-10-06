# Contribuer

Merci de ton intérêt ! Toute aide est la bienvenue : correction d'une traduction, nouvelle liste de vocabulaire,
meilleure astuce ou meilleur dessin, nouvelle fonctionnalité.

## Lancer le projet

Aucune dépendance à installer. Il faut juste servir le dossier en HTTP (les modules JavaScript ne se chargent pas
depuis `file://`) :

```bash
npm start          # ou : python3 -m http.server
npm test           # tests unitaires (node --test)
npm run lint       # ESLint
npm run format     # Prettier
```

## Organisation du code

```
src/
  core/      logique pure : rōmaji, répétition espacée, stockage des profils, synthèse vocale
  content/   données : kana, vocabulaire, kanji, astuces et dessins des katakana
  quiz/      catalogue des questions, plan du daily, déroulement d'une session
  views/     écrans de l'application
  main.js    routeur et point d'entrée
styles/      feuille de style (thèmes « Kana Pro » et « Moderne »)
tests/       tests unitaires
```

Le contenu est volontairement séparé du code : ajouter une liste de vocabulaire, c'est ajouter un objet dans
`src/content/vocab.js`, rien d'autre.

## Règles

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/fr/) — `feat:`, `fix:`, `docs:`,
  `refactor:`, `test:`, `style:`, `chore:`, `ci:`. Pour les données, utilise un scope : `feat(content): …`, `fix(content): …`.
- **Code** : lisible avant tout. Des noms explicites plutôt que des commentaires ; un commentaire n'explique que le
  _pourquoi_ quand ce n'est pas évident.
- **Tests** : toute logique dans `src/core` ou `src/quiz` doit être couverte. `npm test` et `npm run lint` doivent passer.
- **Contenu** : vérifie tes lectures et traductions. Pas de contenu copié depuis un manuel ou un site sans autorisation.
