# 日本語練習 Nihongo Renshū

Application web libre pour **réviser le japonais de base** : hiragana, katakana, vocabulaire du quotidien et kanji
du niveau JLPT N5.

Rien à installer, pas de compte, pas de serveur : tout se passe dans le navigateur et la progression reste sur
l'appareil.

## Fonctionnalités

- **Kana façon [Kana Pro](https://kana.pro/legacy)** : choisis les groupes à réviser puis enchaîne les 4 étapes
  (QCM, QCM inversé, saisie, trois caractères à la fois). Il faut 20 points par étape : +1 par bonne réponse, −1 par
  erreur. Tu choisis les étapes à jouer : une seule ou plusieurs.
- **Vocabulaire et verbes** : 10 listes thématiques (~150 mots) à travailler façon Quizlet — cartes mémoire à
  retourner, mode « Apprendre » pas à pas, jeu d'association chronométré, test noté configurable et exercices (QCM ou saisie en rōmaji, dans
  les deux sens, forme du dictionnaire des verbes).
- **Kanji N5** : environ 100 kanji avec leur sens, leurs lectures on/kun et des mots d'exemple.
- **Daily** : chaque jour, une session en vrac qui mélange ce qui est à revoir (répétition espacée), tes points
  faibles et quelques nouveautés.
- **Astuces mnémotechniques** : une astuce et un petit dessin pour chaque katakana. Tu peux écrire tes propres
  astuces sur n'importe quel kana, mot ou kanji.
- **Aides à la lecture** : rōmaji et sens de chaque kanji affichés à côté du japonais, sauf quand c'est la réponse
  attendue. Prononciation par la synthèse vocale du navigateur.
- **Plusieurs profils** sur le même appareil, export et import de la progression.
- **Deux thèmes** : « Classique » (clair) et « Moderne » (clair/sombre selon le système).
- **Installable et utilisable hors ligne** (PWA).

## Utiliser

Ouvre la version en ligne (GitHub Pages), ou lance-la en local :

```bash
git clone https://github.com/<ton-compte>/nihongo-renshu.git
cd nihongo-renshu
npm start            # puis ouvre http://localhost:5173
```

> Les modules JavaScript ne se chargent pas en double-cliquant sur `index.html` (`file://`). Il faut un petit
> serveur : `npm start`, ou `python3 -m http.server`.

## Tes données

La progression, les réglages et tes astuces sont enregistrés dans le `localStorage` du navigateur, un profil par
personne. Rien n'est envoyé sur internet. Pour changer d'appareil, utilise **Progrès → Exporter**, puis
**Importer** sur l'autre appareil.

## Contribuer

Les contributions sont bienvenues, voir [CONTRIBUTING.md](CONTRIBUTING.md). Le projet suit
[Conventional Commits](https://www.conventionalcommits.org/fr/).

## Licence

Code sous licence [MIT](LICENSE). Contenu (listes, astuces, dessins) sous licence CC BY-SA 4.0, voir
[CREDITS.md](CREDITS.md).

---

**English**: Nihongo Renshū is a free, offline-first web app to practise Japanese basics (kana, everyday vocabulary,
JLPT N5 kanji) with spaced repetition, mnemonics and drawings. The interface is in French for now. Contributions and
translations are welcome.
