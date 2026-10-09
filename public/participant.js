/**
 * LE VILLAGE IoT DES SCHTROUMPFS - ESPACE PARTICIPANT (MOBILE DÉDIÉ)
 * Workflow participant : Identification ➔ Test 15 Questions ➔ Profil 3D ➔ Espace Équipe
 */

// État local du participant
const pState = {
  currentUser: null,
  assignedTeam: null,
  activeHouse: 1,
  hasAutoRedirected: false,

  quiz: {
    currentIndex: 0,
    answers: [],
    firstName: '',
    lastName: ''
  },

  waitingTimerInterval: null,
  waitingStartTime: null,

  pitchTimer: {
    interval: null,
    totalSeconds: 180,
    remainingSeconds: 180,
    isRunning: false
  }
};

// 15 Questions Officielles d'Analyse Comportementale Schtroumpf (Échelle 1 à 5)
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

// Métadonnées statiques des 5 archétypes Schtroumpfs
const ARCHETYPES = {
  Artiste: {
    name: 'Schtroumpf Artiste',
    displayName: 'Artiste',
    tagline: 'L\'imagination sans limites et le sens du design',
    avatar: 'assets/images/artiste.jpg',
    color: '#ec4899',
    badge: 'Artiste',
    desc: 'Vous abordez les projets par l\'esthétique, l\'émotion visuelle et la pensée divergente. Vous imaginez des objets connectés élégants qui font rêver l\'utilisateur.',
    powers: ['Design d\'interface & ergonomie visuelle', 'Storytelling percutant', 'Création de scénarios d\'usage immersifs']
  },
  Professeur: {
    name: 'Schtroumpf Professeur (Théoricien)',
    displayName: 'Professeur (Théoricien)',
    tagline: 'L\'architecture rigoureuse et la logique technique',
    avatar: 'assets/images/professeur.jpg',
    color: '#0284c7',
    badge: 'Professeur (Théoricien)',
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
    desc: 'Moins de paroles, plus d\'action ! Vous aimez tester des maquettes physiques, brancher des capteurs et faire fonctionner le premier prototype au plus vite.',
    powers: ['Prototypage express (Maker spirit)', 'Résolution rapide des blocages concrets', 'Dynamisme d\'équipe et passage à l\'action']
  }
};

function getArchetypeDisplayName(archKey) {
  const map = {
    Artiste: 'Artiste',
    Professeur: 'Professeur',
    Critique: 'Critique',
    Empathique: 'Empathique',
    Sportif: 'Sportif'
  };
  return map[archKey] || archKey;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  loadSavedUserFromStorage();

  // Boucle de synchronisation temps réel (toutes les 2.5 secondes)
  setInterval(() => {
    syncParticipantStatus();
  }, 2500);
});

// Restaurer la session du participant
function loadSavedUserFromStorage() {
  try {
    const raw = localStorage.getItem('smurf_iot_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.first_name) {
        pState.currentUser = user;
        updateUserHeaderBadge(user);

        // Si le profil est déjà calculé, afficher directement l'écran de résultat / attente
        if (user.archetype) {
          showResultScreen(user);
          syncParticipantStatus();
          return;
        }
      }
    }
  } catch (e) {
    console.warn('Session participant non restaurée:', e);
  }

  showParticipantScreen('screen-identify');
}

function updateUserHeaderBadge(user) {
  const badge = document.getElementById('participantUserBadge');
  const avatar = document.getElementById('headerUserAvatar');
  const name = document.getElementById('headerUserName');
  if (!badge || !user) return;

  const arch = ARCHETYPES[user.archetype] || ARCHETYPES.Professeur;
  if (avatar) avatar.src = arch.avatar;
  if (name) name.textContent = `${user.first_name} ${user.last_name ? user.last_name[0] + '.' : ''}`;
  badge.style.display = 'inline-flex';
}

function toggleParticipantProfileView() {
  const ws = document.getElementById('view-workspace');
  const part = document.getElementById('view-participant');
  if (!ws || !part) return;

  if (ws.classList.contains('active')) {
    ws.classList.remove('active');
    part.classList.add('active');
    sessionStorage.setItem('smurf_active_view', 'profile');
    if (pState.currentUser) {
      showResultScreen(pState.currentUser);
    }
  } else if (pState.assignedTeam) {
    part.classList.remove('active');
    ws.classList.add('active');
    sessionStorage.setItem('smurf_active_view', 'workspace');
  }
}

