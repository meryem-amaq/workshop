const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const db = require('./db');
require('dotenv').config();

let QRCode = null;
try {
  QRCode = require('qrcode');
} catch (e) {
  QRCode = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Archétypes et métadonnées Schtroumpf (Ordre officiel)
const ARCHETYPES_META = {
  Artiste: {
    title: 'Schtroumpf Artiste',
    displayName: 'Artiste',
    tagline: 'L\'imagination sans limites et le sens du design',
    avatar: 'artiste.jpg',
    color: '#ec4899',
    description: 'Vous abordez les projets par l\'esthétique, l\'émotion visuelle et la pensée divergente. Vous imaginez des objets connectés élégants qui font rêver l\'utilisateur.',
    powers: ['Design d\'interface & ergonomie visuelle', 'Storytelling percutant', 'Création de scénarios d\'usage immersifs']
  },
  Professeur: {
    title: 'Schtroumpf Professeur (Théoricien)',
    displayName: 'Professeur (Théoricien)',
    tagline: 'L\'architecture rigoureuse et la logique technique',
    avatar: 'professeur.jpg',
    color: '#0284c7',
    description: 'Vous décomposez chaque système en blocs fonctionnels clairs. Pour vous, un projet IoT doit être robuste, documenté et techniquement infaillible.',
    powers: ['Modélisation de la chaîne technique', 'Sélection optimale des capteurs et protocoles', 'Structuration méthodique des étapes']
  },
  Critique: {
    title: 'Schtroumpf Critique',
    displayName: 'Critique',
    tagline: 'L\'exigence de faisabilité et le regard acéré',
    avatar: 'critique.jpg',
    color: '#8b5cf6',
    description: 'Vous êtes le garant de la qualité et du pragmatisme. Vous repérez immédiatement les failles techniques, les coûts cachés et les risques d\'échec.',
    powers: ['Stress-test des hypothèses', 'Optimisation des coûts et de la sécurité', 'Vérification de la cohérence de marché']
  },
  Empathique: {
    title: 'Schtroumpf Empathique (Sentimental)',
    displayName: 'Empathique (Sentimental)',
    tagline: 'Le facteur humain et l\'utilité sociétale',
    avatar: 'empathique.jpg',
    color: '#10b981',
    description: 'Vous vous mettez à la place de l\'humain qui utilisera la technologie. Pour vous, un objet connecté doit apporter du réconfort, du lien social ou un vrai soulagement au quotidien.',
    powers: ['Compréhension profonde du besoin réel', 'Éthique et respect de la vie privée', 'Expérience utilisateur bienveillante']
  },
  Sportif: {
    title: 'Schtroumpf Sportif (Action Man)',
    displayName: 'Sportif (Action Man)',
    tagline: 'Le dynamisme athlétique et l\'énergie de concrétisation',
    avatar: 'sportif.jpg',
    color: '#f59e0b',
    description: 'Moins de paroles, plus d\'action ! Vous aimez souder, tester des maquettes physiques, brancher des cartes et faire fonctionner le premier prototype au plus vite avec une énergie débordante.',
    powers: ['Prototypage express (Maker & Action spirit)', 'Résolution rapide des blocages concrets', 'Dynamisme d\'équipe et passage à l\'action']
  }
};

// ================= API ENDPOINTS =================

// 1. Statut & Santé (MySQL, Réseau & Workshop)
app.get('/api/health', (req, res) => {
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

// 1b. Générateur de QR Code scannable officiel
app.get('/api/qrcode', async (req, res) => {
  try {
    const localIp = getLocalIp();
    const targetUrl = req.query.url || `http://${localIp}:${PORT}/?join=1`;
    if (QRCode) {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        margin: 1,
        width: 250,
        color: {
          dark: '#070d19',
          light: '#ffffff'
        }
      });
      return res.json({ success: true, dataUrl, url: targetUrl, localIp });
    }
    // Si QRCode non chargé, renvoyer url pour générateur client
    res.json({ success: false, url: targetUrl, localIp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Récupérer les métadonnées des archétypes
app.get('/api/archetypes', (req, res) => {
  res.json(ARCHETYPES_META);
});

// Helper de calcul psychologique officiel (15 questions, échelle 1 à 5, scores /75)
function calculatePersonality15(ratings) {
  // ratings = tableau de 15 notes de 1 à 5 (index 0 = Q1, index 14 = Q15)
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

// 3. Inscription & Calcul du profil Schtroumpf (Questionnaire officiel 15 questions)
app.post('/api/participants/register', async (req, res) => {
  try {
    const { first_name, last_name, ratings, answers } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Le nom et le prénom sont obligatoires.' });
    }

    // Le tableau de notes peut arriver sous 'ratings' ou 'answers'
    const inputRatings = Array.isArray(ratings) ? ratings : (Array.isArray(answers) ? answers : []);
    const { dominantArchetype, scores75, totalSum, breakdown } = calculatePersonality15(inputRatings);

    const participantId = 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const participant = {
      id: participantId,
      session_id: 'default',
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      archetype: dominantArchetype,
      archetype_scores: scores75,
      breakdown: breakdown,
      total_sum: totalSum,
      team_id: null,
      is_scribe: false,
      created_at: new Date().toISOString()
    };

    await db.addParticipant(participant);

    res.json({
      success: true,
      participant,
      meta: ARCHETYPES_META[dominantArchetype]
    });
  } catch (err) {
    console.error('Erreur inscription participant:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Liste des participants
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await db.getParticipants();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. État de la session globale (pour synchronisation en temps réel de tous les participants)
app.get('/api/session', async (req, res) => {
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

// 4c. Supprimer un participant (départ / abandon)
app.delete('/api/participants/:id', async (req, res) => {
  try {
    const result = await db.removeParticipant(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Génération automatique des groupes homogènes
app.post('/api/teams/generate', async (req, res) => {
  try {
    const participants = await db.getParticipants();
    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: 'Aucun participant inscrit. Veuillez inscrire des participants avant de former les groupes.' });
    }

    // Regrouper par archétype
    const groupsByArchetype = {
      Artiste: [],
      Professeur: [],
      Critique: [],
      Empathique: [],
      Sportif: []
    };

    participants.forEach(p => {
      if (groupsByArchetype[p.archetype]) {
        groupsByArchetype[p.archetype].push(p);
      } else {
        groupsByArchetype.Professeur.push(p);
      }
    });

    const teams = [];
    const participantUpdates = [];

    const archetypesList = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];
    const teamNameTemplates = {
      Artiste: 'Les Schtroumpfs Artistes',
      Professeur: 'Les Schtroumpfs Professeurs (Théoriciens)',
      Critique: 'Les Schtroumpfs Critiques',
      Empathique: 'Les Schtroumpfs Empathiques (Sentimentaux)',
      Sportif: 'Les Schtroumpfs Sportifs (Action Man)'
    };

    archetypesList.forEach((archetype) => {
      const members = groupsByArchetype[archetype];
      // Si nous avons au moins 1 membre dans l'archétype, on crée l'équipe
      if (members && members.length > 0) {
        const teamId = 'team-' + archetype.toLowerCase() + '-' + Date.now().toString(36);
        const meta = ARCHETYPES_META[archetype];
        
        // Choisir le premier membre comme rédacteur / scribe par défaut
        const scribeId = members[0].id;

        teams.push({
          id: teamId,
          session_id: 'default',
          name: teamNameTemplates[archetype] || `Équipe ${archetype}`,
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

// 6. Liste des équipes avec membres et état
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await db.getTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Désigner un nouveau rédacteur / scribe
app.post('/api/teams/:id/scribe', async (req, res) => {
  try {
    const { participant_id } = req.body;
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

// 8. Modifier / Forcer l'étape (Maison 1 à 6) d'une équipe
app.post('/api/teams/:id/house', async (req, res) => {
  try {
    const { house_number } = req.body;
    const teamId = req.params.id;
    const updatedTeam = await db.setTeamHouse(teamId, house_number);
    res.json({ success: true, team: updatedTeam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Enregistrer un livrable pour une maison (Accès Rédacteur)
app.post('/api/deliverables', async (req, res) => {
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

    // Vérification stricte des droits du rédacteur
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
    if (advance_next && house_number < 6) {
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

// 10. Valider un livrable (Vue Animateur)
app.post('/api/deliverables/:id/validate', async (req, res) => {
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

// 11. Restitution globale (Compte Rendu multi-équipes)
app.get('/api/restitution', async (req, res) => {
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

// 12. Charger les données de démo
app.post('/api/demo/seed', async (req, res) => {
  try {
    const result = await db.seedDemoData();
    res.json({ success: true, message: 'Données de démonstration chargées avec succès !', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Réinitialiser le workshop
app.post('/api/workshop/reset', async (req, res) => {
  try {
    await db.resetAll();
    res.json({ success: true, message: 'Données du workshop réinitialisées.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Démarrer serveur
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏡 LE VILLAGE IoT DES SCHTROUMPFS - SERVEUR EN LIGNE`);
    console.log(`🌐 Accès Web : http://localhost:${PORT}`);
    console.log(`📡 Base de données : MySQL / Mode Autonome actif`);
    console.log(`======================================================\n`);
  });
});
