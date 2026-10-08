/**
 * Gestionnaire de Connexion et de Persistance Locale
 * Module : server/db/store.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const { DB_CONFIG, PATHS } = require('../config');

const DATA_FILE = PATHS.dataStore;
const dbConfig = DB_CONFIG;

// État de la connexion MySQL
let mysqlPool = null;
let isConnectedToMySQL = false;
let dbStatusMessage = 'Initialisation...';

// Modèle de données par défaut (utilisé en fallback autonome)
let memoryStore = {
  session: {
    id: 'default',
    title: 'Workshop IoT des Schtroumpfs - Édition 2026',
    phase: 'registration',
    created_at: new Date().toISOString()
  },
  participants: [],
  teams: [],
  deliverables: [],
  logs: []
};

// Chargement du store de secours s'il existe
function loadFallbackStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(data);
    }
  } catch (err) {
    console.warn('[DB] Avertissement lecture fallback store:', err.message);
  }
}

// Sauvegarde synchrone sur disque du store de secours
function persistFallbackStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB] Erreur écriture fallback store:', err.message);
  }
}

// Initialisation de la base de données
async function initDatabase() {
  loadFallbackStore();
  try {
    const testConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await testConn.end();

    mysqlPool = mysql.createPool(dbConfig);

    const schemaSql = fs.readFileSync(PATHS.schema, 'utf8');
    await mysqlPool.query(schemaSql);

    isConnectedToMySQL = true;
    dbStatusMessage = `Connecté à MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`;
    console.log(`[DB SUCCESS] ${dbStatusMessage}`);
  } catch (err) {
    isConnectedToMySQL = false;
    dbStatusMessage = `Serveur MySQL inaccessible (${err.code || err.message}). Mode autonome actif avec persistence locale.`;
    console.warn(`[DB WARNING] ${dbStatusMessage}`);
  }
}

// Statut de la base de données
function getStatus() {
  return {
    isMySQL: isConnectedToMySQL,
    message: dbStatusMessage,
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    },
    counts: {
      participants: memoryStore.participants.length,
      teams: memoryStore.teams.length,
      deliverables: memoryStore.deliverables.length
    }
  };
}

module.exports = {
  getPool: () => mysqlPool,
  isMySQLConnected: () => isConnectedToMySQL && Boolean(mysqlPool),
  getMemoryStore: () => memoryStore,
  persistFallbackStore,
  initDatabase,
  getStatus
};
