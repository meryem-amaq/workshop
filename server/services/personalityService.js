/**
 * Service de calcul du profil psychologique Schtroumpf
 * Basé sur le questionnaire officiel de 15 questions (échelle Likert 1 à 5, scores /75)
 */

const { ARCHETYPES_META } = require('../config');

/**
 * Calcule les scores, pourcentages et profil dominant à partir des réponses au questionnaire
 * @param {Array<number|string>} ratings - Tableau des 15 notes de 1 à 5
 * @returns {Object} { dominantArchetype, scores75, totalSum, breakdown }
 */
function calculatePersonality15(ratings = []) {
  const q = (idx) => {
    const val = parseInt(ratings[idx] !== undefined ? ratings[idx] : 3, 10);
    return isNaN(val) ? 3 : Math.min(5, Math.max(1, val));
  };

  // Somme des 3 questions associées à chaque profil
  const rawSums = {
    Sportif: q(0) + q(5) + q(10),       // Q1 + Q6 + Q11
    Artiste: q(1) + q(6) + q(11),       // Q2 + Q7 + Q12
    Professeur: q(2) + q(7) + q(12),   // Q3 + Q8 + Q13
    Critique: q(3) + q(8) + q(13),     // Q4 + Q9 + Q14
    Empathique: q(4) + q(9) + q(14)    // Q5 + Q10 + Q15
  };

  // Score total sur 75 = Somme des notes * 5
  const scores75 = {
    Sportif: rawSums.Sportif * 5,
    Artiste: rawSums.Artiste * 5,
    Professeur: rawSums.Professeur * 5,
    Critique: rawSums.Critique * 5,
    Empathique: rawSums.Empathique * 5
  };

  const totalSum = Object.values(scores75).reduce((acc, v) => acc + v, 0);

  function getLevel(score) {
    if (score >= 60) return 'Trait Dominant majeur';
    if (score >= 45) return 'Trait Fort';
    if (score >= 30) return 'Trait Modéré';
    return 'Trait Secondaire';
  }

  const breakdown = {};
  let dominantArchetype = 'Sportif';
  let maxScore = -1;

  for (const [trait, score] of Object.entries(scores75)) {
    const pct = totalSum > 0 ? Math.round((score / totalSum) * 100) : 20;
    breakdown[trait] = {
      rawSum: rawSums[trait],
      score: score, // sur 75
      percent: pct,
      level: getLevel(score)
    };
    if (score > maxScore) {
      maxScore = score;
      dominantArchetype = trait;
    }
  }

  return { dominantArchetype, scores75, totalSum, breakdown };
}

/**
 * Normalise les informations d'un participant et construit son enregistrement
 * @param {Object} input
 * @returns {Object} participant
 */
function formatParticipantRecord({
  first_name = '',
  last_name = '',
  ratings = [],
  answers = [],
  archetype = null,
  scores = null,
  assignedTeamId = null
}) {
  let fName = (first_name || '').trim();
  let lName = (last_name || '').trim();

  if (!fName && !lName) {
    throw new Error('Le prénom est obligatoire pour participer.');
  }

  if (!fName) fName = lName;
  if (!lName) {
    const parts = fName.split(' ');
    if (parts.length > 1) {
      fName = parts[0];
      lName = parts.slice(1).join(' ');
    } else {
      lName = 'Schtroumpf';
    }
  }

  const inputRatings = Array.isArray(ratings) ? ratings : (Array.isArray(answers) ? answers : []);
  let { dominantArchetype, scores75, totalSum, breakdown } = calculatePersonality15(inputRatings);

  if (archetype && ARCHETYPES_META[archetype]) {
    dominantArchetype = archetype;
  }
  if (scores && typeof scores === 'object') {
    scores75 = scores;
  }

  const participantId = 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  return {
    id: participantId,
    session_id: 'default',
    first_name: fName,
    last_name: lName,
    archetype: dominantArchetype,
    archetype_scores: scores75,
    breakdown: breakdown,
    total_sum: totalSum,
    team_id: assignedTeamId,
    is_scribe: false,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  calculatePersonality15,
  formatParticipantRecord
};