function showParticipantScreen(screenId) {
  document.querySelectorAll('#view-participant .step-screen').forEach(s => {
    s.classList.toggle('active', s.id === screenId);
  });
}

// ====================================================================
// ÉTAPE 1 : IDENTIFICATION
// ====================================================================
function startPersonalityTest() {
  const fInput = document.getElementById('inputFirstName');
  const lInput = document.getElementById('inputLastName');

  const fName = fInput ? fInput.value.trim() : '';
  const lName = lInput ? lInput.value.trim() : '';

  if (!fName || !lName) {
    showToast('Veuillez renseigner votre prénom et votre nom.', 'warning');
    return;
  }

  pState.quiz.firstName = fName;
  pState.quiz.lastName = lName;
  pState.quiz.currentIndex = 0;
  pState.quiz.answers = new Array(OFFICIAL_15_QUESTIONS.length).fill(null);

  showParticipantScreen('screen-quiz');
  renderQuizQuestion();
}

// ====================================================================
// ÉTAPE 2 : QUESTIONNAIRE 15 QUESTIONS
// ====================================================================
function renderQuizQuestion() {
  const q = OFFICIAL_15_QUESTIONS[pState.quiz.currentIndex];
  if (!q) return;

  const total = OFFICIAL_15_QUESTIONS.length;
  const currentNum = pState.quiz.currentIndex + 1;
  const pct = Math.round((currentNum / total) * 100);

  const bar = document.getElementById('quizProgressBar');
  const stepText = document.getElementById('quizStepText');
  const pctText = document.getElementById('quizPercentText');
  const catText = document.getElementById('questionCategory');
  const promptEl = document.getElementById('questionPrompt');
  const container = document.getElementById('quizOptionsContainer');
  const btnPrev = document.getElementById('btnQuizPrev');
  const btnNext = document.getElementById('btnQuizNext');

  if (bar) bar.style.width = `${pct}%`;
  if (stepText) stepText.textContent = `Question ${currentNum} sur ${total}`;
  if (pctText) pctText.textContent = `${pct}%`;
  if (catText) catText.textContent = `Affirmation ${currentNum} / ${total}`;
  if (promptEl) promptEl.textContent = q.text;

  if (btnPrev) btnPrev.style.visibility = pState.quiz.currentIndex === 0 ? 'hidden' : 'visible';

  const currentAnswer = pState.quiz.answers[pState.quiz.currentIndex];
  if (btnNext) {
    btnNext.disabled = currentAnswer === null;
    btnNext.textContent = currentNum === total ? 'Calculer mon Profil ➔' : 'Suivant →';
  }

  if (container) {
    container.innerHTML = LIKERT_SCALE.map(scale => {
      const isSelected = currentAnswer === scale.val;
      return `
        <div class="likert-option-card ${isSelected ? 'selected' : ''}" onclick="selectQuizRating(${scale.val})">
          <div class="likert-radio-dot">${isSelected ? '●' : '○'}</div>
          <div class="likert-label-text">${scale.label}</div>
        </div>
      `;
    }).join('');
  }
}

function selectQuizRating(val) {
  pState.quiz.answers[pState.quiz.currentIndex] = val;
  renderQuizQuestion();

  // Avance automatique fluide après 200ms
  setTimeout(() => {
    nextQuizQuestion();
  }, 220);
}

function prevQuizQuestion() {
  if (pState.quiz.currentIndex > 0) {
    pState.quiz.currentIndex--;
    renderQuizQuestion();
  }
}

async function nextQuizQuestion() {
  if (pState.quiz.answers[pState.quiz.currentIndex] === null) {
    showToast('Veuillez sélectionner une note entre 1 et 5.', 'warning');
    return;
  }

  if (pState.quiz.currentIndex < OFFICIAL_15_QUESTIONS.length - 1) {
    pState.quiz.currentIndex++;
    renderQuizQuestion();
  } else {
    await submitQuizResults();
  }
}

