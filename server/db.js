const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_FILE = path.join(__dirname, 'data-store.json');

// État de la connexion
let mysqlPool = null;
let isConnectedToMySQL = false;
let dbStatusMessage = 'Initialisation...';

// Configuration MySQL issue des variables d'environnement
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smurf_iot_village',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Modèle de données par défaut (utilisé en fallback si MySQL n'est pas encore démarré)
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

function persistFallbackStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB] Erreur écriture fallback store:', err.message);
  }
}

// Initialisation de la connexion MySQL
async function initDatabase() {
  loadFallbackStore();
  try {
    // 1. Tester la connexion au serveur MySQL
    const testConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // 2. Créer la base de données si nécessaire
    await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await testConn.end();

    // 3. Créer le pool de connexions vers la base
    mysqlPool = mysql.createPool(dbConfig);

    // 4. Exécuter le schéma complet
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
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

// Obtenir le statut
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

// Récupérer les participants
async function getParticipants() {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM participants ORDER BY created_at DESC');
      return rows.map(r => ({
        ...r,
        archetype_scores: typeof r.archetype_scores === 'string' ? JSON.parse(r.archetype_scores) : r.archetype_scores,
        is_scribe: Boolean(r.is_scribe)
      }));
    } catch (err) {
      console.error('[DB] Erreur getParticipants MySQL, utilisation fallback:', err.message);
    }
  }
  return memoryStore.participants;
}

// Ajouter un participant
async function addParticipant(participant) {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query(
        `INSERT INTO participants (id, session_id, first_name, last_name, archetype, archetype_scores, is_scribe)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          participant.id,
          participant.session_id || 'default',
          participant.first_name,
          participant.last_name,
          participant.archetype,
          JSON.stringify(participant.archetype_scores || {}),
          participant.is_scribe ? 1 : 0
        ]
      );
    } catch (err) {
      console.error('[DB] Erreur addParticipant MySQL:', err.message);
    }
  }

  // Mettre à jour la mémoire/cache
  const existingIdx = memoryStore.participants.findIndex(p => p.id === participant.id);
  if (existingIdx >= 0) {
    memoryStore.participants[existingIdx] = participant;
  } else {
    memoryStore.participants.unshift(participant);
  }
  persistFallbackStore();
  return participant;
}

// Récupérer les équipes
async function getTeams() {
  let teams = memoryStore.teams;
  if (isConnectedToMySQL && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM teams ORDER BY name ASC');
      teams = rows;
    } catch (err) {
      console.error('[DB] Erreur getTeams MySQL:', err.message);
    }
  }

  const participants = await getParticipants();
  const deliverables = await getDeliverables();

  // Associer les membres et livrables à chaque équipe
  return teams.map(team => {
    const members = participants.filter(p => p.team_id === team.id);
    const teamDeliverables = deliverables.filter(d => d.team_id === team.id);
    const scribe = members.find(m => m.id === team.scribe_participant_id || m.is_scribe) || null;
    return {
      ...team,
      members,
      scribe,
      deliverables: teamDeliverables
    };
  });
}

// Enregistrer ou remplacer les équipes (Génération de groupes homogènes)
async function saveTeams(teams, participantUpdates = []) {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query('DELETE FROM deliverables');
      await mysqlPool.query('UPDATE participants SET team_id = NULL, is_scribe = FALSE');
      await mysqlPool.query('DELETE FROM teams');

      for (const t of teams) {
        await mysqlPool.query(
          `INSERT INTO teams (id, session_id, name, archetype, color, avatar, current_house, progress_percent, scribe_participant_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.id, 'default', t.name, t.archetype, t.color, t.avatar, t.current_house || 1, t.progress_percent || 16, t.scribe_participant_id || null]
        );
      }

      for (const u of participantUpdates) {
        await mysqlPool.query(
          `UPDATE participants SET team_id = ?, is_scribe = ? WHERE id = ?`,
          [u.team_id, u.is_scribe ? 1 : 0, u.id]
        );
      }
    } catch (err) {
      console.error('[DB] Erreur saveTeams MySQL:', err.message);
    }
  }

  memoryStore.teams = teams;
  // Mettre à jour les participants en mémoire
  for (const u of participantUpdates) {
    const p = memoryStore.participants.find(part => part.id === u.id);
    if (p) {
      p.team_id = u.team_id;
      p.is_scribe = Boolean(u.is_scribe);
    }
  }
  persistFallbackStore();
  return getTeams();
}

