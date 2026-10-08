/**
 * Routes pour la gestion des livrables des 6 Maisons
 * Module : server/routes/deliverableRoutes.js
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// Liste des livrables (filtrable par team_id)
router.get('/', async (req, res) => {
  try {
    const { team_id } = req.query;
    const deliverables = await db.getDeliverables(team_id || null);
    res.json(deliverables || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enregistrer un livrable pour une maison (Accès strict Rédacteur / Scribe)
router.post('/', async (req, res) => {
  try {
    const { team_id, house_number, house_title, content, submitted_by, advance_next } = req.body;
    if (!team_id || !house_number || !content) {
      return res.status(400).json({ error: 'Données de livrable incomplètes (team_id, house_number, content requis).' });
    }

    const teams = await db.getTeams();
    const currentTeam = teams.find(t => t.id === team_id);
    if (!currentTeam) {
      return res.status(404).json({ error: 'Équipe introuvable.' });
    }

    // Vérification stricte des droits du rédacteur officiel
    if (submitted_by && currentTeam.scribe_participant_id && currentTeam.scribe_participant_id !== submitted_by) {
      return res.status(403).json({ 
        error: `Accès refusé : Seul le rédacteur officiel (${currentTeam.scribe ? currentTeam.scribe.first_name + ' ' + currentTeam.scribe.last_name : 'le porteur de stylo'}) possède les droits de saisie pour ce groupe.` 
      });
    }

    const deliverableId = `del_${team_id}_m${house_number}`;
    const deliverable = {
      id: deliverableId,
      team_id,
      house_number: parseInt(house_number, 10),
      house_title: house_title || `Maison ${house_number}`,
      content,
      submitted_by: submitted_by || null,
      status: 'submitted'
    };

    await db.saveDeliverable(deliverable);

    // Si demandé, avancer automatiquement l'équipe à l'étape suivante (max 6)
    const shouldAdvance = Boolean(advance_next || req.body.advanceNext || req.body.status === 'validated');
    if (shouldAdvance && house_number < 6) {
      await db.setTeamHouse(team_id, house_number + 1);
    }

    const updatedDeliverables = await db.getDeliverables(team_id);
    const allTeams = await db.getTeams();
    const updatedTeam = allTeams.find(t => t.id === team_id);

    res.json({
      success: true,
      deliverable,
      team: updatedTeam,
      team_deliverables: updatedDeliverables
    });
  } catch (err) {
    console.error('Erreur enregistrement livrable:', err);
    res.status(500).json({ error: err.message });
  }
});

// Valider un livrable (Vue Animateur)
router.post('/:id/validate', async (req, res) => {
  try {
    const deliverableId = req.params.id;
    const deliverables = await db.getDeliverables();
    const d = deliverables.find(del => del.id === deliverableId);
    if (!d) return res.status(404).json({ error: 'Livrable non trouvé' });

    d.status = 'validated';
    d.validated_at = new Date().toISOString();
    await db.saveDeliverable(d);

    // Faire avancer l'équipe si applicable
    if (d.house_number < 6) {
      await db.setTeamHouse(d.team_id, d.house_number + 1);
    }

    res.json({ success: true, deliverable: d });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
