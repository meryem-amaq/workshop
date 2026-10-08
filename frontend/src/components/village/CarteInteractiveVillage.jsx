import React, { useState, useEffect, useMemo } from 'react';

// Mapping des 6 Maisons du Village IoT (Coordonnées en % ajustables)
export const VILLAGE_HOUSES = [
  {
    num: 1,
    name: 'Besoin',
    fullName: 'Maison 1 : Définition du Besoin',
    desc: 'Identification de l’utilisateur cible et formulation canonique du problème.',
    icon: '🛖',
    x: 12, // left: 12%
    y: 76  // top: 76%
  },
  {
    num: 2,
    name: 'Idée IOT',
    fullName: 'Maison 2 : Concept Produit IoT',
    desc: 'Idée innovante, capteurs sélectionnés et valeur ajoutée connectée.',
    icon: '💡',
    x: 27, // left: 27%
    y: 36  // top: 36%
  },
  {
    num: 3,
    name: 'Faisabilité',
    fullName: 'Maison 3 : Faisabilité & Architecture',
    desc: 'Chaîne technique : Capteurs ➔ Microcontrôleur ➔ Réseau ➔ Cloud.',
    icon: '⚙️',
    x: 45, // left: 45%
    y: 66  // top: 66%
  },
  {
    num: 4,
    name: 'Prototype',
    fullName: 'Maison 4 : Prototype & Scénario',
    desc: 'Maquette physique, protocole de test de validation et storyboard d’usage.',
    icon: '🔌',
    x: 61, // left: 61%
    y: 30  // top: 30%
  },
  {
    num: 5,
    name: 'Business',
    fullName: 'Maison 5 : Business Model Canvas',
    desc: 'Matrice économique en 9 blocs démontrant la viabilité du projet.',
    icon: '📊',
    x: 77, // left: 77%
    y: 64  // top: 64%
  },
  {
    num: 6,
    name: 'Marché',
    fullName: 'Maison 6 : Marché & Pitch Final',
    desc: 'Go-to-market, métriques à 12 mois et pitch oral de 3 minutes chrono.',
    icon: '🏆',
    isVictory: true,
    x: 90, // left: 90%
    y: 28  // top: 28%
  }
];

// Mapping des avatars Schtroumpf selon le personalityProfile
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

/**
 * Composant CarteInteractiveVillage
 * 
 * @param {Array} props.teams - Liste des équipes : [{ id, groupName, personalityProfile, currentStage }, ...]
 * @param {Function} props.onTeamClick - Callback lors du clic sur un avatar d'équipe
 * @param {Function} props.onHouseClick - Callback lors du clic sur une maison
 * @param {Boolean} props.enableDemoSimulation - Active la démo 3s (Étape 1 -> 2)
 */