// Désigner le scribe / porteur de stylo d'une équipe
async function setTeamScribe(teamId, participantId) {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query('UPDATE participants SET is_scribe = FALSE WHERE team_id = ?', [teamId]);
      await mysqlPool.query('UPDATE participants SET is_scribe = TRUE WHERE id = ?', [participantId]);
      await mysqlPool.query('UPDATE teams SET scribe_participant_id = ? WHERE id = ?', [participantId, teamId]);
    } catch (err) {
      console.error('[DB] Erreur setTeamScribe MySQL:', err.message);
    }
  }

  // Mise à jour mémoire
  memoryStore.participants.forEach(p => {
    if (p.team_id === teamId) p.is_scribe = (p.id === participantId);
  });
  const t = memoryStore.teams.find(tm => tm.id === teamId);
  if (t) {
    t.scribe_participant_id = participantId;
  }
  persistFallbackStore();
  return getTeams();
}

// Mettre à jour l'étape (Maison 1..6) d'une équipe
async function setTeamHouse(teamId, houseNumber) {
  const clampedHouse = Math.max(1, Math.min(6, parseInt(houseNumber, 10)));
  const progressMap = { 1: 16, 2: 33, 3: 50, 4: 66, 5: 83, 6: 100 };
  const progressPercent = progressMap[clampedHouse] || 16;

  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query(
        'UPDATE teams SET current_house = ?, progress_percent = ? WHERE id = ?',
        [clampedHouse, progressPercent, teamId]
      );
    } catch (err) {
      console.error('[DB] Erreur setTeamHouse MySQL:', err.message);
    }
  }

  const team = memoryStore.teams.find(t => t.id === teamId);
  if (team) {
    team.current_house = clampedHouse;
    team.progress_percent = progressPercent;
  }
  persistFallbackStore();
  return team;
}

// Récupérer les livrables
async function getDeliverables(teamId = null) {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      let query = 'SELECT * FROM deliverables';
      const params = [];
      if (teamId) {
        query += ' WHERE team_id = ?';
        params.push(teamId);
      }
      query += ' ORDER BY house_number ASC';
      const [rows] = await mysqlPool.query(query, params);
      return rows.map(r => ({
        ...r,
        content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content
      }));
    } catch (err) {
      console.error('[DB] Erreur getDeliverables MySQL:', err.message);
    }
  }

  if (teamId) {
    return memoryStore.deliverables.filter(d => d.team_id === teamId);
  }
  return memoryStore.deliverables;
}

// Enregistrer ou mettre à jour un livrable
async function saveDeliverable(deliverable) {
  const { id, team_id, house_number, house_title, content, submitted_by, status } = deliverable;
  const contentJson = JSON.stringify(content || {});

  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query(
        `INSERT INTO deliverables (id, team_id, house_number, house_title, content, submitted_by, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
           house_title = VALUES(house_title),
           content = VALUES(content),
           submitted_by = VALUES(submitted_by),
           status = VALUES(status),
           submitted_at = NOW()`,
        [id, team_id, house_number, house_title, contentJson, submitted_by || null, status || 'submitted']
      );
    } catch (err) {
      console.error('[DB] Erreur saveDeliverable MySQL:', err.message);
    }
  }

  const existingIdx = memoryStore.deliverables.findIndex(
    d => d.team_id === team_id && d.house_number === house_number
  );
  if (existingIdx >= 0) {
    memoryStore.deliverables[existingIdx] = {
      ...memoryStore.deliverables[existingIdx],
      ...deliverable,
      updated_at: new Date().toISOString()
    };
  } else {
    memoryStore.deliverables.push({
      ...deliverable,
      submitted_at: new Date().toISOString()
    });
  }
  persistFallbackStore();
  return deliverable;
}

