/**
 * Routes pour la gestion des participants
 * Module : server/routes/participantRoutes.js
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { ARCHETYPES_META } = require('../config');
const { calculatePersonality15, formatParticipantRecord } = require('../services/personalityService');
const { findTeamForLatecomer } = require('../services/teamService');

// Inscription & calcul du profil Schtroumpf (15 questions)
router.post(['/', '/register'], async (req, res) => {
  try {
    const { first_name, last_name, ratings, answers, archetype, scores } = req.body;

    // Vérifier si des équipes existent déjà (affectation retardataire)
    const existingTeams = await db.getTeams();
    const tempDominant = (archetype && ARCHETYPES_META[archetype])
      ? archetype
      : calculatePersonality15(Array.isArray(ratings) ? ratings : (Array.isArray(answers) ? answers : [])).dominantArchetype;
    const assignedTeamId = findTeamForLatecomer(tempDominant, existingTeams);

    const participant = formatParticipantRecord({
      first_name,
      last_name,
      ratings,
      answers,
      archetype,
      scores,
      assignedTeamId
    });

    await db.addParticipant(participant);

    res.json({
      success: true,
      participant,
      assignedTeamId,
      meta: ARCHETYPES_META[participant.archetype]
    });
  } catch (err) {
    console.error('Erreur inscription participant:', err);
    res.status(err.message && err.message.includes('obligatoire') ? 400 : 500).json({ error: err.message });
  }
});

// Liste de tous les participants
router.get('/', async (req, res) => {
  try {
    const participants = await db.getParticipants();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un participant spécifique
router.get('/:id', async (req, res) => {
  try {
    const participants = await db.getParticipants();
    const p = participants.find(item => String(item.id) === String(req.params.id));
    if (!p) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un participant (abandon / départ)
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.removeParticipant(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assigner ou réassigner manuellement l'équipe d'un participant
router.post('/:id/team', async (req, res) => {
  try {
    const { teamId } = req.body;
    const participantId = req.params.id;
    const updated = await db.assignParticipantToTeam(participantId, teamId || null);
    if (!updated) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    const teams = await db.getTeams();
    res.json({ success: true, participant: updated, teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rattachement automatique en masse des participants sans équipe
router.post('/auto-assign-unassigned', async (req, res) => {
  try {
    const result = await db.autoAssignUnassignedParticipants();
    const participants = await db.getParticipants();
    const teams = await db.getTeams();
    res.json({ success: true, ...result, participants, teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
