# 🏒 NHL Oracle — Guide de déploiement Vercel

## Déploiement en 5 minutes

### Étape 1 — Créer un compte GitHub
1. Va sur **https://github.com**
2. Clique **Sign up** (gratuit)
3. Choisis un nom d'utilisateur, email, mot de passe

### Étape 2 — Créer un nouveau repository
1. Une fois connecté, clique le **+** en haut à droite → **New repository**
2. Nom : `nhl-oracle`
3. Coche **Public**
4. Clique **Create repository**

### Étape 3 — Upload les fichiers
1. Sur la page du repo, clique **uploading an existing file**
2. Glisse-dépose ces fichiers/dossiers :
   - `vercel.json`
   - `package.json`
   - `api/update.js`
   - `public/index.html`
3. Clique **Commit changes**

### Étape 4 — Créer un compte Vercel
1. Va sur **https://vercel.com**
2. Clique **Sign Up** → **Continue with GitHub**
3. Autorise Vercel à accéder à GitHub

### Étape 5 — Déployer le projet
1. Sur Vercel, clique **Add New Project**
2. Sélectionne ton repo `nhl-oracle`
3. Clique **Deploy** (sans rien changer)
4. C'est tout ! Ton site est live sur `nhl-oracle.vercel.app`

---

## Mises à jour automatiques

Le site se met à jour **toutes les heures** grâce à Vercel Cron Jobs :
- Scores live des matchs en cours
- Statuts blessures mis à jour
- Matchs du jour automatiquement chargés

Les matchs **en direct** se rafraîchissent toutes les **3 minutes** automatiquement.

---

## Sécuriser le cron (optionnel)

1. Dans Vercel → Settings → Environment Variables
2. Ajoute : `CRON_SECRET` = un mot de passe de ton choix (ex: `monmotdepasse123`)
3. Redéploie

---

## Mettre à jour les picks manuellement

Modifie `public/index.html` directement sur GitHub :
1. Ouvre le fichier dans GitHub
2. Clique l'icône crayon ✏️
3. Modifie les données
4. Clique **Commit changes**
→ Vercel redéploie automatiquement en 30 secondes !