// Récupérer la session courante
async function getSession() {
  let session = memoryStore.session;
  if (isConnectedToMySQL && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM sessions WHERE id = ?', ['default']);
      if (rows.length > 0) session = rows[0];
    } catch (err) {
      console.error('[DB] Erreur getSession MySQL:', err.message);
    }
  }
  return session;
}

// Mettre à jour la phase de la session
async function setSessionPhase(phase) {
  memoryStore.session.phase = phase;
  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query('UPDATE sessions SET phase = ? WHERE id = ?', [phase, 'default']);
    } catch (err) {
      console.error('[DB] Erreur setSessionPhase MySQL:', err.message);
    }
  }
  persistFallbackStore();
  return memoryStore.session;
}

// Supprimer un participant (désistement / départ pendant l'atelier)
async function removeParticipant(participantId) {
  const p = memoryStore.participants.find(x => x.id === participantId);
  const teamId = p ? p.team_id : null;
  const wasScribe = p ? (p.is_scribe || p.id === (memoryStore.teams.find(t => t.id === teamId)?.scribe_participant_id)) : false;

  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query('DELETE FROM participants WHERE id = ?', [participantId]);
    } catch (err) {
      console.error('[DB] Erreur delete participant MySQL:', err.message);
    }
  }

  memoryStore.participants = memoryStore.participants.filter(x => x.id !== participantId);

  // Si le participant était rédacteur du groupe, élire automatiquement le prochain membre
  if (teamId && wasScribe) {
    const remainingMembers = memoryStore.participants.filter(x => x.team_id === teamId);
    if (remainingMembers.length > 0) {
      await setTeamScribe(teamId, remainingMembers[0].id);
    } else {
      const t = memoryStore.teams.find(x => x.id === teamId);
      if (t) t.scribe_participant_id = null;
      if (isConnectedToMySQL && mysqlPool) {
        await mysqlPool.query('UPDATE teams SET scribe_participant_id = NULL WHERE id = ?', [teamId]);
      }
    }
  }

  persistFallbackStore();
  return { success: true, remainingCount: memoryStore.participants.length };
}

// Réinitialiser le workshop
async function resetAll() {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      await mysqlPool.query('DELETE FROM deliverables');
      await mysqlPool.query('UPDATE participants SET team_id = NULL, is_scribe = FALSE');
      await mysqlPool.query('DELETE FROM teams');
      await mysqlPool.query('DELETE FROM participants');
      await mysqlPool.query('UPDATE sessions SET phase = "registration" WHERE id = "default"');
    } catch (err) {
      console.error('[DB] Erreur reset MySQL:', err.message);
    }
  }
  memoryStore.session.phase = 'registration';
  memoryStore.participants = [];
  memoryStore.teams = [];
  memoryStore.deliverables = [];
  persistFallbackStore();
  return { success: true };
}

