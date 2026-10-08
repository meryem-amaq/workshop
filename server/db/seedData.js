/**
 * Jeu de données de démonstration du Village IoT des Schtroumpfs
 * Module : server/db/seedData.js
 */

const demoParticipants = [
  { id: 'part-1', first_name: 'Lucas', last_name: 'Moreau', archetype: 'Professeur', archetype_scores: { Professeur: 90, Critique: 65, Artiste: 40, Sportif: 50, Empathique: 35 }, is_scribe: true },
  { id: 'part-2', first_name: 'Sophie', last_name: 'Bernard', archetype: 'Professeur', archetype_scores: { Professeur: 85, Critique: 60, Artiste: 45, Sportif: 30, Empathique: 55 }, is_scribe: false },
  { id: 'part-3', first_name: 'Thomas', last_name: 'Dubois', archetype: 'Professeur', archetype_scores: { Professeur: 80, Critique: 70, Artiste: 35, Sportif: 40, Empathique: 45 }, is_scribe: false },
  
  { id: 'part-4', first_name: 'Clara', last_name: 'Lemoine', archetype: 'Artiste', archetype_scores: { Artiste: 95, Empathique: 70, Sportif: 40, Professeur: 30, Critique: 25 }, is_scribe: true },
  { id: 'part-5', first_name: 'Alexandre', last_name: 'Girard', archetype: 'Artiste', archetype_scores: { Artiste: 88, Empathique: 65, Sportif: 50, Professeur: 40, Critique: 30 }, is_scribe: false },
  { id: 'part-6', first_name: 'Camille', last_name: 'Roux', archetype: 'Artiste', archetype_scores: { Artiste: 82, Empathique: 60, Sportif: 45, Professeur: 45, Critique: 35 }, is_scribe: false },

  { id: 'part-7', first_name: 'Hugo', last_name: 'Fontaine', archetype: 'Critique', archetype_scores: { Critique: 92, Professeur: 75, Sportif: 45, Empathique: 30, Artiste: 35 }, is_scribe: true },
  { id: 'part-8', first_name: 'Élodie', last_name: 'Mercier', archetype: 'Critique', archetype_scores: { Critique: 85, Professeur: 70, Sportif: 50, Empathique: 40, Artiste: 40 }, is_scribe: false },
  { id: 'part-9', first_name: 'Julien', last_name: 'Blanc', archetype: 'Critique', archetype_scores: { Critique: 80, Professeur: 68, Sportif: 55, Empathique: 35, Artiste: 30 }, is_scribe: false },

  { id: 'part-10', first_name: 'Emma', last_name: 'Vasseur', archetype: 'Empathique', archetype_scores: { Empathique: 94, Artiste: 70, Sportif: 45, Professeur: 35, Critique: 20 }, is_scribe: true },
  { id: 'part-11', first_name: 'Nicolas', last_name: 'Lefevre', archetype: 'Empathique', archetype_scores: { Empathique: 86, Artiste: 65, Sportif: 50, Professeur: 40, Critique: 30 }, is_scribe: false },
  { id: 'part-12', first_name: 'Léa', last_name: 'Faure', archetype: 'Empathique', archetype_scores: { Empathique: 82, Artiste: 60, Sportif: 40, Professeur: 45, Critique: 35 }, is_scribe: false },

  { id: 'part-13', first_name: 'Maxime', last_name: 'Marchand', archetype: 'Sportif', archetype_scores: { Sportif: 96, Critique: 55, Professeur: 50, Artiste: 45, Empathique: 35 }, is_scribe: true },
  { id: 'part-14', first_name: 'Antoine', last_name: 'Perrin', archetype: 'Sportif', archetype_scores: { Sportif: 88, Critique: 60, Professeur: 45, Artiste: 40, Empathique: 40 }, is_scribe: false },
  { id: 'part-15', first_name: 'Inès', last_name: 'Dumont', archetype: 'Sportif', archetype_scores: { Sportif: 84, Critique: 50, Professeur: 40, Artiste: 55, Empathique: 45 }, is_scribe: false },
];

