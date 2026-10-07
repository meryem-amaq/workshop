/**
 * LE VILLAGE IoT DES SCHTROUMPFS - APPLICATION CLIENTE
 * Logique complète pour les 4 vues, questionnaires, animations et synchronisation
 */

// ====================================================================
// ÉTAT GLOBAL DE L'APPLICATION
// ====================================================================
const state = {
  currentView: 'view-participant',
  currentUser: null, // Participant connecté sur ce navigateur
  isAdmin: false, // Mode Animateur activé ou non (accès pupitre, supervision, etc.)
  sessionPhase: 'registration', // 'registration' | 'teams_formed'
  hasAutoRedirectedToWorkspace: false, // Flag pour basculer automatiquement le participant sur mobile
  waitingTimerInterval: null,
  waitingStartTime: null,
  participants: [],
  teams: [],
  activeTeamId: null,
  activeHouse: 1,
  dbHealth: null,

  // État du quiz
  quiz: {
    currentIndex: 0,
    answers: [],
    firstName: '',
    lastName: ''
  },

  // Chrono Pitch (Maison 6)
  pitchTimer: {
    interval: null,
    totalSeconds: 180,
    remainingSeconds: 180,
    isRunning: false
  }
};

// ====================================================================
// QUESTIONNAIRE OFFICIEL D'ANALYSE DE PERSONNALITÉ (15 QUESTIONS)
// Échelle de 1 à 5 • 3 questions par archétype • Scores sur 75 points
// ====================================================================
const OFFICIAL_15_QUESTIONS = [
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

const LIKERT_SCALE = [
  { val: 1, label: "1 — Pas du tout d'accord" },
  { val: 2, label: "2 — Plutôt pas d'accord" },
  { val: 3, label: "3 — Neutre / Parfois vrai" },
  { val: 4, label: "4 — Plutôt d'accord" },
  { val: 5, label: "5 — Tout à fait d'accord" }
];

// Métadonnées statiques des 5 archétypes Schtroumpfs (Ordre officiel du Workshop)
const ARCHETYPES = {
  Artiste: {
    name: 'Schtroumpf Artiste',
    displayName: 'Artiste',
    tagline: 'L\'imagination sans limites et le sens du design',
    avatar: 'assets/images/artiste.jpg',
    color: '#ec4899',
    badge: 'Artiste',
    associatedQuestions: 'Q2 + Q7 + Q12',
    desc: 'Vous abordez les projets par l\'esthétique, l\'émotion visuelle et la pensée divergente. Vous imaginez des objets connectés élégants qui font rêver l\'utilisateur.',
    powers: ['Design d\'interface & ergonomie visuelle', 'Storytelling et projection visuelle', 'Création de scénarios d\'usage immersifs']
  },
  Professeur: {
    name: 'Schtroumpf Professeur (Théoricien)',
    displayName: 'Professeur (Théoricien)',
    tagline: 'L\'architecture rigoureuse et la logique technique',
    avatar: 'assets/images/professeur.jpg',
    color: '#0284c7',
    badge: 'Professeur (Théoricien)',
    associatedQuestions: 'Q3 + Q8 + Q13',
    desc: 'Vous décomposez chaque système en blocs fonctionnels clairs. Pour vous, un projet IoT doit être robuste, documenté et techniquement infaillible.',
    powers: ['Modélisation de la chaîne technique', 'Sélection optimale des capteurs et protocoles', 'Structuration méthodique des étapes']
  },
  Critique: {
    name: 'Schtroumpf Critique',
    displayName: 'Critique',
    tagline: 'L\'exigence de faisabilité et le regard acéré',
    avatar: 'assets/images/critique.jpg',
    color: '#8b5cf6',
    badge: 'Critique',
    associatedQuestions: 'Q4 + Q9 + Q14',
    desc: 'Vous êtes le garant de la qualité et du pragmatisme. Vous repérez immédiatement les failles techniques, les coûts cachés et les risques d\'échec.',
    powers: ['Stress-test des hypothèses', 'Optimisation des coûts et de la sécurité', 'Vérification de la cohérence de marché']
  },
  Empathique: {
    name: 'Schtroumpf Empathique (Sentimental)',
    displayName: 'Empathique (Sentimental)',
    tagline: 'Le facteur humain et l\'utilité sociétale',
    avatar: 'assets/images/empathique.jpg',
    color: '#10b981',
    badge: 'Empathique (Sentimental)',
    associatedQuestions: 'Q5 + Q10 + Q15',
    desc: 'Vous vous mettez à la place de l\'humain qui utilisera la technologie. Pour vous, un objet connecté doit apporter du réconfort, du lien social ou un vrai soulagement au quotidien.',
    powers: ['Compréhension profonde du besoin réel', 'Éthique et respect de la vie privée', 'Expérience utilisateur bienveillante']
  },
  Sportif: {
    name: 'Schtroumpf Sportif (Action Man)',
    displayName: 'Sportif (Action Man)',
    tagline: 'Le dynamisme athlétique et l\'énergie de concrétisation',
    avatar: 'assets/images/sportif.jpg',
    color: '#f59e0b',
    badge: 'Sportif (Action Man)',
    associatedQuestions: 'Q1 + Q6 + Q11',
    desc: 'Moins de paroles, plus d\'action ! Vous aimez tester des maquettes physiques, brancher des cartes et faire fonctionner le premier prototype au plus vite sur le terrain avec une énergie débordante.',
    powers: ['Prototypage express (Maker & Action spirit)', 'Résolution rapide des blocages concrets', 'Dynamisme d\'équipe et passage à l\'action']
  }
};

function getArchetypeDisplayName(archKey) {
  const meta = ARCHETYPES[archKey];
  if (meta && meta.displayName) return meta.displayName;
  const map = {
    Artiste: 'Artiste',
    Professeur: 'Professeur (Théoricien)',
    Critique: 'Critique',
    Empathique: 'Empathique (Sentimental)',
    Sportif: 'Sportif (Action Man)'
  };
  return map[archKey] || archKey;
}

// ====================================================================
// INITIALISATION DE L'APPLICATION
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Restaurer le mode animateur si précédemment déverrouillé
  if (localStorage.getItem('smurf_iot_admin') === 'true') {
    state.isAdmin = true;
  }
  applyAdminModeUI();

  setupNavigation();
  initRouter();
  loadSavedUserFromStorage();
  checkDatabaseHealth();
  refreshWorkshopData();
  renderRegistrationQrCode();

  // Boucle de rafraîchissement temps réel (toutes les 2.5 secondes)
  setInterval(() => {
    refreshWorkshopData(false);
  }, 2500);
});

// ====================================================================
// ROUTEUR D'URL (HTML5 HISTORY API SANS RECHARGEMENT DE PAGE)
// ====================================================================
function initRouter() {
  window.addEventListener('popstate', () => {
    handleCurrentUrlRoute(false);
  });
  handleCurrentUrlRoute(false);
}

function navigateToUrl(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
}

function handleCurrentUrlRoute(push = false) {
  const path = window.location.pathname.toLowerCase();

  if (path === '/admin' || path === '/dashboard') {
    if (!state.isAdmin) {
      openAdminAuthModal();
    }
    switchView('view-dashboard', false);
  } else if (path === '/team' || path === '/workspace') {
    switchView('view-workspace', false);
  } else if (path === '/restitution') {
    if (!state.isAdmin) {
      openAdminAuthModal();
    }
    switchView('view-restitution', false);
  } else if (path === '/register') {
    switchView('view-participant', false);
    goToIdentifyScreen(false);
  } else if (path === '/quiz') {
    switchView('view-participant', false);
  } else if (path === '/waiting') {
    switchView('view-participant', false);
    if (state.currentUser) {
      showResultScreen(state.currentUser, false);
    }
  } else {
    // Racine '/' ou autre
    switchView('view-participant', false);
  }
}

// Échappement HTML sécurisé pour l'affichage des noms
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Gestion de l'Authentification Animateur
function openAdminAuthModal() {
  const modal = document.getElementById('modalAdminAuth');
  const input = document.getElementById('adminPinInput');
  const err = document.getElementById('adminPinError');
  if (err) err.style.display = 'none';
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
  if (modal) modal.classList.add('active');
}

function submitAdminPin() {
  const input = document.getElementById('adminPinInput');
  const err = document.getElementById('adminPinError');
  const pin = input ? input.value.trim().toLowerCase() : '';

  // Code accepté : 'admin', '1234', 'animateur'
  if (pin === 'admin' || pin === '1234' || pin === 'animateur') {
    state.isAdmin = true;
    localStorage.setItem('smurf_iot_admin', 'true');
    closeModal('modalAdminAuth');
    applyAdminModeUI();
    showToast('👑 Espace Animateur déverrouillé avec succès !', 'success');
  } else {
    if (err) err.style.display = 'block';
    if (input) {
      input.select();
      input.focus();
    }
  }
}

function exitAdminMode() {
  state.isAdmin = false;
  localStorage.removeItem('smurf_iot_admin');
  applyAdminModeUI();
  showToast('Retour au mode participant standard.', 'info');

  // Si on est sur une vue réservée à l'animateur, revenir à l'espace approprié
  if (state.currentView === 'view-dashboard' || state.currentView === 'view-restitution') {
    if (state.currentUser && state.currentUser.team_id) {
      switchView('view-workspace');
    } else {
      switchView('view-participant');
    }
  }
}

function applyAdminModeUI() {
  const body = document.body;
  const btnAccess = document.getElementById('btnAdminAccess');
  const btnExit = document.getElementById('btnAdminExit');

  if (state.isAdmin) {
    body.classList.add('is-admin');
    if (btnAccess) btnAccess.style.display = 'none';
    if (btnExit) btnExit.style.display = 'inline-flex';
  } else {
    body.classList.remove('is-admin');
    if (btnAccess) btnAccess.style.display = 'inline-flex';
    if (btnExit) btnExit.style.display = 'none';
  }

  // Si on se trouve sur l'espace de travail, mettre à jour les droits d'édition
  if (state.currentView === 'view-workspace') {
    onTeamSelectionChanged();
  }
}

