import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { HOUSES_META } from '../constants/workshopData';
import {
  House1Besoin,
  House2Idee,
  House3Technique,
  House4Prototype,
  House5Business,
  House6Pitch
} from '../components/houses';
import { WorkspaceSidebar, WorkspaceRoleBanner } from '../components/workspace';

export default function TeamWorkspacePage() {
  const {
    currentUser,
    isAdmin,
    teams,
    activeTeamId,
    setActiveTeamId,
    openScribeModal,
    refreshWorkshopData,
    showToast
  } = useWorkshop();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected team
  const currentTeam = teams.find((t) => t.id === (activeTeamId || currentUser?.team_id)) || teams[0];

  // Active house stepper (1 to 6)
  const [activeHouse, setActiveHouse] = useState(() => {
    const q = parseInt(searchParams.get('house'), 10);
    return q >= 1 && q <= 6 ? q : 1;
  });
  const prevHouseRef = useRef(currentTeam?.current_house);
  const hasLocalEditsRef = useRef(false);

  // Form fields state for the 6 houses
  const [h1, setH1] = useState({ targetUser: '', problem: '', cause: '', formulation: '' });
  const [h2, setH2] = useState({ conceptName: '', measures: '', connectivity: '', actions: '' });
  const [h3, setH3] = useState({ sensors: '', processing: '', protocol: '', cloudUser: '' });
  const [h4, setH4] = useState({ prototypeType: '', prototypePhoto: '', usageScenario: '', testProtocol: '' });
  const [h5, setH5] = useState({
    bmcPartners: '',
    bmcActivities: '',
    bmcValue: '',
    bmcRelations: '',
    bmcSegments: '',
    bmcResources: '',
    bmcChannels: '',
    bmcCosts: '',
    bmcRevenues: ''
  });
  const [h6, setH6] = useState({ launchPlan: '', targetMetrics: '', pitchScript: '' });

  // Pitch Stopwatch state (Maison 6)
  const [pitchRunning, setPitchRunning] = useState(false);
  const [pitchSeconds, setPitchSeconds] = useState(180); // 3 minutes

  useEffect(() => {
    if (!currentUser && !isAdmin) {
      showToast('Veuillez vous inscrire ou vous connecter en tant qu\'animateur.', 'warning');
      navigate('/register');
    }
  }, [currentUser, isAdmin, navigate, showToast]);

  // Set active team on mount or change
  useEffect(() => {
    if (currentUser?.team_id && !activeTeamId) {
      setActiveTeamId(currentUser.team_id);
    } else if (!activeTeamId && teams.length > 0) {
      setActiveTeamId(teams[0].id);
    }
  }, [currentUser?.team_id, activeTeamId, teams, setActiveTeamId]);

  // Synchronisation en temps réel de l'étape active pour TOUS les membres de l'équipe
  useEffect(() => {
    const qHouse = parseInt(searchParams.get('house'), 10);
    if (qHouse >= 1 && qHouse <= 6) {
      setActiveHouse(qHouse);
      return;
    }
    if (currentTeam?.current_house) {
      if (prevHouseRef.current !== undefined && currentTeam.current_house !== prevHouseRef.current) {
        showToast(
          `🚀 Votre équipe avance vers la Maison ${currentTeam.current_house} : ${HOUSES_META[currentTeam.current_house]?.badge || ''} !`,
          'success'
        );
      }
      prevHouseRef.current = currentTeam.current_house;
      setActiveHouse(currentTeam.current_house);
    }
  }, [currentTeam?.id, currentTeam?.current_house, searchParams, showToast]);

  // Find scribe
  const members = currentTeam?.members || [];
  const scribeMember =
    members.find((m) => m.id === currentTeam?.scribe_participant_id || m.is_scribe) || currentTeam?.scribe;
  const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Désigné par animateur';
  const isScribe = Boolean(
    currentUser && (currentUser.id === currentTeam?.scribe_participant_id || currentUser.is_scribe)
  );
  const canEdit = isAdmin || isScribe;

  // Populate deliverables when team changes or when new deliverable is saved
  useEffect(() => {
    if (!currentTeam || !currentTeam.deliverables) return;
    // Si l'utilisateur est le scribe et a des modifications locales en cours, ne pas écraser
    if (isScribe && !isAdmin && hasLocalEditsRef.current) return;

    currentTeam.deliverables.forEach((del) => {
      const h = del.house_number;
      const c = del.content || {};
      if (h === 1) setH1((prev) => ({ ...prev, ...c }));
      if (h === 2) setH2((prev) => ({ ...prev, ...c }));
      if (h === 3) setH3((prev) => ({ ...prev, ...c }));
      if (h === 4) setH4((prev) => ({ ...prev, ...c }));
      if (h === 5) setH5((prev) => ({ ...prev, ...c }));
      if (h === 6) setH6((prev) => ({ ...prev, ...c }));
    });
  }, [currentTeam, isScribe, isAdmin]);

  // Pitch timer tick with alert
  useEffect(() => {
    let interval = null;
    if (pitchRunning && pitchSeconds > 0) {
      interval = setInterval(() => {
        setPitchSeconds((s) => s - 1);
      }, 1000);
    } else if (pitchSeconds === 0 && pitchRunning) {
      setPitchRunning(false);
      showToast('🔔 3 minutes écoulées ! Fin du pitch.', 'error');
    }
    return () => clearInterval(interval);
  }, [pitchRunning, pitchSeconds, showToast]);

  // Generate canonical formula for Maison 1
  const generateFormula = () => {
    const user = h1.targetUser.trim() || '[Utilisateur]';
    const prob = h1.problem.trim() || '[Problème majeur]';
    const cause = h1.cause.trim() || '[Limite existante]';
    const formula = `« Pour ${user}, le problème majeur est ${prob} car actuellement ${cause}. »`;
    setH1((prev) => ({ ...prev, formulation: formula }));
    hasLocalEditsRef.current = true;
    showToast('Formule canonique générée !', 'success');
  };

  // Helper change handlers
  const updateH1 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH1((prev) => ({ ...prev, [field]: val }));
  };
  const updateH2 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH2((prev) => ({ ...prev, [field]: val }));
  };
  const updateH3 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH3((prev) => ({ ...prev, [field]: val }));
  };
  const updateH4 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH4((prev) => ({ ...prev, [field]: val }));
  };
  const updateH5 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH5((prev) => ({ ...prev, [field]: val }));
  };
  const updateH6 = (field, val) => {
    hasLocalEditsRef.current = true;
    setH6((prev) => ({ ...prev, [field]: val }));
  };

  // Sauvegarder Brouillon (sans avancer à l'étape suivante)
  const handleSaveDraft = async (houseNum) => {
    if (!canEdit) {
      showToast(`🔒 Mode Consultation : Seul le porteur de stylo (${scribeName}) peut enregistrer.`, 'error');
      return;
    }

    let content = {};
    if (houseNum === 1) content = h1;
    if (houseNum === 2) content = h2;
    if (houseNum === 3) content = h3;
    if (houseNum === 4) content = h4;
    if (houseNum === 5) content = h5;
    if (houseNum === 6) content = h6;

    try {
      const payload = {
        team_id: currentTeam.id,
        house_number: houseNum,
        house_title: HOUSES_META[houseNum]?.title || `Maison ${houseNum}`,
        content,
        submitted_by: currentUser ? currentUser.id : null,
        advance_next: false
      };

      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement du brouillon');

      showToast(`💾 Brouillon de la Maison ${houseNum} sauvegardé !`, 'success');
      hasLocalEditsRef.current = false;
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit Deliverable for House X (et avancer à la suivante)
  const handleSaveDeliverable = async (houseNum) => {
    if (!canEdit) {
      showToast(`🔒 Mode Consultation : Seul le porteur de stylo (${scribeName}) peut enregistrer.`, 'error');
      return;
    }

    let content = {};
    if (houseNum === 1) content = h1;
    if (houseNum === 2) content = h2;
    if (houseNum === 3) content = h3;
    if (houseNum === 4) content = h4;
    if (houseNum === 5) content = h5;
    if (houseNum === 6) content = h6;

    try {
      const payload = {
        team_id: currentTeam.id,
        house_number: houseNum,
        house_title: HOUSES_META[houseNum]?.title || `Maison ${houseNum}`,
        content,
        submitted_by: currentUser ? currentUser.id : null,
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
      hasLocalEditsRef.current = false;
      await refreshWorkshopData();

      if (houseNum < 6) {
        setActiveHouse(houseNum + 1);
      } else {
        showToast('🏆 Félicitations ! Les 6 Maisons du Village IoT sont validées !', 'success');
        navigate('/restitution');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pMin = Math.floor(pitchSeconds / 60);
  const pSec = pitchSeconds % 60;
  const pitchFormatted = `${String(pMin).padStart(2, '0')}:${String(pSec).padStart(2, '0')}`;

  if (!currentTeam) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3>🍄 Aucune équipe disponible</h3>
          <p style={{ color: '#94a3b8', margin: '1rem 0' }}>
            Les équipes n'ont pas encore été formées par l'animateur.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/waiting')}>
            Retour à la Salle d'Attente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-panel active">
      <div className="workspace-container">
        {/* Top Header / Role Banner */}
        <WorkspaceRoleBanner
          isAdmin={isAdmin}
          isScribe={isScribe}
          currentTeam={currentTeam}
          scribeName={scribeName}
        />

        {/* Workspace Layout : Team sidebar + 6 Houses forms */}
        <div className="workspace-layout">
          {/* Team Sidebar */}
          <WorkspaceSidebar
            currentTeam={currentTeam}
            teams={teams}
            currentUser={currentUser}
            isAdmin={isAdmin}
            setActiveTeamId={setActiveTeamId}
            scribeName={scribeName}
            openScribeModal={openScribeModal}
            members={members}
          />

          {/* Espace principal de saisie des 6 Maisons */}
          <main className="workspace-main">
            {/* Stepper épuré des 6 Maisons du Village IoT */}
            <div className="houses-stepper" id="housesStepper">
              {[
                { num: 1, name: 'Besoin' },
                { num: 2, name: 'Idée' },
                { num: 3, name: 'Technique' },
                { num: 4, name: 'Prototype' },
                { num: 5, name: 'Business' },
                { num: 6, name: 'Pitch' }
              ].map((h) => {
                const isActive = activeHouse === h.num;
                const currentTeamHouse = currentTeam.current_house || 1;
                const isCompleted = currentTeamHouse > h.num;
                const isLocked = !isAdmin && currentTeamHouse < h.num;

                const handleClick = () => {
                  if (isLocked) {
                    showToast(
                      `🔒 Veuillez terminer l'étape précédente.`,
                      'warning'
                    );
                    return;
                  }
                  setActiveHouse(h.num);
                };

                let circleContent = h.num;
                if (isCompleted) circleContent = '✓';
                else if (isActive) circleContent = '▶';
                else if (isLocked) circleContent = '🔒';

                let statusLabel = isCompleted ? 'Terminé' : isActive ? 'En cours' : 'Verrouillé';

                return (
                  <div
                    key={h.num}
                    className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                    data-house={h.num}
                    onClick={handleClick}
                    title={isLocked ? `🔒 Maison verrouillée - Veuillez terminer l'étape précédente.` : `Maison ${h.num} : ${h.name}`}
                  >
                    <div className="stepper-circle">{circleContent}</div>
                    <div className="stepper-meta">
                      <span className="stepper-name">Maison {h.num} : {h.name}</span>
                      <span className="stepper-status-badge">{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bannière Dynamique de Rôle dans l'Espace de Travail */}
            <div
              className="workspace-role-banner"
              id="workspaceRoleBanner"
              style={{
                display: 'flex',
                background: canEdit ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: canEdit ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="banner-icon">{canEdit ? '✍️' : '🔒'}</div>
              <div className="banner-content">
                <strong>{canEdit ? 'Mode Rédacteur Unique (Porteur de stylo)' : 'Mode Consultation (Conseiller)'}</strong>
                <p>
                  {canEdit
                    ? 'Vous avez les droits exclusifs pour saisir et valider les livrables de votre équipe ci-dessous.'
                    : `Le rédacteur désigné pour votre groupe est ${scribeName}. Participez aux réflexions et aux débats ; seul le rédacteur enregistre les livrables.`}
                </p>
              </div>
            </div>

            {/* Conteneur dynamique des Formulaires par Maison */}
            <div className={`house-workspace-card ${!canEdit ? 'workspace-readonly-active' : ''}`}>
              {/* House Title Header */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Étape {activeHouse} sur 6 • {HOUSES_META[activeHouse]?.badge} de progression
                </span>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0.25rem 0' }}>
                  {HOUSES_META[activeHouse]?.title}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  {HOUSES_META[activeHouse]?.subtitle}
                </p>
                {!canEdit && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🔒 Mode Consultation active — Seul le rédacteur officiel ({scribeName}) a les droits d'écriture.
                  </div>
                )}
              </div>

              {/* Form Content by House */}
              {activeHouse === 1 && (
                <House1Besoin
                  data={h1}
                  onChange={updateH1}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onGenerateFormula={generateFormula}
                />
              )}

              {activeHouse === 2 && (
                <House2Idee
                  data={h2}
                  onChange={updateH2}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onPrevHouse={() => setActiveHouse(1)}
                />
              )}

              {activeHouse === 3 && (
                <House3Technique
                  data={h3}
                  onChange={updateH3}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onPrevHouse={() => setActiveHouse(2)}
                />
              )}

              {activeHouse === 4 && (
                <House4Prototype
                  data={h4}
                  onChange={updateH4}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onPrevHouse={() => setActiveHouse(3)}
                />
              )}

              {activeHouse === 5 && (
                <House5Business
                  data={h5}
                  onChange={updateH5}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onPrevHouse={() => setActiveHouse(4)}
                />
              )}

              {activeHouse === 6 && (
                <House6Pitch
                  data={h6}
                  onChange={updateH6}
                  canEdit={canEdit}
                  scribeName={scribeName}
                  onSaveDraft={handleSaveDraft}
                  onSaveDeliverable={handleSaveDeliverable}
                  onPrevHouse={() => setActiveHouse(5)}
                  pitchRunning={pitchRunning}
                  setPitchRunning={setPitchRunning}
                  pitchSeconds={pitchSeconds}
                  setPitchSeconds={setPitchSeconds}
                  pitchFormatted={pitchFormatted}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
