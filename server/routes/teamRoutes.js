/**
 * Routes pour la gestion des équipes et attribution des rôles
 * Module : server/routes/teamRoutes.js
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateHomogeneousTeams } = require('../services/teamService');

// Génération automatique des groupes homogènes
router.post(['/generate', '/auto-assign'], async (req, res) => {
  try {
    const participants = await db.getParticipants();
    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: 'Aucun participant inscrit. Veuillez inscrire des participants avant de former les groupes.' });
    }

    const { teams, participantUpdates } = generateHomogeneousTeams(participants);

    // Enregistrer les équipes et changer la phase du workshop
    const savedTeams = await db.saveTeams(teams, participantUpdates);
    await db.setSessionPhase('teams_formed');

    res.json({
      success: true,
      teams: savedTeams,
      count: savedTeams.length,
      phase: 'teams_formed'
    });
  } catch (err) {
    console.error('Erreur génération équipes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Liste des équipes avec membres et état
router.get('/', async (req, res) => {
  try {
    const teams = await db.getTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Désigner un nouveau rédacteur / scribe
router.all('/:id/scribe', async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'PUT') return res.status(405).end();
  try {
    const participant_id = req.body.participant_id || req.body.scribe_id;
    const teamId = req.params.id;
    if (!participant_id) {
      return res.status(400).json({ error: 'Identifiant du participant requis.' });
    }
    const updatedTeams = await db.setTeamScribe(teamId, participant_id);
    res.json({ success: true, teams: updatedTeams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier / Forcer l'étape (Maison 1 à 6) d'une équipe
router.post('/:id/house', async (req, res) => {
  try {
    const { house_number } = req.body;
    const teamId = req.params.id;
    const updatedTeam = await db.setTeamHouse(teamId, house_number);
    res.json({ success: true, team: updatedTeam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias pour rattachement automatique des participants non assignés
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