// Génération du QR Code sur l'écran d'accueil d'inscription
async function renderRegistrationQrCode() {
  const canvas = document.getElementById('registrationQrCanvas');
  const img = document.getElementById('registrationQrImg');
  const urlInput = document.getElementById('registrationDirectUrl');
  if (!canvas || !urlInput) return;

  let targetUrl = `${window.location.origin}/?join=1`;

  try {
    const res = await fetch('/api/qrcode');
    if (res.ok) {
      const data = await res.json();
      if (data.url) targetUrl = data.url;
      if (data.dataUrl && img) {
        img.src = data.dataUrl;
        img.style.display = 'block';
        canvas.style.display = 'none';
      }
    }
  } catch (err) {
    console.warn('API qrcode non disponible, fallback canvas client:', err);
  }

  urlInput.value = targetUrl;
  if (!img || img.style.display !== 'block') {
    drawStyledQrCode(canvas, targetUrl);
  }
}

function copyRegistrationUrl() {
  const urlInput = document.getElementById('registrationDirectUrl');
  if (!urlInput) return;
  urlInput.select();
  navigator.clipboard.writeText(urlInput.value);
  showToast('Lien du workshop copié !', 'success');
}

// Configuration des onglets de navigation
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Clic sur la pilule de statut DB
  const pill = document.getElementById('dbStatusPill');
  if (pill) {
    pill.addEventListener('click', openDbStatusModal);
  }
}

function switchView(viewId, updateUrl = true) {
  // Restriction stricte : seules les personnes authentifiées animateur accèdent au dashboard et restitution
  if (!state.isAdmin && (viewId === 'view-dashboard' || viewId === 'view-restitution')) {
    showToast('Accès restreint : cette vue est réservée à l\'animateur du workshop.', 'warning');
    openAdminAuthModal();
    return;
  }

  state.currentView = viewId;
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const activePanel = document.getElementById(viewId);
  const activeTab = document.querySelector(`.nav-tab[data-view="${viewId}"]`);

  if (activePanel) activePanel.classList.add('active');
  if (activeTab) activeTab.classList.add('active');

  // Mise à jour de la vraie URL dans la barre d'adresse
  if (updateUrl) {
    if (viewId === 'view-dashboard') navigateToUrl('/admin');
    else if (viewId === 'view-workspace') navigateToUrl('/team');
    else if (viewId === 'view-restitution') navigateToUrl('/restitution');
    else if (viewId === 'view-participant') {
      const scrRes = document.getElementById('screen-result');
      if (scrRes && scrRes.classList.contains('active')) {
        navigateToUrl('/waiting');
      } else {
        const scrId = document.getElementById('screen-identify');
        const scrQuiz = document.getElementById('screen-quiz');
        if ((scrId && scrId.classList.contains('active')) || (scrQuiz && scrQuiz.classList.contains('active'))) {
          navigateToUrl('/register');
        } else {
          navigateToUrl('/');
        }
      }
    }
  }

  // Actions spécifiques lors de l'ouverture
  if (viewId === 'view-dashboard') {
    renderVillageMap();
    renderAdminPrelaunchGrid();
  } else if (viewId === 'view-restitution') {
    renderRestitutionView();
  } else if (viewId === 'view-workspace') {
    populateTeamSelector();
  }
}

// ====================================================================
// GESTION DU STATUT BASE DE DONNÉES (MySQL & FALLBACK)
// ====================================================================
async function checkDatabaseHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    state.dbHealth = data.database;

    const pill = document.getElementById('dbStatusPill');
    const text = document.getElementById('dbStatusText');

    if (data.database.isMySQL) {
      pill.classList.remove('offline');
      text.textContent = 'MySQL Connecté';
      pill.title = `Connecté à MySQL (${data.database.config.host}:${data.database.config.port}/${data.database.config.database})`;
    } else {
      pill.classList.add('offline');
      text.textContent = 'Mode Autonome (MySQL Prêt)';
      pill.title = data.database.message;
    }
  } catch (err) {
    console.warn('Vérification DB santé échouée:', err);
  }
}

function openDbStatusModal() {
  const modal = document.getElementById('modalDbStatus');
  const details = document.getElementById('modalDbDetails');
  if (!state.dbHealth) return;

  const h = state.dbHealth;
  details.innerHTML = `
    <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
      <p style="margin-bottom: 0.5rem;"><strong>Statut :</strong> <span style="color: ${h.isMySQL ? '#34d399' : '#fbbf24'};">${h.message}</span></p>
      <p style="margin-bottom: 0.5rem;"><strong>Hôte :</strong> ${h.config.host}:${h.config.port}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Base :</strong> ${h.config.database}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Utilisateur :</strong> ${h.config.user}</p>
      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 0.75rem 0;" />
      <p style="font-size: 0.85rem; color: #94a3b8;">
        ${h.isMySQL 
          ? 'Toutes les écritures (participants, équipes, livrables) sont synchronisées en direct dans les tables MySQL.' 
          : 'Le serveur MySQL local n\'a pas encore été démarré. Le workshop fonctionne actuellement de manière autonome avec persistence JSON sécurisée. Démarrez MySQL à tout moment pour activer la liaison automatique.'}
      </p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="closeModal('modalDbStatus')">Fermer</button>
    </div>
  `;
  modal.classList.add('active');
}

// ====================================================================
// VUE 1 : INSCRIPTION & TEST DE PERSONNALITÉ (MOBILE FIRST)
// ====================================================================

function loadSavedUserFromStorage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isDirectJoin = urlParams.has('join') || urlParams.has('scan') || urlParams.has('participant') || urlParams.has('register');

    const saved = localStorage.getItem('smurf_iot_user');
    if (saved && !isDirectJoin) {
      state.currentUser = JSON.parse(saved);
      // Afficher directement l'écran de résultat si déjà inscrit
      showResultScreen(state.currentUser);
      return;
    }

    if (isDirectJoin) {
      goToIdentifyScreen();
    }
  } catch (e) {
    console.error('Erreur chargement utilisateur local:', e);
  }
}

// Basculer vers l'écran d'identification (Nom & Prénom)
function goToIdentifyScreen(updateUrl = true) {
  const scrQr = document.getElementById('screen-qr');
  const scrId = document.getElementById('screen-identify');
  const scrQuiz = document.getElementById('screen-quiz');
  const scrRes = document.getElementById('screen-result');

  if (scrQr) scrQr.classList.remove('active');
  if (scrQuiz) scrQuiz.classList.remove('active');
  if (scrRes) scrRes.classList.remove('active');
  if (scrId) {
    scrId.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('inputFirstName');
      if (input) input.focus();
    }, 80);
  }
  if (updateUrl) navigateToUrl('/register');
}

// Revenir à l'écran du QR Code d'accueil
function goToQrScreen(updateUrl = true) {
  const scrQr = document.getElementById('screen-qr');
  const scrId = document.getElementById('screen-identify');
  const scrQuiz = document.getElementById('screen-quiz');
  const scrRes = document.getElementById('screen-result');

  if (scrId) scrId.classList.remove('active');
  if (scrQuiz) scrQuiz.classList.remove('active');
  if (scrRes) scrRes.classList.remove('active');
  if (scrQr) scrQr.classList.add('active');
  if (updateUrl) navigateToUrl('/');
}

function startPersonalityTest() {
  const firstName = document.getElementById('inputFirstName').value.trim();
  const lastName = document.getElementById('inputLastName').value.trim();

  if (!firstName || !lastName) {
    showToast('Veuillez saisir votre prénom et votre nom.', 'error');
    return;
  }

  state.quiz.firstName = firstName;
  state.quiz.lastName = lastName;
  state.quiz.currentIndex = 0;
  state.quiz.ratings = new Array(OFFICIAL_15_QUESTIONS.length).fill(null);

  // Basculer sur l'écran du quiz
  const scrQr = document.getElementById('screen-qr');
  const scrId = document.getElementById('screen-identify');
  const scrQuiz = document.getElementById('screen-quiz');

  if (scrQr) scrQr.classList.remove('active');
  if (scrId) scrId.classList.remove('active');
  if (scrQuiz) scrQuiz.classList.add('active');

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = OFFICIAL_15_QUESTIONS[state.quiz.currentIndex];
  const total = OFFICIAL_15_QUESTIONS.length;
  const currentNum = state.quiz.currentIndex + 1;
  const pct = Math.round((currentNum / total) * 100);

  // Mettre à jour la barre de progression
  document.getElementById('quizProgressBar').style.width = `${pct}%`;
  document.getElementById('quizStepText').textContent = `Question ${currentNum} sur ${total}`;
  document.getElementById('quizPercentText').textContent = `${pct}%`;

  // Mettre à jour la question
  document.getElementById('questionCategory').textContent = `Affirmation ${currentNum} / ${total} (${q.code})`;
  document.getElementById('questionSubtext').textContent = 'Évaluez de 1 à 5';
  document.getElementById('questionPrompt').textContent = q.text;

  // Rendre les 5 options Likert (1 à 5)
  const container = document.getElementById('quizOptionsContainer');
  container.innerHTML = '';

  const currentRating = state.quiz.ratings[state.quiz.currentIndex];

  LIKERT_SCALE.forEach(opt => {
    const isSelected = currentRating === opt.val;
    const card = document.createElement('div');
    card.className = `likert-option-card ${isSelected ? 'selected' : ''}`;
    card.onclick = () => selectQuizRating(opt.val);

    card.innerHTML = `
      <div class="likert-badge">${opt.val}</div>
      <div class="likert-label-text">${opt.label}</div>
    `;
    container.appendChild(card);
  });

  // Boutons de navigation
  const btnPrev = document.getElementById('btnQuizPrev');
  const btnNext = document.getElementById('btnQuizNext');

  btnPrev.style.visibility = 'visible';
  if (state.quiz.currentIndex === 0) {
    btnPrev.textContent = '← Nom & Prénom';
  } else {
    btnPrev.textContent = '← Précédent';
  }

  btnNext.disabled = currentRating === null;

  if (currentNum === total) {
    btnNext.textContent = 'Valider & Découvrir mon Profil Schtroumpf ➔';
  } else {
    btnNext.textContent = 'Suivant →';
  }
}

function selectQuizRating(ratingVal) {
  state.quiz.ratings[state.quiz.currentIndex] = ratingVal;
  renderQuizQuestion();
}

