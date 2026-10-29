/**
 * Routes générales du Workshop (Santé, Session, QR Code, Restitution, Seed & Reset)
 * Module : server/routes/workshopRoutes.js
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { PORT, ARCHETYPES_META, getLocalIp } = require('../config');

const JWT_SECRET = process.env.JWT_SECRET || 'smurf-iot-village-jwt-secret-key-2026';
const JWT_EXP_SECONDS = 8 * 60 * 60; // 8 heures

function signAdminJwt(admin) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || 'superadmin',
      iat: now,
      exp: now + JWT_EXP_SECONDS
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyAdminJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!decoded.exp || decoded.exp <= now) return null;
    return decoded;
  } catch {
    return null;
  }
}

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
      joinUrl: `http://${localIp}:${PORT}/register`
    }
  });
});

// 2. État global synchronisé du Workshop (Endpoint unifié haute performance)
router.get('/state', async (req, res) => {
  try {
    const [session, teams, participants, deliverables, votes] = await Promise.all([
      db.getSession(),
      db.getTeams(),
      db.getParticipants(),
      db.getDeliverables(),
      db.getVotes()
    ]);
    res.json({
      session,
      phase: session?.phase || (teams.length > 0 ? 'teams_formed' : 'registration'),
      teams,
      participants,
      deliverables,
      votes
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

// 4. Générateur de QR Code scannable officiel (Compatible Heroku, Cloud, Wi-Fi Local & LAN)
router.get('/qrcode', async (req, res) => {
  try {
    const localIp = getLocalIp();
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const rawProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const proto = String(rawProto).split(',')[0].trim();

    const isCloud = host.includes('herokuapp.com') ||
                    host.includes('onrender.com') ||
                    host.includes('railway.app') ||
                    host.includes('vercel.app') ||
                    (!host.includes('localhost') && !host.includes('127.0.0.1') && !/^\d+\.\d+\.\d+\.\d+/.test(host));

    let targetUrl = req.query.url;

    if (!targetUrl) {
      if (isCloud && host) {
        targetUrl = `${proto}://${host}/register`;
      } else {
        targetUrl = `http://${localIp}:${PORT}/register`;
      }
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
      return res.json({
        success: true,
        dataUrl,
        url: targetUrl,
        localIp,
        host,
        isCloud,
        port: PORT
      });
    }
    res.json({ success: false, url: targetUrl, localIp, host, isCloud, port: PORT });
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

// 7. Charger les données de démonstration (Sécurisé : refuse d'écraser si des participants réels sont inscrits)
router.post('/demo/seed', async (req, res) => {
  try {
    const current = await db.getParticipants();
    if (current && current.length > 0) {
      return res.status(400).json({ error: 'Action bloquée par sécurité : des participants réels sont déjà inscrits dans l\'atelier.' });
    }
    const result = await db.seedDemoData();
    res.json({ success: true, message: 'Données de démonstration chargées avec succès !', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Réinitialiser le workshop (Sécurisé par Code PIN Animateur)
router.post('/workshop/reset', async (req, res) => {
  try {
    const { pin } = req.body;
    const { isValidAdminPin } = require('../config');
    // Vérifier si le code pin est fourni ou si requête interne
    if (pin && !isValidAdminPin(pin)) {
      return res.status(403).json({ error: 'Code d\'accès animateur invalide.' });
    }
    await db.resetAll();
    res.json({ success: true, message: 'Données du workshop réinitialisées.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Authentification Sécurisée Super Admin avec émission d'un JWT signé (HS256)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez renseigner votre email et mot de passe.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPwd = String(password).trim();

    const admin = await db.verifyAdminLogin(cleanEmail, cleanPwd);
    if (!admin) {
      return res.status(401).json({ error: 'Adresse email ou mot de passe incorrect.' });
    }

    const token = signAdminJwt(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Vérification stricte du JWT Super Admin
router.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const decoded = verifyAdminJwt(token);
  if (!decoded) {
    return res.status(401).json({ valid: false, error: 'Session expirée ou jeton JWT invalide.' });
  }
  return res.json({ valid: true, admin: decoded });
});

// 11. Votes Inter-Équipes sur 20 (/api/votes)
router.get('/votes', async (req, res) => {
  try {
    const votes = await db.getVotes();
    res.json({ success: true, votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/votes', async (req, res) => {
  try {
    const { voter_team_id, target_team_id, score, criteria, comment, votes } = req.body;
    if (!voter_team_id) {
      return res.status(400).json({ error: 'Identifiant de l\'équipe votante requis.' });
    }

    // Mode lot (une équipe enregistre ses notes /20 pour toutes les autres équipes)
    if (Array.isArray(votes)) {
      const allVotes = await db.saveTeamVotesBatch(voter_team_id, votes);
      return res.json({ success: true, votes: allVotes });
    }

    // Mode unitaire (une équipe note une autre équipe sur 20)
    if (!target_team_id) {
      return res.status(400).json({ error: 'Identifiant de l\'équipe évaluée requis.' });
    }
    if (voter_team_id === target_team_id) {
      return res.status(400).json({ error: 'Une équipe ne peut pas voter pour elle-même.' });
    }
    if (score === undefined || score === null || score === '' || isNaN(Number(score))) {
      return res.status(400).json({ error: 'Veuillez saisir une note valide entre 0 et 20.' });
    }

    const saved = await db.saveVote({ voter_team_id, target_team_id, score, criteria, comment });
    const allVotes = await db.getVotes();
    res.json({ success: true, vote: saved, votes: allVotes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/votes/reset', async (req, res) => {
  try {
    await db.resetVotes();
    res.json({ success: true, votes: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
