/**
 * Configuration et Constantes Centralisées
 * Application : Le Village IoT des Schtroumpfs
 * 
 * Centralise les variables d'environnement, configurations réseau, base de données,
 * chemins d'accès, archétypes et métadonnées du workshop.
 */

const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Port d'écoute HTTP
const PORT = parseInt(process.env.PORT || '3000', 10);

// Configuration de connexion MySQL
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smurf_iot_village',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Chemins d'accès du projet
const PATHS = {
  frontendDist: path.join(__dirname, '../frontend/dist'),
  public: path.join(__dirname, '../public'),
  dataStore: path.join(__dirname, 'data-store.json'),
  schema: path.join(__dirname, 'schema.sql')
};

// Codes secrets Animateur (PINs d'accès au pupitre de supervision)
const DEFAULT_PINS = ['admin', '1234', 'animateur'];
const ENV_PIN = process.env.ADMIN_PIN ? [process.env.ADMIN_PIN.trim().toLowerCase()] : [];
const ADMIN_PINS = [...new Set([...DEFAULT_PINS, ...ENV_PIN])];

/**
 * Vérifie si le code PIN fourni correspond aux accès Animateur autorisés
 * @param {string} pin 
 * @returns {boolean}
 */
function isValidAdminPin(pin) {
  if (!pin) return false;
  return ADMIN_PINS.includes(String(pin).trim().toLowerCase());
}

// Ordre officiel des 5 profils / archétypes
const ARCHETYPES_LIST = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];

// Noms officiels par défaut pour les équipes
const TEAM_NAME_TEMPLATES = {
  Artiste: 'Les Schtroumpfs Artistes',
  Professeur: 'Les Schtroumpfs Professeurs (Théoriciens)',
  Critique: 'Les Schtroumpfs Critiques',
  Empathique: 'Les Schtroumpfs Empathiques (Sentimentaux)',
  Sportif: 'Les Schtroumpfs Sportifs (Action Man)'
};

// Métadonnées complètes des archétypes Schtroumpf (cartes de visite, couleurs, avatars, pouvoirs)
const ARCHETYPES_META = {
  Artiste: {
    title: 'Schtroumpf Artiste',
    displayName: 'Artiste',
    tagline: 'L\'imagination sans limites et le sens du design',
    avatar: 'artiste.jpg',
    color: '#ec4899',
    description: 'Vous abordez les projets par l\'esthétique, l\'émotion visuelle et la pensée divergente. Vous imaginez des objets connectés élégants qui font rêver l\'utilisateur.',
    powers: [
      'Design d\'interface & ergonomie visuelle',
      'Storytelling percutant',
      'Création de scénarios d\'usage immersifs'
    ]
  },
  Professeur: {
    title: 'Schtroumpf Professeur (Théoricien)',
    displayName: 'Professeur (Théoricien)',
    tagline: 'L\'architecture rigoureuse et la logique technique',
    avatar: 'professeur.jpg',
    color: '#0284c7',
    description: 'Vous décomposez chaque système en blocs fonctionnels clairs. Pour vous, un projet IoT doit être robuste, documenté et techniquement infaillible.',
    powers: [
      'Modélisation de la chaîne technique',
      'Sélection optimale des capteurs et protocoles',
      'Structuration méthodique des étapes'
    ]
  },
  Critique: {
    title: 'Schtroumpf Critique',
    displayName: 'Critique',
    tagline: 'L\'exigence de faisabilité et le regard acéré',
    avatar: 'critique.jpg',
    color: '#8b5cf6',
    description: 'Vous êtes le garant de la qualité et du pragmatisme. Vous repérez immédiatement les failles techniques, les coûts cachés et les risques d\'échec.',
    powers: [
      'Stress-test des hypothèses',
      'Optimisation des coûts et de la sécurité',
      'Vérification de la cohérence de marché'
    ]
  },
  Empathique: {
    title: 'Schtroumpf Empathique (Sentimental)',
    displayName: 'Empathique (Sentimental)',
    tagline: 'Le facteur humain et l\'utilité sociétale',
    avatar: 'empathique.jpg',
    color: '#10b981',
    description: 'Vous vous mettez à la place de l\'humain qui utilisera la technologie. Pour vous, un objet connecté doit apporter du réconfort, du lien social ou un vrai soulagement au quotidien.',
    powers: [
      'Compréhension profonde du besoin réel',
      'Éthique et respect de la vie privée',
      'Expérience utilisateur bienveillante'
    ]
  },
  Sportif: {
    title: 'Schtroumpf Sportif (Action Man)',
    displayName: 'Sportif (Action Man)',
    tagline: 'Le dynamisme athlétique et l\'énergie de concrétisation',
    avatar: 'sportif.jpg',
    color: '#f59e0b',
    description: 'Moins de paroles, plus d\'action ! Vous aimez souder, tester des maquettes physiques, brancher des cartes et faire fonctionner le premier prototype au plus vite avec une énergie débordante.',
    powers: [
      'Prototypage express (Maker & Action spirit)',
      'Résolution rapide des blocages concrets',
      'Dynamisme d\'équipe et passage à l\'action'
    ]
  }
};

