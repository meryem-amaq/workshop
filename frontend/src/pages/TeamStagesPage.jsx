import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';

export default function TeamStagesPage() {
  const { teams, setActiveTeamId, refreshWorkshopData } = useWorkshop();
  const navigate = useNavigate();
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  const houseDefs = [
    { num: 1, title: 'Maison 1 : Définition du Problème', pct: '16%', icon: '🛖', desc: 'Utilisateur cible, problème identifié, cause racine et formulation canonique.' },
    { num: 2, title: "Maison 2 : Idée d'Objet Connecté (IoT)", pct: '33%', icon: '💡', desc: 'Concept, grandeurs mesurées, connectivité et actionneurs physiques.' },
    { num: 3, title: 'Maison 3 : Faisabilité & Architecture', pct: '50%', icon: '⚙️', desc: 'Capteurs, microcontrôleur, protocole réseau et restitution Cloud.' },
    { num: 4, title: 'Maison 4 : Prototype & Scénario', pct: '66%', icon: '🔌', desc: 'Maquette physique, protocole de test et scénario d\'usage utilisateur.' },
    { num: 5, title: 'Maison 5 : Business Model Canvas (BMC)', pct: '83%', icon: '📊', desc: 'Matrice économique en 9 blocs démontrant la viabilité du projet.' },
    { num: 6, title: 'Maison 6 : Marché & Pitch Final 180s', pct: '100%', icon: '🏆', desc: 'Go-to-market, métriques à 12 mois et pitch oral de 3 minutes chrono.' }
  ];

  const teamsToShow = selectedTeamFilter === 'all' ? teams : teams.filter((t) => t.id === selectedTeamFilter);

  return (
    <div className="view-panel active">
      <div className="dashboard-container">
        
        {/* En-tête de la vue Suivi 6 Maisons */}
        <div className="animator-control-bar">
          <div className="control-bar-left">
            <div className="animator-badge">📋 Suivi Détaillé des 6 Maisons par Équipe</div>
            <p className="control-bar-desc" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Consultez l'avancement jalon par jalon (Besoin, Idée, Faisabilité, Prototype, Business, Marché) et les livrables saisis en direct.
            </p>
          </div>
          <div className="control-bar-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={refreshWorkshopData}>
              🔄 Rafraîchir en Direct
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>
              🍄 Voir la Carte 3D
            </button>
          </div>
        </div>

        {/* Filtres par équipe */}
        <div className="restitution-filter-row" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-pill ${selectedTeamFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTeamFilter('all')}
          >
            Tous les Groupes ({teams.length})
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`filter-pill ${selectedTeamFilter === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTeamFilter(t.id)}
              style={{ borderLeft: `3px solid ${t.color}` }}
            >
              {t.name} (Maison {t.current_house}/6)
            </button>
          ))}
        </div>

        {/* Grille des Équipes & Décomposition des 6 Maisons */}
        <div className="stages-teams-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🍄</span>
              <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>Aucune équipe formée pour le moment</h4>
              <p style={{ fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                Pour suivre le détail des 6 Maisons par équipe, constituez d'abord les groupes dans l'onglet Lancement des Groupes.
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/launch')}>
                👥 Aller au Lancement des Groupes
              </button>
            </div>
          ) : (
            teamsToShow.map((team) => {
              const deliverables = team.deliverables || [];
              const scribeMember = (team.members || []).find((m) => m.id === team.scribe_participant_id || m.is_scribe) || team.scribe;
              const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

              return (
                <div
                  key={team.id}
                  className="stages-team-card"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '1.5rem'
                  }}
                >
                  {/* En-tête de l'équipe */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={`/assets/images/${team.avatar}`}
                        alt={team.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: `2px solid ${team.color}`
                        }}
                      />
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{team.name}</h3>
                        <div style={{ fontSize: '0.82rem', color: team.color, marginTop: '2px' }}>
                          {getArchetypeDisplayName(team.archetype)} • {(team.members || []).length} membres • ✍️ Rédacteur :{' '}
                          <strong style={{ color: '#fbbf24' }}>{scribeName}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#94a3b8' }}>Progression Village :</span>
                        <strong style={{ color: team.color }}>
                          {team.progress_percent}% (Maison {team.current_house}/6)
                        </strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${team.progress_percent}%`,
                            background: team.color,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Décomposition des 6 Maisons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {houseDefs.map((house) => {
                      const del = deliverables.find((d) => Number(d.house_number) === house.num);
                      const isCompleted = team.current_house > house.num || (del && del.status === 'validated');
                      const isCurrent = team.current_house === house.num;

                      let badge = null;
                      let cardBorder = 'rgba(255,255,255,0.06)';
                      let cardBg = 'rgba(0,0,0,0.2)';

                      if (isCompleted) {
                        badge = (
                          <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✅ Validé
                          </span>
                        );
                        cardBorder = 'rgba(16,185,129,0.3)';
                      } else if (isCurrent) {
                        badge = (
                          <span className="pulse-glow" style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ⏳ En cours
                          </span>
                        );
                        cardBorder = 'rgba(56,189,248,0.4)';
                        cardBg = 'rgba(56,189,248,0.04)';
                      } else {
                        badge = (
                          <span style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
                            🔒 À venir
                          </span>
                        );
                      }

                      let detailsPreview = null;
                      if (del && del.content) {
                        const c = del.content;
                        if (house.num === 1) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Cible :</strong> {c.targetUser || '—'}<br />
                              <strong>Problème :</strong> {c.problem || '—'}
                            </div>
                          );
                        } else if (house.num === 2) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Concept :</strong> {c.conceptName || '—'}<br />
                              <strong>Capteurs :</strong> {c.measures || '—'}
                            </div>
                          );
                        } else if (house.num === 3) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Capteurs :</strong> {c.sensors || '—'}<br />
                              <strong>Réseau :</strong> {c.protocol || '—'}
                            </div>
                          );
                        } else if (house.num === 4) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Maquette :</strong> {c.prototypeType || '—'}
                            </div>
                          );
                        } else if (house.num === 5) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Valeur :</strong> {c.value || '—'}
                            </div>
                          );
                        } else if (house.num === 6) {
                          detailsPreview = (
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                              <strong>Go-to-market :</strong> {c.launchPlan || '—'}
                            </div>
                          );
                        }
                      } else {
                        detailsPreview = (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.4rem' }}>
                            {isCompleted ? "Validé par l'équipe" : isCurrent ? 'Saisie en cours par le rédacteur...' : 'Étape verrouillée'}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={house.num}
                          style={{
                            background: cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '10px',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                                {house.icon} {house.title}
                              </span>
                              {badge}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>{house.desc}</p>
                            {detailsPreview}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '0.75rem',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid rgba(255,255,255,0.04)'
                            }}
                          >
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Jalon {house.pct}</span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              style={{ color: '#38bdf8', fontSize: '0.72rem' }}
                              onClick={() => {
                                setActiveTeamId(team.id);
                                navigate(`/team?house=${house.num}`);
                              }}
                            >
                              Ouvrir Maison ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
