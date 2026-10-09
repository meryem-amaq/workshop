import React, { useState, useEffect, useMemo, useRef } from 'react';

// =========================================================================
// 1. LES 6 GRANDES MAISONS DU VILLAGE IoT (Coordonnées calibrées plein écran)
// =========================================================================
export const VILLAGE_HOUSES = [
  {
    num: 1,
    name: 'Maison 1 : Besoin',
    fullName: 'Maison 1 : Définition du Besoin',
    desc: 'Identification précise de l’utilisateur cible et formulation canonique du problème réel.',
    icon: '🪵',
    color: '#fbbf24',
    badge: '16%',
    x: 18, // Grande chaumière rurale en bas à gauche
    y: 72,
    clickArea: { width: 170, height: 160 }
  },
  {
    num: 2,
    name: 'Maison 2 : Idée IoT',
    fullName: 'Maison 2 : Concept & Idée IoT',
    desc: 'Définition du produit connecté : capteurs physiques mesurés et action automatisée.',
    icon: '💡',
    color: '#38bdf8',
    badge: '33%',
    x: 31, // Grand champignon bleu à ampoule
    y: 49,
    clickArea: { width: 160, height: 160 }
  },
  {
    num: 3,
    name: 'Maison 3 : Faisabilité',
    fullName: 'Maison 3 : Faisabilité & Architecture',
    desc: 'Chaîne de valeur technique : Capteurs ➔ Microcontrôleur ➔ Réseau ➔ Cloud.',
    icon: '⚙️',
    color: '#f97316',
    badge: '50%',
    x: 48, // Grand atelier cuivre & engrenages
    y: 73,
    clickArea: { width: 170, height: 160 }
  },
  {
    num: 4,
    name: 'Maison 4 : Prototype',
    fullName: 'Maison 4 : Prototype & Algorithme',
    desc: 'Maquette physique, protocole de test de validation et scénario logique d’usage.',
    icon: '🔌',
    color: '#00e5ff',
    badge: '66%',
    x: 53, // Grand dôme cyber-labo
    y: 36,
    clickArea: { width: 170, height: 150 }
  },
  {
    num: 5,
    name: 'Maison 5 : Business',
    fullName: 'Maison 5 : Business Model Canvas',
    desc: 'Modèle économique en 9 blocs démontrant la viabilité financière et la proposition de valeur.',
    icon: '💎',
    color: '#10b981',
    badge: '83%',
    x: 69, // Grande pagode émeraude de valeur
    y: 59,
    clickArea: { width: 160, height: 160 }
  },
  {
    num: 6,
    name: 'Maison 6 : Pitch Final',
    fullName: 'Maison 6 : Marché & Pitch Final',
    desc: 'Go-to-market, indicateurs cibles à 12 mois et soutenance orale de 3 minutes chrono.',
    icon: '🏆',
    color: '#f59e0b',
    badge: '100%',
    isVictory: true,
    x: 84, // Grand château doré du Pitch Final
    y: 28,
    clickArea: { width: 200, height: 180 }
  }
];