function prevQuizQuestion() {
  if (state.quiz.currentIndex > 0) {
    state.quiz.currentIndex--;
    renderQuizQuestion();
  } else {
    goToIdentifyScreen();
  }
}

async function nextQuizQuestion() {
  if (state.quiz.currentIndex < OFFICIAL_15_QUESTIONS.length - 1) {
    state.quiz.currentIndex++;
    renderQuizQuestion();
  } else {
    // Fin des 15 questions, soumettre le profil !
    await submitQuizResults();
  }
}

async function submitQuizResults() {
  const btnNext = document.getElementById('btnQuizNext');
  btnNext.disabled = true;
  btnNext.textContent = 'Calcul psychologique selon la grille officielle...';

  try {
    const payload = {
      first_name: state.quiz.firstName,
      last_name: state.quiz.lastName,
      ratings: state.quiz.ratings
    };

    const res = await fetch('/api/participants/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement');

    state.currentUser = data.participant;
    localStorage.setItem('smurf_iot_user', JSON.stringify(data.participant));

    showResultScreen(data.participant);
    showToast('Profil Schtroumpf calculé avec succès !', 'success');

    // Mettre à jour la liste des participants
    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
    btnNext.disabled = false;
    btnNext.textContent = 'Réessayer la validation';
  }
}

function showResultScreen(participant, updateUrl = true) {
  const scrQr = document.getElementById('screen-qr');
  const scrId = document.getElementById('screen-identify');
  const scrQuiz = document.getElementById('screen-quiz');
  const scrRes = document.getElementById('screen-result');

  if (scrQr) scrQr.classList.remove('active');
  if (scrId) scrId.classList.remove('active');
  if (scrQuiz) scrQuiz.classList.remove('active');
  if (scrRes) scrRes.classList.add('active');

  if (updateUrl) navigateToUrl('/waiting');

  const meta = ARCHETYPES[participant.archetype] || ARCHETYPES.Professeur;

  document.getElementById('resParticipantName').textContent = `${participant.first_name} ${participant.last_name}`;
  document.getElementById('resArchetypeAvatar').src = meta.avatar;
  document.getElementById('resArchetypeBadge').textContent = meta.badge;
  document.getElementById('resArchetypeTitle').textContent = meta.name;
  document.getElementById('resArchetypeTagline').textContent = meta.tagline;
  document.getElementById('resArchetypeDesc').textContent = meta.desc;

  // Super-pouvoirs
  const listEl = document.getElementById('resSuperpowersList');
  listEl.innerHTML = meta.powers.map(p => `<li>${p}</li>`).join('');

  // Table officielle des scores sur 75 points & Pourcentages
  const tableEl = document.getElementById('resOfficialScoringTable');
  tableEl.innerHTML = '';

  const breakdown = participant.breakdown || {};
  const scores75 = participant.archetype_scores || {};
  const totalSum = participant.total_sum || Object.values(scores75).reduce((a, b) => a + b, 0);

  const archetypesOrder = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];

  archetypesOrder.forEach(arch => {
    const item = breakdown[arch] || {};
    const scoreVal = item.score !== undefined ? item.score : (scores75[arch] || 0);
    const rawSum = item.rawSum !== undefined ? item.rawSum : Math.round(scoreVal / 5);
    const pct = item.percent !== undefined ? item.percent : (totalSum > 0 ? Math.round((scoreVal / totalSum) * 100) : 20);
    const level = item.level || (scoreVal >= 60 ? 'Trait Dominant majeur' : (scoreVal >= 45 ? 'Trait Fort' : (scoreVal >= 30 ? 'Trait Modéré' : 'Trait Secondaire')));
    const isDominant = arch === participant.archetype;

    let levelClass = 'secondaire';
    if (scoreVal >= 60) levelClass = 'dominant';
    else if (scoreVal >= 45) levelClass = 'fort';
    else if (scoreVal >= 30) levelClass = 'modere';

    const archMeta = ARCHETYPES[arch] || { color: '#0284c7', associatedQuestions: '3 Qs', displayName: arch };

    const row = document.createElement('div');
    row.className = `scoring-row ${isDominant ? 'dominant' : ''}`;
    row.innerHTML = `
      <div class="scoring-archetype-name" style="color: ${archMeta.color};">
        ${archMeta.displayName || arch}
      </div>
      <div class="scoring-formula">
        <span>${archMeta.associatedQuestions} = (${rawSum}) × 5</span>
        <span class="level-tag ${levelClass}" style="margin-left: 0.4rem;">${level}</span>
      </div>
      <div class="scoring-points" style="color: ${isDominant ? '#fbbf24' : '#fff'};">
        ${scoreVal} / 75
      </div>
      <div class="scoring-pct">
        ${pct}%
      </div>
    `;
    tableEl.appendChild(row);
  });

  // Barres visuelles de répartition
  const scoresContainer = document.getElementById('resScoresBars');
  scoresContainer.innerHTML = '';

  archetypesOrder.forEach(arch => {
    const item = breakdown[arch] || {};
    const scoreVal = item.score !== undefined ? item.score : (scores75[arch] || 0);
    const pct = item.percent !== undefined ? item.percent : (totalSum > 0 ? Math.round((scoreVal / totalSum) * 100) : 20);
    const traitMeta = ARCHETYPES[arch] || { color: '#0284c7', displayName: arch };

    const row = document.createElement('div');
    row.className = 'score-bar-row';
    row.innerHTML = `
      <span>${traitMeta.displayName || arch}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${pct}%; background-color: ${traitMeta.color};"></div>
      </div>
      <span style="color: ${traitMeta.color}; font-weight: bold;">${pct}%</span>
    `;
    scoresContainer.appendChild(row);
  });

  // Mettre à jour l'état d'affectation d'équipe
  updateParticipantTeamStatus(participant);
}

// ====================================================================
// SALLE D'ATTENTE INTERACTIVE & ATTRIBUTION DES ÉQUIPES
// ====================================================================

function startWaitingTimer() {
  if (state.waitingTimerInterval) return;
  if (!state.waitingStartTime) {
    state.waitingStartTime = Date.now();
  }
  updateWaitingTimerDisplay();
  state.waitingTimerInterval = setInterval(updateWaitingTimerDisplay, 1000);
}

function stopWaitingTimer() {
  if (state.waitingTimerInterval) {
    clearInterval(state.waitingTimerInterval);
    state.waitingTimerInterval = null;
  }
}

