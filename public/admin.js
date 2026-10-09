/**
 * LE VILLAGE IoT DES SCHTROUMPFS - PUPITRE ANIMATEUR & GRAND ÉCRAN
 * Console de pilotage : Lancement Groupes, Carte 3D Village, Suivi 6 Maisons, Restitution
 */

// État du pupitre animateur
const adminState = {
  currentView: 'view-projection',
  participants: [],
  teams: [],
  deliverables: [],
  sessionPhase: 'registration',
  stagesSelectedTeamId: 'all',
  restitutionFilterTeamId: 'all',
  activeTeamIdForScribe: null,
  isUnlocked: true,
  qrCodeData: null,
  pitchTimer: {
    interval: null,
    totalSeconds: 180,
    remainingSeconds: 180,
    isRunning: false
  }
};

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
    powers: ['Design d\'interface & ergonomie visuelle', 'Storytelling et projection visuelle', 'Création de scénarios d\'usage immersifs']
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  checkDatabaseHealth();
  refreshAdminData();
  setupQrCode();

  // Polling automatique toutes les 2.5 secondes
  setInterval(() => {
    refreshAdminData(false);
  }, 2500);
});

// ====================================================================
// GESTION DE LA NAVIGATION INTERNE DU PUPITRE
// ====================================================================
function switchAdminView(viewId) {
  adminState.currentView = viewId;

  // Mise à jour visuelle des onglets
  document.querySelectorAll('#adminNavTabs .nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });

  // Mise à jour des panneaux
  document.querySelectorAll('.main-content .view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === viewId);
  });

  // Rafraîchir la vue spécifique
  if (viewId === 'view-projection') {
    renderProjectionView();
  } else if (viewId === 'view-launch') {
    renderTeamsLaunchView();
    renderAdminPrelaunchGrid();
  } else if (viewId === 'view-dashboard') {
    renderVillageMap();
  } else if (viewId === 'view-stages') {
    renderStagesView();
  } else if (viewId === 'view-restitution') {
    renderRestitutionView();
  }
}