const demoTeams = [
  { id: 'team-artistes', name: 'Les Schtroumpfs Artistes', archetype: 'Artiste', color: '#ec4899', avatar: 'artiste.jpg', current_house: 5, progress_percent: 83, scribe_participant_id: 'part-4' },
  { id: 'team-professeurs', name: 'Les Schtroumpfs Professeurs (Théoriciens)', archetype: 'Professeur', color: '#0284c7', avatar: 'professeur.jpg', current_house: 4, progress_percent: 66, scribe_participant_id: 'part-1' },
  { id: 'team-critiques', name: 'Les Schtroumpfs Critiques', archetype: 'Critique', color: '#8b5cf6', avatar: 'critique.jpg', current_house: 3, progress_percent: 50, scribe_participant_id: 'part-7' },
  { id: 'team-empathiques', name: 'Les Schtroumpfs Empathiques (Sentimentaux)', archetype: 'Empathique', color: '#10b981', avatar: 'empathique.jpg', current_house: 6, progress_percent: 100, scribe_participant_id: 'part-10' },
  { id: 'team-sportifs', name: 'Les Schtroumpfs Sportifs (Action Man)', archetype: 'Sportif', color: '#f59e0b', avatar: 'sportif.jpg', current_house: 3, progress_percent: 50, scribe_participant_id: 'part-13' },
];

