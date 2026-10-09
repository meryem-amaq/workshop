/**
 * Constantes et modèles de données pour Le Village IoT des Schtroumpfs
 */

export const OFFICIAL_15_QUESTIONS = [
  { num: 1, text: "Face à un obstacle ou un problème, mon réflexe immédiat est de passer à l'action sur le terrain plutôt que de trop réfléchir.", archetype: "Sportif", code: "Q1" },
  { num: 2, text: "J'ai besoin d'exprimer mes ressentis et mon univers intérieur à travers une forme de création (visuelle, écrite ou technique).", archetype: "Artiste", code: "Q2" },
  { num: 3, text: "Avant d'agir, j'aime analyser la logique globale, les règles et la théorie qui régissent une situation.", archetype: "Professeur", code: "Q3" },
  { num: 4, text: "J'ai un œil naturel pour repérer immédiatement les failles, les erreurs ou les faiblesses dans un projet.", archetype: "Critique", code: "Q4" },
  { num: 5, text: "L'état émotionnel des gens autour de moi m'impacte fortement ; je ressens spontanément leur peine ou leur joie.", archetype: "Empathique", code: "Q5" },
  { num: 6, text: "J'aime le défi physique, la compétition, l'adrénaline et me confronter directement aux difficultés sans reculer.", archetype: "Sportif", code: "Q6" },
  { num: 7, text: "Je m'épanouis davantage dans l'originalité, l'esthétique et l'improvisation que dans le respect strict d'un cadre.", archetype: "Artiste", code: "Q7" },
  { num: 8, text: "On me sollicite souvent pour expliquer des concepts complexes de manière claire, logique et structurée.", archetype: "Professeur", code: "Q8" },
  { num: 9, text: "Je préfère un constat lucide, sans filtre et exigeant à des politesses superficielles.", archetype: "Critique", code: "Q9" },
  { num: 10, text: "Face à un conflit, mon premier réflexe est d'apaiser les tensions et de préserver l'harmonie humaine.", archetype: "Empathique", code: "Q10" },
  { num: 11, text: "Je suis une personne de terrain : les longues réunions théoriques m'épuisent si elles ne mènent pas à une action concrète.", archetype: "Sportif", code: "Q11" },
  { num: 12, text: "La routine stricte et l'absence de liberté créative étouffent rapidement mon énergie.", archetype: "Artiste", code: "Q12" },
  { num: 13, text: "J'adore synthétiser des connaissances, étudier de la documentation et modéliser des idées.", archetype: "Professeur", code: "Q13" },
  { num: 14, text: "J'ai un niveau d'exigence élevé pour garantir que le travail fourni soit irréprochable.", archetype: "Critique", code: "Q14" },
  { num: 15, text: "Je prends la plupart de mes décisions importantes en suivant mon cœur, mon intuition et ma sensibilité.", archetype: "Empathique", code: "Q15" }
];

export const LIKERT_SCALE = [
  { val: 1, label: "1 — Pas du tout d'accord" },
  { val: 2, label: "2 — Plutôt pas d'accord" },
  { val: 3, label: "3 — Neutre / Parfois vrai" },
  { val: 4, label: "4 — Plutôt d'accord" },
  { val: 5, label: "5 — Tout à fait d'accord" }
];

