# 🍄 Le Village IoT des Schtroumpfs

> **Plateforme Web Interactive & Gamifiée pour Workshop d'Innovation IoT**  
> Basée sur les **5 types de personnalité Schtroumpfs** et les **6 Maisons séquentielles** du Village IoT.

---

## 🌟 Présentation du Workshop

Cette application web est spécialement conçue pour animer un atelier d'idéation et de prototypage d'objets connectés :

1. **Accueil & Inscription (Mobile First / QR Code)** : Chaque participant scanne le QR code avec son smartphone, renseigne son nom/prénom et passe un test de positionnement comportemental en 8 questions situationnelles.
2. **Attribution du Profil Schtroumpf (3D)** :
   - 🎨 **Artiste** : Créatif, visuel, storytelling & design d'expérience.
   - 👓 **Professeur / Savant** : Analytique, structuré, modélisation de la chaîne technique.
   - 🔍 **Critique** : Rigoureux, sceptique constructif, gestion des risques et des pannes.
   - ❤️ **Empathique** : Humain, sensible, éthique, utilité sociétale et bienveillance.
   - ⚡ **Sportif / Action Man** : Pratique, fonceur, prototypage express et esprit Maker.
3. **Constitution des Groupes Homogènes** : L'animateur déclenche en 1 clic la répartition automatique pour former les équipes (Les Schtroumpfs Savants, Les Schtroumpfs Créatifs, etc.) et désigne le **Rédacteur unique (Porteur de stylo)** par groupe.
4. **Le Parcours des 6 Maisons (Village IoT)** :
   - 🛖 **Maison 1 : Besoin (16%)** — Formule canonique : « Pour [utilisateur], le problème est... »
   - 💡 **Maison 2 : Idée IoT (33%)** — Concept connecté, grandeurs mesurées & valeur ajoutée
   - ⚙️ **Maison 3 : Faisabilité (50%)** — Chaîne complète : Capteur ➔ Traitement ➔ Comms ➔ Utilisateur
   - 🔌 **Maison 4 : Prototype (66%)** — Maquette physique, scénario d'usage & protocole de test
   - 📊 **Maison 5 : Business (83%)** — Matrice Business Model Canvas simplifié (9 blocs)
   - 🏆 **Maison 6 : Marché (100%)** — Mini-plan de lancement + **Chronomètre de Pitch 3 minutes**
5. **Dashboard Grand Écran du Village** : Une carte interactive et animée avec les 6 Maisons champignons où les pions des équipes avancent physiquement en temps réel !
6. **Compte Rendu & Restitution Finale** : Restitution complète multi-équipes avec **export PDF / Impression grand format** et **export Markdown (.md)**.

---

## 🛠️ Architecture Technique & Base de Données

- **Backend** : Node.js & Express.
- **Base de données MySQL** :
  - Client performant `mysql2/promise` avec pool de connexions.
  - Schéma relationnel complet (`server/schema.sql`) : tables `sessions`, `teams`, `participants`, `deliverables`, `activity_logs`.
  - Script d'initialisation automatique (`npm run db:init`).
  - **Mode Résilient & Autonome** : Si votre serveur MySQL local n'est pas encore démarré, l'application bascule automatiquement et de manière transparente sur un moteur de persistence locale sécurisé sans planter, et se synchronise dès que MySQL est disponible.
- **Frontend** : HTML5 sémantique, CSS3 moderne (Dark Glassmorphism, animations fluides, responsive smartphone & vidéo-projecteur), JavaScript Vanilla réactif.
- **Visuels 3D** : Avatars et bannières 3D générés sur mesure intégrés dans `public/assets/images/`.

---

## 🚀 Installation & Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur recommandé).
- [MySQL](https://www.mysql.com/) (ou MariaDB) optionnel mais recommandé pour la persistance SQL.

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration MySQL (Fichier `.env`)
Copiez ou modifiez le fichier `.env` à la racine :
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smurf_iot_village
```

### 4. Initialisation de la Base de Données MySQL (Optionnel)
Pour créer automatiquement la base `smurf_iot_village` et toutes ses tables :
```bash
npm run db:init
```

### 5. Lancer l'Application
```bash
npm start
```
Ou avec rechargement automatique en développement :
```bash
npm run dev
```

Rendez-vous ensuite sur : **[http://localhost:3000](http://localhost:3000)**

---

## 🎮 Guide d'Utilisation du Workshop

| Étape | Vue | Action Animateur / Participant |
| :--- | :--- | :--- |
| **1. Accueil** | `Dashboard (Vue 3)` | L'animateur clique sur **"📱 QR Code Inscription"** et le projette sur grand écran. |
| **2. Inscription** | `Mobile (Vue 1)` | Les participants scannent le QR code, renseignent leur prénom/nom et répondent aux 8 questions. |
| **3. Profils** | `Mobile (Vue 1)` | Chaque participant découvre son profil Schtroumpf (avatar 3D, super-pouvoirs, pourcentages). |
| **4. Groupes** | `Dashboard (Vue 3)` | L'animateur clique sur **"⚡ Former les Groupes Homogènes"** pour répartir automatiquement les équipes. |
| **5. Travail** | `Espace Équipe (Vue 2)` | Le rédacteur unique de chaque groupe saisit les livrables des 6 Maisons et valide au fur et à mesure. |
| **6. Suivi Live** | `Dashboard (Vue 3)` | Toute la salle voit en direct les avatars Schtroumpfs progresser de maison en maison (16% à 100%). |
| **7. Pitch** | `Espace Équipe (Vue 2)` | Chaque groupe lance le chronomètre 3:00 pour son pitch final devant le jury. |
| **8. Restitution** | `Restitution (Vue 4)` | Projection des fiches projets, impression PDF ou téléchargement du rapport Markdown `.md`. |

---

## 🧪 Données de Démonstration en 1 Clic

Pour tester ou faire une répétition sans attendre 15 participants réels :
1. Allez sur l'onglet **"3. Dashboard Village (Animateur)"**.
2. Cliquez sur le bouton violet **"🧪 Charger Données Démo"**.
3. Cela pré-charge instantanément **15 participants**, **5 équipes homogènes** et leurs livrables validés à travers les 6 maisons !