// ====================================================================
// VUE 1 : ACCUEIL / PROJECTION GRAND ÉCRAN (QR CODE HD & COMPTEUR LIVE)
// ====================================================================
function renderProjectionView() {
  const countEl = document.getElementById('projectionLiveCount');
  const btnCountEl = document.getElementById('projectionBtnCount');
  const ratioEl = document.getElementById('projectionLiveRatio');
  const wallEl = document.getElementById('projectionLiveWall');

  const count = adminState.participants.length;
  if (countEl) countEl.textContent = count;
  if (btnCountEl) btnCountEl.textContent = count;
  if (ratioEl) {
    ratioEl.textContent = count > 0 ? `${count} profil(s) prêt(s)` : 'En attente de scans...';
  }

  if (wallEl) {
    if (count === 0) {
      wallEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: #64748b; font-size: 0.9rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
          Pointez votre smartphone vers le QR Code pour apparaître ici en direct !
        </div>
      `;
    } else {
      wallEl.innerHTML = adminState.participants.slice().reverse().map(p => {
        const arch = ARCHETYPES[p.archetype] || ARCHETYPES.Artiste;
        return `
          <div class="projection-participant-chip" style="border-left: 3px solid ${arch.color};">
            <img src="${arch.avatar}" alt="${p.first_name}" class="projection-participant-avatar" style="border: 1px solid ${arch.color};">
            <div class="projection-participant-meta">
              <div class="projection-participant-name">${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</div>
              <div class="projection-participant-arch" style="color: ${arch.color};">${arch.displayName}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (adminState.qrCodeData) {
    applyQrCodeToView(adminState.qrCodeData);
  }
}

function applyQrCodeToView(data) {
  const qrImg = document.getElementById('projectionQrImg');
  const qrCanvas = document.getElementById('projectionQrCanvas');
  const ipInfo = document.getElementById('projectionIpInfo');
  const directUrlText = document.getElementById('projectionDirectUrlText');

  const imgUrl = data.dataUrl || data.qrDataUrl;
  const targetUrl = data.url || data.targetUrl;

  if (qrImg && imgUrl) {
    qrImg.src = imgUrl;
    qrImg.style.display = 'block';
    if (qrCanvas) qrCanvas.style.display = 'none';
  }

  if (ipInfo && data.localIp) {
    ipInfo.textContent = `🌐 Wi-Fi Local : http://${data.localIp}:${data.port || 3000}`;
  }

  if (directUrlText && targetUrl) {
    directUrlText.textContent = targetUrl;
  }
}

// ====================================================================
// RAFRAÎCHISSEMENT ET RÉCUPÉRATION DES DONNÉES EN DIRECT
// ====================================================================
async function refreshAdminData(notifyErrors = true) {
  try {
    const [resSession, resTeams, resParticipants, resDeliverables] = await Promise.all([
      fetch('/api/session'),
      fetch('/api/teams'),
      fetch('/api/participants'),
      fetch('/api/deliverables')
    ]);

    if (resSession.ok) {
      const sessData = await resSession.json();
      adminState.sessionPhase = sessData.phase || 'registration';
    }
    if (resTeams.ok) adminState.teams = await resTeams.json();
    if (resParticipants.ok) adminState.participants = await resParticipants.json();
    let dels = [];
    if (resDeliverables.ok) dels = await resDeliverables.json();
    adminState.deliverables = dels;

    // Associer les livrables à chaque équipe
    adminState.teams.forEach(t => {
      t.deliverables = dels.filter(d => d.team_id === t.id);
    });

    // Mettre à jour les statistiques globales
    updateGlobalCounters();

    // Vérifier les retardataires (participants sans équipe après lancement)
    updateLatecomersStatus();

    // Re-rendre la vue active
    if (adminState.currentView === 'view-projection') {
      renderProjectionView();
    } else if (adminState.currentView === 'view-launch') {
      renderTeamsLaunchView();
      renderAdminPrelaunchGrid();
    } else if (adminState.currentView === 'view-dashboard') {
      renderVillageMap();
    } else if (adminState.currentView === 'view-stages') {
      renderStagesView();
    } else if (adminState.currentView === 'view-restitution') {
      renderRestitutionView();
    }
  } catch (err) {
    if (notifyErrors) {
      console.warn('Erreur rafraîchissement admin:', err.message);
    }
  }
}

function updateGlobalCounters() {
  const pCount = adminState.participants.length;
  const tCount = adminState.teams.length;
  const dCount = adminState.deliverables.length;

  const elLP = document.getElementById('launchParticipantsCount');
  const elLT = document.getElementById('launchTeamsCount');
  const elReady = document.getElementById('adminReadyCount');
  const elBtnL = document.getElementById('btnLaunchCount');
  const elPhase = document.getElementById('launchPhaseBadge');

  if (elLP) elLP.textContent = pCount;
  if (elLT) elLT.textContent = tCount;
  if (elReady) elReady.textContent = pCount;
  if (elBtnL) elBtnL.textContent = pCount;
  if (elPhase) elPhase.textContent = tCount > 0 ? 'Phase : Groupes Actifs' : 'Phase : Inscription';

  const elSP = document.getElementById('statParticipantsCount');
  const elST = document.getElementById('statTeamsCount');
  const elSD = document.getElementById('statDeliverablesCount');

  if (elSP) elSP.textContent = pCount;
  if (elST) elST.textContent = tCount;
  if (elSD) elSD.textContent = dCount;
}

function updateLatecomersStatus() {
  const btnUnassigned = document.getElementById('btnAutoAssignUnassigned');
  const badgeUnassigned = document.getElementById('unassignedCountBadge');
  if (!btnUnassigned || !badgeUnassigned) return;

  if (adminState.teams.length > 0) {
    const unassigned = adminState.participants.filter(p => !p.team_id);
    if (unassigned.length > 0) {
      btnUnassigned.style.display = 'inline-flex';
      badgeUnassigned.textContent = unassigned.length;
    } else {
      btnUnassigned.style.display = 'none';
    }
  } else {
    btnUnassigned.style.display = 'none';
  }
}

// ====================================================================
// VUE 1 : LANCEMENT & CONSTITUTION DES GROUPES
// ====================================================================
function renderTeamsLaunchView() {
  // 1. Rendu des puces de répartition des 5 familles Schtroumpfs
  const chipsRow = document.getElementById('launchArchetypeChipsRow');
  if (chipsRow) {
    const counts = { Artiste: 0, Professeur: 0, Critique: 0, Empathique: 0, Sportif: 0 };
    adminState.participants.forEach(p => {
      if (counts[p.archetype] !== undefined) counts[p.archetype]++;
    });

    chipsRow.innerHTML = Object.keys(ARCHETYPES).map(key => {
      const arch = ARCHETYPES[key];
      const count = counts[key] || 0;
      return `
        <div class="mini-archetype-chip" style="border: 1px solid ${arch.color}40; background: ${arch.color}10;">
          <img src="${arch.avatar}" alt="${arch.displayName}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;">
          <strong style="color: ${arch.color};">${arch.displayName} :</strong>
          <span style="font-weight: 800; font-size: 0.95rem; color: #fff;">${count}</span>
        </div>
      `;
    }).join('');
  }

  // 2. Rendu des équipes formées
  const teamsGrid = document.getElementById('launchTeamsGrid');
  const formedWrapper = document.getElementById('formedTeamsWrapper');
  if (!teamsGrid || !formedWrapper) return;

  if (adminState.teams.length === 0) {
    formedWrapper.style.display = 'none';
    return;
  }

  formedWrapper.style.display = 'block';
  teamsGrid.innerHTML = '';

  adminState.teams.forEach(team => {
    const arch = ARCHETYPES[team.archetype] || ARCHETYPES.Artiste;
    const members = team.members || [];
    const scribe = team.scribe || members[0] || null;

    const card = document.createElement('div');
    card.className = 'dashboard-team-card';
    card.style.borderTop = `4px solid ${team.color || arch.color}`;

    let membersListHtml = members.map(m => {
      const isScribe = scribe && m.id === scribe.id;
      return `
        <div class="team-member-chip ${isScribe ? 'is-scribe' : ''}">
          <span class="member-chip-role">${isScribe ? '✍️ Porteur de stylo' : '🤝 Conseiller'}</span>
          <span class="member-chip-name">${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</span>
          <span class="member-chip-arch" style="color: ${ARCHETYPES[m.archetype]?.color || '#38bdf8'}">${getArchetypeDisplayName(m.archetype)}</span>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="team-card-header">
        <img src="assets/images/${team.avatar || arch.avatar}" alt="${team.name}" class="team-card-avatar" style="border: 2px solid ${team.color};">
        <div class="team-card-title-wrap">
          <h4 class="team-card-title">${escapeHtml(team.name)}</h4>
          <span class="team-card-badge" style="background: ${team.color}25; color: ${team.color}; border: 1px solid ${team.color}50;">
            ${getArchetypeDisplayName(team.archetype)} • Maison ${team.current_house}/6
          </span>
        </div>
      </div>

      <div class="team-card-body">
        <div class="team-scribe-row" style="margin-bottom: 0.75rem; padding: 0.6rem; background: rgba(56, 189, 248, 0.08); border-radius: 8px; border: 1px dashed rgba(56, 189, 248, 0.3);">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #38bdf8; font-weight: 700;">✍️ Rédacteur Unique Officiel :</div>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-top: 2px;">
            ${scribe ? `${escapeHtml(scribe.first_name)} ${escapeHtml(scribe.last_name)}` : '<em>Non désigné</em>'}
          </div>
          <button type="button" class="btn btn-outline btn-xs mt-2" onclick="openChangeScribeModal('${team.id}')">
            Modifier le rédacteur
          </button>
        </div>

        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 0.4rem;">
          Membres du groupe (${members.length}) :
        </div>
        <div class="team-members-chips-grid">
          ${membersListHtml || '<div style="color: #64748b; font-size: 0.85rem;">Aucun membre affecté</div>'}
        </div>
      </div>
    `;

    teamsGrid.appendChild(card);
  });
}

function renderAdminPrelaunchGrid() {
  const grid = document.getElementById('adminParticipantsGrid');
  if (!grid) return;

  if (adminState.participants.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: #94a3b8; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed var(--border-glass);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📱</div>
        <h4 style="color: #fff; margin-bottom: 0.25rem;">En attente de participants...</h4>
        <p style="margin: 0; font-size: 0.9rem;">Invitez les participants à scanner le QR Code ci-dessus pour passer le test.</p>
        <button class="btn btn-secondary btn-sm mt-3" onclick="openQrModal()">📱 Afficher le QR Code Grand Écran</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';

  adminState.participants.forEach(p => {
    const arch = ARCHETYPES[p.archetype] || ARCHETYPES.Artiste;
    const scores = p.archetype_scores || p.scores || {};
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const card = document.createElement('div');
    card.className = 'admin-participant-3d-card';
    card.style.borderColor = `${arch.color}50`;

    // Barres de score miniatures
    let scoreBarsHtml = Object.keys(ARCHETYPES).map(key => {
      const sVal = scores[key] || 0;
      const sPct = totalScore > 0 ? Math.round((sVal / totalScore) * 100) : 20;
      const aMeta = ARCHETYPES[key];
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; margin-bottom: 2px;">
          <span style="color: #cbd5e1;">${aMeta.displayName}</span>
          <span style="font-weight: 700; color: ${aMeta.color};">${sVal}/15 (${sPct}%)</span>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="part-card-head" style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
        <img src="${arch.avatar}" alt="${p.first_name}" class="part-card-3d-img" style="width: 58px; height: 58px; border-radius: 14px; object-fit: cover; border: 2px solid ${arch.color}; box-shadow: 0 4px 15px ${arch.color}40;">
        <div style="flex: 1; min-width: 0;">
          <h4 style="color: #fff; font-size: 1.05rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}
          </h4>
          <span class="part-arch-pill" style="display: inline-block; margin-top: 4px; font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: ${arch.color}20; color: ${arch.color}; border: 1px solid ${arch.color}50; font-weight: 700;">
            ${arch.displayName}
          </span>
        </div>
        <button type="button" class="btn btn-ghost btn-xs" onclick="confirmRemoveParticipant('${p.id}', '${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}')" title="Supprimer ce participant" style="color: #ef4444; padding: 4px 6px;">
          ✕
        </button>
      </div>

      <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px 0; font-style: italic; line-height: 1.3;">
        « ${arch.tagline} »
      </p>

      <div style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: 8px; margin-bottom: 10px;">
        ${scoreBarsHtml}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
        <span style="color: #94a3b8;">Équipe :</span>
        <strong style="color: ${p.team_id ? '#10b981' : '#f59e0b'};">
          ${p.team_id ? `Maison affectée (#${p.team_id})` : 'En attente de répartition'}
        </strong>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Lancement automatique des groupes
async function triggerAutoAssignTeams() {
  if (adminState.participants.length < 2) {
    showToast('Il faut au moins 2 participants enregistrés pour former les groupes !', 'warning');
    return;
  }

  const confirmMsg = adminState.teams.length > 0 
    ? 'Des équipes existent déjà. Voulez-vous recalculer et redistribuer tous les participants dans de nouveaux groupes ?'
    : `Voulez-vous former les groupes optimisés pour les ${adminState.participants.length} participants inscrits ?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/teams/auto-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Groupes créés avec succès ! (${data.teams?.length || 0} équipes constituées)`, 'success');
      await refreshAdminData();
    } else {
      showToast(data.error || 'Erreur lors de la constitution des groupes', 'error');
    }
  } catch (err) {
    showToast(`Erreur réseau: ${err.message}`, 'error');
  }
}

// Rattacher les retardataires en cours de workshop
async function triggerAutoAssignUnassigned() {
  try {
    const res = await fetch('/api/teams/auto-assign-unassigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Retardataires rattachés avec succès !', 'success');
      await refreshAdminData();
    } else {
      showToast(data.error || 'Erreur lors du rattachement des retardataires', 'error');
    }
  } catch (err) {
    showToast(`Erreur réseau: ${err.message}`, 'error');
  }
}

// Suppression d'un participant
async function confirmRemoveParticipant(id, name) {
  if (!confirm(`Supprimer le participant « ${name} » du workshop ?`)) return;

  try {
    const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`Participant ${name} retiré.`, 'info');
      await refreshAdminData();
    } else {
      showToast('Erreur lors de la suppression.', 'error');
    }
  } catch (err) {
    showToast(`Erreur: ${err.message}`, 'error');
  }
}

// Désignation / Changement du rédacteur unique
function openChangeScribeModal(teamId) {
  adminState.activeTeamIdForScribe = teamId;
  const team = adminState.teams.find(t => t.id === teamId);
  if (!team) return;

  const select = document.getElementById('selectNewScribe');
  if (!select) return;

  select.innerHTML = '';
  const currentScribeId = team.scribe ? team.scribe.id : (team.scribe_id || null);

  (team.members || []).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.first_name} ${m.last_name} (${getArchetypeDisplayName(m.archetype)})`;
    if (m.id === currentScribeId) opt.selected = true;
    select.appendChild(opt);
  });

  const modal = document.getElementById('modalChangeScribe');
  if (modal) modal.classList.add('active');
}

async function confirmChangeScribe() {
  const teamId = adminState.activeTeamIdForScribe;
  const select = document.getElementById('selectNewScribe');
  if (!teamId || !select) return;

  const newScribeId = select.value;
  try {
    const res = await fetch(`/api/teams/${teamId}/scribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: newScribeId, scribe_id: newScribeId })
    });
    if (res.ok) {
      showToast('Rédacteur unique mis à jour avec succès !', 'success');
      closeModal('modalChangeScribe');
      await refreshAdminData();
    } else {
      showToast('Erreur lors du changement de rédacteur', 'error');
    }
  } catch (err) {
    showToast(`Erreur: ${err.message}`, 'error');
  }
}