async function submitQuizResults() {
  const btnNext = document.getElementById('btnQuizNext');
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'Calcul du profil Schtroumpf...';
  }

  // Calcul officiel des scores sur 75 points (3 questions par archétype)
  const scores = { Artiste: 0, Professeur: 0, Critique: 0, Empathique: 0, Sportif: 0 };
  OFFICIAL_15_QUESTIONS.forEach((q, idx) => {
    const val = pState.quiz.answers[idx] || 3;
    if (scores[q.archetype] !== undefined) {
      scores[q.archetype] += val;
    }
  });

  // Déterminer l'archétype dominant
  let dominantArchetype = 'Artiste';
  let maxScore = -1;
  const officialPriority = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];
  for (const arch of officialPriority) {
    if (scores[arch] > maxScore) {
      maxScore = scores[arch];
      dominantArchetype = arch;
    }
  }

  const payload = {
    first_name: pState.quiz.firstName,
    last_name: pState.quiz.lastName,
    archetype: dominantArchetype,
    scores: scores,
    answers: pState.quiz.answers
  };

  try {
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      pState.currentUser = data.participant || {
        ...payload,
        id: data.id || Date.now()
      };
      localStorage.setItem('smurf_iot_user', JSON.stringify(pState.currentUser));
      updateUserHeaderBadge(pState.currentUser);
      showResultScreen(pState.currentUser);
      showToast('Votre profil Schtroumpf a été enregistré !', 'success');
    } else {
      showToast(data.error || 'Erreur lors de l\'enregistrement', 'error');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent = 'Réessayer ➔';
      }
    }
  } catch (err) {
    // Mode hors-ligne / secours local
    pState.currentUser = {
      ...payload,
      id: Date.now()
    };
    localStorage.setItem('smurf_iot_user', JSON.stringify(pState.currentUser));
    updateUserHeaderBadge(pState.currentUser);
    showResultScreen(pState.currentUser);
  }
}

