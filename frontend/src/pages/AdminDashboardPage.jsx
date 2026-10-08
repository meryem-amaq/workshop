import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';

export default function AdminDashboardPage() {
  const {
    isAdmin,
    participants,
    teams,
    deliverables,
    openAdminModal,
    openQrModal,
    setActiveTeamId
  } = useWorkshop();

  const navigate = useNavigate();
  const [selectedHouseModal, setSelectedHouseModal] = useState(null);

  if (!isAdmin) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={{ color: '#fff', margin: '1rem 0' }}>Espace Animateur Réservé</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Veuillez renseigner votre code d'accès animateur pour accéder à la carte interactive 3D du Village.
          </p>
          <button type="button" className="btn btn-primary" onClick={openAdminModal}>
            Saisir le Code Animateur ➔
          </button>
        </div>
      </div>
    );
  }

  // Modale détails d'une maison
  const houseTitles = {
    1: 'Maison 1 : Définition du Besoin (16%)',
    2: 'Maison 2 : Concept Produit IoT (33%)',
    3: 'Maison 3 : Faisabilité & Architecture (50%)',
    4: 'Maison 4 : Prototype & Scénario (66%)',
    5: 'Maison 5 : Business Model Canvas (83%)',
    6: 'Maison 6 : Mini-Plan de Marché & Pitch (100%)'
  };

  const houseDescriptions = {
    1: "Identification de l'utilisateur cible et formulation canonique du problème à résoudre.",
    2: 'Formalisation de la valeur ajoutée du capteur et de la communication connectée.',
    3: 'Chaîne technique complète : Capteurs ➔ Microcontrôleur ➔ Réseau ➔ Cloud.',
    4: 'Maquette physique, ergonomie, protocole de test de validation et storyboard.',
    5: 'Matrice économique en 9 blocs (partenaires, proposition de valeur, flux de revenus...).',
    6: 'Go-to-market, métriques de succès à 12 mois et pitch oral de 3 minutes chrono.'
  };

  const handleOpenHouseModal = (num) => {
    setSelectedHouseModal(num);
  };

  const handleCloseHouseModal = () => {
    setSelectedHouseModal(null);
  };

  return (
    <div className="view-panel active">
      <div className="dashboard-container">
        
        {/* En-tête statistiques globales du Village (Carte Standalone) */}
        <div className="animator-control-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="control-bar-left">
            <div className="animator-badge">🍄 Carte 3D Interactive du Village IoT</div>
            <div className="live-stats">
              <span className="stat-item"><strong id="statParticipantsCount">{participants.length}</strong> Inscrits</span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong id="statTeamsCount">{teams.length}</strong> Équipes</span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong id="statDeliverablesCount">{deliverables.length}</strong> Livrables</span>
            </div>
          </div>

          <div className="control-bar-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/launch')}>
              👥 Gérer les Groupes
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/stages')}>
              📋 Voir Détail 6 Maisons
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openQrModal}>
              📱 QR Code
            </button>
          </div>
        </div>

        {/* CARTE VISUELLE DU VILLAGE DES SCHTROUMPFS - STANDALONE */}
        <div className="village-map-card">
          <div className="village-map-header">
            <div>
              <h2 className="village-map-title">La Carte Interactive du Village IoT</h2>
              <p className="village-map-desc">
                Suivez la progression des équipes à travers les 6 Maisons champignons en temps réel.
              </p>
            </div>
            <div className="village-legend">
              <span className="legend-dot art"></span> Artistes
              <span className="legend-dot prof"></span> Savants
              <span className="legend-dot crit"></span> Rigoureux
              <span className="legend-dot emp"></span> Solidaires
              <span className="legend-dot sprt"></span> Bâtisseurs
            </div>
          </div>

          {/* L'arène visuelle 3D du Village */}
          <div className="village-arena" id="villageArena">
            <img
              src="/assets/images/village-banner.jpg"
              alt="Village des Schtroumpfs"
              className="village-bg-img"
              id="villageBgImg"
            />

            {/* Chemin SVG lumineux reliant les 6 maisons */}
            <svg className="village-trail-svg" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                id="villageTrailPath"
                d="M 120 480 Q 250 280 320 200 T 520 380 T 700 180 T 890 350 T 1080 180"
                fill="none"
                stroke="url(#trailGradient)"
                strokeWidth="8"
                strokeDasharray="12 8"
                filter="url(#glowEffect)"
              />
            </svg>

            {/* Les 6 Maisons Champignons positionnées sur la carte */}
            {[
              { num: 1, pct: '16%', icon: '🛖', name: 'Besoin' },
              { num: 2, pct: '33%', icon: '💡', name: 'Idée IoT' },
              { num: 3, pct: '50%', icon: '⚙️', name: 'Faisabilité' },
              { num: 4, pct: '66%', icon: '🔌', name: 'Prototype' },
              { num: 5, pct: '83%', icon: '📊', name: 'Business' },
              { num: 6, pct: '100%', icon: '🏆', name: 'Marché & Pitch', isVictory: true }
            ].map((h) => {
              const teamsInHouse = teams.filter((t) => t.current_house === h.num);

              return (
                <div
                  key={h.num}
                  className={`village-house-node house-${h.num}`}
                  data-house={h.num}
                  onClick={() => handleOpenHouseModal(h.num)}
                >
                  <div className={`house-pin-head ${h.isVictory ? 'victory' : ''}`}>
                    <span className="house-pin-pct">{h.pct}</span>
                    <span className="house-pin-icon">{h.icon}</span>
                  </div>
                  <div className={`house-card-tag ${h.isVictory ? 'victory' : ''}`}>
                    <span className="house-tag-num">Maison {h.num}</span>
                    <span className="house-tag-title">{h.name}</span>
                  </div>
                  <div className="house-teams-dock" id={`dock-house-${h.num}`}>
                    {teamsInHouse.map((team) => (
                      <div
                        key={team.id}
                        className="team-avatar-token"
                        title={`${team.name} (${getArchetypeDisplayName(team.archetype)}) - Progression : ${team.progress_percent}%`}
                        style={{ borderColor: team.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTeamId(team.id);
                          navigate('/team');
                        }}
                      >
                        <img
                          src={`/assets/images/${team.avatar}`}
                          alt={team.name}
                          className="token-img"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modale d'inspection d'une Maison */}
      {selectedHouseModal && (
        <div className="modal-backdrop active" onClick={handleCloseHouseModal}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{houseTitles[selectedHouseModal]}</h3>
              <button type="button" className="modal-close" onClick={handleCloseHouseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {houseDescriptions[selectedHouseModal]}
              </p>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#38bdf8' }}>
                Équipes actuellement dans cette maison (
                {teams.filter((t) => t.current_house === selectedHouseModal).length}) :
              </h4>

              {teams.filter((t) => t.current_house === selectedHouseModal).length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Aucune équipe n'est arrêtée dans cette maison actuellement.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {teams
                    .filter((t) => t.current_house === selectedHouseModal)
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={`/assets/images/${t.avatar}`}
                            alt={t.name}
                            style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{t.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {getArchetypeDisplayName(t.archetype)} • Rédacteur :{' '}
                              {t.scribe ? `${t.scribe.first_name} ${t.scribe.last_name}` : 'Défaut'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => {
                            setActiveTeamId(t.id);
                            navigate('/team');
                          }}
                        >
                          Consulter la saisie ➔
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseHouseModal}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