function updateWaitingTimerDisplay() {
  const el = document.getElementById('waitingTimerDisplay');
  if (!el || !state.waitingStartTime) return;
  const elapsedSec = Math.floor((Date.now() - state.waitingStartTime) / 1000);
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderWaitingLiveFeed(participants) {
  const feedEl = document.getElementById('waitingLiveFeed');
  const countEl = document.getElementById('waitingCountReady');
  if (countEl) countEl.textContent = participants ? participants.length : 0;
  if (!feedEl) return;

  if (!participants || participants.length === 0) {
    feedEl.innerHTML = '<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 0.6rem;">En attente de la première participation...</div>';
    return;
  }

  // Trier par ordre antéchronologique (les plus récents en premier)
  const sorted = [...participants].reverse();
  feedEl.innerHTML = sorted.map(p => {
    const meta = ARCHETYPES[p.archetype] || ARCHETYPES.Professeur;
    const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'À l\'instant';
    return `
      <div class="waiting-feed-item">
        <div class="feed-item-left">
          <span class="waiting-feed-dot" style="background: ${meta.color};"></span>
          <span class="feed-item-name">${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</span>
          <span class="feed-item-badge" style="background: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}44;">
            ${meta.badge || p.archetype}
          </span>
        </div>
        <span class="feed-item-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

function updateParticipantTeamStatus(participant) {
  const idlePanel = document.getElementById('waitingIdleState');
  const assignedPanel = document.getElementById('waitingAssignedState');
  const tabWorkspace = document.getElementById('tabWorkspace');

  // Si le participant a une équipe et que les équipes sont chargées
  const team = participant && participant.team_id ? state.teams.find(t => t.id === participant.team_id) : null;

  if (team) {
    if (idlePanel) idlePanel.style.display = 'none';
    if (assignedPanel) assignedPanel.style.display = 'block';
    if (tabWorkspace) tabWorkspace.style.display = 'inline-flex';

    // Remplir les informations de l'équipe
    const elName = document.getElementById('assignedTeamName');
    const elTrait = document.getElementById('assignedTeamTrait');
    const elAvatar = document.getElementById('assignedTeamAvatar');
    if (elName) {
      elName.textContent = team.name;
      elName.style.color = team.color;
    }
    if (elTrait) {
      elTrait.textContent = `Archétype dominant : ${getArchetypeDisplayName(team.archetype)}`;
    }
    if (elAvatar) {
      elAvatar.src = `assets/images/${team.avatar}`;
    }

    // Gestion de l'affichage du rôle : Rédacteur unique vs Conseiller
    const isScribe = (participant.id === team.scribe_participant_id) || Boolean(participant.is_scribe);
    const roleCard = document.getElementById('assignedRoleCard');
    const roleIcon = document.getElementById('assignedRoleIcon');
    const roleHeadline = document.getElementById('assignedRoleHeadline');
    const roleExplanation = document.getElementById('assignedRoleExplanation');
    const btnText = document.getElementById('btnEnterWorkspaceText');

    const scribeMember = (team.members || []).find(m => m.id === team.scribe_participant_id || m.is_scribe);
    const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Désigné par l\'animateur';

    if (isScribe) {
      if (roleCard) roleCard.className = 'role-notice-card is-scribe';
      if (roleIcon) roleIcon.textContent = '✍️';
      if (roleHeadline) roleHeadline.textContent = 'Vous êtes le Rédacteur Unique (Porteur de stylo)';
      if (roleExplanation) {
        roleExplanation.innerHTML = 'Vous avez les <strong>droits exclusifs de saisie et de validation</strong> pour remplir les livrables des 6 Maisons au nom de votre équipe.';
      }
      if (btnText) btnText.textContent = '✍️ Ouvrir l\'Espace de Travail de mon Équipe';
    } else {
      if (roleCard) roleCard.className = 'role-notice-card is-counselor';
      if (roleIcon) roleIcon.textContent = '👥';
      if (roleHeadline) roleHeadline.textContent = 'Vous êtes Conseiller de l\'Équipe';
      if (roleExplanation) {
        roleExplanation.innerHTML = `Le rédacteur officiel de votre groupe est <strong>${scribeName}</strong>. Participez aux débats et aux orientations ; seul le rédacteur enregistre les livrables.`;
      }
      if (btnText) btnText.textContent = '👀 Découvrir la Maison de mon Équipe';
    }

    // Liste des membres du groupe avec badges de rôle
    const members = team.members || [];
    const countEl = document.getElementById('assignedMembersCount');
    const listEl = document.getElementById('assignedMembersList');
    if (countEl) countEl.textContent = members.length;
    if (listEl) {
      listEl.innerHTML = '';
      members.forEach(m => {
        const isMemScribe = (m.id === team.scribe_participant_id) || Boolean(m.is_scribe);
        const isMe = m.id === participant.id;
        const pill = document.createElement('div');
        pill.className = `assigned-member-pill ${isMe ? 'is-me' : ''} ${isMemScribe ? 'is-scribe' : ''}`;
        pill.innerHTML = `
          <div class="member-pill-name">
            ${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)} ${isMe ? '<small style="color:#38bdf8; margin-left:0.3rem; font-size:0.75rem;">(Vous)</small>' : ''}
          </div>
          <span class="member-pill-badge ${isMemScribe ? 'badge-scribe' : 'badge-counselor'}">
            ${isMemScribe ? '✍️ Rédacteur' : 'Conseiller'}
          </span>
        `;
        listEl.appendChild(pill);
      });
    }

    stopWaitingTimer();

    // REDIRECTION AUTOMATIQUE SUR LE SMARTPHONE DU PARTICIPANT :
    // Dès que les groupes sont constitués par l'animateur, si le participant était dans la salle d'attente,
    // son écran bascule automatiquement vers l'Espace Équipe Rédaction des 6 Maisons !
    if (state.currentView === 'view-participant' && !state.isAdmin && !state.hasAutoRedirectedToWorkspace) {
      state.hasAutoRedirectedToWorkspace = true;
      showToast(`🎉 Votre groupe « ${team.name} » est constitué ! Redirection vers votre espace...`, 'success');
      setTimeout(() => {
        switchToWorkspaceWithTeam();
      }, 1500);
    }
  } else {
    // Équipes non encore formées : rester en salle d'attente interactive
    if (idlePanel) idlePanel.style.display = 'block';
    if (assignedPanel) assignedPanel.style.display = 'none';
    if (tabWorkspace) tabWorkspace.style.display = 'none';
    startWaitingTimer();
    renderWaitingLiveFeed(state.participants);
  }
}

function switchToWorkspaceWithTeam() {
  if (state.currentUser && state.currentUser.team_id) {
    state.activeTeamId = state.currentUser.team_id;
  }
  const tabWs = document.getElementById('tabWorkspace');
  if (tabWs) tabWs.style.display = 'inline-flex';
  switchView('view-workspace', true);
}

// ====================================================================
// VUE 2 : ESPACE DE TRAVAIL PAR GROUPE (RÉDACTEUR UNIQUE)
// ====================================================================

function populateTeamSelector() {
  const selector = document.getElementById('selectCurrentTeam');
  if (!selector) return;

  const currentVal = selector.value;
  selector.innerHTML = '<option value="">-- Sélectionnez votre équipe --</option>';

  state.teams.forEach(team => {
    const opt = document.createElement('option');
    opt.value = team.id;
    opt.textContent = `${team.name} (${getArchetypeDisplayName(team.archetype)}) - Maison ${team.current_house}/6`;
    selector.appendChild(opt);
  });

  if (state.activeTeamId) {
    selector.value = state.activeTeamId;
  } else if (state.currentUser && state.currentUser.team_id) {
    selector.value = state.currentUser.team_id;
    state.activeTeamId = state.currentUser.team_id;
  } else if (currentVal) {
    selector.value = currentVal;
  }

  onTeamSelectionChanged();
}

function onTeamSelectionChanged() {
  const selector = document.getElementById('selectCurrentTeam');
  const teamId = selector.value;
  state.activeTeamId = teamId;

  if (!teamId) {
    document.getElementById('teamCardName').textContent = 'Sélectionnez une équipe';
    document.getElementById('teamCardTrait').textContent = 'Profil Schtroumpf';
    document.getElementById('teamCardScribeName').textContent = 'Non désigné';
    document.getElementById('teamMemberCount').textContent = '0';
    document.getElementById('teamMembersList').innerHTML = '<li class="member-empty">Aucune équipe active</li>';
    const banner = document.getElementById('workspaceRoleBanner');
    if (banner) banner.style.display = 'none';
    return;
  }

  const team = state.teams.find(t => t.id === teamId);
  if (!team) return;

  // Mise à jour de la carte équipe
  document.getElementById('teamCardAvatar').src = `assets/images/${team.avatar}`;
  document.getElementById('teamCardName').textContent = team.name;
  document.getElementById('teamCardTrait').textContent = `Archétype dominant : ${getArchetypeDisplayName(team.archetype)}`;

  // Trouver le scribe
  const scribeMember = (team.members || []).find(m => m.id === team.scribe_participant_id || m.is_scribe) || team.scribe;
  const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Premier membre (par défaut)';
  document.getElementById('teamCardScribeName').textContent = scribeName;

  // Liste des membres
  document.getElementById('teamMemberCount').textContent = (team.members || []).length;
  const listEl = document.getElementById('teamMembersList');
  listEl.innerHTML = '';

  (team.members || []).forEach(m => {
    const isScribe = m.id === team.scribe_participant_id || m.is_scribe;
    const isMe = state.currentUser && m.id === state.currentUser.id;
    const li = document.createElement('li');
    li.className = 'team-member-item';
    li.innerHTML = `
      <span>${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)} ${isMe ? '<small style="color:#38bdf8; margin-left:4px;">(Vous)</small>' : ''}</span>
      ${isScribe ? '<span style="color: #fbbf24; font-size: 0.75rem; font-weight: bold;">✍️ Rédacteur</span>' : '<span style="color: #64748b; font-size: 0.75rem;">Conseiller</span>'}
    `;
    listEl.appendChild(li);
  });

  // Déterminer les droits d'édition (Animateur ou Scribe unique)
  const isUserScribe = state.currentUser && (state.currentUser.id === team.scribe_participant_id || state.currentUser.is_scribe);
  const canEdit = state.isAdmin || isUserScribe;

  // Contrôle du sélecteur d'équipe et bouton changement rédacteur
  const btnChangeScribe = document.getElementById('btnChangeScribe');
  if (state.isAdmin) {
    if (selector) selector.disabled = false;
    if (btnChangeScribe) btnChangeScribe.style.display = 'inline-block';
  } else {
    // Si participant : verrouiller sur son équipe attribuée
    if (selector && state.currentUser && state.currentUser.team_id) {
      selector.value = state.currentUser.team_id;
      selector.disabled = true;
    }
    // Bouton de modification de rédacteur réservé à l'administrateur
    if (btnChangeScribe) btnChangeScribe.style.display = 'none';
  }

  // Mise à jour de la bannière de rôle dans l'espace de travail
  const roleBanner = document.getElementById('workspaceRoleBanner');
  const bannerIcon = document.getElementById('workspaceRoleBannerIcon');
  const bannerTitle = document.getElementById('workspaceRoleBannerTitle');
  const bannerDesc = document.getElementById('workspaceRoleBannerDesc');

  if (roleBanner) {
    roleBanner.style.display = 'flex';
    if (state.isAdmin) {
      roleBanner.className = 'workspace-role-banner role-admin-mode';
      if (bannerIcon) bannerIcon.textContent = '👑';
      if (bannerTitle) bannerTitle.textContent = 'Mode Animateur (Supervision Globale)';
      if (bannerDesc) bannerDesc.textContent = `Vous pouvez superviser et éditer toutes les équipes (${team.name}), modifier le rédacteur et forcer les jalons.`;
    } else if (canEdit) {
      roleBanner.className = 'workspace-role-banner role-scribe-mode';
      if (bannerIcon) bannerIcon.textContent = '✍️';
      if (bannerTitle) bannerTitle.textContent = 'Mode Rédacteur Unique (Porteur de stylo)';
      if (bannerDesc) bannerDesc.textContent = `Vous êtes le rédacteur officiel de votre groupe (${team.name}). Remplissez et validez les livrables ci-dessous.`;
    } else {
      roleBanner.className = 'workspace-role-banner role-counselor-mode';
      if (bannerIcon) bannerIcon.textContent = '👥';
      if (bannerTitle) bannerTitle.textContent = 'Mode Consultation (Conseiller)';
      if (bannerDesc) bannerDesc.textContent = `Le rédacteur désigné pour votre groupe est <strong>${scribeName}</strong>. Participez aux réflexions et aux débats ; seul le rédacteur enregistre les livrables.`;
    }
  }

  // Activer l'étape actuelle de l'équipe
  switchHouseTab(team.current_house || 1);

  // Charger les livrables déjà enregistrés
  loadDeliverablesIntoForms(team);

  // Verrouiller ou déverrouiller les champs selon les droits
  applyHouseFormsEditableState(canEdit, scribeName);
}

function applyHouseFormsEditableState(canEdit, scribeName) {
  const container = document.querySelector('.house-workspace-card');
  if (container) {
    if (canEdit) {
      container.classList.remove('workspace-readonly-active');
    } else {
      container.classList.add('workspace-readonly-active');
    }
  }

  // Champs de formulaires
  const formInputs = document.querySelectorAll('.house-workspace-card input, .house-workspace-card textarea, .house-workspace-card select');
  formInputs.forEach(input => {
    input.disabled = !canEdit;
    input.readOnly = !canEdit;
  });

  // Bouton formule canonique
  const btnCanon = document.querySelector('button[onclick="generateCanonicalNeedFormula()"]');
  if (btnCanon) btnCanon.disabled = !canEdit;

  // Boutons de validation des maisons
  const submitConfigs = [
    { id: 'btnSubmitH1', defaultText: 'Valider la Maison 1 et Passer au Concept ➔' },
    { id: 'btnSubmitH2', defaultText: 'Valider la Maison 2 et Passer à la Faisabilité ➔' },
    { id: 'btnSubmitH3', defaultText: 'Valider la Maison 3 et Passer au Prototype ➔' },
    { id: 'btnSubmitH4', defaultText: 'Valider la Maison 4 et Passer au Business ➔' },
    { id: 'btnSubmitH5', defaultText: 'Valider la Maison 5 et Passer au Marché ➔' },
    { id: 'btnSubmitH6', defaultText: '🏆 Clôturer les 6 Maisons et Voir la Restitution' }
  ];

  submitConfigs.forEach(conf => {
    const btn = document.getElementById(conf.id);
    if (btn) {
      btn.disabled = !canEdit;
      if (canEdit) {
        btn.textContent = conf.defaultText;
      } else {
        btn.textContent = `🔒 Mode Consultation (Réservé à ${scribeName})`;
      }
    }
  });
}

function switchHouseTab(houseNum) {
  state.activeHouse = houseNum;

  // Stepper
  document.querySelectorAll('.stepper-item').forEach(item => {
    const num = parseInt(item.getAttribute('data-house'), 10);
    item.classList.remove('active');
    if (num === houseNum) item.classList.add('active');

    // Marquer les étapes antérieures comme terminées si l'équipe a avancé
    const team = state.teams.find(t => t.id === state.activeTeamId);
    if (team && num < team.current_house) {
      item.classList.add('completed');
    }
  });

  // Panneaux de formulaires
  document.querySelectorAll('.house-content-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`house-form-${houseNum}`);
  if (targetPanel) targetPanel.classList.add('active');
}

function loadDeliverablesIntoForms(team) {
  if (!team || !team.deliverables) return;

  team.deliverables.forEach(del => {
    const h = del.house_number;
    const c = del.content || {};

    if (h === 1) {
      if (c.targetUser) document.getElementById('h1_targetUser').value = c.targetUser;
      if (c.problem) document.getElementById('h1_problem').value = c.problem;
      if (c.cause) document.getElementById('h1_cause').value = c.cause;
      if (c.formulation) document.getElementById('h1_formulation').value = c.formulation;
    } else if (h === 2) {
      if (c.conceptName) document.getElementById('h2_conceptName').value = c.conceptName;
      if (c.measures) document.getElementById('h2_measures').value = c.measures;
      if (c.connectivity) document.getElementById('h2_connectivity').value = c.connectivity;
      if (c.actions) document.getElementById('h2_actions').value = c.actions;
    } else if (h === 3) {
      if (c.sensors) document.getElementById('h3_sensors').value = c.sensors;
      if (c.processing) document.getElementById('h3_processing').value = c.processing;
      if (c.protocol) document.getElementById('h3_protocol').value = c.protocol;
      if (c.cloudUser) document.getElementById('h3_cloudUser').value = c.cloudUser;
    } else if (h === 4) {
      if (c.prototypeType) document.getElementById('h4_prototypeType').value = c.prototypeType;
      if (c.usageScenario) document.getElementById('h4_usageScenario').value = c.usageScenario;
      if (c.testProtocol) document.getElementById('h4_testProtocol').value = c.testProtocol;
    } else if (h === 5) {
      if (c.bmcPartners) document.getElementById('bmc_partners').value = c.bmcPartners;
      if (c.bmcActivities) document.getElementById('bmc_activities').value = c.bmcActivities;
      if (c.bmcValue) document.getElementById('bmc_value').value = c.bmcValue;
      if (c.bmcRelations) document.getElementById('bmc_relations').value = c.bmcRelations;
      if (c.bmcSegments) document.getElementById('bmc_segments').value = c.bmcSegments;
      if (c.bmcResources) document.getElementById('bmc_resources').value = c.bmcResources;
      if (c.bmcChannels) document.getElementById('bmc_channels').value = c.bmcChannels;
      if (c.bmcCosts) document.getElementById('bmc_costs').value = c.bmcCosts;
      if (c.bmcRevenues) document.getElementById('bmc_revenues').value = c.bmcRevenues;
    } else if (h === 6) {
      if (c.launchPlan) document.getElementById('h6_launchPlan').value = c.launchPlan;
      if (c.targetMetrics) document.getElementById('h6_targetMetrics').value = c.targetMetrics;
      if (c.pitchScript) document.getElementById('h6_pitchScript').value = c.pitchScript;
    }
  });
}

// Générateur automatique de la formule canonique pour Maison 1
function generateCanonicalNeedFormula() {
  const targetUser = document.getElementById('h1_targetUser').value.trim() || '[Utilisateur]';
  const problem = document.getElementById('h1_problem').value.trim() || '[Problème]';
  const cause = document.getElementById('h1_cause').value.trim() || '[Limite existante]';

  const formula = `« Pour ${targetUser}, le problème majeur est ${problem} car actuellement ${cause}. »`;
  document.getElementById('h1_formulation').value = formula;
  showToast('Formule canonique générée !', 'success');
}

// Sauvegarder et valider un livrable
async function submitDeliverable(houseNum) {
  if (!state.activeTeamId) {
    showToast('Veuillez sélectionner votre équipe dans la colonne de gauche.', 'error');
    return;
  }

  const team = state.teams.find(t => t.id === state.activeTeamId);
  if (!team) {
    showToast('Équipe introuvable.', 'error');
    return;
  }

  // Vérification de permission : seul le rédacteur ou l'animateur peut enregistrer
  const isUserScribe = state.currentUser && (state.currentUser.id === team.scribe_participant_id || state.currentUser.is_scribe);
  if (!state.isAdmin && !isUserScribe) {
    const scribeMember = (team.members || []).find(m => m.id === team.scribe_participant_id || m.is_scribe);
    const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'le rédacteur désigné';
    showToast(`🔒 Accès refusé : Seul le rédacteur unique (${scribeName}) peut valider les livrables.`, 'error');
    return;
  }

  const houseTitles = {
    1: 'Maison 1 : Besoin',
    2: 'Maison 2 : Idée IoT',
    3: 'Maison 3 : Faisabilité',
    4: 'Maison 4 : Prototype',
    5: 'Maison 5 : Business',
    6: 'Maison 6 : Marché'
  };

  let content = {};

  if (houseNum === 1) {
    content = {
      targetUser: document.getElementById('h1_targetUser').value.trim(),
      problem: document.getElementById('h1_problem').value.trim(),
      cause: document.getElementById('h1_cause').value.trim(),
      formulation: document.getElementById('h1_formulation').value.trim()
    };
  } else if (houseNum === 2) {
    content = {
      conceptName: document.getElementById('h2_conceptName').value.trim(),
      measures: document.getElementById('h2_measures').value.trim(),
      connectivity: document.getElementById('h2_connectivity').value.trim(),
      actions: document.getElementById('h2_actions').value.trim()
    };
  } else if (houseNum === 3) {
    content = {
      sensors: document.getElementById('h3_sensors').value.trim(),
      processing: document.getElementById('h3_processing').value.trim(),
      protocol: document.getElementById('h3_protocol').value.trim(),
      cloudUser: document.getElementById('h3_cloudUser').value.trim()
    };
  } else if (houseNum === 4) {
    content = {
      prototypeType: document.getElementById('h4_prototypeType').value.trim(),
      usageScenario: document.getElementById('h4_usageScenario').value.trim(),
      testProtocol: document.getElementById('h4_testProtocol').value.trim()
    };
  } else if (houseNum === 5) {
    content = {
      bmcPartners: document.getElementById('bmc_partners').value.trim(),
      bmcActivities: document.getElementById('bmc_activities').value.trim(),
      bmcValue: document.getElementById('bmc_value').value.trim(),
      bmcRelations: document.getElementById('bmc_relations').value.trim(),
      bmcSegments: document.getElementById('bmc_segments').value.trim(),
      bmcResources: document.getElementById('bmc_resources').value.trim(),
      bmcChannels: document.getElementById('bmc_channels').value.trim(),
      bmcCosts: document.getElementById('bmc_costs').value.trim(),
      bmcRevenues: document.getElementById('bmc_revenues').value.trim()
    };
  } else if (houseNum === 6) {
    content = {
      launchPlan: document.getElementById('h6_launchPlan').value.trim(),
      targetMetrics: document.getElementById('h6_targetMetrics').value.trim(),
      pitchScript: document.getElementById('h6_pitchScript').value.trim()
    };
  }

  try {
    const payload = {
      team_id: state.activeTeamId,
      house_number: houseNum,
      house_title: houseTitles[houseNum],
      content,
      submitted_by: state.currentUser ? state.currentUser.id : null,
      advance_next: true
    };

    const res = await fetch('/api/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement');

    showToast(`Maison ${houseNum} enregistrée avec succès !`, 'success');

    // Passer à la maison suivante si < 6
    if (houseNum < 6) {
      switchHouseTab(houseNum + 1);
    } else {
      showToast('🎉 Félicitations ! Les 6 Maisons du Village IoT sont validées !', 'success');
      switchView('view-restitution');
    }

    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function saveDraft(houseNum) {
  submitDeliverable(houseNum);
}

// Modal Changement de rédacteur
function openChangeScribeModal(targetTeamId = null) {
  const teamId = targetTeamId || state.activeTeamId;
  if (!teamId) return;
  state.activeTeamId = teamId;
  const team = state.teams.find(t => t.id === teamId);
  if (!team || !team.members || team.members.length === 0) {
    showToast('Aucun membre dans cette équipe pour désigner un rédacteur.', 'error');
    return;
  }

  const select = document.getElementById('selectNewScribe');
  select.innerHTML = '';
  team.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.first_name} ${m.last_name}`;
    if (m.id === team.scribe_participant_id || m.is_scribe) opt.selected = true;
    select.appendChild(opt);
  });

  document.getElementById('modalChangeScribe').classList.add('active');
}

