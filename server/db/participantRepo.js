/**
 * Repository pour les Participants (MySQL + Fallback autonome persistant)
 * Module : server/db/participantRepo.js
 */

const { getPool, isMySQLConnected, getMemoryStore, persistFallbackStore } = require('./store');

// Récupérer tous les participants
async function getParticipants() {
  const pool = getPool();
  if (isMySQLConnected() && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM participants ORDER BY created_at DESC');
      return rows.map(r => ({
        ...r,
        archetype_scores: typeof r.archetype_scores === 'string' ? JSON.parse(r.archetype_scores) : r.archetype_scores,
        is_scribe: Boolean(r.is_scribe)
      }));
    } catch (err) {
      console.error('[DB] Erreur getParticipants MySQL, utilisation fallback:', err.message);
    }
  }
  return getMemoryStore().participants;
}

// Ajouter ou mettre à jour un participant
async function addParticipant(participant) {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query(
        `INSERT INTO participants (id, session_id, first_name, last_name, archetype, archetype_scores, team_id, is_scribe)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          participant.id,
          participant.session_id || 'default',
          participant.first_name,
          participant.last_name,
          participant.archetype,
          JSON.stringify(participant.archetype_scores || {}),
          participant.team_id || null,
          participant.is_scribe ? 1 : 0
        ]
      );
    } catch (err) {
      console.error('[DB] Erreur addParticipant MySQL:', err.message);
    }
  }

  const existingIdx = memoryStore.participants.findIndex(p => p.id === participant.id);
  if (existingIdx >= 0) {
    memoryStore.participants[existingIdx] = participant;
  } else {
    memoryStore.participants.unshift(participant);
  }
  persistFallbackStore();
  return participant;
}

// Assigner ou déplacer manuellement un participant dans une équipe
async function assignParticipantToTeam(participantId, teamId) {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query(
        `UPDATE participants SET team_id = ? WHERE id = ?`,
        [teamId || null, participantId]
      );
    } catch (err) {
      console.error('[DB] Erreur assignParticipantToTeam MySQL:', err.message);
    }
  }

  const p = memoryStore.participants.find(part => part.id === participantId);
  if (p) {
    p.team_id = teamId || null;
  }
  persistFallbackStore();
  return p;
}

// Rattacher automatiquement tous les participants non affectés
async function autoAssignUnassignedParticipants() {
  const { getTeams } = require('./teamRepo');
  const teams = await getTeams();
  if (!teams || teams.length === 0) return { assigned: 0 };

  const { findTeamForLatecomer } = require('../services/teamService');
  const participants = await getParticipants();
  const unassigned = participants.filter(p => !p.team_id);
  let count = 0;
  const extraCounts = {};

  for (const p of unassigned) {
    const teamId = findTeamForLatecomer(p.archetype, teams, p.archetype_scores, extraCounts);
    if (teamId) {
      await assignParticipantToTeam(p.id, teamId);
      extraCounts[teamId] = (extraCounts[teamId] || 0) + 1;
      count++;
    }
  }

  return { assigned: count };
}

// Supprimer un participant (désistement / départ pendant l'atelier)
async function removeParticipant(participantId) {
  const pool = getPool();
  const memoryStore = getMemoryStore();
  const { getTeams, setTeamScribe } = require('./teamRepo');

  const allParticipants = await getParticipants();
  const allTeams = await getTeams();
  const p = allParticipants.find(x => x.id === participantId);
  const teamId = p ? p.team_id : null;
  const teamObj = teamId ? allTeams.find(t => t.id === teamId) : null;
  const wasScribe = p ? Boolean(p.is_scribe || (teamObj && teamObj.scribe_participant_id === p.id)) : false;

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('UPDATE deliverables SET submitted_by = NULL WHERE submitted_by = ?', [participantId]);
      await pool.query('UPDATE teams SET scribe_participant_id = NULL WHERE scribe_participant_id = ?', [participantId]);
      await pool.query('DELETE FROM participants WHERE id = ?', [participantId]);
    } catch (err) {
      console.error('[DB] Erreur delete participant MySQL:', err.message);
    }
  }

  memoryStore.participants = memoryStore.participants.filter(x => x.id !== participantId);

  // Si le participant était rédacteur du groupe, élire automatiquement le prochain membre
  const remainingMembers = allParticipants.filter(x => x.team_id === teamId && x.id !== participantId);
  if (teamId && wasScribe) {
    if (remainingMembers.length > 0) {
      await setTeamScribe(teamId, remainingMembers[0].id);
    } else {
      const t = memoryStore.teams.find(x => x.id === teamId);
      if (t) t.scribe_participant_id = null;
    }
  }

  persistFallbackStore();
  return { success: true, remainingCount: allParticipants.length - (p ? 1 : 0) };
}

module.exports = {
  getParticipants,
  addParticipant,
  assignParticipantToTeam,
  autoAssignUnassignedParticipants,
  removeParticipant
};
