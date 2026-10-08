/**
 * Repository pour les Livrables (MySQL + Fallback autonome persistant)
 * Module : server/db/deliverableRepo.js
 */

const { getPool, isMySQLConnected, getMemoryStore, persistFallbackStore } = require('./store');

// Récupérer les livrables (filtrable par teamId)
async function getDeliverables(teamId = null) {
  const pool = getPool();
  const memoryStore = getMemoryStore();

  if (isMySQLConnected() && pool) {
    try {
      let query = 'SELECT * FROM deliverables';
      const params = [];
      if (teamId) {
        query += ' WHERE team_id = ?';
        params.push(teamId);
      }
      query += ' ORDER BY house_number ASC';
      const [rows] = await pool.query(query, params);
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
  const pool = getPool();
  const memoryStore = getMemoryStore();

  const { id, team_id, house_number, house_title, content, submitted_by, status } = deliverable;
  const contentJson = JSON.stringify(content || {});

  if (isMySQLConnected() && pool) {
    try {
      await pool.query(
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

module.exports = {
  getDeliverables,
  saveDeliverable
};