// ====================================================================
// VUE 2 : CARTE 3D DU VILLAGE IoT (GRAND ÉCRAN)
// ====================================================================
function renderVillageMap() {
  for (let i = 1; i <= 6; i++) {
    const dock = document.getElementById(`dock-house-${i}`);
    if (dock) dock.innerHTML = '';
  }

  adminState.teams.forEach(team => {
    const houseNum = team.current_house || 1;
    const dock = document.getElementById(`dock-house-${houseNum}`);
    if (dock) {
      const arch = ARCHETYPES[team.archetype] || ARCHETYPES.Artiste;
      const token = document.createElement('div');
      token.className = 'team-avatar-token';
      token.title = `${team.name} (${getArchetypeDisplayName(team.archetype)}) - Progression : ${team.progress_percent}%`;
      token.style.borderColor = team.color || arch.color;
      token.onclick = (e) => {
        e.stopPropagation();
        openHouseDetailsModal(houseNum);
      };

      token.innerHTML = `<img src="assets/images/${team.avatar || arch.avatar}" alt="${team.name}" class="token-img">`;
      dock.appendChild(token);
    }
  });
}

function openHouseDetailsModal(houseNum) {
  const houseNames = {
    1: 'Maison 1 : Définition du Besoin Utilisateur (16%)',
    2: 'Maison 2 : Le Concept Produit IoT (33%)',
    3: 'Maison 3 : Faisabilité & Architecture IoT (50%)',
    4: 'Maison 4 : Maquette & Prototypage Rapide (66%)',
    5: 'Maison 5 : Business Model Canvas (83%)',
    6: 'Maison 6 : Mini-Plan de Marché & Pitch Final (100%)'
  };

  const modalTitle = document.getElementById('modalHouseTitle');
  const modalBody = document.getElementById('modalHouseBody');
  if (modalTitle) modalTitle.textContent = houseNames[houseNum] || `Maison ${houseNum}`;
  if (!modalBody) return;

  const delsForHouse = adminState.deliverables.filter(d => d.house_number === houseNum);

  if (delsForHouse.length === 0) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: #94a3b8;">
        <span style="font-size: 2.5rem;">🛖</span>
        <h4 style="color: #fff; margin: 0.5rem 0;">Aucun livrable validé pour cette maison</h4>
        <p style="margin: 0; font-size: 0.85rem;">Les équipes sont en cours d'exploration ou n'ont pas encore atteint ce jalon.</p>
      </div>
    `;
  } else {
    modalBody.innerHTML = delsForHouse.map(d => {
      const team = adminState.teams.find(t => t.id === d.team_id) || { name: `Équipe #${d.team_id}`, color: '#38bdf8' };
      const content = d.content || {};
      return `
        <div style="margin-bottom: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 10px; border-left: 4px solid ${team.color};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: #fff; font-size: 1rem;">${escapeHtml(team.name)}</strong>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 700;">✓ Validé</span>
          </div>
          <pre style="background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; color: #cbd5e1; white-space: pre-wrap; font-family: inherit;">${escapeHtml(JSON.stringify(content, null, 2))}</pre>
        </div>
      `;
    }).join('');
  }

  const modal = document.getElementById('modalHouseDetails');
  if (modal) modal.classList.add('active');
}