// Métadonnées des 6 maisons / étapes du workshop
const HOUSES_META = {
  1: {
    number: 1,
    title: 'Maison 1 : Besoin',
    subtitle: 'Définition du besoin utilisateur & Formulation canonique',
    badge: '16%',
    color: '#38bdf8'
  },
  2: {
    number: 2,
    title: 'Maison 2 : Idée IoT',
    subtitle: 'Concept Produit IoT & Cas d’usage connecté',
    badge: '33%',
    color: '#38bdf8'
  },
  3: {
    number: 3,
    title: 'Maison 3 : Faisabilité',
    subtitle: 'Chaîne technique : Capteurs, Traitement, Réseau, Cloud',
    badge: '50%',
    color: '#38bdf8'
  },
  4: {
    number: 4,
    title: 'Maison 4 : Prototype',
    subtitle: 'Maquette physique, ergonomie & protocole de test',
    badge: '66%',
    color: '#38bdf8'
  },
  5: {
    number: 5,
    title: 'Maison 5 : Business',
    subtitle: 'Business Model Canvas IoT en 9 blocs',
    badge: '83%',
    color: '#38bdf8'
  },
  6: {
    number: 6,
    title: 'Maison 6 : Marché',
    subtitle: 'Go-to-Market, Pitch final & Démonstration',
    badge: '100%',
    color: '#38bdf8'
  }
};

/**
 * Détection automatique de l'adresse IP locale (LAN/Wi-Fi)
 * Priorise l'interface Wi-Fi (en0 sur macOS) et les plages privées (192.168.x.x, 10.x.x.x)
 * @returns {string} Adresse IPv4 locale ou 'localhost'
 */
function getLocalIp() {
  if (process.env.LOCAL_IP || process.env.HOST_IP) {
    return process.env.LOCAL_IP || process.env.HOST_IP;
  }

  const nets = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    // Ignorer les interfaces virtuelles, VPN, Docker, Apple Wireless Direct Link, loopback
    if (name.startsWith('utun') || name.startsWith('tun') || name.startsWith('tap') || 
        name.startsWith('vbox') || name.startsWith('vmnet') || name.startsWith('docker') ||
        name.startsWith('awdl') || name.startsWith('llw') || name.startsWith('lo')) {
      continue;
    }
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        let priority = 1;
        if (name === 'en0') priority = 10;
        else if (name === 'en1') priority = 9;
        else if (name.startsWith('en')) priority = 8;
        else if (name.startsWith('eth') || name.startsWith('wlan')) priority = 7;

        if (net.address.startsWith('192.168.') || net.address.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(net.address)) {
          priority += 5;
        }

        candidates.push({ address: net.address, name, priority });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0].address;
  }

  return 'localhost';
}

module.exports = {
  PORT,
  DB_CONFIG,
  PATHS,
  ADMIN_PINS,
  isValidAdminPin,
  ARCHETYPES_LIST,
  TEAM_NAME_TEMPLATES,
  ARCHETYPES_META,
  HOUSES_META,
  getLocalIp
};
