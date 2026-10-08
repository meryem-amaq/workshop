/**
 * Repository pour les Sessions, le Reset et le Seeding de Démonstration
 * Module : server/db/sessionRepo.js
 */

const { getPool, isMySQLConnected, getMemoryStore, persistFallbackStore } = require('./store');
const { demoParticipants, demoTeams, demoDeliverables } = require('./seedData');

// Récupérer la session courante
async function getSession() {
  const pool = getPool();
  let session = getMemoryStore().session;
  if (isMySQLConnected() && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM sessions WHERE id = ?', ['default']);
      if (rows.length > 0) session = rows[0];
    } catch (err) {
      console.error('[DB] Erreur getSession MySQL:', err.message);
    }
  }
  return session;
}

// Mettre à jour la phase de la session
async function setSessionPhase(phase) {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  memoryStore.session.phase = phase;
  if (isMySQLConnected() && pool) {
    try {
      await pool.query('UPDATE sessions SET phase = ? WHERE id = ?', [phase, 'default']);
    } catch (err) {
      console.error('[DB] Erreur setSessionPhase MySQL:', err.message);
    }
  }
  persistFallbackStore();
  return memoryStore.session;
}

// Réinitialiser complètement le workshop
async function resetAll() {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      await pool.query('DELETE FROM deliverables');
      await pool.query('UPDATE participants SET team_id = NULL, is_scribe = FALSE');
      await pool.query('DELETE FROM teams');
      await pool.query('DELETE FROM participants');
      await pool.query('UPDATE sessions SET phase = "registration" WHERE id = "default"');
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

// Charger les données de démonstration
async function seedDemoData() {
  const { addParticipant } = require('./participantRepo');
  const { saveTeams } = require('./teamRepo');
  const { saveDeliverable } = require('./deliverableRepo');

  // Assigner les team_id aux participants de démonstration
  demoParticipants.slice(0, 3).forEach(p => p.team_id = 'team-professeurs');
  demoParticipants.slice(3, 6).forEach(p => p.team_id = 'team-artistes');
  demoParticipants.slice(6, 9).forEach(p => p.team_id = 'team-critiques');
  demoParticipants.slice(9, 12).forEach(p => p.team_id = 'team-empathiques');
  demoParticipants.slice(12, 15).forEach(p => p.team_id = 'team-sportifs');

  await resetAll();
  for (const p of demoParticipants) {
    await addParticipant(p);
  }
  await saveTeams(
    demoTeams,
    demoParticipants.map(p => ({ id: p.id, team_id: p.team_id, is_scribe: p.is_scribe }))
  );
  for (const d of demoDeliverables) {
    await saveDeliverable(d);
  }

  return {
    participants: demoParticipants.length,
    teams: demoTeams.length,
    deliverables: demoDeliverables.length
  };
}

module.exports = {
  getSession,
  setSessionPhase,
  resetAll,
  seedDemoData
};
