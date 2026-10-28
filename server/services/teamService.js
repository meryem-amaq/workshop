/**
 * Service de gestion et d'équilibrage des équipes
 *
 * Répartition ÉQUILIBRÉE : les participants sont répartis sur les équipes
 * (une équipe par caractère Schtroumpf) en visant 2 ou 3 personnes par équipe,
 * quel que soit le résultat du questionnaire (même si tout le monde a le même profil).
 * Chaque personne est placée en priorité dans l'équipe où son score est le plus élevé,
 * parmi les places disponibles.
 */

const { ARCHETYPES_LIST, ARCHETYPES_META, TEAM_NAME_TEMPLATES } = require('../config');

const MIN_TEAM_SIZE = 2;

/**
 * Score d'un participant pour un archétype donné (0 si absent)
 */
function getScore(participant, archetype) {
  const scores = participant && participant.archetype_scores;
  const val = scores && Number(scores[archetype]);
  return Number.isFinite(val) ? val : 0;
}

/**
 * Choisit l'équipe la moins remplie pour un participant retardataire.
 * À effectif égal, on privilégie l'équipe où son score est le plus élevé,
 * puis l'équipe de son archétype dominant.
 * @param {string} dominantArchetype
 * @param {Array<Object>} existingTeams
 * @param {Object} scores - scores par archétype (optionnel)
 * @param {Object} extraCounts - effectifs ajoutés localement { teamId: n } (optionnel)
 * @returns {string|null} teamId
 */
function findTeamForLatecomer(dominantArchetype, existingTeams = [], scores = null, extraCounts = {}) {
  if (!existingTeams || existingTeams.length === 0) {
    return null;
  }

  const size = (t) => (t.members || []).length + (extraCounts[t.id] || 0);
  const scoreFor = (t) => {
    const v = scores && Number(scores[t.archetype]);
    return Number.isFinite(v) ? v : 0;
  };

  const sorted = existingTeams.slice().sort((a, b) => {
    if (size(a) !== size(b)) return size(a) - size(b);
    if (scoreFor(b) !== scoreFor(a)) return scoreFor(b) - scoreFor(a);
    const aDom = a.archetype === dominantArchetype ? 0 : 1;
    const bDom = b.archetype === dominantArchetype ? 0 : 1;
    return aDom - bDom;
  });

  return sorted[0] ? sorted[0].id : null;
}

/**
 * Génère des équipes équilibrées (2 ou 3 personnes quand c'est possible)
 * et désigne le premier inscrit de chaque groupe comme rédacteur (scribe).
 * @param {Array<Object>} participants
 * @returns {Object} { teams, participantUpdates }
 */
function generateBalancedTeams(participants = []) {
  if (!participants || participants.length === 0) {
    throw new Error('Aucun participant inscrit. Veuillez inscrire des participants avant de former les groupes.');
  }

  // Ordre chronologique d'inscription
  const sorted = participants.slice().sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );
  const total = sorted.length;

  // Nombre d'équipes : 5 max, avec au moins 2 personnes par équipe quand c'est possible
  const teamCount = Math.max(1, Math.min(ARCHETYPES_LIST.length, Math.floor(total / MIN_TEAM_SIZE)));

  // Choix des archétypes utilisés : les plus "demandés" (somme des scores) si moins de 5 équipes
  const demand = {};
  ARCHETYPES_LIST.forEach((arch) => {
    demand[arch] = sorted.reduce((sum, p) => sum + getScore(p, arch), 0);
  });
  const chosenArchetypes = ARCHETYPES_LIST
    .slice()
    .sort((a, b) => (demand[b] - demand[a]) || (ARCHETYPES_LIST.indexOf(a) - ARCHETYPES_LIST.indexOf(b)))
    .slice(0, teamCount);

  // Capacités exactes : effectif de base + 1 place en plus pour les équipes les plus demandées
  const base = Math.floor(total / teamCount);
  const extra = total % teamCount;
  const capacity = {};
  chosenArchetypes.forEach((arch, idx) => {
    capacity[arch] = base + (idx < extra ? 1 : 0);
  });

  // Affectation gloutonne : les meilleurs scores d'abord (égalité = ordre d'inscription)
  const pairs = [];
  sorted.forEach((p, order) => {
    chosenArchetypes.forEach((arch) => {
      pairs.push({ p, order, arch, score: getScore(p, arch) });
    });
  });
  pairs.sort((x, y) =>
    (y.score - x.score) ||
    (x.order - y.order) ||
    (ARCHETYPES_LIST.indexOf(x.arch) - ARCHETYPES_LIST.indexOf(y.arch))
  );

  const membersByArchetype = {};
  chosenArchetypes.forEach((arch) => { membersByArchetype[arch] = []; });
  const assigned = new Set();

  pairs.forEach(({ p, arch }) => {
    if (assigned.has(p.id)) return;
    if (membersByArchetype[arch].length >= capacity[arch]) return;
    membersByArchetype[arch].push(p);
    assigned.add(p.id);
  });

  // Sécurité : tout participant restant va dans l'équipe la moins remplie
  sorted.forEach((p) => {
    if (assigned.has(p.id)) return;
    const arch = chosenArchetypes
      .slice()
      .sort((a, b) => membersByArchetype[a].length - membersByArchetype[b].length)[0];
    membersByArchetype[arch].push(p);
    assigned.add(p.id);
  });

  const teams = [];
  const participantUpdates = [];

  chosenArchetypes.forEach((archetype) => {
    // Ordre d'inscription au sein de l'équipe : le premier inscrit devient rédacteur
    const members = membersByArchetype[archetype].slice().sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );
    if (members.length === 0) return;

    const teamId = 'team-' + archetype.toLowerCase() + '-' + Date.now().toString(36);
    const meta = ARCHETYPES_META[archetype];

    teams.push({
      id: teamId,
      session_id: 'default',
      name: TEAM_NAME_TEMPLATES[archetype] || `Équipe ${archetype}`,
      archetype: archetype,
      color: meta.color,
      avatar: meta.avatar,
      current_house: 1,
      progress_percent: 16,
      scribe_participant_id: members[0].id
    });

    members.forEach((m, idx) => {
      participantUpdates.push({
        id: m.id,
        team_id: teamId,
        is_scribe: idx === 0
      });
    });
  });

  return { teams, participantUpdates };
}

module.exports = {
  findTeamForLatecomer,
  generateBalancedTeams,
  // Alias conservé pour compatibilité avec l'ancien nom
  generateHomogeneousTeams: generateBalancedTeams
};
