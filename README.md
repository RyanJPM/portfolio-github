# Portfolio Ryan Martial — version GitHub Pages

Même rendu visuel que la version « complète » (hébergement type Hostinger), mais **100 % statique** :

- pas de PHP, pas de base de données ;
- **pas de formulaire** ni collecte de données sur le site ;
- contact uniquement via **mailto**, **téléphone**, **LinkedIn**, **GitHub**.

Le dossier de travail « prod » avec formulaire + backend reste séparé (ex. `files/` en local).

---

## Mettre en ligne sur GitHub Pages

1. Crée un **nouveau dépôt** sur GitHub (ex. `portfolio` ou `ryan-martial-portfolio`).
2. Dans le dossier `portfolio-github` sur ta machine :

   ```bash
   cd portfolio-github
   git init
   git add .
   git commit -m "Portfolio statique pour GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/TON_USER/TON_REPO.git
   git push -u origin main
   ```

3. Sur GitHub : **Settings → Pages**  
   - **Source** : déployer depuis la branche **`main`**  
   - **Folder** : **`/ (root)`**  
4. Attends 1–2 minutes : le site sera à  
   **`https://TON_USER.github.io/TON_REPO/`**

Fichier **`.nojekyll`** : évite que GitHub traite le site avec Jekyll (utile si un jour tu ajoutes des fichiers ou dossiers avec des `_` en tête).

---

## Chemins des assets

Tout est en **chemins relatifs** (`assets/...`). Ça fonctionne à la racine d’un dépôt **project site** (`/repo/`).  
Si tu utilises un **user site** (`USERNAME.github.io` avec le contenu à la racine du repo), ça fonctionne aussi.

---

## Sécurité / vie privée (version statique)

- Aucune donnée personnelle n’est saisie sur cette version du site.
- Les liens externes utilisent `rel="noopener noreferrer"` où c’est pertinent.
- Pour un site avec formulaire et obligations légales complètes, utilise l’autre version (PHP + mentions + politique).

---

© 2026 Ryan Martial
