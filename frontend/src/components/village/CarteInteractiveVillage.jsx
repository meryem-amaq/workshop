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
        const radius = count <= 3 ? 34 : 44;
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
    <div className="village-interactive-container relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#070d19]">
      
      {/* Barre d'outils et légende en haut de la carte */}
      <div className="village-interactive-header flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🍄</span>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">
              La Carte Interactive du Village IoT
            </h3>
            <p className="text-xs text-slate-400">
              Déplacement en direct des équipes le long des 6 Maisons champignons
            </p>
          </div>
        </div>

        {/* Contrôles de simulation / Test */}
        <div className="flex items-center gap-2">
          {simulationActive && (
            <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full animate-pulse">
              ✨ Démo active : Les Bâtisseurs ont avancé à l'Étape 2 !
            </span>
          )}
          <button
            type="button"
            onClick={() => simulateAdvanceTeam(1)}
            className="px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 rounded-lg transition-all shadow-sm hover:scale-105 active:scale-95"
            title="Tester l'animation fluide de déplacement"
          >
            🏃 Faire Avancer Équipe 1 (+1 Étape)
          </button>
        </div>
      </div>

      {/* L'Arène Visuelle 3D de la Carte */}
      <div className="village-map-arena relative w-full h-[580px] overflow-hidden bg-[#070d19] select-none">
        
        {/* 1. Image de fond isométrique du Village */}
        <img
          src="/assets/images/village-banner.jpg"
          alt="Village des Schtroumpfs"
          className="absolute inset-0 w-full h-full object-cover brightness-90 contrast-110 pointer-events-none"
        />

        {/* 2. Chemins lumineux SVG reliant les 6 Maisons */}
        <svg
          className="village-paths-svg absolute inset-0 w-full h-full pointer-events-none z-10"
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
              className={`village-house-anchor absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-110`}
              style={{
                left: `${house.x}%`,
                top: `${house.y}%`
              }}
              onClick={() => {
                setActiveHouseModal(house);
                if (onHouseClick) onHouseClick(house);
              }}
            >
              {/* Cercle Pin de la maison */}
              <div
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center relative backdrop-blur-md border-2 shadow-lg transition-all ${
                  house.isVictory
                    ? 'bg-amber-950/80 border-amber-400 shadow-amber-500/50'
                    : 'bg-slate-900/85 border-sky-400 shadow-sky-500/40'
                }`}
              >
                <span className="text-xl leading-none">{house.icon}</span>
                <span
                  className={`absolute -top-2.5 px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider text-white shadow ${
                    house.isVictory ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                >
                  M{house.num}
                </span>
              </div>

              {/* Étiquette sous la maison */}
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-center whitespace-nowrap shadow-md">
                <span className="text-[11px] font-bold text-sky-300">
                  {house.name}
                </span>
                {teamsAtHouse.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-sky-500/30 text-sky-200 rounded-full">
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
              className="village-team-avatar-wrapper absolute z-30 flex flex-col items-center cursor-pointer select-none"
              style={{
                // Coordonnées avec interpolation fluide
                left: `calc(${team.baseX}% + ${team.offsetX}px)`,
                top: `calc(${team.baseY}% + ${team.offsetY}px)`,
                transform: 'translate(-50%, -100%)',
                transition: 'left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), top 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onTeamClick) onTeamClick(team);
              }}
            >
              {/* Bulle flottante avec le groupName (au-dessus de l'avatar) */}
              <div className="team-floating-bubble mb-1.5 px-3 py-1 bg-gradient-to-r from-sky-600 to-blue-700 border border-sky-300/80 rounded-full shadow-lg shadow-sky-500/40 text-center relative transform hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-xs whitespace-nowrap tracking-wide drop-shadow">
                  {team.groupName || `Groupe ${team.id}`}
                </span>
                {/* Flèche pointeur vers le bas */}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-blue-700 rotate-45 border-r border-b border-sky-300/80"></div>
              </div>

              {/* Avatar 3D du Schtroumpf */}
              <div className="team-avatar-token relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-xl shadow-sky-500/50 hover:scale-115 transition-transform animate-pulse">
                <img
                  src={avatarUrl}
                  alt={team.groupName}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
                {/* Badge profil miniature */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border border-sky-400 rounded-full flex items-center justify-center text-[10px] text-white"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveHouseModal(null)}
        >
          <div
            className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeHouseModal.icon}</span>
                <h4 className="text-white font-bold text-lg">
                  {activeHouseModal.fullName}
                </h4>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
                onClick={() => setActiveHouseModal(null)}
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-300">
              {activeHouseModal.desc}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                Équipes actuellement à cette étape :
              </h5>
              <div className="flex flex-wrap gap-2">
                {teamsState.filter((t) => (t.currentStage || 1) === activeHouseModal.num).length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    Aucune équipe pour le moment.
                  </span>
                ) : (
                  teamsState
                    .filter((t) => (t.currentStage || 1) === activeHouseModal.num)
                    .map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs font-semibold rounded-full"
                      >
                        👥 {t.groupName}
                      </span>
                    ))
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
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
