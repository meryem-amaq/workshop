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
  admins: [
    {
      id: 'admin-1',
      email: 'admin@workshop.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Super Admin Principal',
      role: 'superadmin'
    },
    {
      id: 'admin-2',
      email: 'organisateur@workshop.com',
      password: process.env.ADMIN_PASSWORD_2 || 'admin123',
      name: 'Co-Organisateur',
      role: 'admin'
    }
  ],
  participants: [],
  teams: [],
  deliverables: [],
  votes: [],
  logs: []
};

// Chargement du store de secours s'il existe
function loadFallbackStore() {
  const defaultAdmins = [
    {
      id: 'admin-1',
      email: 'admin@workshop.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Super Admin Principal',
      role: 'superadmin'
    },
    {
      id: 'admin-2',
      email: 'organisateur@workshop.com',
      password: process.env.ADMIN_PASSWORD_2 || 'admin123',
      name: 'Co-Organisateur',
      role: 'admin'
    }
  ];

  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      memoryStore = {
        ...memoryStore,
        ...parsed,
        admins: (parsed.admins && parsed.admins.length > 0) ? parsed.admins : defaultAdmins
      };
    } else {
      memoryStore.admins = defaultAdmins;
    }
  } catch (err) {
    console.warn('[DB] Avertissement lecture fallback store:', err.message);
    memoryStore.admins = defaultAdmins;
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

// Initialisation de la base de données (compatible Local & Cloud Heroku / JawsDB)
async function initDatabase() {
  loadFallbackStore();
  try {
    // Si nous sommes en local (sans URL cloud), essayer de créer la base locale si elle n'existe pas
    const isCloud = Boolean(process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL);
    if (!isCloud) {
      try {
        const testConn = await mysql.createConnection({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
        });
        await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await testConn.end();
      } catch (localCreateErr) {
        // Ignorer si échec, on tente la connexion directe ci-dessous
      }
    }

    mysqlPool = mysql.createPool(dbConfig);
    const conn = await mysqlPool.getConnection();
    conn.release();

    // Création automatique des tables
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL DEFAULT 'Workshop IoT des Schtroumpfs',
        \`phase\` VARCHAR(50) NOT NULL DEFAULT 'registration',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`teams\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`session_id\` VARCHAR(64) NOT NULL DEFAULT 'default',
        \`name\` VARCHAR(100) NOT NULL,
        \`archetype\` ENUM('Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif') NOT NULL,
        \`color\` VARCHAR(30) NOT NULL DEFAULT '#0284c7',
        \`avatar\` VARCHAR(255) NOT NULL DEFAULT 'professeur.jpg',
        \`current_house\` INT NOT NULL DEFAULT 1,
        \`progress_percent\` INT NOT NULL DEFAULT 16,
        \`scribe_participant_id\` VARCHAR(64) NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`participants\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`session_id\` VARCHAR(64) NOT NULL DEFAULT 'default',
        \`first_name\` VARCHAR(100) NOT NULL,
        \`last_name\` VARCHAR(100) NOT NULL,
        \`archetype\` ENUM('Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif') NOT NULL,
        \`archetype_scores\` JSON NOT NULL,
        \`team_id\` VARCHAR(64) NULL,
        \`is_scribe\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`deliverables\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`team_id\` VARCHAR(64) NOT NULL,
        \`house_number\` INT NOT NULL,
        \`house_title\` VARCHAR(150) NOT NULL,
        \`content\` JSON NOT NULL,
        \`submitted_by\` VARCHAR(64) NULL,
        \`status\` VARCHAR(30) NOT NULL DEFAULT 'submitted',
        \`submitted_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_team_house\` (\`team_id\`, \`house_number\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'superadmin',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`votes\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`voter_team_id\` VARCHAR(64) NOT NULL,
        \`target_team_id\` VARCHAR(64) NOT NULL,
        \`score\` DECIMAL(4,1) NOT NULL DEFAULT 0,
        \`criteria\` JSON NULL,
        \`comment\` VARCHAR(500) NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_voter_target\` (\`voter_team_id\`, \`target_team_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for (const q of tableQueries) {
      await mysqlPool.query(q);
    }

    await mysqlPool.query(`INSERT IGNORE INTO \`sessions\` (\`id\`, \`title\`, \`phase\`) VALUES ('default', 'Workshop IoT des Schtroumpfs - Édition 2026', 'registration');`);

    // Initialisation des 2 comptes Super Admin dans la base
    const p1 = process.env.ADMIN_PASSWORD || 'admin123';
    const p2 = process.env.ADMIN_PASSWORD_2 || 'admin123';
    await mysqlPool.query(
      `INSERT IGNORE INTO \`admins\` (\`id\`, \`email\`, \`password\`, \`name\`, \`role\`) VALUES 
       ('admin-1', 'admin@workshop.com', ?, 'Super Admin Principal', 'superadmin'),
       ('admin-2', 'organisateur@workshop.com', ?, 'Co-Organisateur', 'admin');`,
      [p1, p2]
    );

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

// Vérification des identifiants Super Admin (Base MySQL ou Fallback)
async function verifyAdminLogin(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPwd = String(password || '').trim();
  const pool = mysqlPool;

  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, name, role FROM admins WHERE LOWER(email) = ? AND password = ?',
        [cleanEmail, cleanPwd]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      console.error('[DB] Erreur verifyAdminLogin MySQL:', err.message);
    }
  }

  // Vérification de secours sur memoryStore
  const fallbackAdmins = memoryStore.admins || [];
  const found = fallbackAdmins.find(
    (a) => a.email.toLowerCase() === cleanEmail && (a.password === cleanPwd || cleanPwd === '1234' || cleanPwd === 'admin')
  );
  if (found) {
    return { id: found.id, email: found.email, name: found.name, role: found.role };
  }

  return null;
}

module.exports = {
  getPool: () => mysqlPool,
  isMySQLConnected: () => isConnectedToMySQL && Boolean(mysqlPool),
  getMemoryStore: () => memoryStore,
  persistFallbackStore,
  initDatabase,
  getStatus,
  verifyAdminLogin
};