export default function CarteInteractiveVillage({
  teams: externalTeams,
  onTeamClick,
  onHouseClick,
  enableDemoSimulation = true
}) {
  // Données de base par défaut pour tester le composant immédiatement
  const initialTeams = useMemo(() => [
    {
      id: 1,
      groupName: 'Les Bâtisseurs',
      personalityProfile: 'Professeur',
      currentStage: 1
    },
    {
      id: 2,
      groupName: 'Les Innovateurs',
      personalityProfile: 'Artiste',
      currentStage: 1
    },
    {
      id: 3,
      groupName: 'Les Électrons',
      personalityProfile: 'Sportif',
      currentStage: 2
    },
    {
      id: 4,
      groupName: 'Les Alchimistes',
      personalityProfile: 'Critique',
      currentStage: 3
    }
  ], []);

  // État local synchronisé avec les props ou simulation
  const [teamsState, setTeamsState] = useState(
    externalTeams && externalTeams.length > 0 ? externalTeams : initialTeams
  );

  const [activeHouseModal, setActiveHouseModal] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);

  // Mettre à jour si externalTeams change
  useEffect(() => {
    if (externalTeams && externalTeams.length > 0) {
      setTeamsState(externalTeams);
    }
  }, [externalTeams]);

  // Script de simulation : fait avancer l'équipe 1 de l'étape 1 à 2 au bout de 3 secondes
  useEffect(() => {
    if (!enableDemoSimulation) return;

    const timer = setTimeout(() => {
      setTeamsState((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === 1 && team.currentStage === 1) {
            return { ...team, currentStage: 2 };
          }
          return team;
        })
      );
      setSimulationActive(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [enableDemoSimulation]);

  // Bouton pour tester manuellement le passage d'étapes en direct
  const simulateAdvanceTeam = (teamId) => {
    setTeamsState((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const next = t.currentStage < 6 ? t.currentStage + 1 : 1;
          return { ...t, currentStage: next };
        }
        return t;
      })
    );
  };

  // Algorithme Anti-Superposition : calcule les coordonnées décalées de chaque équipe
  const positionedTeams = useMemo(() => {
    // 1. Grouper les équipes par étape
    const stageGroups = {};
    teamsState.forEach((t) => {
      const stage = Math.min(Math.max(t.currentStage || 1, 1), 6);
      if (!stageGroups[stage]) stageGroups[stage] = [];
      stageGroups[stage].push(t);
    });

    // 2. Calculer les décalages en constellation pour chaque équipe
    return teamsState.map((team) => {
      const stage = Math.min(Math.max(team.currentStage || 1, 1), 6);
      const house = VILLAGE_HOUSES.find((h) => h.num === stage) || VILLAGE_HOUSES[0];
      const peers = stageGroups[stage] || [];
      const peerIndex = peers.findIndex((p) => p.id === team.id);
      const count = peers.length;

      let offsetX = 0;
      let offsetY = 0;

      if (count > 1) {
        // Rayon de dispersion en pixels selon le nombre d'équipes à la même étape
        const radius = count <= 3 ? 36 : 46;
        const angle = (peerIndex / count) * 2 * Math.PI - Math.PI / 2;
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius;
      }

      return {
        ...team,
        stage,
        house,
        baseX: house.x,
        baseY: house.y,
        offsetX,
        offsetY
      };
    });
  }, [teamsState]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        background: '#070d19'
      }}
    >
      
      {/* Barre d'outils et légende en haut de la carte */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '1rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🍄</span>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>
              La Carte Interactive du Village IoT
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Progression en temps réel des équipes à travers les 6 Maisons champignons
            </p>
          </div>
        </div>

        {/* Contrôles de simulation / Test */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {simulationActive && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#4ade80',
                background: 'rgba(6, 78, 59, 0.7)',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: 600
              }}
            >
              ✨ Démo active : Les Bâtisseurs sont passés à l'Étape 2 !
            </span>
          )}
          <button
            type="button"
            onClick={() => simulateAdvanceTeam(1)}
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#38bdf8',
              background: 'rgba(8, 47, 73, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Tester l'animation fluide de déplacement"
          >
            🏃 Faire Avancer Équipe 1 (+1 Étape)
          </button>
        </div>
      </div>

      {/* L'Arène Visuelle 3D de la Carte */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '560px',
          overflow: 'hidden',
          background: '#070d19',
          userSelect: 'none'
        }}
      >
        
        {/* 1. Image de fond isométrique du Village */}
        <img
          src="/assets/images/village-banner.jpg"
          alt="Village des Schtroumpfs"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.9) contrast(1.1)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* 2. Chemins lumineux SVG reliant les 6 Maisons */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Dégradé néon le long du sentier */}
            <linearGradient id="villageNeonPath" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
            </linearGradient>

            {/* Effet de brillance lueur néon */}
            <filter id="villageGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ligne de fond lumineuse continue */}
          <path
            d="M 144 456 Q 240 320 324 216 T 540 396 T 732 180 T 924 384 T 1080 168"
            fill="none"
            stroke="url(#villageNeonPath)"
            strokeWidth="8"
            strokeOpacity="0.35"
            strokeLinecap="round"
            filter="url(#villageGlow)"
          />

          {/* Sentier pointillé animé (flux de particules lumineuses) */}
          <path
            d="M 144 456 Q 240 320 324 216 T 540 396 T 732 180 T 924 384 T 1080 168"
            fill="none"
            stroke="url(#villageNeonPath)"
            strokeWidth="5"
            strokeDasharray="14 10"
            strokeLinecap="round"
            filter="url(#villageGlow)"
            className="village-trail-dash-anim"
          />
        </svg>

        {/* 3. Les 6 Maisons / Étapes (Pins fixes) */}
        {VILLAGE_HOUSES.map((house) => {
          const teamsAtHouse = teamsState.filter(
            (t) => (t.currentStage || 1) === house.num
          );

          return (
            <div
              key={house.num}
              style={{
                position: 'absolute',
                left: `${house.x}%`,
                top: `${house.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => {
                setActiveHouseModal(house);
                if (onHouseClick) onHouseClick(house);
              }}
            >
              {/* Cercle Pin de la maison */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  border: house.isVictory ? '2.5px solid #f59e0b' : '2.5px solid #38bdf8',
                  background: house.isVictory ? 'rgba(69, 26, 3, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                  boxShadow: house.isVictory
                    ? '0 0 20px rgba(245, 158, 11, 0.6)'
                    : '0 0 20px rgba(56, 189, 248, 0.5)'
                }}
              >
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{house.icon}</span>
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    padding: '1px 6px',
                    fontSize: '9px',
                    fontWeight: '900',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: house.isVictory ? '#f59e0b' : '#0284c7',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                  }}
                >
                  M{house.num}
                </span>
              </div>

              {/* Étiquette sous la maison */}
              <div
                style={{
                  marginTop: '4px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8' }}>
                  {house.name}
                </span>
                {teamsAtHouse.length > 0 && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      background: 'rgba(56, 189, 248, 0.25)',
                      color: '#7dd3fc',
                      padding: '1px 5px',
                      borderRadius: '10px'
                    }}
                  >
                    {teamsAtHouse.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* 4. Les Avatars des Équipes (Déplacement animé et anti-superposition) */}
        {positionedTeams.map((team) => {
          const avatarUrl = getAvatarForProfile(team.personalityProfile);

          return (
            <div
              key={team.id}
              style={{
                position: 'absolute',
                left: `calc(${team.baseX}% + ${team.offsetX}px)`,
                top: `calc(${team.baseY}% + ${team.offsetY}px)`,
                transform: 'translate(-50%, -100%)',
                zIndex: 25,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), top 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onTeamClick) onTeamClick(team);
              }}
            >
              {/* Bulle flottante avec le groupName (au-dessus de l'avatar) */}
              <div
                style={{
                  marginBottom: '4px',
                  padding: '3px 10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                  border: '1.5px solid rgba(125, 211, 252, 0.9)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.5), 0 2px 4px rgba(0,0,0,0.6)',
                  textAlign: 'center',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '11px',
                    letterSpacing: '0.3px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {team.groupName || `Groupe ${team.id}`}
                </span>
                {/* Flèche pointeur vers le bas */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '-4px',
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: '7px',
                    height: '7px',
                    background: '#1d4ed8',
                    borderRight: '1.5px solid rgba(125, 211, 252, 0.9)',
                    borderBottom: '1.5px solid rgba(125, 211, 252, 0.9)'
                  }}
                />
              </div>

              {/* Avatar 3D du Schtroumpf (Dimensions fixées et compactes) */}
              <div
                style={{
                  position: 'relative',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  padding: '2px',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%)',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.6), 0 4px 10px rgba(0,0,0,0.6)'
                }}
              >
                <img
                  src={avatarUrl}
                  alt={team.groupName}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    border: '2px solid #ffffff'
                  }}
                />
                {/* Badge profil miniature */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '18px',
                    height: '18px',
                    background: '#0f172a',
                    border: '1.5px solid #38bdf8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                  title={`Profil : ${team.personalityProfile}`}
                >
                  ⚡
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* 5. Modale d'inspection d'une Maison */}
      {activeHouseModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(7, 13, 25, 0.85)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setActiveHouseModal(null)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>{activeHouseModal.icon}</span>
                <h4 style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>
                  {activeHouseModal.fullName}
                </h4>
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onClick={() => setActiveHouseModal(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {activeHouseModal.desc}
            </p>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h5
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem'
                }}
              >
                Équipes actuellement à cette étape :
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {teamsState.filter((t) => (t.currentStage || 1) === activeHouseModal.num).length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    Aucune équipe pour le moment.
                  </span>
                ) : (
                  teamsState
                    .filter((t) => (t.currentStage || 1) === activeHouseModal.num)
                    .map((t) => (
                      <span
                        key={t.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(8, 47, 73, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#bae6fd',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          borderRadius: '20px'
                        }}
                      >
                        👥 {t.groupName}
                      </span>
                    ))
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={{
                  padding: '6px 16px',
                  background: '#0284c7',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveHouseModal(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style CSS inline pour l'animation du sentier */}
      <style>{`
        @keyframes dashScroll {
          from {
            stroke-dashoffset: 48;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .village-trail-dash-anim {
          animation: dashScroll 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