async function confirmChangeScribe() {
  const newScribeId = document.getElementById('selectNewScribe').value;
  if (!newScribeId || !state.activeTeamId) return;

  try {
    const res = await fetch(`/api/teams/${state.activeTeamId}/scribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: newScribeId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de rédacteur');

    closeModal('modalChangeScribe');
    showToast('Nouveau rédacteur désigné avec succès !', 'success');
    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Retirer un participant (désistement / départ pendant le workshop)
async function confirmRemoveParticipant(participantId, participantName) {
  if (!confirm(`Confirmez-vous le départ de ${participantName} du workshop ? Ce participant sera retiré et le rédacteur sera automatiquement réattribué si nécessaire.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/participants/${participantId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du retrait du participant');

    showToast(`${participantName} a été retiré de l'atelier. Les groupes ont été synchronisés.`, 'info');
    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====================================================================
// CHRONOMÈTRE DE PITCH 3 MINUTES (MAISON 6)
// ====================================================================
function togglePitchTimer() {
  const btn = document.getElementById('btnStartTimer');
  if (state.pitchTimer.isRunning) {
    // Pause
    clearInterval(state.pitchTimer.interval);
    state.pitchTimer.isRunning = false;
    btn.textContent = 'Reprendre';
  } else {
    // Start
    state.pitchTimer.isRunning = true;
    btn.textContent = 'Pause';
    state.pitchTimer.interval = setInterval(() => {
      if (state.pitchTimer.remainingSeconds > 0) {
        state.pitchTimer.remainingSeconds--;
        updatePitchTimerDisplay();
      } else {
        clearInterval(state.pitchTimer.interval);
        state.pitchTimer.isRunning = false;
        btn.textContent = 'Terminé !';
        showToast('🔔 3 minutes écoulées ! Fin du pitch.', 'error');
      }
    }, 1000);
  }
}

function resetPitchTimer() {
  clearInterval(state.pitchTimer.interval);
  state.pitchTimer.isRunning = false;
  state.pitchTimer.remainingSeconds = 180;
  updatePitchTimerDisplay();
  const btn = document.getElementById('btnStartTimer');
  if (btn) btn.textContent = 'Démarrer';
}

function updatePitchTimerDisplay() {
  const minutes = Math.floor(state.pitchTimer.remainingSeconds / 60);
  const seconds = state.pitchTimer.remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const display = document.getElementById('pitchTimerDisplay');
  if (display) {
    display.textContent = formatted;
    if (state.pitchTimer.remainingSeconds <= 30) {
      display.style.color = '#ef4444';
    } else {
      display.style.color = '#38bdf8';
    }
  }
}

// ====================================================================
// VUE 3 : LE DASHBOARD "VILLAGE DE SCHTROUMPFS" (VUE ANIMATEUR)
// ====================================================================

// Panneau Pré-Constitution : Affichage visuel de tous les participants inscrits avec profil
function renderAdminPrelaunchGrid() {
  const grid = document.getElementById('adminParticipantsGrid');
  const countEl = document.getElementById('adminReadyCount');
  const launchCountEl = document.getElementById('btnLaunchCount');
  const launchBtn = document.getElementById('btnAdminLaunchTeams');
  if (!grid) return;

  const participants = state.participants || [];
  if (countEl) countEl.textContent = participants.length;
  if (launchCountEl) launchCountEl.textContent = participants.length;
  if (launchBtn) {
    launchBtn.disabled = participants.length === 0;
  }

  if (participants.length === 0) {
    grid.innerHTML = `
      <div class="admin-prelaunch-empty">
        <h4>🍄 En attente des premières inscriptions...</h4>
        <p>Les participants apparaîtront ici dès qu'ils auront scanné le QR Code et validé leur test de 15 questions.</p>
        <button type="button" class="btn btn-outline btn-xs mt-3" onclick="openQrModal()">📱 Afficher le Grand QR Code d'accès</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = participants.map(p => {
    const meta = ARCHETYPES[p.archetype] || ARCHETYPES.Professeur;
    const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Prêt';
    const hasTeam = Boolean(p.team_id);
    const team = hasTeam ? state.teams.find(t => t.id === p.team_id) : null;
    const isScribe = (team && team.scribe_participant_id === p.id) || p.is_scribe;

    return `
      <div class="admin-part-card" style="border-left: 3px solid ${meta.color};">
        <div class="admin-part-left">
          <img src="${meta.avatar}" alt="${p.archetype}" class="admin-part-avatar">
          <div class="admin-part-meta">
            <div class="admin-part-name">${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</div>
            <span class="admin-part-arch" style="background: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}44;">
              ${meta.badge || p.archetype}
            </span>
            ${hasTeam ? `
              <div style="font-size:0.72rem; color:${team ? team.color : '#38bdf8'}; margin-top:3px; font-weight:600;">
                👥 ${escapeHtml(team ? team.name : 'Affecté')} ${isScribe ? '<span style="color:#fbbf24;">(✍️ Rédacteur)</span>' : ''}
              </div>
            ` : '<div style="font-size:0.7rem; color:#f59e0b; margin-top:2px;">⏳ En attente de groupe</div>'}
            <div class="admin-part-time">Test validé à ${timeStr}</div>
          </div>
        </div>
        <button type="button" class="admin-part-del-btn" onclick="confirmRemoveParticipant('${p.id}', '${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}')" title="Retirer ce participant s'il a quitté le workshop">
          Retirer ❌
        </button>
      </div>
    `;
  }).join('');
}

function renderVillageMap() {
  renderAdminPrelaunchGrid();
  // Réinitialiser les quais des 6 maisons
  for (let i = 1; i <= 6; i++) {
    const dock = document.getElementById(`dock-house-${i}`);
    if (dock) dock.innerHTML = '';
  }

  // Placer les équipes sur la maison correspondante
  state.teams.forEach(team => {
    const houseNum = team.current_house || 1;
    const dock = document.getElementById(`dock-house-${houseNum}`);
    if (dock) {
      const token = document.createElement('div');
      token.className = 'team-avatar-token';
      token.title = `${team.name} (${getArchetypeDisplayName(team.archetype)}) - Progression : ${team.progress_percent}%`;
      token.style.borderColor = team.color;
      token.onclick = (e) => {
        e.stopPropagation();
        inspectTeamFromDashboard(team.id);
      };

      token.innerHTML = `<img src="assets/images/${team.avatar}" alt="${team.name}" class="token-img">`;
      dock.appendChild(token);
    }
  });

  // Rendre la grille des équipes en dessous de la carte
  renderDashboardTeamsGrid();
}

function renderDashboardTeamsGrid() {
  const grid = document.getElementById('dashboardTeamsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (state.teams.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 12px;">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🍄 Aucun groupe formé pour le moment.</p>
        <p style="font-size: 0.85rem;">Inscrivez des participants puis cliquez sur <strong>"Former les Groupes Homogènes"</strong> ou <strong>"Charger Données Démo"</strong>.</p>
      </div>
    `;
    return;
  }

  state.teams.forEach(team => {
    const scribeMember = (team.members || []).find(m => m.id === team.scribe_participant_id || m.is_scribe) || team.scribe;
    const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

    const card = document.createElement('div');
    card.className = 'dash-team-card';
    card.innerHTML = `
      <div class="dash-team-head">
        <img src="assets/images/${team.avatar}" alt="${team.name}" class="dash-team-avatar" style="border: 2px solid ${team.color};">
        <div>
          <div class="dash-team-title">${team.name}</div>
          <div class="dash-team-sub">${getArchetypeDisplayName(team.archetype)} • ${(team.members || []).length} membres</div>
        </div>
      </div>

      <div class="dash-progress-wrap">
        <div class="dash-progress-track">
          <div class="dash-progress-fill" style="width: ${team.progress_percent}%; background: ${team.color};"></div>
        </div>
        <div class="dash-progress-meta">
          <span>Maison ${team.current_house}/6</span>
          <span style="font-weight: bold; color: ${team.color};">${team.progress_percent}%</span>
        </div>
      </div>

      <!-- Contrôle Animateur : Rédacteur & Gestion des membres (départ/changement) -->
      <div class="dash-team-admin-box" style="margin: 0.85rem 0; background: rgba(0,0,0,0.25); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <span style="font-size: 0.78rem; color: #94a3b8;">✍️ Rédacteur : <strong style="color: #fbbf24;">${escapeHtml(scribeName)}</strong></span>
          <button class="btn btn-outline btn-xs" style="padding: 2px 7px; font-size: 0.72rem;" onclick="openChangeScribeModal('${team.id}')">Changer</button>
        </div>
        <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 0.35rem; text-transform: uppercase;">Membres du groupe :</div>
        <div style="display: flex; flex-direction: column; gap: 0.3rem;">
          ${(team.members || []).map(m => {
            const isScribe = m.id === team.scribe_participant_id || m.is_scribe;
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                <span>${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)} ${isScribe ? '<span style="color:#fbbf24; font-size:0.7rem; margin-left:4px;">(✍️ Rédacteur)</span>' : '<span style="color:#64748b; font-size:0.7rem; margin-left:4px;">(Conseiller)</span>'}</span>
                <button class="btn btn-danger-outline btn-xs" style="padding: 1px 6px; font-size: 0.68rem;" onclick="confirmRemoveParticipant('${m.id}', '${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}')" title="Retirer ce participant s'il a quitté l'atelier">Retirer ❌</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="dash-team-controls">
        <button class="btn btn-outline btn-xs" onclick="adjustTeamHouse('${team.id}', ${Math.max(1, team.current_house - 1)})" ${team.current_house <= 1 ? 'disabled' : ''}>- Reculer</button>
        <button class="btn btn-primary btn-xs" onclick="adjustTeamHouse('${team.id}', ${Math.min(6, team.current_house + 1)})" ${team.current_house >= 6 ? 'disabled' : ''}>+ Avancer Maison</button>
        <button class="btn btn-secondary btn-xs" onclick="inspectTeamFromDashboard('${team.id}')">Voir Fiche</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function adjustTeamHouse(teamId, newHouse) {
  try {
    const res = await fetch(`/api/teams/${teamId}/house`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ house_number: newHouse })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    refreshWorkshopData();
    showToast(`Étape mise à jour : Maison ${newHouse}/6`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function inspectTeamFromDashboard(teamId) {
  state.activeTeamId = teamId;
  switchView('view-workspace');
}

// Modale Détails d'une Maison
function openHouseDetailsModal(houseNum) {
  const houseTitles = {
    1: 'Maison 1 : Définition du Besoin (16%)',
    2: 'Maison 2 : Concept Produit IoT (33%)',
    3: 'Maison 3 : Faisabilité & Architecture (50%)',
    4: 'Maison 4 : Prototype & Scénario (66%)',
    5: 'Maison 5 : Business Model Canvas (83%)',
    6: 'Maison 6 : Mini-Plan de Marché & Pitch (100%)'
  };

  const houseDescriptions = {
    1: 'Identification de l\'utilisateur cible et formulation canonique du problème à résoudre.',
    2: 'Formalisation de la valeur ajoutée du capteur et de la communication connectée.',
    3: 'Chaîne technique complète : Capteurs ➔ Microcontrôleur ➔ Réseau ➔ Cloud.',
    4: 'Maquette physique, ergonomie, protocole de test de validation et storyboard.',
    5: 'Matrice économique en 9 blocs (partenaires, proposition de valeur, revenus...).',
    6: 'Go-to-market, métriques de succès à 12 mois et pitch oral de 3 minutes chrono.'
  };

  const modal = document.getElementById('modalHouseDetails');
  document.getElementById('modalHouseTitle').textContent = houseTitles[houseNum];

  // Trouver les équipes actuellement dans cette maison
  const teamsInHouse = state.teams.filter(t => t.current_house === houseNum);

  const body = document.getElementById('modalHouseBody');
  body.innerHTML = `
    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.25rem;">${houseDescriptions[houseNum]}</p>
    
    <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #38bdf8;">Équipes actuellement dans cette maison (${teamsInHouse.length}) :</h4>
    ${teamsInHouse.length === 0 ? '<p style="color: #64748b; font-style: italic;">Aucune équipe n\'est arrêtée dans cette maison actuellement.</p>' : ''}
    
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${teamsInHouse.map(t => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="assets/images/${t.avatar}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;">
            <div>
              <div style="font-weight: bold; color: #fff;">${t.name}</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">${getArchetypeDisplayName(t.archetype)} • Rédacteur : ${t.scribe ? t.scribe.first_name + ' ' + t.scribe.last_name : 'Défaut'}</div>
            </div>
          </div>
          <button class="btn btn-outline btn-xs" onclick="closeModal('modalHouseDetails'); inspectTeamFromDashboard('${t.id}');">Consulter la saisie ➔</button>
        </div>
      `).join('')}
    </div>

    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('modalHouseDetails')">Fermer</button>
    </div>
  `;

  modal.classList.add('active');
}

// Déclencher la constitution des groupes homogènes
async function triggerAutoAssignTeams() {
  const btn = document.getElementById('btnFormTeams');
  btn.disabled = true;
  btn.textContent = 'Formation en cours...';

  try {
    const res = await fetch('/api/teams/generate', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération des groupes');

    showToast(`🎉 ${data.count} groupes homogènes constitués avec succès !`, 'success');
    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Former les Groupes Homogènes';
  }
}

// Charger les données de démonstration
async function loadDemoData() {
  const btn = document.getElementById('btnLoadDemo');
  btn.disabled = true;
  btn.textContent = 'Chargement démo...';

  try {
    const res = await fetch('/api/demo/seed', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast('Données de démonstration chargées ! 15 participants, 5 équipes, 6 livrables.', 'success');
    refreshWorkshopData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 Charger Données Démo';
  }
}

// Réinitialiser le workshop
async function confirmResetWorkshop() {
  if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données du workshop (participants, équipes, livrables) ?')) {
    return;
  }

  try {
    const res = await fetch('/api/workshop/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.removeItem('smurf_iot_user');
    state.currentUser = null;

    showToast('Workshop réinitialisé.', 'success');
    refreshWorkshopData();
    switchView('view-participant');
    goToQrScreen();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Modale QR Code
async function openQrModal() {
  const modal = document.getElementById('modalQrCode');
  const canvas = document.getElementById('qrCodeCanvas');
  const urlInput = document.getElementById('qrDirectUrl');

  let targetUrl = `${window.location.origin}/?join=1`;
  try {
    const res = await fetch('/api/qrcode');
    if (res.ok) {
      const data = await res.json();
      if (data.url) targetUrl = data.url;
    }
  } catch (e) {}

  if (urlInput) urlInput.value = targetUrl;
  if (canvas) drawStyledQrCode(canvas, targetUrl);

  modal.classList.add('active');
}

function copyWorkshopUrl() {
  const urlInput = document.getElementById('qrDirectUrl');
  urlInput.select();
  navigator.clipboard.writeText(urlInput.value);
  showToast('Lien copié dans le presse-papiers !', 'success');
}

// Générateur de motif QR Code sur Canvas (sans dépendance externe)
function drawStyledQrCode(canvas, text) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Génération d'une matrice pseudo-aléatoire mais reproductible basée sur le texte
  const gridSize = 25;
  const cellSize = (size - 20) / gridSize;
  const padding = 10;

  // Calcul d'un hash simple
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  ctx.fillStyle = '#0f172a';

  // Dessiner les 3 carrés de coin caractéristiques des QR Codes
  function drawCorner(x, y) {
    ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#0284c7'; // Schtroumpf blue accent
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    ctx.fillStyle = '#0f172a';
  }

  drawCorner(padding, padding);
  drawCorner(padding + cellSize * (gridSize - 7), padding);
  drawCorner(padding, padding + cellSize * (gridSize - 7));

  // Remplir les cellules de données
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Ignorer les coins
      if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) {
        continue;
      }
      const pseudo = Math.sin(r * 13 + c * 37 + hash) * 10000;
      if (pseudo - Math.floor(pseudo) > 0.5) {
        ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }

  // Micro logo champignon Schtroumpf au centre
  const centerSize = cellSize * 5;
  const centerX = padding + (gridSize * cellSize - centerSize) / 2;
  const centerY = padding + (gridSize * cellSize - centerSize) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(centerX - 2, centerY - 2, centerSize + 4, centerSize + 4);
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(centerX + centerSize / 2, centerY + centerSize / 2, centerSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍄', centerX + centerSize / 2, centerY + centerSize / 2);
}

// ====================================================================
// VUE 4 : PAGE DE COMPTE RENDU & RESTITUTION
// ====================================================================

function renderRestitutionView() {
  const filterRow = document.getElementById('restitutionFilterRow');
  const stack = document.getElementById('restitutionCardsStack');

  if (!filterRow || !stack) return;

  // Filtres équipes
  filterRow.innerHTML = '<button class="filter-pill active" onclick="filterRestitutionTeam(\'all\')">Tous les Groupes</button>';
  state.teams.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.textContent = t.name;
    btn.onclick = () => filterRestitutionTeam(t.id);
    filterRow.appendChild(btn);
  });

  // Fiches complètes
  renderRestitutionCards('all');
}

function filterRestitutionTeam(teamId) {
  document.querySelectorAll('#restitutionFilterRow .filter-pill').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderRestitutionCards(teamId);
}

function renderRestitutionCards(filterTeamId) {
  const stack = document.getElementById('restitutionCardsStack');
  stack.innerHTML = '';

  const teamsToDisplay = filterTeamId === 'all'
    ? state.teams
    : state.teams.filter(t => t.id === filterTeamId);

  if (teamsToDisplay.length === 0) {
    stack.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 16px;">
        <h3>Aucun livrable disponible pour l'instant.</h3>
        <p>Les fiches de restitution apparaîtront au fur et à mesure que les équipes valident les 6 Maisons.</p>
      </div>
    `;
    return;
  }

  teamsToDisplay.forEach(team => {
    const deliverables = team.deliverables || [];
    const d1 = deliverables.find(d => d.house_number === 1)?.content || {};
    const d2 = deliverables.find(d => d.house_number === 2)?.content || {};
    const d3 = deliverables.find(d => d.house_number === 3)?.content || {};
    const d4 = deliverables.find(d => d.house_number === 4)?.content || {};
    const d5 = deliverables.find(d => d.house_number === 5)?.content || {};
    const d6 = deliverables.find(d => d.house_number === 6)?.content || {};

    const sheet = document.createElement('article');
    sheet.className = 'restitution-team-sheet';
    sheet.innerHTML = `
      <div class="restitution-sheet-head">
        <div class="restitution-team-identity">
          <img src="assets/images/${team.avatar}" alt="${team.name}" class="restitution-team-avatar" style="border-color: ${team.color};">
          <div>
            <h3 class="restitution-team-name">${team.name}</h3>
            <div class="restitution-team-meta">
              Archétype : <strong style="color: ${team.color};">${getArchetypeDisplayName(team.archetype)}</strong> • 
              Rédacteur : <strong>${team.scribe ? team.scribe.first_name + ' ' + team.scribe.last_name : 'Non désigné'}</strong> • 
              Progression Village : <strong>${team.progress_percent}% (Maison ${team.current_house}/6)</strong>
            </div>
            <div style="font-size: 0.775rem; color: #94a3b8; margin-top: 0.2rem;">
              Membres : ${(team.members || []).map(m => m.first_name + ' ' + m.last_name).join(', ') || 'Aucun'}
            </div>
          </div>
        </div>
      </div>

      <div class="restitution-houses-grid">
        <!-- Maison 1 : Besoin -->
        <div class="restitution-house-block">
          <div class="restitution-house-title">
            <span>🛖 Maison 1 : Le Besoin Utilisateur</span>
            <span style="font-size: 0.75rem; color: #10b981;">16%</span>
          </div>
          <div class="restitution-house-content">
            <div class="content-row"><span class="content-label">Utilisateur :</span> ${d1.targetUser || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Douleur :</span> ${d1.problem || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Formule canonique :</span><br><strong>${d1.formulation || '<em>Non renseigné</em>'}</strong></div>
          </div>
        </div>

        <!-- Maison 2 : Idée IoT -->
        <div class="restitution-house-block">
          <div class="restitution-house-title">
            <span>💡 Maison 2 : Concept Produit IoT</span>
            <span style="font-size: 0.75rem; color: #10b981;">33%</span>
          </div>
          <div class="restitution-house-content">
            <div class="content-row"><span class="content-label">Nom du Produit :</span> <strong>${d2.conceptName || '<em>Non renseigné</em>'}</strong></div>
            <div class="content-row"><span class="content-label">Mesures capteurs :</span> ${d2.measures || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Connectivité :</span> ${d2.connectivity || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Action déclenchée :</span> ${d2.actions || '<em>Non renseigné</em>'}</div>
          </div>
        </div>

        <!-- Maison 3 : Faisabilité -->
        <div class="restitution-house-block">
          <div class="restitution-house-title">
            <span>⚙️ Maison 3 : Chaîne Technique Faisabilité</span>
            <span style="font-size: 0.75rem; color: #10b981;">50%</span>
          </div>
          <div class="restitution-house-content">
            <div class="content-row"><span class="content-label">Capteurs :</span> ${d3.sensors || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Microcontrôleur & Énergie :</span> ${d3.processing || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Protocole & Transport :</span> ${d3.protocol || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Cloud & Interface :</span> ${d3.cloudUser || '<em>Non renseigné</em>'}</div>
          </div>
        </div>

        <!-- Maison 4 : Prototype -->
        <div class="restitution-house-block">
          <div class="restitution-house-title">
            <span>🔌 Maison 4 : Prototype & Scénario</span>
            <span style="font-size: 0.75rem; color: #10b981;">66%</span>
          </div>
          <div class="restitution-house-content">
            <div class="content-row"><span class="content-label">Maquette physique :</span> ${d4.prototypeType || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Scénario d'usage :</span> ${d4.usageScenario || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Protocole de test :</span> ${d4.testProtocol || '<em>Non renseigné</em>'}</div>
          </div>
        </div>

        <!-- Maison 5 : Business Model Canvas -->
        <div class="restitution-house-block" style="grid-column: 1 / -1;">
          <div class="restitution-house-title">
            <span>📊 Maison 5 : Synthèse Business Model (9 Blocs)</span>
            <span style="font-size: 0.75rem; color: #10b981;">83%</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.8rem;">
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Partenaires :</strong><br>${d5.bmcPartners || '-'}</div>
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Proposition Valeur :</strong><br>${d5.bmcValue || '-'}</div>
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Segments Clients :</strong><br>${d5.bmcSegments || '-'}</div>
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Activités & Ressources :</strong><br>${d5.bmcActivities || '-'} / ${d5.bmcResources || '-'}</div>
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Canaux & Relations :</strong><br>${d5.bmcChannels || '-'} / ${d5.bmcRelations || '-'}</div>
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;"><strong>Coûts & Revenus :</strong><br>${d5.bmcCosts || '-'} / ${d5.bmcRevenues || '-'}</div>
          </div>
        </div>

        <!-- Maison 6 : Marché & Pitch -->
        <div class="restitution-house-block" style="grid-column: 1 / -1;">
          <div class="restitution-house-title">
            <span>🏆 Maison 6 : Marché & Pitch 3 Minutes</span>
            <span style="font-size: 0.75rem; color: #10b981;">100%</span>
          </div>
          <div class="restitution-house-content">
            <div class="content-row"><span class="content-label">Lancement & Go-to-Market :</span> ${d6.launchPlan || '<em>Non renseigné</em>'}</div>
            <div class="content-row"><span class="content-label">Objectifs 12 mois :</span> ${d6.targetMetrics || '<em>Non renseigné</em>'}</div>
            <div class="content-row" style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(56, 189, 248, 0.05); border-left: 3px solid #38bdf8; border-radius: 4px;">
              <span class="content-label">🎤 Script du Pitch 3 Minutes :</span><br>
              <em>${d6.pitchScript || 'Aucun script saisi'}</em>
            </div>
          </div>
        </div>

      </div>
    </article>
    `;
    stack.appendChild(sheet);
  });
}

// Export en Markdown
function exportMarkdownReport() {
  let md = `# LE VILLAGE IoT DES SCHTROUMPFS - RESTITUTION FINALE DES PROJETS\n`;
  md += `Date d'exportation : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;
  md += `Ce document synthétise les travaux des équipes formées par archétype Schtroumpf à travers les 6 Maisons du Village IoT.\n\n`;
  md += `---\n\n`;

  state.teams.forEach((t, idx) => {
    const dels = t.deliverables || [];
    const d1 = dels.find(d => d.house_number === 1)?.content || {};
    const d2 = dels.find(d => d.house_number === 2)?.content || {};
    const d3 = dels.find(d => d.house_number === 3)?.content || {};
    const d4 = dels.find(d => d.house_number === 4)?.content || {};
    const d5 = dels.find(d => d.house_number === 5)?.content || {};
    const d6 = dels.find(d => d.house_number === 6)?.content || {};

    md += `## ${idx + 1}. Équipe : ${t.name} (${getArchetypeDisplayName(t.archetype)})\n\n`;
    md += `- **Progression :** Maison ${t.current_house}/6 (${t.progress_percent}%)\n`;
    md += `- **Rédacteur Officiel :** ${t.scribe ? t.scribe.first_name + ' ' + t.scribe.last_name : 'Non désigné'}\n`;
    md += `- **Membres :** ${(t.members || []).map(m => m.first_name + ' ' + m.last_name).join(', ') || 'Aucun'}\n\n`;

    md += `### Maison 1 — Besoin (16%)\n`;
    md += `- **Utilisateur Cible :** ${d1.targetUser || 'N/A'}\n`;
    md += `- **Problème / Douleur :** ${d1.problem || 'N/A'}\n`;
    md += `- **Formule Canonique :** ${d1.formulation || 'N/A'}\n\n`;

    md += `### Maison 2 — Idée IoT (33%)\n`;
    md += `- **Nom du Produit :** ${d2.conceptName || 'N/A'}\n`;
    md += `- **Grandeurs Mesurées :** ${d2.measures || 'N/A'}\n`;
    md += `- **Connectivité :** ${d2.connectivity || 'N/A'}\n`;
    md += `- **Action & Valeur Déclenchée :** ${d2.actions || 'N/A'}\n\n`;

    md += `### Maison 3 — Faisabilité Technique (50%)\n`;
    md += `- **Capteurs :** ${d3.sensors || 'N/A'}\n`;
    md += `- **Microcontrôleur & Énergie :** ${d3.processing || 'N/A'}\n`;
    md += `- **Protocole Réseau :** ${d3.protocol || 'N/A'}\n`;
    md += `- **Cloud & Restitution Utilisateur :** ${d3.cloudUser || 'N/A'}\n\n`;

    md += `### Maison 4 — Prototype (66%)\n`;
    md += `- **Maquette Physique :** ${d4.prototypeType || 'N/A'}\n`;
    md += `- **Scénario d'Usage :** ${d4.usageScenario || 'N/A'}\n`;
    md += `- **Protocole de Validation :** ${d4.testProtocol || 'N/A'}\n\n`;

    md += `### Maison 5 — Business Model Canvas (83%)\n`;
    md += `- **Proposition de Valeur :** ${d5.bmcValue || 'N/A'}\n`;
    md += `- **Segments Clients :** ${d5.bmcSegments || 'N/A'}\n`;
    md += `- **Flux de Revenus :** ${d5.bmcRevenues || 'N/A'}\n`;
    md += `- **Structure de Coûts :** ${d5.bmcCosts || 'N/A'}\n\n`;

    md += `### Maison 6 — Marché & Pitch (100%)\n`;
    md += `- **Plan de Lancement :** ${d6.launchPlan || 'N/A'}\n`;
    md += `- **Objectifs 12 Mois :** ${d6.targetMetrics || 'N/A'}\n`;
    md += `> **Script du Pitch 3 Minutes :**\n> ${d6.pitchScript || 'N/A'}\n\n`;
    md += `---\n\n`;
  });

  // Téléchargement du fichier Markdown
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `restitution_village_iot_schtroumpfs_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Rapport Markdown téléchargé avec succès !', 'success');
}

function startPresentationMode() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Mode plein écran non disponible:', err);
    });
  }
}

// ====================================================================
// RAFRAÎCHISSEMENT DES DONNÉES DU WORKSHOP
// ====================================================================
async function refreshWorkshopData(updateUiFeedback = true) {
  try {
    const [resSession, resTeams, resParticipants, resDeliverables] = await Promise.all([
      fetch('/api/session'),
      fetch('/api/teams'),
      fetch('/api/participants'),
      fetch('/api/deliverables')
    ]);

    if (resSession.ok) {
      const sessData = await resSession.json();
      state.sessionPhase = sessData.phase || 'registration';
    }
    if (resTeams.ok) state.teams = await resTeams.json();
    if (resParticipants.ok) state.participants = await resParticipants.json();
    let deliverables = [];
    if (resDeliverables.ok) deliverables = await resDeliverables.json();

    // Associer les livrables aux équipes
    state.teams.forEach(t => {
      t.deliverables = deliverables.filter(d => d.team_id === t.id);
    });

    // Mettre à jour le flux des participants dans la salle d'attente
    renderWaitingLiveFeed(state.participants);

    // Mettre à jour les compteurs du dashboard
    const elParts = document.getElementById('statParticipantsCount');
    const elTeams = document.getElementById('statTeamsCount');
    const elDels = document.getElementById('statDeliverablesCount');

    if (elParts) elParts.textContent = state.participants.length;
    if (elTeams) elTeams.textContent = state.teams.length;
    if (elDels) elDels.textContent = deliverables.length;

    // Si nous sommes sur le Dashboard (animateur), rafraîchir la carte et la pré-constitution
    if (state.currentView === 'view-dashboard') {
      renderVillageMap();
      renderAdminPrelaunchGrid();
    }

    // Si un participant local existe, vérifier son affectation et ses droits
    if (state.currentUser) {
      const updatedUser = state.participants.find(p => p.id === state.currentUser.id);
      if (updatedUser) {
        state.currentUser = updatedUser;
        localStorage.setItem('smurf_iot_user', JSON.stringify(updatedUser));
        updateParticipantTeamStatus(updatedUser);
      }
    }

    // Si nous sommes sur l'espace de travail, actualiser les informations de l'équipe
    if (state.currentView === 'view-workspace' && state.activeTeamId) {
      onTeamSelectionChanged();
    }
  } catch (err) {
    if (updateUiFeedback) {
      console.warn('Erreur rafraîchissement données:', err.message);
    }
  }
}

// ====================================================================
// UTILITAIRES D'INTERFACE (TOAST, MODALES)
// ====================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function closeModalOnBackdrop(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}