// ====================================================================
// VUE 3 : SUIVI DÉTAILLÉ DES 6 MAISONS
// ====================================================================
function setStagesFilter(teamId) {
  adminState.stagesSelectedTeamId = teamId;
  renderStagesView();
}

function renderStagesView() {
  const container = document.getElementById('stagesTeamsList');
  const filterRow = document.getElementById('stagesFilterRow');
  if (!container) return;

  const teams = adminState.teams || [];
  const currentFilter = adminState.stagesSelectedTeamId || 'all';

  if (filterRow) {
    let filterHtml = `
      <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" onclick="setStagesFilter('all')">
        Tous les Groupes (${teams.length})
      </button>
    `;
    teams.forEach(t => {
      filterHtml += `
        <button class="filter-pill ${currentFilter === String(t.id) ? 'active' : ''}" onclick="setStagesFilter('${t.id}')" style="border-left: 3px solid ${t.color};">
          ${escapeHtml(t.name)} (Maison ${t.current_house}/6)
        </button>
      `;
    });
    filterRow.innerHTML = filterHtml;
  }

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--border-glass);">
        <h4 style="color: #fff;">Aucune équipe formée pour l'instant</h4>
        <p style="margin: 0; font-size: 0.9rem;">Formez d'abord les équipes dans l'onglet « 1. Lancement Groupes ».</p>
      </div>
    `;
    return;
  }

  const filteredTeams = currentFilter === 'all' ? teams : teams.filter(t => String(t.id) === String(currentFilter));

  container.innerHTML = filteredTeams.map(t => {
    const arch = ARCHETYPES[t.archetype] || ARCHETYPES.Artiste;
    const dels = t.deliverables || [];
    const scribe = t.scribe || (t.members ? t.members[0] : null);

    let housesHtml = [1, 2, 3, 4, 5, 6].map(hNum => {
      const d = dels.find(item => item.house_number === hNum);
      const isCompleted = d && d.status === 'validated';
      const isCurrent = t.current_house === hNum;

      const titles = {
        1: 'Maison 1 : Besoin (16%)',
        2: 'Maison 2 : Idée IoT (33%)',
        3: 'Maison 3 : Faisabilité (50%)',
        4: 'Maison 4 : Prototype (66%)',
        5: 'Maison 5 : Business Model (83%)',
        6: 'Maison 6 : Marché & Pitch (100%)'
      };

      return `
        <div style="padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; background: ${isCompleted ? 'rgba(16, 185, 129, 0.08)' : isCurrent ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : isCurrent ? 'rgba(56, 189, 248, 0.3)' : 'var(--border-glass)'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #fff; font-size: 0.9rem;">${titles[hNum]}</strong>
            <span style="font-size: 0.75rem; font-weight: 700; color: ${isCompleted ? '#10b981' : isCurrent ? '#38bdf8' : '#64748b'};">
              ${isCompleted ? '✓ Livrable validé' : isCurrent ? '⚡ En cours de travail' : 'En attente'}
            </span>
          </div>
          ${d && d.content ? `
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #cbd5e1;">
              ${d.content.formulation ? `<div style="font-style: italic;">« ${escapeHtml(d.content.formulation)} »</div>` : ''}
              ${d.content.conceptName ? `<div><strong>Concept :</strong> ${escapeHtml(d.content.conceptName)}</div>` : ''}
              ${d.content.pitchScript ? `<div><strong>Extrait pitch :</strong> ${escapeHtml(d.content.pitchScript.slice(0, 140))}...</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.5rem; border-top: 4px solid ${t.color || arch.color};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="assets/images/${t.avatar || arch.avatar}" alt="${t.name}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 2px solid ${t.color};">
            <div>
              <h3 style="color: #fff; margin: 0; font-size: 1.15rem;">${escapeHtml(t.name)}</h3>
              <span style="font-size: 0.78rem; color: ${t.color};">${arch.displayName} • Rédacteur : ${scribe ? `${escapeHtml(scribe.first_name)} ${escapeHtml(scribe.last_name)}` : 'Non désigné'}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${t.progress_percent || 0}%</div>
            <span style="font-size: 0.75rem; color: #94a3b8;">Progression globale</span>
          </div>
        </div>

        <div>
          ${housesHtml}
        </div>
      </div>
    `;
  }).join('');
}

// ====================================================================
// VUE 4 : RESTITUTION FINALE & SOUTENANCE
// ====================================================================
function filterRestitutionTeam(teamId) {
  adminState.restitutionFilterTeamId = teamId;
  renderRestitutionView();
}

function renderRestitutionView() {
  const filterRow = document.getElementById('restitutionFilterRow');
  const stack = document.getElementById('restitutionCardsStack');
  if (!stack) return;

  const teams = adminState.teams || [];
  const currentFilter = adminState.restitutionFilterTeamId || 'all';

  if (filterRow) {
    let filterHtml = `
      <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" onclick="filterRestitutionTeam('all')">
        Tous les Groupes (${teams.length})
      </button>
    `;
    teams.forEach(t => {
      filterHtml += `
        <button class="filter-pill ${currentFilter === String(t.id) ? 'active' : ''}" onclick="filterRestitutionTeam('${t.id}')">
          ${escapeHtml(t.name)}
        </button>
      `;
    });
    filterRow.innerHTML = filterHtml;
  }

  if (teams.length === 0) {
    stack.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; color: #94a3b8;">
        <h4>Aucune équipe enregistrée pour la restitution.</h4>
      </div>
    `;
    return;
  }

  const filteredTeams = currentFilter === 'all' ? teams : teams.filter(t => String(t.id) === String(currentFilter));

  stack.innerHTML = filteredTeams.map(t => {
    const dels = t.deliverables || [];
    const d1 = dels.find(d => d.house_number === 1)?.content || {};
    const d2 = dels.find(d => d.house_number === 2)?.content || {};
    const d3 = dels.find(d => d.house_number === 3)?.content || {};
    const d4 = dels.find(d => d.house_number === 4)?.content || {};
    const d5 = dels.find(d => d.house_number === 5)?.content || {};
    const d6 = dels.find(d => d.house_number === 6)?.content || {};

    return `
      <article class="restitution-sheet-card" style="margin-bottom: 2rem; background: rgba(15,23,42,0.85); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h3 style="color: #fff; font-size: 1.35rem; margin: 0;">${escapeHtml(t.name)}</h3>
            <p style="color: ${t.color}; margin: 0.25rem 0 0; font-size: 0.85rem;">Archétype : ${getArchetypeDisplayName(t.archetype)}</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.25rem; font-weight: 800; color: #10b981;">${t.progress_percent || 0}% complété</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <div class="restitution-block">
            <strong>Maison 1 : Besoin</strong>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Cible :</strong> ${escapeHtml(d1.targetUser || 'Non renseigné')}</p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Formule :</strong> <em>${escapeHtml(d1.formulation || 'Non renseigné')}</em></p>
          </div>
          <div class="restitution-block">
            <strong>Maison 2 : Concept IoT</strong>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Produit :</strong> ${escapeHtml(d2.conceptName || 'Non renseigné')}</p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Mesures :</strong> ${escapeHtml(d2.measures || 'Non renseigné')}</p>
          </div>
          <div class="restitution-block">
            <strong>Maison 3 : Faisabilité</strong>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Capteurs :</strong> ${escapeHtml(d3.sensors || 'Non renseigné')}</p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Protocole :</strong> ${escapeHtml(d3.protocol || 'Non renseigné')}</p>
          </div>
          <div class="restitution-block">
            <strong>Maison 4 : Prototype</strong>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Maquette :</strong> ${escapeHtml(d4.prototypeType || 'Non renseigné')}</p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #cbd5e1;"><strong>Scénario :</strong> ${escapeHtml(d4.usageScenario || 'Non renseigné')}</p>
          </div>
          <div class="restitution-block" style="grid-column: 1 / -1;">
            <strong>Maison 5 : Business Model Canvas</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-top: 6px; font-size: 0.8rem;">
              <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;"><strong>Valeur :</strong> ${escapeHtml(d5.bmcValue || '-')}</div>
              <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;"><strong>Segments :</strong> ${escapeHtml(d5.bmcSegments || '-')}</div>
              <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;"><strong>Revenus :</strong> ${escapeHtml(d5.bmcRevenues || '-')}</div>
              <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;"><strong>Coûts :</strong> ${escapeHtml(d5.bmcCosts || '-')}</div>
            </div>
          </div>
          <div class="restitution-block" style="grid-column: 1 / -1; background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px;">
            <strong style="color: #38bdf8;">🎤 Maison 6 : Script du Pitch 3 Minutes (180s)</strong>
            <p style="margin-top: 8px; font-size: 0.9rem; color: #f8fafc; font-style: italic; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(d6.pitchScript || 'Aucun script de pitch rédigé pour le moment.')}</p>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Export en PDF
function exportPdfReport() {
  const teamsToExport = adminState.teams || [];
  if (teamsToExport.length === 0) {
    showToast('⚠️ Aucun livrable disponible pour générer le PDF.', 'error');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    showToast('⚠️ Veuillez autoriser les pop-ups pour exporter le PDF.', 'error');
    return;
  }

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Restitution Projets IoT - Le Village des Schtroumpfs</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 20px;
      line-height: 1.5;
    }
    .header-box {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title h1 {
      font-size: 22px;
      color: #0369a1;
      margin-bottom: 4px;
    }
    .header-title p {
      font-size: 12px;
      color: #64748b;
    }
    .header-date {
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    .team-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      margin-bottom: 24px;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .team-header {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .team-name {
      font-size: 16px;
      font-weight: bold;
      color: #0369a1;
    }
    .team-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      background: #0284c7;
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
    }
    .team-meta {
      padding: 10px 16px;
      background: #f8fafc;
      font-size: 11px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .houses-grid {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .house-row {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .house-tag {
      font-size: 12px;
      font-weight: bold;
      color: #0284c7;
      margin-bottom: 6px;
    }
    .house-content-p {
      font-size: 12px;
      color: #334155;
      margin-bottom: 4px;
    }
    .pitch-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #eab308;
      padding: 8px 12px;
      border-radius: 4px;
      font-style: italic;
      color: #713f12;
      font-size: 12px;
      margin-top: 6px;
    }
    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .no-print-bar {
      margin-bottom: 20px;
      padding: 12px;
      background: #0284c7;
      color: white;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #ffffff;
      color: #0284c7;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>📄 Aperçu prêt pour l'exportation PDF</span>
    <button class="btn-print" onclick="window.print()">🖨️ Enregistrer en PDF</button>
  </div>
  <div class="header-box">
    <div class="header-title">
      <h1>Le Village IoT des Schtroumpfs</h1>
      <p>Compte Rendu & Restitution Officielle des Livrables</p>
    </div>
    <div class="header-date">
      Exporté le ${dateStr}
    </div>
  </div>
`;

  teamsToExport.forEach((t, idx) => {
    const dels = t.deliverables || [];
    const d1 = dels.find(d => d.house_number === 1)?.content || {};
    const d2 = dels.find(d => d.house_number === 2)?.content || {};
    const d3 = dels.find(d => d.house_number === 3)?.content || {};
    const d4 = dels.find(d => d.house_number === 4)?.content || {};
    const d5 = dels.find(d => d.house_number === 5)?.content || {};
    const d6 = dels.find(d => d.house_number === 6)?.content || {};

    const scribeMember =
      (t.members || []).find(m => m.id === t.scribe_participant_id || m.is_scribe) || t.scribe;
    const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

    html += `
  <div class="team-card">
    <div class="team-header">
      <span class="team-name">Groupe ${idx + 1} : ${t.name}</span>
      <span class="team-badge">${getArchetypeDisplayName(t.archetype)}</span>
    </div>
    <div class="team-meta">
      <div><strong>Progression :</strong> Maison ${t.current_house}/6 (${t.progress_percent}%)</div>
      <div><strong>Rédacteur (Scribe) :</strong> ${scribeName}</div>
      <div><strong>Membres :</strong> ${(t.members || []).map(m => m.first_name + ' ' + m.last_name).join(', ') || 'Aucun'}</div>
    </div>
    <div class="houses-grid">
      <div class="house-row">
        <div class="house-tag">🛖 Maison 1 — Besoin & Problématique</div>
        <div class="house-content-p"><strong>Utilisateur Cible :</strong> ${d1.targetUser || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Problème :</strong> ${d1.problem || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Formulation Canonique :</strong> ${d1.formulation || 'Non formulé'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 2 — Idée & Dispositif IoT</div>
        <div class="house-content-p"><strong>Nom du Produit :</strong> ${d2.conceptName || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Mesures (Capteurs) :</strong> ${d2.measures || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Connectivité :</strong> ${d2.connectivity || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 3 — Faisabilité & Architecture</div>
        <div class="house-content-p"><strong>Capteurs :</strong> ${d3.sensors || 'Non spécifié'} | <strong>Microcontrôleur :</strong> ${d3.processing || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Protocole :</strong> ${d3.protocol || 'Non spécifié'} | <strong>Cloud & Dashboard :</strong> ${d3.cloudUser || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 4 — Prototype & Algorithme</div>
        <div class="house-content-p"><strong>Type de Prototype :</strong> ${d4.prototypeType || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Scénario :</strong> ${d4.usageScenario || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 5 — Business Model Canvas</div>
        <div class="house-content-p"><strong>Proposition de Valeur :</strong> ${d5.bmcValue || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Clients :</strong> ${d5.bmcSegments || 'Non spécifié'} | <strong>Revenus :</strong> ${d5.bmcRevenues || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 6 — Marché & Pitch Final</div>
        <div class="house-content-p"><strong>Plan de Lancement :</strong> ${d6.launchPlan || 'Non spécifié'}</div>
        ${d6.pitchScript ? `<div class="pitch-box"><strong>Script du Pitch :</strong> "${d6.pitchScript}"</div>` : ''}
      </div>
    </div>
  </div>`;
  });

  html += `
  <div class="footer-note">
    Document généré automatiquement par la plateforme Workshop IoT • Le Village des Schtroumpfs
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  showToast('📑 Préparation du document PDF en cours...', 'success');
}

const exportMarkdownReport = exportPdfReport;

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
// ACTIONS GLOBALES (DÉMO, RESET, QR CODE, BASE DE DONNÉES)
// ====================================================================
async function loadDemoData() {
  if (!confirm('Charger les données de démonstration ? (15 participants, 5 équipes réparties, livrables remplis)')) return;

  try {
    const res = await fetch('/api/demo/seed', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Données de démo injectées avec succès !', 'success');
      await refreshAdminData();
    } else {
      showToast(data.error || 'Erreur lors du chargement des données démo', 'error');
    }
  } catch (err) {
    showToast(`Erreur: ${err.message}`, 'error');
  }
}

async function confirmResetWorkshop() {
  if (!confirm('ATTENTION : Voulez-vous vraiment réinitialiser tout le workshop ? Tous les participants, équipes et livrables seront effacés.')) return;

  try {
    const res = await fetch('/api/workshop/reset', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Workshop réinitialisé à zéro.', 'info');
      await refreshAdminData();
    } else {
      showToast(data.error || 'Erreur lors de la réinitialisation', 'error');
    }
  } catch (err) {
    showToast(`Erreur: ${err.message}`, 'error');
  }
}

// Configuration du QR Code officiel avec résolution Wi-Fi automatique
async function setupQrCode() {
  try {
    const res = await fetch('/api/qrcode');
    if (res.ok) {
      const data = await res.json();
      adminState.qrCodeData = data;
      const modalImg = document.getElementById('qrCodeModalImg');
      const directUrlInput = document.getElementById('qrDirectUrl');
      const ipInfo = document.getElementById('qrModalIpInfo');

      const imgUrl = data.dataUrl || data.qrDataUrl;
      const targetUrl = data.url || data.targetUrl;

      if (modalImg && imgUrl) {
        modalImg.src = imgUrl;
        modalImg.style.display = 'block';
        const canvas = document.getElementById('qrCodeCanvas');
        if (canvas) canvas.style.display = 'none';
      }

      if (directUrlInput && targetUrl) {
        directUrlInput.value = targetUrl;
      }

      if (ipInfo && data.localIp) {
        ipInfo.textContent = `🌐 Réseau Wi-Fi : http://${data.localIp}:${data.port || 3000}`;
      }

      applyQrCodeToView(data);
    }
  } catch (e) {
    console.warn('QR Code setup error:', e);
  }
}

