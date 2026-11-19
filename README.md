# AtelierIA

Atelier pédagogique pour comprendre l’IA par la pratique. L’application est statique : toutes les données sont locales et elle ne fait aucun appel réseau à l’exécution.

## Lancer en ligne

Site public GitHub Pages : https://onepro182.github.io/AtelierIA/

## Lancer en local

Depuis la racine du dépôt :

```powershell
python -m http.server 8734
```

Puis ouvrir http://127.0.0.1:8734/

## Contenu publié

- `index.html` — point d’entrée de l’application.
- `assets/` — styles, polices, scripts et icônes locales.
- `data/` — contenus locally importés (cours, wiki, glossaire, outils IA).
- `IMG/` — images utilisées par l’interface.

Les anciens fichiers `OLD/` et les caches locaux sont volontairement exclus.