// Charger un jeu de données de démonstration réaliste
async function seedDemoData() {
  const demoParticipants = [
    { id: 'part-1', first_name: 'Lucas', last_name: 'Moreau', archetype: 'Professeur', archetype_scores: { Professeur: 90, Critique: 65, Artiste: 40, Sportif: 50, Empathique: 35 }, is_scribe: true },
    { id: 'part-2', first_name: 'Sophie', last_name: 'Bernard', archetype: 'Professeur', archetype_scores: { Professeur: 85, Critique: 60, Artiste: 45, Sportif: 30, Empathique: 55 }, is_scribe: false },
    { id: 'part-3', first_name: 'Thomas', last_name: 'Dubois', archetype: 'Professeur', archetype_scores: { Professeur: 80, Critique: 70, Artiste: 35, Sportif: 40, Empathique: 45 }, is_scribe: false },
    
    { id: 'part-4', first_name: 'Clara', last_name: 'Lemoine', archetype: 'Artiste', archetype_scores: { Artiste: 95, Empathique: 70, Sportif: 40, Professeur: 30, Critique: 25 }, is_scribe: true },
    { id: 'part-5', first_name: 'Alexandre', last_name: 'Girard', archetype: 'Artiste', archetype_scores: { Artiste: 88, Empathique: 65, Sportif: 50, Professeur: 40, Critique: 30 }, is_scribe: false },
    { id: 'part-6', first_name: 'Camille', last_name: 'Roux', archetype: 'Artiste', archetype_scores: { Artiste: 82, Empathique: 60, Sportif: 45, Professeur: 45, Critique: 35 }, is_scribe: false },

    { id: 'part-7', first_name: 'Hugo', last_name: 'Fontaine', archetype: 'Critique', archetype_scores: { Critique: 92, Professeur: 75, Sportif: 45, Empathique: 30, Artiste: 35 }, is_scribe: true },
    { id: 'part-8', first_name: 'Élodie', last_name: 'Mercier', archetype: 'Critique', archetype_scores: { Critique: 85, Professeur: 70, Sportif: 50, Empathique: 40, Artiste: 40 }, is_scribe: false },
    { id: 'part-9', first_name: 'Julien', last_name: 'Blanc', archetype: 'Critique', archetype_scores: { Critique: 80, Professeur: 68, Sportif: 55, Empathique: 35, Artiste: 30 }, is_scribe: false },

    { id: 'part-10', first_name: 'Emma', last_name: 'Vasseur', archetype: 'Empathique', archetype_scores: { Empathique: 94, Artiste: 70, Sportif: 45, Professeur: 35, Critique: 20 }, is_scribe: true },
    { id: 'part-11', first_name: 'Nicolas', last_name: 'Lefevre', archetype: 'Empathique', archetype_scores: { Empathique: 86, Artiste: 65, Sportif: 50, Professeur: 40, Critique: 30 }, is_scribe: false },
    { id: 'part-12', first_name: 'Léa', last_name: 'Faure', archetype: 'Empathique', archetype_scores: { Empathique: 82, Artiste: 60, Sportif: 40, Professeur: 45, Critique: 35 }, is_scribe: false },

    { id: 'part-13', first_name: 'Maxime', last_name: 'Marchand', archetype: 'Sportif', archetype_scores: { Sportif: 96, Critique: 55, Professeur: 50, Artiste: 45, Empathique: 35 }, is_scribe: true },
    { id: 'part-14', first_name: 'Antoine', last_name: 'Perrin', archetype: 'Sportif', archetype_scores: { Sportif: 88, Critique: 60, Professeur: 45, Artiste: 40, Empathique: 40 }, is_scribe: false },
    { id: 'part-15', first_name: 'Inès', last_name: 'Dumont', archetype: 'Sportif', archetype_scores: { Sportif: 84, Critique: 50, Professeur: 40, Artiste: 55, Empathique: 45 }, is_scribe: false },
  ];

  const demoTeams = [
    { id: 'team-artistes', name: 'Les Schtroumpfs Artistes', archetype: 'Artiste', color: '#ec4899', avatar: 'artiste.jpg', current_house: 5, progress_percent: 83, scribe_participant_id: 'part-4' },
    { id: 'team-professeurs', name: 'Les Schtroumpfs Professeurs (Théoriciens)', archetype: 'Professeur', color: '#0284c7', avatar: 'professeur.jpg', current_house: 4, progress_percent: 66, scribe_participant_id: 'part-1' },
    { id: 'team-critiques', name: 'Les Schtroumpfs Critiques', archetype: 'Critique', color: '#8b5cf6', avatar: 'critique.jpg', current_house: 3, progress_percent: 50, scribe_participant_id: 'part-7' },
    { id: 'team-empathiques', name: 'Les Schtroumpfs Empathiques (Sentimentaux)', archetype: 'Empathique', color: '#10b981', avatar: 'empathique.jpg', current_house: 6, progress_percent: 100, scribe_participant_id: 'part-10' },
    { id: 'team-sportifs', name: 'Les Schtroumpfs Sportifs (Action Man)', archetype: 'Sportif', color: '#f59e0b', avatar: 'sportif.jpg', current_house: 3, progress_percent: 50, scribe_participant_id: 'part-13' },
  ];

  // Assigner les team_id aux participants
  demoParticipants.slice(0, 3).forEach(p => p.team_id = 'team-professeurs');
  demoParticipants.slice(3, 6).forEach(p => p.team_id = 'team-artistes');
  demoParticipants.slice(6, 9).forEach(p => p.team_id = 'team-critiques');
  demoParticipants.slice(9, 12).forEach(p => p.team_id = 'team-empathiques');
  demoParticipants.slice(12, 15).forEach(p => p.team_id = 'team-sportifs');

  const demoDeliverables = [
    // Équipe Savants (M1 à M4)
    {
      id: 'del-prof-1',
      team_id: 'team-professeurs',
      house_number: 1,
      house_title: 'Maison 1 : Besoin',
      content: {
        targetUser: 'Apiculteurs artisanaux et urbains',
        problem: 'Perte imprévue de ruches en hiver et effondrement des colonies',
        cause: 'Manque de surveillance thermique et hygrométrique continue non intrusive',
        formulation: 'Pour les apiculteurs, le problème est de détecter trop tard le stress thermique et les frelons car les visites physiques déstabilisent la reine.'
      },
      status: 'validated'
    },
    {
      id: 'del-prof-2',
      team_id: 'team-professeurs',
      house_number: 2,
      house_title: 'Maison 2 : Idée IoT',
      content: {
        conceptName: 'ApiGuard Schtroumpf Connect',
        measures: 'Température interne de grappe, hygrométrie, vibrations et fréquence acoustique',
        connectivity: 'LoRaWAN longue portée basse consommation',
        actions: 'Alerte prédictive par SMS/Appli lors d\'une anomalie de ponte ou attaque de prédateur'
      },
      status: 'validated'
    },
    {
      id: 'del-prof-3',
      team_id: 'team-professeurs',
      house_number: 3,
      house_title: 'Maison 3 : Faisabilité',
      content: {
        sensors: 'Sonde DS18B20 étanche, Accéléromètre piezo, Microphone I2S MEMS',
        processing: 'ESP32 Deep Sleep + Micro-panneau solaire 2W',
        protocol: 'LoRaWAN 868MHz (Passerelle communale TTN)',
        cloudUser: 'Backend Node.js/InfluxDB + Dashboard Grafana mobile pour l\'apiculteur'
      },
      status: 'validated'
    },
    {
      id: 'del-prof-4',
      team_id: 'team-professeurs',
      house_number: 4,
      house_title: 'Maison 4 : Prototype',
      content: {
        prototypeType: 'Boîtier étanche imprimé en 3D sous le couvre-cadre de ruche Dadant',
        usageScenario: 'Installation en 2 minutes sans vis. Calibration automatique dès la fermeture du toit.',
        testProtocol: 'Validation de l\'étanchéité IP67 en chambre froide à 0°C et autonomie sur batterie 18650.'
      },
      status: 'submitted'
    },
    // Équipe Solidaires (M1 à M6 - terminée !)
    {
      id: 'del-emp-1',
      team_id: 'team-empathiques',
      house_number: 1,
      house_title: 'Maison 1 : Besoin',
      content: {
        targetUser: 'Personnes âgées isolées vivant seules en maison rurale',
        problem: 'Isolement social et détection tardive d\'altération du rythme de vie quotidien',
        cause: 'Réticence à porter des médaillons d\'urgence stigmatisants',
        formulation: 'Pour les aînés isolés, le problème est de conserver leur dignité sans caméra intrusive tout en rassurant leurs aidants familiaux.'
      },
      status: 'validated'
    },
    {
      id: 'del-emp-2',
      team_id: 'team-empathiques',
      house_number: 2,
      house_title: 'Maison 2 : Idée IoT',
      content: {
        conceptName: 'Veilleuse Douce-Schtroumpf',
        measures: 'Allumage de lumière, bouilloire (courant), ouverture de porte frigo (choc/magnétique)',
        connectivity: 'Wi-Fi / 4G NB-IoT intégré',
        actions: 'Envoi d\'un message rassurant « Bonne journée Mamie ! » et alerte bienveillante si aucun mouvement matinal.'
      },
      status: 'validated'
    },
    {
      id: 'del-emp-3',
      team_id: 'team-empathiques',
      house_number: 3,
      house_title: 'Maison 3 : Faisabilité',
      content: {
        sensors: 'Prise connectée mesure de courant + Capteur PIR infrarouge passif',
        processing: 'Microcontrôleur ESP8266 basse consommation',
        protocol: 'MQTT sécurisé TLS via Wi-Fi domestique',
        cloudUser: 'Application mobile Aidant avec notifications chaleureuses et journal de vie'
      },
      status: 'validated'
    },
    {
      id: 'del-emp-4',
      team_id: 'team-empathiques',
      house_number: 4,
      house_title: 'Maison 4 : Prototype',
      content: {
        prototypeType: 'Veilleuse abat-jour en bois chaleureux qui s\'illumine discrètement',
        usageScenario: 'L\'aîné pose sa tasse sur le socle le matin : un coeur lumineux pulsatile signale le bonjour aux petits-enfants.',
        testProtocol: 'Test en conditions réelles avec 3 familles pilotes pendant 14 jours.'
      },
      status: 'validated'
    },
    {
      id: 'del-emp-5',
      team_id: 'team-empathiques',
      house_number: 5,
      house_title: 'Maison 5 : Business',
      content: {
        bmcValueProposition: 'Lien affectif rassurant sans caméra ni médaillon médical stigmatisant',
        bmcCustomerSegments: 'Enfants aidants (40-60 ans) et résidences seniors indépendantes',
        bmcChannels: 'Pharmacies, associations d\'aide à domicile, boutique en ligne',
        bmcRevenueStreams: 'Achat de la veilleuse 79€ + Abonnement cloud/SMS bienveillant 5€/mois',
        bmcCostStructure: 'Fabrication bois locale, serveurs sécurisés HDS, support client humain',
        bmcKeyActivities: 'Design produit, algorithme de respect de la vie privée, animation de communauté',
        bmcKeyResources: 'Brevet ergonomie douce, serveurs de données santé hébergés en France',
        bmcKeyPartners: 'Mutuelles de santé, CCAS municipaux, La Poste / Facteurs aidants'
      },
      status: 'validated'
    },
    {
      id: 'del-emp-6',
      team_id: 'team-empathiques',
      house_number: 6,
      house_title: 'Maison 6 : Marché',
      content: {
        launchPlan: 'Phase 1 : Pilote dans 20 EHPAD/Résidences. Phase 2 : Campagne Ulule axée sur la bienveillance intergénérationnelle.',
        targetMetrics: '1 000 foyers équipés d\'ici 12 mois, taux de satisfaction famille > 95%.',
        pitchScript: '« Mesdames et messieurs, 3 millions de grands-parents vivent seuls. Plutôt qu\'un bracelet anxiogène qui leur rappelle leur vulnérabilité, notre Veilleuse Douce recrée le fil magique entre générations grâce à l\'IoT invisible... »',
        pitchTimerSec: 180
      },
      status: 'validated'
    }
  ];

  // Sauvegarde
  await resetAll();
  for (const p of demoParticipants) {
    await addParticipant(p);
  }
  await saveTeams(demoTeams, demoParticipants.map(p => ({ id: p.id, team_id: p.team_id, is_scribe: p.is_scribe })));
  for (const d of demoDeliverables) {
    await saveDeliverable(d);
  }

  return { participants: demoParticipants.length, teams: demoTeams.length, deliverables: demoDeliverables.length };
}

module.exports = {
  initDatabase,
  getStatus,
  getSession,
  setSessionPhase,
  getParticipants,
  addParticipant,
  removeParticipant,
  getTeams,
  saveTeams,
  setTeamScribe,
  setTeamHouse,
  getDeliverables,
  saveDeliverable,
  resetAll,
  seedDemoData
};
