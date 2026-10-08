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

  const participants = await getParticipants();
  const unassigned = participants.filter(p => !p.team_id);
  let count = 0;

  for (const p of unassigned) {
    let matchingTeam = teams.find(t => t.archetype === p.archetype);
    if (!matchingTeam) {
      matchingTeam = teams.slice().sort((a, b) => (a.members || []).length - (b.members || []).length)[0];
    }
    if (matchingTeam) {
      await assignParticipantToTeam(p.id, matchingTeam.id);
      count++;
    }
  }

  return { assigned: count };
}

// Supprimer un participant (désistement / départ pendant l'atelier)
async function removeParticipant(participantId) {
  const pool = getPool();
  const memoryStore = getMemoryStore();
  const { setTeamScribe } = require('./teamRepo');

  const p = memoryStore.participants.find(x => x.id === participantId);
  const teamId = p ? p.team_id : null;
  const wasScribe = p ? (p.is_scribe || p.id === (memoryStore.teams.find(t => t.id === teamId)?.scribe_participant_id)) : false;

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('DELETE FROM participants WHERE id = ?', [participantId]);
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
      if (isMySQLConnected() && pool) {
        await pool.query('UPDATE teams SET scribe_participant_id = NULL WHERE id = ?', [teamId]);
      }
    }
  }

  persistFallbackStore();
  return { success: true, remainingCount: memoryStore.participants.length };
}

module.exports = {
  getParticipants,
  addParticipant,
  assignParticipantToTeam,
  autoAssignUnassignedParticipants,
  removeParticipant
};