function openQrModal() {
  setupQrCode();
  const modal = document.getElementById('modalQrCode');
  if (modal) {
    modal.classList.add('active');
  } else {
    switchAdminView('view-projection');
  }
}

function copyWorkshopUrl() {
  const input = document.getElementById('qrDirectUrl');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Lien copié dans le presse-papier !', 'success');
    }).catch(() => {
      showToast('Lien sélectionné, faites Ctrl+C', 'info');
    });
  }
}

// État de santé MySQL
async function checkDatabaseHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      const dot = document.querySelector('#dbStatusPill .status-dot');
      const text = document.getElementById('dbStatusText');
      if (dot && text) {
        const isMysqlOk = Boolean(data.database && (data.database.isMySQL || data.database.mode === 'mysql'));
        if (isMysqlOk) {
          dot.style.background = '#10b981';
          text.textContent = 'MySQL Connecté';
        } else {
          dot.style.background = '#38bdf8';
          text.textContent = 'Mode Autonome Actif';
        }
      }
    }
  } catch (err) {
    const dot = document.querySelector('#dbStatusPill .status-dot');
    const text = document.getElementById('dbStatusText');
    if (dot) dot.style.background = '#ef4444';
    if (text) text.textContent = 'Serveur Hors Ligne';
  }
}