// Tracé naturel des waypoints épousant les pavés dorés du village
export const CIRCUIT_WAYPOINTS = {
  // 1 ➔ 2 : De la Maison 1, suit les pavés vers la droite et monte à la Maison 2
  '1-2': [
    { x: 18, y: 72 },
    { x: 24, y: 78 },
    { x: 29, y: 68 },
    { x: 31, y: 56 },
    { x: 31, y: 49 } // Devant Maison 2
  ],
  // 2 ➔ 3 : De la Maison 2, descend sur le sentier et rejoint la Maison 3
  '2-3': [
    { x: 31, y: 49 },
    { x: 34, y: 58 },
    { x: 38, y: 72 },
    { x: 43, y: 82 },
    { x: 48, y: 73 } // Devant Maison 3
  ],
  // 3 ➔ 4 : De la Maison 3, traverse le pont de bois vers le dôme tech
  '3-4': [
    { x: 48, y: 73 },
    { x: 47, y: 58 },
    { x: 49, y: 46 },
    { x: 53, y: 36 } // Devant Maison 4
  ],
  // 4 ➔ 5 : Du dôme tech, descend vers la pagode émeraude
  '4-5': [
    { x: 53, y: 36 },
    { x: 58, y: 44 },
    { x: 64, y: 49 },
    { x: 69, y: 59 } // Devant Maison 5
  ],
  // 5 ➔ 6 : De la pagode émeraude, traverse le pont et gravit les escaliers jusqu'au château
  '5-6': [
    { x: 69, y: 59 },
    { x: 75, y: 59 },
    { x: 81, y: 52 },
    { x: 78, y: 38 },
    { x: 84, y: 28 } // Devant Château
  ]
};

// Mapping des avatars Schtroumpf selon le profil
export const PROFILE_AVATARS = {
  professeur: '/assets/images/professeur.jpg',
  savant: '/assets/images/professeur.jpg',
  theoricien: '/assets/images/professeur.jpg',
  artiste: '/assets/images/artiste.jpg',
  creatif: '/assets/images/artiste.jpg',
  critique: '/assets/images/critique.jpg',
  analyste: '/assets/images/critique.jpg',
  rigoureux: '/assets/images/critique.jpg',
  empathique: '/assets/images/empathique.jpg',
  solidaire: '/assets/images/empathique.jpg',
  mediateur: '/assets/images/empathique.jpg',
  sportif: '/assets/images/sportif.jpg',
  batisseur: '/assets/images/sportif.jpg',
  pratique: '/assets/images/sportif.jpg',
  bricoleur: '/assets/images/sportif.jpg'
};

export function getAvatarForProfile(profile) {
  if (!profile) return '/assets/images/professeur.jpg';
  const key = String(profile).toLowerCase().trim();
  for (const [k, v] of Object.entries(PROFILE_AVATARS)) {
    if (key.includes(k)) return v;
  }
  return '/assets/images/professeur.jpg';
}

export function formatShortTeamName(team) {
  if (!team) return 'Équipe';
  const raw = team.name || team.groupName || team.archetype || '';
  if (raw.includes('Professeur')) return 'Professeur';
  if (raw.includes('Artiste')) return 'Artiste';
  if (raw.includes('Critique')) return 'Critique';
  if (raw.includes('Empathique')) return 'Empathique';
  if (raw.includes('Sportif')) return 'Sportif';
  return raw.replace(/^Les Schtroumpfs /i, '').replace(/ \(.*\)/g, '').trim() || `Groupe ${team.id}`;
}