export const ARCHETYPES = {
  Artiste: {
    name: 'Artiste',
    displayName: 'Artiste',
    tagline: 'L\'imagination sans limites et le sens du design',
    avatar: '/assets/images/artiste.jpg',
    color: '#ec4899',
    badge: 'Artiste',
    associatedQuestions: 'Q2 + Q7 + Q12',
    desc: 'Vous abordez les projets par l\'esthétique, l\'émotion visuelle et la pensée divergente. Vous imaginez des objets connectés élégants qui font rêver l\'utilisateur.',
    powers: [
      'Design d\'interface & ergonomie visuelle',
      'Storytelling et projection visuelle',
      'Création de scénarios d\'usage immersifs'
    ]
  },
  Professeur: {
    name: 'Professeur',
    displayName: 'Professeur',
    tagline: 'L\'architecture rigoureuse et la logique technique',
    avatar: '/assets/images/professeur.jpg',
    color: '#0284c7',
    badge: 'Professeur',
    associatedQuestions: 'Q3 + Q8 + Q13',
    desc: 'Vous décomposez chaque système en blocs fonctionnels clairs. Pour vous, un projet IoT doit être robuste, documenté et techniquement infaillible.',
    powers: [
      'Modélisation de la chaîne technique',
      'Sélection optimale des capteurs et protocoles',
      'Structuration méthodique des étapes'
    ]
  },
  Critique: {
    name: 'Critique',
    displayName: 'Critique',
    tagline: 'L\'exigence de faisabilité et le regard acéré',
    avatar: '/assets/images/critique.jpg',
    color: '#8b5cf6',
    badge: 'Critique',
    associatedQuestions: 'Q4 + Q9 + Q14',
    desc: 'Vous êtes le garant de la qualité et du pragmatisme. Vous repérez immédiatement les failles techniques, les coûts cachés et les risques d\'échec.',
    powers: [
      'Stress-test des hypothèses',
      'Optimisation des coûts et de la sécurité',
      'Vérification de la cohérence de marché'
    ]
  },
  Empathique: {
    name: 'Empathique',
    displayName: 'Empathique',
    tagline: 'Le facteur humain et l\'utilité sociétale',
    avatar: '/assets/images/empathique.jpg',
    color: '#10b981',
    badge: 'Empathique',
    associatedQuestions: 'Q5 + Q10 + Q15',
    desc: 'Vous vous mettez à la place de l\'humain qui utilisera la technologie. Pour vous, un objet connecté doit apporter du réconfort, du lien social ou un vrai soulagement au quotidien.',
    powers: [
      'Compréhension profonde du besoin réel',
      'Éthique et respect de la vie privée',
      'Expérience utilisateur bienveillante'
    ]
  },
  Sportif: {
    name: 'Sportif',
    displayName: 'Sportif',
    tagline: 'Le dynamisme athlétique et l\'énergie de concrétisation',
    avatar: '/assets/images/sportif.jpg',
    color: '#f59e0b',
    badge: 'Sportif',
    associatedQuestions: 'Q1 + Q6 + Q11',
    desc: 'Moins de paroles, plus d\'action ! Vous aimez tester des maquettes physiques, brancher des cartes et faire fonctionner le premier prototype au plus vite sur le terrain avec une énergie débordante.',
    powers: [
      'Prototypage express (Maker & Action spirit)',
      'Résolution rapide des blocages concrets',
      'Dynamisme d\'équipe et passage à l\'action'
    ]
  }
};

export function getArchetypeDisplayName(archKey) {
  const meta = ARCHETYPES[archKey];
  if (meta && meta.displayName) return meta.displayName;
  const map = {
    Artiste: 'Artiste',
    Professeur: 'Professeur',
    Critique: 'Critique',
    Empathique: 'Empathique',
    Sportif: 'Sportif'
  };
  return map[archKey] || archKey || 'Artiste';
}

export const HOUSES_META = {
  1: {
    title: 'Maison 1 : Besoin',
    subtitle: 'Définition du besoin utilisateur & Formulation canonique',
    badge: '16%',
    color: '#38bdf8'
  },
  2: {
    title: 'Maison 2 : Idée IoT',
    subtitle: 'Concept Produit IoT & Cas d’usage connecté',
    badge: '33%',
    color: '#38bdf8'
  },
  3: {
    title: 'Maison 3 : Faisabilité',
    subtitle: 'Chaîne technique : Capteurs, Traitement, Réseau, Cloud',
    badge: '50%',
    color: '#38bdf8'
  },
  4: {
    title: 'Maison 4 : Prototype',
    subtitle: 'Maquette physique, ergonomie & protocole de test',
    badge: '66%',
    color: '#38bdf8'
  },
  5: {
    title: 'Maison 5 : Business',
    subtitle: 'Business Model Canvas IoT en 9 blocs',
    badge: '83%',
    color: '#38bdf8'
  },
  6: {
    title: 'Maison 6 : Marché & Pitch',
    subtitle: 'Go-to-market, métriques de succès & Pitch 3 minutes',
    badge: '100%',
    color: '#10b981'
  }
};