function openDbStatusModal() {
  fetch('/api/health').then(r => r.json()).then(data => {
    const el = document.getElementById('modalDbDetails');
    if (el) {
      el.innerHTML = `
        <div style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6;">
          <p><strong>Serveur :</strong> En ligne (${data.network?.localIp || 'localhost'}:${data.network?.port || 3000})</p>
          <p><strong>Mode Base de données :</strong> <span style="color: #38bdf8; font-weight: 700;">${data.database?.mode === 'mysql' ? 'MySQL Connecté' : 'Mémoire Autonome'}</span></p>
          <p><strong>Archétypes Schtroumpfs :</strong> ${data.archetypes?.join(', ')}</p>
          <p><strong>Lien Mobile :</strong> <a href="${data.network?.joinUrl}" target="_blank" style="color: #38bdf8;">${data.network?.joinUrl}</a></p>
        </div>
      `;
    }
    const modal = document.getElementById('modalDbStatus');
    if (modal) modal.classList.add('active');
  });
}

// Utilitaires Toast & Modales
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

// ====================================================================
// SÉCURITÉ & CODE PIN ANIMATEUR
// ====================================================================
function openAdminAuthModal() {
  const modal = document.getElementById('modalAdminAuth');
  if (modal) modal.classList.add('active');
}