export default function CarteInteractiveVillage({
  teams: externalTeams,
  onTeamClick,
  onHouseClick,
  enableDemoSimulation = false
}) {
  const initialTeams = useMemo(() => [
    {
      id: 1,
      name: 'Professeur',
      groupName: 'Professeur',
      personalityProfile: 'Professeur',
      archetype: 'professeur',
      current_house: 1,
      currentStage: 1,
      scribe_name: 'Amin (Scribe)'
    },
    {
      id: 2,
      name: 'Artiste',
      groupName: 'Artiste',
      personalityProfile: 'Artiste',
      archetype: 'artiste',
      current_house: 1,
      currentStage: 1,
      scribe_name: 'Sara (Scribe)'
    },
    {
      id: 3,
      name: 'Sportif',
      groupName: 'Sportif',
      personalityProfile: 'Sportif',
      archetype: 'sportif',
      current_house: 2,
      currentStage: 2,
      scribe_name: 'Yassine (Scribe)'
    },
    {
      id: 4,
      name: 'Critique',
      groupName: 'Critique',
      personalityProfile: 'Critique',
      archetype: 'critique',
      current_house: 3,
      currentStage: 3,
      scribe_name: 'Meryem (Scribe)'
    },
    {
      id: 5,
      name: 'Empathique',
      groupName: 'Empathique',
      personalityProfile: 'Empathique',
      archetype: 'empathique',
      current_house: 5,
      currentStage: 5,
      scribe_name: 'Inès (Scribe)'
    }
  ], []);

  const [teamsState, setTeamsState] = useState(
    externalTeams && externalTeams.length > 0 ? externalTeams : initialTeams
  );

  const [selectedTeamId, setSelectedTeamId] = useState(
    teamsState[0]?.id || 1
  );

  const [animatedPositions, setAnimatedPositions] = useState({});
  const [activeHouseModal, setActiveHouseModal] = useState(null);
  const activeAnimationsRef = useRef({});

  // Initialiser les positions de base
  useEffect(() => {
    const initialPos = {};
    teamsState.forEach((t) => {
      const stage = Math.min(Math.max(t.current_house || t.currentStage || 1, 1), 6);
      const house = VILLAGE_HOUSES.find((h) => h.num === stage) || VILLAGE_HOUSES[0];
      initialPos[t.id] = { x: house.x, y: house.y, isWalking: false };
    });
    setAnimatedPositions(initialPos);
  }, []);

  // Synchroniser avec les équipes externes
  useEffect(() => {
    if (externalTeams && externalTeams.length > 0) {
      setTeamsState(externalTeams);
      if (!selectedTeamId) setSelectedTeamId(externalTeams[0].id);
    }
  }, [externalTeams]);

  // Fonction pour animer le personnage point par point le long du sentier
  const animateAlongCircuit = (teamId, fromStage, toStage) => {
    const key = `${fromStage}-${toStage}`;
    let waypoints = CIRCUIT_WAYPOINTS[key];

    if (!waypoints) {
      const targetHouse = VILLAGE_HOUSES.find((h) => h.num === toStage) || VILLAGE_HOUSES[0];
      waypoints = [{ x: targetHouse.x, y: targetHouse.y }];
    }

    let stepIndex = 0;
    const stepDuration = 260; // ms par point de passage

    if (activeAnimationsRef.current[teamId]) {
      clearInterval(activeAnimationsRef.current[teamId]);
    }

    setAnimatedPositions((prev) => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || { x: waypoints[0].x, y: waypoints[0].y }),
        isWalking: true
      }
    }));

    const interval = setInterval(() => {
      if (stepIndex < waypoints.length) {
        const pt = waypoints[stepIndex];
        setAnimatedPositions((prev) => ({
          ...prev,
          [teamId]: { x: pt.x, y: pt.y, isWalking: true }
        }));
        stepIndex++;
      } else {
        clearInterval(interval);
        delete activeAnimationsRef.current[teamId];
        const finalHouse = VILLAGE_HOUSES.find((h) => h.num === toStage) || VILLAGE_HOUSES[0];
        setAnimatedPositions((prev) => ({
          ...prev,
          [teamId]: { x: finalHouse.x, y: finalHouse.y, isWalking: false }
        }));
      }
    }, stepDuration);

    activeAnimationsRef.current[teamId] = interval;
  };

  // Simulation manuelle / Déplacement guidé sur le circuit
  const simulateAdvanceTeam = (teamId) => {
    const team = teamsState.find((t) => t.id === teamId);
    if (!team) return;

    const current = team.current_house || team.currentStage || 1;
    const next = current < 6 ? current + 1 : 1;

    // Déclencher l'animation le long du sentier
    animateAlongCircuit(teamId, current, next);

    // Mettre à jour l'état de l'équipe
    setTeamsState((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return { ...t, current_house: next, currentStage: next };
        }
        return t;
      })
    );
  };

  // Calcul des coordonnées décalées avec anti-superposition
  const positionedTeams = useMemo(() => {
    const stageGroups = {};
    teamsState.forEach((t) => {
      const stage = Math.min(Math.max(t.current_house || t.currentStage || 1, 1), 6);
      if (!stageGroups[stage]) stageGroups[stage] = [];
      stageGroups[stage].push(t);
    });

    return teamsState.map((team) => {
      const stage = Math.min(Math.max(team.current_house || team.currentStage || 1, 1), 6);
      const house = VILLAGE_HOUSES.find((h) => h.num === stage) || VILLAGE_HOUSES[0];
      const peers = stageGroups[stage] || [];
      const peerIndex = peers.findIndex((p) => p.id === team.id);
      const count = peers.length;

      let offsetX = 0;
      let offsetY = 0;

      if (count > 1) {
        const radius = count <= 3 ? 36 : 46;
        const angle = (peerIndex / count) * 2 * Math.PI - Math.PI / 2;
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius;
      }

      const animPos = animatedPositions[team.id];
      const posX = animPos ? animPos.x : house.x;
      const posY = animPos ? animPos.y : house.y;
      const isWalking = animPos ? animPos.isWalking : false;

      return {
        ...team,
        stage,
        house,
        posX,
        posY,
        offsetX: isWalking ? 0 : offsetX,
        offsetY: isWalking ? 0 : offsetY,
        isWalking
      };
    });
  }, [teamsState, animatedPositions]);

  const selectedTeam = teamsState.find((t) => t.id === selectedTeamId) || teamsState[0];

  return (
    <div className="village-game-container">
      {/* 1. Barre Supérieure Style Jeu Vidéo (Quest HUD) */}
      <div className="village-game-hud">
        <div className="village-hud-left">
          <div className="village-hud-badge">
            <span className="village-hud-icon">🍄</span>
            <div>
              <h3 className="village-hud-title">Carte d'Aventure du Village IoT</h3>
              <p className="village-hud-sub">Suivez les équipes le long des 6 Maisons champignons</p>
            </div>
          </div>
        </div>

        <div className="village-hud-right">
          {/* Sélecteur d'équipes rapide avec noms courts */}
          <div className="hud-team-pills">
            {teamsState.map((t) => {
              const isSelected = selectedTeamId === t.id;
              const shortName = formatShortTeamName(t);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`hud-team-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedTeamId(t.id)}
                >
                  🏕️ {shortName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="village-btn-advance"
            onClick={() => simulateAdvanceTeam(selectedTeamId)}
            title="Faire marcher le Scribe le long du sentier en pavés"
          >
            <span>🚶‍♂️</span> Faire Marcher {formatShortTeamName(selectedTeam)} (+1 Étape)
          </button>
        </div>
      </div>

      {/* 2. Arène Visuelle Plein Écran Haute Immersion (Sans aucun trait parasite) */}
      <div className="village-game-canvas-wrap">
        
        {/* Illustration Haute Définition Plein Écran (Sans légende ni bordure) */}
        <img
          src="/assets/images/village-banner.jpg?v=3"
          alt="Village IoT des Schtroumpfs"
          className="village-map-bg-img"
        />

        {/* 3. Zones Interactives Cliquables sur les 6 Grandes Maisons */}
        {VILLAGE_HOUSES.map((house) => {
          const teamsAtHouse = teamsState.filter(
            (t) => (t.current_house || t.currentStage || 1) === house.num
          );

          return (
            <div
              key={house.num}
              className="village-house-interactive-zone"
              style={{
                left: `${house.x}%`,
                top: `${house.y}%`,
                width: `${house.clickArea.width}px`,
                height: `${house.clickArea.height}px`
              }}
              onClick={() => {
                setActiveHouseModal(house);
                if (onHouseClick) onHouseClick(house);
              }}
              title={`Cliquer pour voir la mission : ${house.fullName}`}
            >
              {/* Pastille discrète du nombre d'équipes si présentes */}
              {teamsAtHouse.length > 0 && (
                <div className="house-teams-badge-pill">
                  {teamsAtHouse.length} {teamsAtHouse.length > 1 ? 'équipes' : 'équipe'}
                </div>
              )}
            </div>
          );
        })}

        {/* 4. Les Personnages / Scribes des Équipes en Marche 3D Stylée */}
        {positionedTeams.map((team) => {
          const avatarUrl = getAvatarForProfile(team.archetype || team.personalityProfile);
          const isWalking = team.isWalking;
          const isSelected = selectedTeamId === team.id;
          const archetypeColor = team.house ? team.house.color : '#38bdf8';
          const shortName = formatShortTeamName(team);

          return (
            <div
              key={team.id}
              className={`village-team-character ${isWalking ? 'character-jumping' : 'character-idle'} ${isSelected ? 'character-selected' : ''}`}
              style={{
                left: `calc(${team.posX}% + ${team.offsetX}px)`,
                top: `calc(${team.posY}% + ${team.offsetY}px)`,
                transition: isWalking
                  ? 'left 0.26s cubic-bezier(0.25, 1, 0.5, 1), top 0.26s cubic-bezier(0.25, 1, 0.5, 1)'
                  : 'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTeamId(team.id);
                if (onTeamClick) onTeamClick(team);
              }}
            >
              {/* Bulle d'identification concise (Professeur, Artiste, etc.) */}
              <div className="team-character-speech-bubble">
                <span className="team-character-name">
                  {shortName}
                </span>
                {team.scribe_name && (
                  <span className="team-character-scribe-tag">
                    ✍️ {team.scribe_name}
                  </span>
                )}
                <div className="team-character-arrow" />
              </div>

              {/* Conteneur 3D du Pion avec Avatar */}
              <div className="pawn-3d-wrapper">
                <div className="team-avatar-frame" style={{ borderColor: archetypeColor }}>
                  <img
                    src={avatarUrl}
                    alt={team.name || team.groupName}
                    className="team-avatar-img"
                  />
                  <div className="team-avatar-status-dot">
                    {isWalking ? '⚡' : '✨'}
                  </div>
                </div>

                {/* Socle rotatif néon */}
                <div
                  className="pawn-3d-base"
                  style={{
                    background: `radial-gradient(ellipse at center, ${archetypeColor} 0%, rgba(2,132,199,0.3) 70%, transparent 100%)`,
                    boxShadow: `0 0 14px ${archetypeColor}`
                  }}
                />
              </div>

              {/* Ombre portée dynamique 3D au sol */}
              <div className={`pawn-ground-shadow ${isWalking ? 'shadow-jumping' : ''}`} />

              {/* Onde de choc d'énergie à l'étape */}
              {!isWalking && (
                <div
                  className="pawn-landing-ripple"
                  style={{ borderColor: `${archetypeColor}99` }}
                />
              )}
            </div>
          );
        })}

      </div>

      {/* 5. Modale de Quête / Détails de la Maison */}
      {activeHouseModal && (
        <div
          className="village-quest-modal-backdrop"
          onClick={() => setActiveHouseModal(null)}
        >
          <div
            className="village-quest-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="village-quest-modal-head">
              <div className="quest-modal-title-wrap">
                <span className="quest-modal-icon">{activeHouseModal.icon}</span>
                <div>
                  <h4 className="quest-modal-title">{activeHouseModal.fullName}</h4>
                  <span className="quest-modal-stage-badge" style={{ background: activeHouseModal.color }}>
                    Étape Officielle • {activeHouseModal.badge}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="quest-modal-close"
                onClick={() => setActiveHouseModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="quest-modal-body">
              <div className="quest-mission-box">
                <div className="quest-mission-title">📜 MISSION DE L'ÉTAPE :</div>
                <p className="quest-mission-desc">{activeHouseModal.desc}</p>
              </div>

              <div className="quest-teams-at-stage">
                <h5 className="quest-teams-title">
                  👥 Équipes actuellement dans cette Maison ({teamsState.filter((t) => (t.current_house || t.currentStage || 1) === activeHouseModal.num).length}) :
                </h5>
                <div className="quest-teams-list">
                  {teamsState.filter((t) => (t.current_house || t.currentStage || 1) === activeHouseModal.num).length === 0 ? (
                    <span className="quest-no-team-txt">
                      Aucune équipe dans cette maison pour l'instant.
                    </span>
                  ) : (
                    teamsState
                      .filter((t) => (t.current_house || t.currentStage || 1) === activeHouseModal.num)
                      .map((t) => (
                        <span key={t.id} className="quest-team-chip">
                          🏕️ {t.name || t.groupName}
                        </span>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="quest-modal-foot">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveHouseModal(null)}
              >
                Continuer l'Aventure ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS Plein Écran & Haute Résolution */}
      <style>{`
        .village-game-container {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15);
          border: 1.5px solid rgba(56, 189, 248, 0.3);
          background: #070d19;
        }

        .village-game-hud {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(56, 189, 248, 0.2);
          z-index: 30;
        }

        .village-hud-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .village-hud-icon {
          font-size: 1.8rem;
          filter: drop-shadow(0 0 8px #38bdf8);
        }

        .village-hud-title {
          color: #f8fafc;
          font-family: var(--font-heading, sans-serif);
          font-weight: 800;
          font-size: 1.15rem;
          margin: 0;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }

        .village-hud-sub {
          color: #94a3b8;
          font-size: 0.82rem;
          margin: 0;
        }

        .village-hud-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hud-team-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .hud-team-pill {
          background: rgba(15, 23, 42, 0.8);
          color: #94a3b8;
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 5px 12px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hud-team-pill.active {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #fff;
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        }

        .village-btn-advance {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border: 1px solid rgba(56, 189, 248, 0.5);
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
          transition: all 0.2s ease;
        }

        .village-btn-advance:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.6);
          border-color: #38bdf8;
        }

        /* 2. Arène Plein Écran */
        .village-game-canvas-wrap {
          position: relative;
          width: 100%;
          min-height: 760px;
          height: calc(100vh - 180px);
          overflow: hidden;
          background: #070c18;
          user-select: none;
        }

        .village-map-bg-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: brightness(1.02) contrast(1.04);
          pointer-events: none;
          z-index: 1;
        }

        /* 3. Zones Interactives sur les Maisons */
        .village-house-interactive-zone {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          border-radius: 24px;
          transition: all 0.25s ease;
        }

        .village-house-interactive-zone:hover {
          background: rgba(56, 189, 248, 0.08);
          box-shadow: inset 0 0 25px rgba(56, 189, 248, 0.35);
        }

        .house-teams-badge-pill {
          background: rgba(15, 23, 42, 0.92);
          border: 1.5px solid rgba(56, 189, 248, 0.7);
          color: #7dd3fc;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          margin-bottom: 8px;
        }

        /* 4. Avatars & Déplacement Animé 3D Façon Pion RPG */
        @keyframes pawnHopPhysics {
          0% {
            transform: translateY(0) scale(1, 1) rotate(0deg);
          }
          20% {
            transform: translateY(-5px) scale(0.95, 1.05) rotate(-3deg);
          }
          50% {
            transform: translateY(-24px) scale(1.05, 0.95) rotate(4deg);
          }
          75% {
            transform: translateY(-12px) scale(1, 1) rotate(-2deg);
          }
          100% {
            transform: translateY(0) scale(1, 1) rotate(0deg);
          }
        }

        @keyframes pawnIdleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes shadowHopPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(0.5);
            opacity: 0.25;
          }
        }

        @keyframes landingRippleWave {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        @keyframes pedestalRotateGlow {
          0% {
            transform: rotateX(70deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(70deg) rotateZ(360deg);
          }
        }

        .village-team-character {
          position: absolute;
          transform: translate(-50%, -100%);
          z-index: 25;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .character-jumping .pawn-3d-wrapper {
          animation: pawnHopPhysics 0.26s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .character-idle .pawn-3d-wrapper {
          animation: pawnIdleFloat 2.8s ease-in-out infinite;
        }

        .character-selected .team-avatar-frame {
          box-shadow: 0 0 25px #38bdf8, 0 0 45px #38bdf888 !important;
          transform: scale(1.18);
        }

        .pawn-3d-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-style: preserve-3d;
        }

        .pawn-3d-base {
          position: absolute;
          bottom: -8px;
          width: 58px;
          height: 20px;
          border-radius: 50%;
          z-index: -1;
          animation: pedestalRotateGlow 4s linear infinite;
        }

        .pawn-ground-shadow {
          position: absolute;
          bottom: -10px;
          width: 48px;
          height: 16px;
          background: rgba(0, 0, 0, 0.65);
          border-radius: 50%;
          filter: blur(3px);
          z-index: -2;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .shadow-jumping {
          animation: shadowHopPulse 0.26s ease infinite;
        }

        .pawn-landing-ripple {
          position: absolute;
          bottom: -10px;
          width: 40px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #38bdf8;
          z-index: -3;
          animation: landingRippleWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        .team-character-speech-bubble {
          margin-bottom: 6px;
          padding: 3px 12px;
          background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
          border: 1.5px solid rgba(125, 211, 252, 0.9);
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.6), 0 2px 4px rgba(0,0,0,0.6);
          text-align: center;
          position: relative;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 30;
        }

        .team-character-name {
          color: #fff;
          font-weight: 800;
          font-size: 11.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }

        .team-character-scribe-tag {
          color: #fef08a;
          font-size: 9px;
          font-weight: 700;
        }

        .team-character-arrow {
          position: absolute;
          left: 50%;
          bottom: -4px;
          transform: translateX(-50%) rotate(45deg);
          width: 7px;
          height: 7px;
          background: #1e40af;
          border-right: 1.5px solid rgba(125, 211, 252, 0.9);
          border-bottom: 1.5px solid rgba(125, 211, 252, 0.9);
        }

        .team-avatar-frame {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          padding: 2.5px;
          background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #f59e0b 100%);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.8), 0 8px 16px rgba(0,0,0,0.7);
          transition: transform 0.2s ease;
        }

        .village-team-character:hover .team-avatar-frame {
          transform: scale(1.1);
        }

        .team-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 2px solid #ffffff;
        }

        .team-avatar-status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          background: #0f172a;
          border: 1.5px solid #38bdf8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        /* 5. Modale Quête */
        .village-quest-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(7, 13, 25, 0.85);
          backdrop-filter: blur(10px);
        }

        .village-quest-modal-card {
          background: #0f172a;
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          border-radius: 18px;
          padding: 1.5rem;
          maxWidth: 460px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.2);
        }

        .village-quest-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quest-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quest-modal-icon {
          font-size: 1.8rem;
        }

        .quest-modal-title {
          color: #fff;
          font-weight: 800;
          font-size: 1.15rem;
          margin: 0;
        }

        .quest-modal-stage-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
          color: #fff;
          margin-top: 3px;
        }

        .quest-modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .quest-mission-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .quest-mission-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #38bdf8;
          margin-bottom: 0.4rem;
        }

        .quest-mission-desc {
          color: #cbd5e1;
          font-size: 0.88rem;
          line-height: 1.5;
          margin: 0;
        }

        .quest-teams-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .quest-teams-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quest-team-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(8, 47, 73, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #bae6fd;
          font-size: 0.8rem;
          font-weight: 700;
          borderRadius: 20px;
        }

        .quest-no-team-txt {
          color: #64748b;
          font-size: 0.82rem;
          font-style: italic;
        }

        .quest-modal-foot {
          margin-top: 1.25rem;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
