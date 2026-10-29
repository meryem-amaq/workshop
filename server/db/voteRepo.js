/**
 * Repository pour les Votes Inter-Équipes sur 20 (MySQL + Fallback autonome persistant)
 * Module : server/db/voteRepo.js
 */

const { getPool, isMySQLConnected, getMemoryStore, persistFallbackStore } = require('./store');

// Récupérer tous les votes enregistrés
async function getVotes() {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (!Array.isArray(memoryStore.votes)) {
    memoryStore.votes = [];
  }

  if (isMySQLConnected() && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM votes ORDER BY updated_at DESC');
      return rows.map((r) => ({
        ...r,
        score: Number(r.score) || 0,
        criteria: typeof r.criteria === 'string' ? JSON.parse(r.criteria) : (r.criteria || null)
      }));
    } catch (err) {
      console.error('[DB] Erreur getVotes MySQL:', err.message);
    }
  }

  return memoryStore.votes.map((v) => ({
    ...v,
    score: Number(v.score) || 0
  }));
}

// Enregistrer ou mettre à jour un vote sur 20 d'une équipe vers une autre équipe
async function saveVote({ voter_team_id, target_team_id, score, criteria = null, comment = '' }) {
  if (!voter_team_id || !target_team_id) {
    throw new Error('Équipe votante et équipe évaluée requises.');
  }
  if (voter_team_id === target_team_id) {
    throw new Error('Une équipe ne peut pas voter pour elle-même.');
  }

  const numericScore = Math.max(0, Math.min(20, Math.round(Number(score) * 2) / 2));
  const id = `vote_${voter_team_id}_${target_team_id}`;
  const criteriaJson = criteria ? JSON.stringify(criteria) : null;
  const cleanComment = String(comment || '').trim().slice(0, 500);

  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (!Array.isArray(memoryStore.votes)) {
    memoryStore.votes = [];
  }

  if (isMySQLConnected() && pool) {
    try {
      await pool.query(
        `INSERT INTO votes (id, voter_team_id, target_team_id, score, criteria, comment, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           score = VALUES(score),
           criteria = VALUES(criteria),
           comment = VALUES(comment),
           updated_at = NOW()`,
        [id, voter_team_id, target_team_id, numericScore, criteriaJson, cleanComment]
      );
    } catch (err) {
      console.error('[DB] Erreur saveVote MySQL:', err.message);
    }
  }

  const existingIdx = memoryStore.votes.findIndex(
    (v) => v.voter_team_id === voter_team_id && v.target_team_id === target_team_id
  );

  const voteRecord = {
    id,
    voter_team_id,
    target_team_id,
    score: numericScore,
    criteria: criteria || null,
    comment: cleanComment,
    updated_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    memoryStore.votes[existingIdx] = voteRecord;
  } else {
    memoryStore.votes.push(voteRecord);
  }

  persistFallbackStore();
  return voteRecord;
}

// Enregistrer en lot les votes d'une équipe pour toutes les autres équipes
async function saveTeamVotesBatch(voter_team_id, votesList = []) {
  if (!voter_team_id) {
    throw new Error('Équipe votante requise.');
  }

  for (const item of votesList) {
    if (!item || !item.target_team_id || item.target_team_id === voter_team_id) continue;
    if (item.score === undefined || item.score === null || item.score === '') continue;
    await saveVote({
      voter_team_id,
      target_team_id: item.target_team_id,
      score: item.score,
      criteria: item.criteria || null,
      comment: item.comment || ''
    });
  }

  return getVotes();
}

// Réinitialiser tous les votes
async function resetVotes() {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('DELETE FROM votes');
    } catch (err) {
      console.error('[DB] Erreur resetVotes MySQL:', err.message);
    }
  }

  memoryStore.votes = [];
  persistFallbackStore();
  return { success: true };
}

module.exports = {
  getVotes,
  saveVote,
  saveTeamVotesBatch,
  resetVotes
};