const demoDeliverables = [
  // Équipe Savants (M1 à M4)
  {
    id: 'del-prof-1',
    team_id: 'team-professeurs',
    house_number: 1,
    house_title: 'Maison 1 : Besoin',
    content: {
      targetUser: 'Apiculteurs artisanaux et urbains',
      problem: 'Perte imprévue de ruches en hiver et effondrement des colonies',
      cause: 'Manque de surveillance thermique et hygrométrique continue non intrusive',
      formulation: 'Pour les apiculteurs, le problème est de détecter trop tard le stress thermique et les frelons car les visites physiques déstabilisent la reine.'
    },
    status: 'validated'
  },
  {
    id: 'del-prof-2',
    team_id: 'team-professeurs',
    house_number: 2,
    house_title: 'Maison 2 : Idée IoT',
    content: {
      conceptName: 'ApiGuard Schtroumpf Connect',
      measures: 'Température interne de grappe, hygrométrie, vibrations et fréquence acoustique',
      connectivity: 'LoRaWAN longue portée basse consommation',
      actions: 'Alerte prédictive par SMS/Appli lors d\'une anomalie de ponte ou attaque de prédateur'
    },
    status: 'validated'
  },
  {
    id: 'del-prof-3',
    team_id: 'team-professeurs',
    house_number: 3,
    house_title: 'Maison 3 : Faisabilité',
    content: {
      sensors: 'Sonde DS18B20 étanche, Accéléromètre piezo, Microphone I2S MEMS',
      processing: 'ESP32 Deep Sleep + Micro-panneau solaire 2W',
      protocol: 'LoRaWAN 868MHz (Passerelle communale TTN)',
      cloudUser: 'Backend Node.js/InfluxDB + Dashboard Grafana mobile pour l\'apiculteur'
    },
    status: 'validated'
  },
  {
    id: 'del-prof-4',
    team_id: 'team-professeurs',
    house_number: 4,
    house_title: 'Maison 4 : Prototype',
    content: {
      prototypeType: 'Boîtier étanche imprimé en 3D sous le couvre-cadre de ruche Dadant',
      usageScenario: 'Installation en 2 minutes sans vis. Calibration automatique dès la fermeture du toit.',
      testProtocol: 'Validation de l\'étanchéité IP67 en chambre froide à 0°C et autonomie sur batterie 18650.'
    },
    status: 'submitted'
  },
  // Équipe Solidaires (M1 à M6 - terminée !)
  {
    id: 'del-emp-1',
    team_id: 'team-empathiques',
    house_number: 1,
    house_title: 'Maison 1 : Besoin',
    content: {
      targetUser: 'Personnes âgées isolées vivant seules en maison rurale',
      problem: 'Isolement social et détection tardive d\'altération du rythme de vie quotidien',
      cause: 'Réticence à porter des médaillons d\'urgence stigmatisants',
      formulation: 'Pour les aînés isolés, le problème est de conserver leur dignité sans caméra intrusive tout en rassurant leurs aidants familiaux.'
    },
    status: 'validated'
  },
  {
    id: 'del-emp-2',
    team_id: 'team-empathiques',
    house_number: 2,
    house_title: 'Maison 2 : Idée IoT',
    content: {
      conceptName: 'Veilleuse Douce-Schtroumpf',
      measures: 'Allumage de lumière, bouilloire (courant), ouverture de porte frigo (choc/magnétique)',
      connectivity: 'Wi-Fi / 4G NB-IoT intégré',
      actions: 'Envoi d\'un message rassurant « Bonne journée Mamie ! » et alerte bienveillante si aucun mouvement matinal.'
    },
    status: 'validated'
  },
  {
    id: 'del-emp-3',
    team_id: 'team-empathiques',
    house_number: 3,
    house_title: 'Maison 3 : Faisabilité',
    content: {
      sensors: 'Prise connectée mesure de courant + Capteur PIR infrarouge passif',
      processing: 'Microcontrôleur ESP8266 basse consommation',
      protocol: 'MQTT sécurisé TLS via Wi-Fi domestique',
      cloudUser: 'Application mobile Aidant avec notifications chaleureuses et journal de vie'
    },
    status: 'validated'
  },
  {
    id: 'del-emp-4',
    team_id: 'team-empathiques',
    house_number: 4,
    house_title: 'Maison 4 : Prototype',
    content: {
      prototypeType: 'Veilleuse abat-jour en bois chaleureux qui s\'illumine discrètement',
      usageScenario: 'L\'aîné pose sa tasse sur le socle le matin : un coeur lumineux pulsatile signale le bonjour aux petits-enfants.',
      testProtocol: 'Test en conditions réelles avec 3 familles pilotes pendant 14 jours.'
    },
    status: 'validated'
  },
  {
    id: 'del-emp-5',
    team_id: 'team-empathiques',
    house_number: 5,
    house_title: 'Maison 5 : Business',
    content: {
      bmcValueProposition: 'Lien affectif rassurant sans caméra ni médaillon médical stigmatisant',
      bmcCustomerSegments: 'Enfants aidants (40-60 ans) et résidences seniors indépendantes',
      bmcChannels: 'Pharmacies, associations d\'aide à domicile, boutique en ligne',
      bmcRevenueStreams: 'Achat de la veilleuse 79€ + Abonnement cloud/SMS bienveillant 5€/mois',
      bmcCostStructure: 'Fabrication bois locale, serveurs sécurisés HDS, support client humain',
      bmcKeyActivities: 'Design produit, algorithme de respect de la vie privée, animation de communauté',
      bmcKeyResources: 'Brevet ergonomie douce, serveurs de données santé hébergés en France',
      bmcKeyPartners: 'Mutuelles de santé, CCAS municipaux, La Poste / Facteurs aidants'
    },
    status: 'validated'
  },
  {
    id: 'del-emp-6',
    team_id: 'team-empathiques',
    house_number: 6,
    house_title: 'Maison 6 : Marché',
    content: {
      launchPlan: 'Phase 1 : Pilote dans 20 EHPAD/Résidences. Phase 2 : Campagne Ulule axée sur la bienveillance intergénérationnelle.',
      targetMetrics: '1 000 foyers équipés d\'ici 12 mois, taux de satisfaction famille > 95%.',
      pitchScript: '« Mesdames et messieurs, 3 millions de grands-parents vivent seuls. Plutôt qu\'un bracelet anxiogène qui leur rappelle leur vulnérabilité, notre Veilleuse Douce recrée le fil magique entre générations grâce à l\'IoT invisible... »',
      pitchTimerSec: 180
    },
    status: 'validated'
  }
];

module.exports = {
  demoParticipants,
  demoTeams,
  demoDeliverables
};
