/**
 * Repository pour les Équipes (MySQL + Fallback autonome persistant)
 * Module : server/db/teamRepo.js
 */

const { getPool, isMySQLConnected, getMemoryStore, persistFallbackStore } = require('./store');

// Récupérer toutes les équipes avec leurs membres, livrables et scribe
async function getTeams() {
  const pool = getPool();
  const memoryStore = getMemoryStore();
  const { getParticipants } = require('./participantRepo');
  const { getDeliverables } = require('./deliverableRepo');

  let teams = memoryStore.teams;
  if (isMySQLConnected() && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM teams ORDER BY name ASC');
      teams = rows;
    } catch (err) {
      console.error('[DB] Erreur getTeams MySQL:', err.message);
    }
  }

  const participants = await getParticipants();
  const deliverables = await getDeliverables();

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
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('DELETE FROM deliverables');
      await pool.query('UPDATE participants SET team_id = NULL, is_scribe = FALSE');
      await pool.query('DELETE FROM teams');

      for (const t of teams) {
        await pool.query(
          `INSERT INTO teams (id, session_id, name, archetype, color, avatar, current_house, progress_percent, scribe_participant_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.id, 'default', t.name, t.archetype, t.color, t.avatar, t.current_house || 1, t.progress_percent || 16, t.scribe_participant_id || null]
        );
      }

      for (const u of participantUpdates) {
        await pool.query(
          `UPDATE participants SET team_id = ?, is_scribe = ? WHERE id = ?`,
          [u.team_id, u.is_scribe ? 1 : 0, u.id]
        );
      }
    } catch (err) {
      console.error('[DB] Erreur saveTeams MySQL:', err.message);
    }
  }

  memoryStore.teams = teams;
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
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('UPDATE participants SET is_scribe = FALSE WHERE team_id = ?', [teamId]);
      await pool.query('UPDATE participants SET is_scribe = TRUE WHERE id = ?', [participantId]);
      await pool.query('UPDATE teams SET scribe_participant_id = ? WHERE id = ?', [participantId, teamId]);
    } catch (err) {
      console.error('[DB] Erreur setTeamScribe MySQL:', err.message);
    }
  }

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
  const pool = getPool();
  const memoryStore = getMemoryStore();

  const clampedHouse = Math.max(1, Math.min(6, parseInt(houseNumber, 10)));
  const progressMap = { 1: 16, 2: 33, 3: 50, 4: 66, 5: 83, 6: 100 };
  const progressPercent = progressMap[clampedHouse] || 16;

  if (isMySQLConnected() && pool) {
    try {
      await pool.query(
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

module.exports = {
  getTeams,
  saveTeams,
  setTeamScribe,
  setTeamHouse
};
