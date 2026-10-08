/**
 * Serveur Principal Express
 * Application : Le Village IoT des Schtroumpfs
 * 
 * Point d'entrée allégé configurant Express, les middlewares,
 * les routeurs d'API modulaires et le fallback SPA.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { PORT, PATHS } = require('./config');

const participantRoutes = require('./routes/participantRoutes');
const teamRoutes = require('./routes/teamRoutes');
const deliverableRoutes = require('./routes/deliverableRoutes');
const workshopRoutes = require('./routes/workshopRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de React (dist) en priorité
if (fs.existsSync(PATHS.frontendDist)) {
  app.use(express.static(PATHS.frontendDist));
}
app.use(express.static(PATHS.public));

// ================= API ENDPOINTS =================
app.use('/api/participants', participantRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api', workshopRoutes);

// Fallback SPA complet (Application React unifiée : /, /admin, /team, /stages, /launch, etc.)
app.get('*', (req, res) => {
  const reactIndex = path.join(PATHS.frontendDist, 'index.html');
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(PATHS.public, 'admin.html'));
  }
  res.sendFile(path.join(PATHS.public, 'index.html'));
});

// Démarrer serveur
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏡 LE VILLAGE IoT DES SCHTROUMPFS - SERVEUR EN LIGNE`);
    console.log(`🌐 Accès Web : http://localhost:${PORT}`);
    console.log(`📡 Base de données : MySQL / Mode Autonome actif`);
    console.log(`======================================================\n`);
  });
});
