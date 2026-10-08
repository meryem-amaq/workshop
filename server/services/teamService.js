/**
 * Service de gestion et d'équilibrage des équipes
 * Gère la répartition homogène par archétype, l'affectation du rédacteur initial et les retardataires.
 */

const { ARCHETYPES_LIST, ARCHETYPES_META, TEAM_NAME_TEMPLATES } = require('../config');

/**
 * Trouve la meilleure équipe pour un participant retardataire
 * (priorité à son archétype, sinon équipe la moins remplie)
 * @param {string} dominantArchetype
 * @param {Array<Object>} existingTeams
 * @returns {string|null} teamId
 */
function findTeamForLatecomer(dominantArchetype, existingTeams = []) {
  if (!existingTeams || existingTeams.length === 0) {
    return null;
  }

  let matchingTeam = existingTeams.find(t => t.archetype === dominantArchetype);
  if (!matchingTeam) {
    matchingTeam = existingTeams.slice().sort((a, b) => (a.members || []).length - (b.members || []).length)[0];
  }

  return matchingTeam ? matchingTeam.id : null;
}

/**
 * Génère les équipes homogènes basées sur les archétypes Schtroumpf
 * et désigne le premier inscrit de chaque groupe comme rédacteur officiel (scribe).
 * @param {Array<Object>} participants
 * @returns {Object} { teams, participantUpdates }
 */
function generateHomogeneousTeams(participants = []) {
  if (!participants || participants.length === 0) {
    throw new Error('Aucun participant inscrit. Veuillez inscrire des participants avant de former les groupes.');
  }

  const groupsByArchetype = {
    Artiste: [],
    Professeur: [],
    Critique: [],
    Empathique: [],
    Sportif: []
  };

  // Trier dans l'ordre chronologique d'inscription
  const sortedParticipants = participants.slice().sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );

  sortedParticipants.forEach(p => {
    if (groupsByArchetype[p.archetype]) {
      groupsByArchetype[p.archetype].push(p);
    } else {
      groupsByArchetype.Professeur.push(p);
    }
  });

  const teams = [];
  const participantUpdates = [];

  ARCHETYPES_LIST.forEach((archetype) => {
    const members = groupsByArchetype[archetype];
    if (members && members.length > 0) {
      const teamId = 'team-' + archetype.toLowerCase() + '-' + Date.now().toString(36);
      const meta = ARCHETYPES_META[archetype];
      
      // Le premier membre inscrit est désigné comme porteur de stylo / scribe par défaut
      const scribeId = members[0].id;

      teams.push({
        id: teamId,
        session_id: 'default',
        name: TEAM_NAME_TEMPLATES[archetype] || `Équipe ${archetype}`,
        archetype: archetype,
        color: meta.color,
        avatar: meta.avatar,
        current_house: 1,
        progress_percent: 16,
        scribe_participant_id: scribeId
      });

      members.forEach((m, idx) => {
        participantUpdates.push({
          id: m.id,
          team_id: teamId,
          is_scribe: idx === 0
        });
      });
    }
  });

  return { teams, participantUpdates };
}

module.exports = {
  findTeamForLatecomer,
  generateHomogeneousTeams
};
