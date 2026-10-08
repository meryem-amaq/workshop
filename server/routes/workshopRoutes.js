/**
 * Routes générales du Workshop (Santé, Session, QR Code, Restitution, Seed & Reset)
 * Module : server/routes/workshopRoutes.js
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { PORT, ARCHETYPES_META, getLocalIp } = require('../config');

let QRCode = null;
try {
  QRCode = require('qrcode');
} catch (e) {
  QRCode = null;
}

// 1. Statut & Santé (MySQL, Réseau & Workshop)
router.get('/health', (req, res) => {
  const status = db.getStatus();
  const localIp = getLocalIp();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: status,
    archetypes: Object.keys(ARCHETYPES_META),
    network: {
      localIp: localIp,
      port: PORT,
      joinUrl: `http://${localIp}:${PORT}/?join=1`
    }
  });
});

// 2. État global synchronisé du Workshop
router.get('/state', async (req, res) => {
  try {
    const [teams, participants, deliverables] = await Promise.all([
      db.getTeams(),
      db.getParticipants(),
      db.getDeliverables()
    ]);
    res.json({
      phase: teams.length > 0 ? 'teams_formed' : 'registration',
      teams,
      participants,
      deliverables
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. État de la session globale (pour synchronisation en temps réel)
router.get('/session', async (req, res) => {
  try {
    const session = await db.getSession();
    const participants = await db.getParticipants();
    const teams = await db.getTeams();
    res.json({
      session,
      phase: session.phase || 'registration',
      participantCount: participants.length,
      participants: participants.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        archetype: p.archetype,
        team_id: p.team_id,
        is_scribe: p.is_scribe,
        created_at: p.created_at
      })),
      teamsCount: teams.length,
      teams: teams
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Générateur de QR Code scannable officiel
router.get('/qrcode', async (req, res) => {
  try {
    const localIp = getLocalIp();
    let targetUrl = req.query.url;

    if (targetUrl) {
      targetUrl = targetUrl.replace(/localhost/gi, localIp).replace(/127\.0\.0\.1/gi, localIp);
    } else {
      targetUrl = `http://${localIp}:${PORT}/?join=1`;
    }

    if (QRCode) {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        margin: 2,
        width: 520,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#070d19',
          light: '#ffffff'
        }
      });
      return res.json({ success: true, dataUrl, url: targetUrl, localIp, port: PORT });
    }
    res.json({ success: false, url: targetUrl, localIp, port: PORT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Récupérer les métadonnées des archétypes
router.get('/archetypes', (req, res) => {
  res.json(ARCHETYPES_META);
});

// 6. Restitution globale (Compte Rendu multi-équipes)
router.get('/restitution', async (req, res) => {
  try {
    const teams = await db.getTeams();
    const allDeliverables = await db.getDeliverables();
    const participants = await db.getParticipants();

    const restitutionData = teams.map(t => {
      const teamDeliverables = allDeliverables.filter(d => d.team_id === t.id);
      return {
        id: t.id,
        name: t.name,
        archetype: t.archetype,
        color: t.color,
        avatar: t.avatar,
        current_house: t.current_house,
        progress_percent: t.progress_percent,
        members: participants.filter(p => p.team_id === t.id),
        scribe: participants.find(p => p.id === t.scribe_participant_id) || null,
        deliverables: {
          1: teamDeliverables.find(d => d.house_number === 1) || null,
          2: teamDeliverables.find(d => d.house_number === 2) || null,
          3: teamDeliverables.find(d => d.house_number === 3) || null,
          4: teamDeliverables.find(d => d.house_number === 4) || null,
          5: teamDeliverables.find(d => d.house_number === 5) || null,
          6: teamDeliverables.find(d => d.house_number === 6) || null
        }
      };
    });

    res.json({
      timestamp: new Date().toISOString(),
      workshop_title: 'Le Village IoT des Schtroumpfs - Restitution Finale',
      teams: restitutionData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Charger les données de démonstration
router.post('/demo/seed', async (req, res) => {
  try {
    const result = await db.seedDemoData();
    res.json({ success: true, message: 'Données de démonstration chargées avec succès !', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Réinitialiser le workshop
router.post('/workshop/reset', async (req, res) => {
  try {
    await db.resetAll();
    res.json({ success: true, message: 'Données du workshop réinitialisées.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