function submitAdminPin() {
  const input = document.getElementById('adminPinInput');
  const errorEl = document.getElementById('adminPinError');
  const pin = input ? input.value.trim() : '';

  if (pin === 'admin' || pin === '1234' || pin === '') {
    adminState.isUnlocked = true;
    sessionStorage.setItem('smurf_admin_auth', 'true');
    closeModal('modalAdminAuth');
    showToast('Pupitre Animateur déverrouillé !', 'success');
  } else {
    if (errorEl) errorEl.style.display = 'block';
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

// ====================================================================
// CHRONOMÈTRE PITCH 3 MINUTES DE L'ANIMATEUR (SOUTENANCE GRAND ÉCRAN)
// ====================================================================
function toggleAdminPitchTimer() {
  const btn = document.getElementById('btnAdminStartTimer');
  if (adminState.pitchTimer.isRunning) {
    clearInterval(adminState.pitchTimer.interval);
    adminState.pitchTimer.isRunning = false;
    if (btn) btn.textContent = 'Reprendre';
  } else {
    adminState.pitchTimer.isRunning = true;
    if (btn) btn.textContent = 'Pause';

    adminState.pitchTimer.interval = setInterval(() => {
      if (adminState.pitchTimer.remainingSeconds > 0) {
        adminState.pitchTimer.remainingSeconds--;
        updateAdminPitchTimerDisplay();
      } else {
        clearInterval(adminState.pitchTimer.interval);
        adminState.pitchTimer.isRunning = false;
        if (btn) btn.textContent = 'Terminé !';
        showToast('⏰ Les 3 minutes de pitch sont écoulées !', 'warning');
      }
    }, 1000);
  }
}

function resetAdminPitchTimer() {
  clearInterval(adminState.pitchTimer.interval);
  adminState.pitchTimer.isRunning = false;
  adminState.pitchTimer.remainingSeconds = adminState.pitchTimer.totalSeconds;
  updateAdminPitchTimerDisplay();

  const btn = document.getElementById('btnAdminStartTimer');
  if (btn) btn.textContent = 'Démarrer';
}

function updateAdminPitchTimerDisplay() {
  const mins = String(Math.floor(adminState.pitchTimer.remainingSeconds / 60)).padStart(2, '0');
  const secs = String(adminState.pitchTimer.remainingSeconds % 60).padStart(2, '0');
  const display = document.getElementById('adminPitchTimerDisplay');
  if (display) {
    display.textContent = `${mins}:${secs}`;
    display.style.color = adminState.pitchTimer.remainingSeconds <= 30 ? '#ef4444' : '#38bdf8';
  }
}