// ====================================================================
// ÉTAPE 3 : RÉSULTAT DU PROFIL & SALLE D'ATTENTE INTERACTIVE
// ====================================================================
function showResultScreen(participant) {
  showParticipantScreen('screen-result');

  const archKey = participant.archetype || 'Artiste';
  const arch = ARCHETYPES[archKey] || ARCHETYPES.Artiste;
  const scores = participant.archetype_scores || participant.scores || {};
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 75;

  const resName = document.getElementById('resParticipantName');
  const resAvatar = document.getElementById('resArchetypeAvatar');
  const resBadge = document.getElementById('resArchetypeBadge');
  const resTitle = document.getElementById('resArchetypeTitle');
  const resTagline = document.getElementById('resArchetypeTagline');
  const resDesc = document.getElementById('resArchetypeDesc');
  const powersList = document.getElementById('resSuperpowersList');
  const tableContainer = document.getElementById('resOfficialScoringTable');
  const barsContainer = document.getElementById('resScoresBars');

  if (resName) resName.textContent = participant.first_name || 'Participant';
  if (resAvatar) resAvatar.src = arch.avatar;
  if (resBadge) {
    resBadge.textContent = arch.badge;
    resBadge.style.backgroundColor = `${arch.color}30`;
    resBadge.style.borderColor = arch.color;
    resBadge.style.color = arch.color;
  }
  if (resTitle) resTitle.textContent = arch.name;
  if (resTagline) resTagline.textContent = arch.tagline;
  if (resDesc) resDesc.textContent = arch.desc;

  if (powersList) {
    powersList.innerHTML = (arch.powers || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');
  }

  // Tableau officiel des scores
  if (tableContainer) {
    tableContainer.innerHTML = Object.keys(ARCHETYPES).map(key => {
      const aMeta = ARCHETYPES[key];
      const sVal = scores[key] || 0;
      const sPct = Math.round((sVal / totalScore) * 100);
      const isDominant = key === archKey;

      return `
        <div class="scoring-row ${isDominant ? 'dominant' : ''}">
          <div class="scoring-col-name" style="color: ${aMeta.color};">
            ${isDominant ? '★ ' : ''}${aMeta.displayName}
          </div>
          <div class="scoring-col-score"><strong>${sVal}</strong> / 15 pts</div>
          <div class="scoring-col-pct">${sPct}%</div>
        </div>
      `;
    }).join('');
  }

  // Barres visuelles de répartition
  if (barsContainer) {
    barsContainer.innerHTML = Object.keys(ARCHETYPES).map(key => {
      const aMeta = ARCHETYPES[key];
      const sVal = scores[key] || 0;
      const sPct = Math.round((sVal / totalScore) * 100);

      return `
        <div class="score-bar-row">
          <div class="score-bar-label">
            <span style="color: ${aMeta.color};">${aMeta.displayName}</span>
            <span>${sVal} pts (${sPct}%)</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width: ${sPct}%; background-color: ${aMeta.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  startWaitingTimer();
}

// Timer de la salle d'attente
function startWaitingTimer() {
  if (pState.waitingTimerInterval) return;
  pState.waitingStartTime = Date.now();

  pState.waitingTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - pState.waitingStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const display = document.getElementById('waitingTimerDisplay');
    if (display) display.textContent = `${mins}:${secs}`;
  }, 1000);
}

// ====================================================================
// SYNCHRONISATION EN DIRECT & DÉTECTION DU GROUPE DU PARTICIPANT
// ====================================================================
async function syncParticipantStatus() {
  if (!pState.currentUser) return;

  try {
    const [resParts, resTeams] = await Promise.all([
      fetch('/api/participants'),
      fetch('/api/teams')
    ]);

    if (!resParts.ok || !resTeams.ok) return;

    const participants = await resParts.json();
    const teams = await resTeams.json();

    // Mettre à jour le compteur de prêts dans la salle d'attente
    const countReady = document.getElementById('waitingCountReady');
    if (countReady) countReady.textContent = participants.length;

    // Flux direct des participants
    renderWaitingLiveFeed(participants);

    // Retrouver le participant à jour
    let updatedUser = participants.find(p => p.id === pState.currentUser.id);
    if (!updatedUser) {
      updatedUser = participants.find(p => 
        p.first_name && pState.currentUser.first_name &&
        p.first_name.trim().toLowerCase() === pState.currentUser.first_name.trim().toLowerCase() &&
        p.last_name && pState.currentUser.last_name &&
        p.last_name.trim().toLowerCase() === pState.currentUser.last_name.trim().toLowerCase()
      );
    }

    if (updatedUser) {
      pState.currentUser = updatedUser;
      localStorage.setItem('smurf_iot_user', JSON.stringify(updatedUser));
      updateUserHeaderBadge(updatedUser);
    }

    // Vérifier si une équipe a été assignée à l'utilisateur
    if (teams.length > 0 && pState.currentUser) {
      let userTeam = null;

      if (pState.currentUser.team_id) {
        userTeam = teams.find(t => t.id === pState.currentUser.team_id);
      }

      if (!userTeam) {
        // Rechercher dans la liste des membres de chaque équipe
        userTeam = teams.find(t => (t.members || []).some(m => m.id === pState.currentUser.id));
      }

      if (!userTeam && pState.currentUser.archetype) {
        // Si même prénom & nom
        userTeam = teams.find(t => (t.members || []).some(m => 
          m.first_name && m.first_name.trim().toLowerCase() === pState.currentUser.first_name.trim().toLowerCase()
        ));
      }

      if (userTeam) {
        handleTeamAssigned(userTeam);
      }
    }
  } catch (err) {
    console.warn('Erreur synchronisation participant:', err.message);
  }
}

function renderWaitingLiveFeed(participants) {
  const feed = document.getElementById('waitingLiveFeed');
  if (!feed) return;

  feed.innerHTML = participants.slice(-8).reverse().map(p => {
    const arch = ARCHETYPES[p.archetype] || ARCHETYPES.Artiste;
    return `
      <div class="feed-item-chip" style="border-left: 3px solid ${arch.color};">
        <img src="${arch.avatar}" alt="" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">
        <span><strong>${escapeHtml(p.first_name)}</strong> (${arch.displayName})</span>
      </div>
    `;
  }).join('');
}

// L'équipe a été formée par l'animateur !
function handleTeamAssigned(team) {
  pState.assignedTeam = team;

  const isScribe = (team.scribe && team.scribe.id === pState.currentUser.id) || 
                   (team.scribe_id === pState.currentUser.id);

  // 1. Mettre à jour la bannière d'alerte en haut de la page résultat
  const banner = document.getElementById('resTeamFormedBanner');
  const bannerTitle = document.getElementById('resTeamFormedTitle');
  const bannerRole = document.getElementById('resTeamFormedRole');

  if (banner) {
    banner.style.display = 'flex';
    if (bannerTitle) bannerTitle.textContent = `Équipe : ${team.name}`;
    if (bannerRole) {
      bannerRole.textContent = isScribe 
        ? 'Rôle : ✍️ Rédacteur Unique (Porteur de stylo)'
        : 'Rôle : 🤝 Conseiller dans l\'équipe';
    }
  }

  // 2. Mettre à jour le panneau de célébration dans la salle d'attente
  const idlePanel = document.getElementById('waitingIdleState');
  const assignedPanel = document.getElementById('waitingAssignedState');
  if (idlePanel) idlePanel.style.display = 'none';
  if (assignedPanel) assignedPanel.style.display = 'block';

  const tAvatar = document.getElementById('assignedTeamAvatar');
  const tName = document.getElementById('assignedTeamName');
  const tTrait = document.getElementById('assignedTeamTrait');
  const rIcon = document.getElementById('assignedRoleIcon');
  const rHead = document.getElementById('assignedRoleHeadline');
  const rExp = document.getElementById('assignedRoleExplanation');
  const mCount = document.getElementById('assignedMembersCount');
  const mList = document.getElementById('assignedMembersList');

  const arch = ARCHETYPES[team.archetype] || ARCHETYPES.Artiste;
  const avatarPath = team.avatar ? (team.avatar.startsWith('assets/') ? team.avatar : `assets/images/${team.avatar}`) : arch.avatar;
  if (tAvatar) tAvatar.src = avatarPath;
  if (tName) tName.textContent = team.name;
  if (tTrait) tTrait.textContent = `Archétype dominant : ${getArchetypeDisplayName(team.archetype)}`;

  if (rIcon) rIcon.textContent = isScribe ? '✍️' : '🤝';
  if (rHead) rHead.textContent = isScribe ? 'Vous êtes le Rédacteur Unique (Porteur de stylo)' : 'Vous êtes Conseiller dans l\'Équipe';
  if (rExp) {
    rExp.textContent = isScribe
      ? 'Vous avez les droits exclusifs pour saisir et valider les livrables des 6 Maisons pour votre groupe.'
      : 'Participez aux échanges oraux et conseillez votre rédacteur pour enrichir les fiches des 6 Maisons.';
  }

  const members = team.members || [];
  if (mCount) mCount.textContent = members.length;
  if (mList) {
    mList.innerHTML = members.map(m => {
      const isMemberScribe = (team.scribe && team.scribe.id === m.id) || (team.scribe_id === m.id);
      const mArch = ARCHETYPES[m.archetype] || ARCHETYPES.Artiste;
      return `
        <div class="assigned-member-chip ${isMemberScribe ? 'is-scribe' : ''}" style="border-left: 3px solid ${mArch.color};">
          <div style="font-weight: 700; color: #fff;">${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</div>
          <div style="font-size: 0.72rem; color: ${isMemberScribe ? '#38bdf8' : '#94a3b8'};">
            ${isMemberScribe ? '✍️ Porteur de stylo' : '🤝 Conseiller'} • ${mArch.displayName}
          </div>
        </div>
      `;
    }).join('');
  }

  // Si l'utilisateur avait déjà ouvert l'espace de travail précédemment
  if (sessionStorage.getItem('smurf_active_view') === 'workspace' && !document.getElementById('view-workspace')?.classList.contains('active')) {
    switchToWorkspaceWithTeam();
    return;
  }

  // Si on est déjà dans l'espace de travail, actualiser les livrables
  if (document.getElementById('view-workspace')?.classList.contains('active')) {
    updateWorkspaceUI(team, isScribe);
  }
}

// ====================================================================
// ÉTAPE 4 : ESPACE DE TRAVAIL EXCLUSIF DE L'ÉQUIPE
// ====================================================================
function switchToWorkspaceWithTeam() {
  if (!pState.assignedTeam) {
    showToast('Votre équipe est en cours de création par l\'animateur...', 'info');
    return;
  }

  sessionStorage.setItem('smurf_active_view', 'workspace');

  // Basculer la vue SPA
  document.getElementById('view-participant')?.classList.remove('active');
  const viewWs = document.getElementById('view-workspace');
  if (viewWs) viewWs.classList.add('active');

  const isScribe = (pState.assignedTeam.scribe && pState.assignedTeam.scribe.id === pState.currentUser.id) || 
                   (pState.assignedTeam.scribe_id === pState.currentUser.id);

  updateWorkspaceUI(pState.assignedTeam, isScribe);
  loadDeliverablesForTeam(pState.assignedTeam.id);

  // Positionner sur la maison en cours
  switchHouseTab(pState.assignedTeam.current_house || 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateWorkspaceUI(team, isScribe) {
  const arch = ARCHETYPES[team.archetype] || ARCHETYPES.Artiste;

  const cardAvatar = document.getElementById('teamCardAvatar');
  const cardName = document.getElementById('teamCardName');
  const cardTrait = document.getElementById('teamCardTrait');
  const scribeName = document.getElementById('teamCardScribeName');
  const memberCount = document.getElementById('teamMemberCount');
  const membersList = document.getElementById('teamMembersList');

  const avatarPath = team.avatar ? (team.avatar.startsWith('assets/') ? team.avatar : `assets/images/${team.avatar}`) : arch.avatar;
  if (cardAvatar) cardAvatar.src = avatarPath;
  if (cardName) cardName.textContent = team.name;
  if (cardTrait) cardTrait.textContent = `Profil : ${getArchetypeDisplayName(team.archetype)}`;

  const currentScribe = team.scribe || (team.members ? team.members[0] : null);
  if (scribeName) {
    scribeName.textContent = currentScribe 
      ? `${currentScribe.first_name} ${currentScribe.last_name}` 
      : 'Non désigné';
  }

  const members = team.members || [];
  if (memberCount) memberCount.textContent = members.length;
  if (membersList) {
    membersList.innerHTML = members.map(m => {
      const isMscribe = currentScribe && m.id === currentScribe.id;
      const mArch = ARCHETYPES[m.archetype] || ARCHETYPES.Artiste;
      return `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem;">
          <span style="color: #fff;">${isMscribe ? '✍️ ' : '🤝 '}${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</span>
          <span style="font-size: 0.72rem; color: ${mArch.color};">${mArch.displayName}</span>
        </li>
      `;
    }).join('');
  }

  // Bannière de rôle
  const roleBanner = document.getElementById('workspaceRoleBanner');
  const roleIcon = document.getElementById('workspaceRoleBannerIcon');
  const roleTitle = document.getElementById('workspaceRoleBannerTitle');
  const roleDesc = document.getElementById('workspaceRoleBannerDesc');

  if (roleBanner) {
    roleBanner.style.display = 'flex';
    if (isScribe) {
      roleBanner.style.background = 'rgba(56, 189, 248, 0.12)';
      roleBanner.style.borderColor = 'rgba(56, 189, 248, 0.35)';
      if (roleIcon) roleIcon.textContent = '✍️';
      if (roleTitle) roleTitle.textContent = 'Mode Rédacteur Unique (Porteur de stylo)';
      if (roleDesc) roleDesc.textContent = 'Vous avez les droits exclusifs pour saisir et valider les livrables de votre équipe.';
    } else {
      roleBanner.style.background = 'rgba(245, 158, 11, 0.12)';
      roleBanner.style.borderColor = 'rgba(245, 158, 11, 0.35)';
      if (roleIcon) roleIcon.textContent = '🤝';
      if (roleTitle) roleTitle.textContent = 'Mode Consultation & Collaboration';
      if (roleDesc) roleDesc.textContent = `Seul ${currentScribe ? currentScribe.first_name : 'le rédacteur'} a les droits de saisie. Échangez et conseillez-le à l'oral !`;
    }
  }

  // Appliquer le verrouillage des formulaires pour les conseillers
  applyFormLock(!isScribe);
}

function applyFormLock(isLocked) {
  const formIds = ['formHouse1', 'formHouse2', 'formHouse3', 'formHouse4', 'formHouse5', 'formHouse6'];
  formIds.forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => {
      inp.readOnly = isLocked;
      inp.style.opacity = isLocked ? '0.75' : '1';
    });

    const submitBtns = form.querySelectorAll('button[type="submit"], button[onclick*="saveDraft"]');
    submitBtns.forEach(btn => {
      btn.disabled = isLocked;
      btn.style.display = isLocked ? 'none' : 'inline-flex';
    });
  });
}

function switchHouseTab(houseNum) {
  pState.activeHouse = houseNum;

  // Stepper
  document.querySelectorAll('#housesStepper .stepper-item').forEach(item => {
    const h = parseInt(item.getAttribute('data-house'), 10);
    item.classList.toggle('active', h === houseNum);
    item.classList.toggle('completed', h < houseNum);
  });

  // Panneaux
  for (let i = 1; i <= 6; i++) {
    const panel = document.getElementById(`house-form-${i}`);
    if (panel) panel.classList.toggle('active', i === houseNum);
  }
}

// Charger les livrables de l'équipe
async function loadDeliverablesForTeam(teamId) {
  try {
    const res = await fetch(`/api/deliverables?team_id=${teamId}`);
    if (!res.ok) return;

    const dels = await res.json();
    dels.forEach(d => {
      fillHouseForm(d.house_number, d.content || {});
    });
  } catch (e) {
    console.warn('Erreur chargement livrables:', e);
  }
}

function fillHouseForm(houseNum, data) {
  if (houseNum === 1) {
    setVal('h1_targetUser', data.targetUser);
    setVal('h1_problem', data.problem);
    setVal('h1_cause', data.cause);
    setVal('h1_formulation', data.formulation);
  } else if (houseNum === 2) {
    setVal('h2_conceptName', data.conceptName);
    setVal('h2_measures', data.measures);
    setVal('h2_connectivity', data.connectivity);
    setVal('h2_actions', data.actions);
  } else if (houseNum === 3) {
    setVal('h3_sensors', data.sensors);
    setVal('h3_processing', data.processing);
    setVal('h3_protocol', data.protocol);
    setVal('h3_cloudUser', data.cloudUser);
  } else if (houseNum === 4) {
    setVal('h4_prototypeType', data.prototypeType);
    setVal('h4_usageScenario', data.usageScenario);
    setVal('h4_testProtocol', data.testProtocol);
  } else if (houseNum === 5) {
    setVal('bmc_partners', data.bmcPartners);
    setVal('bmc_activities', data.bmcActivities);
    setVal('bmc_value', data.bmcValue);
    setVal('bmc_relations', data.bmcRelations);
    setVal('bmc_segments', data.bmcSegments);
    setVal('bmc_resources', data.bmcResources);
    setVal('bmc_channels', data.bmcChannels);
    setVal('bmc_costs', data.bmcCosts);
    setVal('bmc_revenues', data.bmcRevenues);
  } else if (houseNum === 6) {
    setVal('h6_launchPlan', data.launchPlan);
    setVal('h6_targetMetrics', data.targetMetrics);
    setVal('h6_pitchScript', data.pitchScript);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) {
    el.value = val;
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// Génération automatique de la formule canonique de besoin
function generateCanonicalNeedFormula() {
  const target = getVal('h1_targetUser') || '[utilisateur cible]';
  const problem = getVal('h1_problem') || '[douleur majeure]';
  const cause = getVal('h1_cause') || '[limites des solutions actuelles]';

  const formula = `Pour ${target}, le problème est ${problem} car actuellement ${cause}.`;
  const el = document.getElementById('h1_formulation');
  if (el) el.value = formula;
  showToast('Formule canonique générée !', 'info');
}

// Sauvegarde Brouillon
function saveDraft(houseNum) {
  submitDeliverable(houseNum, false);
}

// Soumission du livrable
async function submitDeliverable(houseNum, advanceNext = true) {
  if (!pState.assignedTeam) {
    showToast('Aucune équipe active.', 'error');
    return;
  }

  let content = {};
  if (houseNum === 1) {
    content = {
      targetUser: getVal('h1_targetUser'),
      problem: getVal('h1_problem'),
      cause: getVal('h1_cause'),
      formulation: getVal('h1_formulation')
    };
  } else if (houseNum === 2) {
    content = {
      conceptName: getVal('h2_conceptName'),
      measures: getVal('h2_measures'),
      connectivity: getVal('h2_connectivity'),
      actions: getVal('h2_actions')
    };
  } else if (houseNum === 3) {
    content = {
      sensors: getVal('h3_sensors'),
      processing: getVal('h3_processing'),
      protocol: getVal('h3_protocol'),
      cloudUser: getVal('h3_cloudUser')
    };
  } else if (houseNum === 4) {
    content = {
      prototypeType: getVal('h4_prototypeType'),
      usageScenario: getVal('h4_usageScenario'),
      testProtocol: getVal('h4_testProtocol')
    };
  } else if (houseNum === 5) {
    content = {
      bmcPartners: getVal('bmc_partners'),
      bmcActivities: getVal('bmc_activities'),
      bmcValue: getVal('bmc_value'),
      bmcRelations: getVal('bmc_relations'),
      bmcSegments: getVal('bmc_segments'),
      bmcResources: getVal('bmc_resources'),
      bmcChannels: getVal('bmc_channels'),
      bmcCosts: getVal('bmc_costs'),
      bmcRevenues: getVal('bmc_revenues')
    };
  } else if (houseNum === 6) {
    content = {
      launchPlan: getVal('h6_launchPlan'),
      targetMetrics: getVal('h6_targetMetrics'),
      pitchScript: getVal('h6_pitchScript')
    };
  }

  const payload = {
    team_id: pState.assignedTeam.id,
    house_number: houseNum,
    content: content,
    status: advanceNext ? 'validated' : 'draft',
    advance_next: advanceNext,
    submitted_by: pState.currentUser ? pState.currentUser.id : null
  };

  try {
    const res = await fetch('/api/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      if (advanceNext) {
        showToast(`Maison ${houseNum} validée avec succès !`, 'success');
        if (houseNum < 6) {
          switchHouseTab(houseNum + 1);
        } else {
          showToast('🎉 Félicitations ! Les 6 Maisons du Village IoT sont achevées !', 'success');
        }
      } else {
        showToast(`Brouillon de la Maison ${houseNum} sauvegardé.`, 'info');
      }
    } else {
      showToast(data.error || 'Erreur lors de l\'enregistrement', 'error');
    }
  } catch (e) {
    showToast(`Erreur réseau: ${e.message}`, 'error');
  }
}

// Chronomètre Pitch 3 Minutes (Maison 6)
function togglePitchTimer() {
  const btn = document.getElementById('btnStartTimer');
  if (pState.pitchTimer.isRunning) {
    clearInterval(pState.pitchTimer.interval);
    pState.pitchTimer.isRunning = false;
    if (btn) btn.textContent = 'Reprendre';
  } else {
    pState.pitchTimer.isRunning = true;
    if (btn) btn.textContent = 'Pause';

    pState.pitchTimer.interval = setInterval(() => {
      if (pState.pitchTimer.remainingSeconds > 0) {
        pState.pitchTimer.remainingSeconds--;
        updatePitchTimerDisplay();
      } else {
        clearInterval(pState.pitchTimer.interval);
        pState.pitchTimer.isRunning = false;
        if (btn) btn.textContent = 'Terminé !';
        showToast('⏰ Les 3 minutes de pitch sont écoulées !', 'warning');
      }
    }, 1000);
  }
}

function resetPitchTimer() {
  clearInterval(pState.pitchTimer.interval);
  pState.pitchTimer.isRunning = false;
  pState.pitchTimer.remainingSeconds = pState.pitchTimer.totalSeconds;
  updatePitchTimerDisplay();

  const btn = document.getElementById('btnStartTimer');
  if (btn) btn.textContent = 'Démarrer';
}

function updatePitchTimerDisplay() {
  const mins = String(Math.floor(pState.pitchTimer.remainingSeconds / 60)).padStart(2, '0');
  const secs = String(pState.pitchTimer.remainingSeconds % 60).padStart(2, '0');
  const display = document.getElementById('pitchTimerDisplay');
  if (display) {
    display.textContent = `${mins}:${secs}`;
    display.style.color = pState.pitchTimer.remainingSeconds <= 30 ? '#ef4444' : '#38bdf8';
  }
}

// Toast utilitaire
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
