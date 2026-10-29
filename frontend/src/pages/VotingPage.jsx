import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';

const QUICK_SCORES = [10, 12, 14, 15, 16, 17, 18, 19, 20];

export default function VotingPage() {
  const { teams, votes, currentUser, isAdmin, refreshWorkshopData, showToast } = useWorkshop();
  const navigate = useNavigate();

  // Déterminer l'équipe du participant connecté (s'il n'est pas admin)
  const participantTeam = useMemo(() => {
    if (isAdmin || !currentUser) return null;
    return (
      teams.find((t) => t.id === currentUser.team_id) ||
      teams.find((t) => (t.members || []).some((m) => m.id === currentUser.id)) ||
      null
    );
  }, [isAdmin, currentUser, teams]);

  // Équipe votante sélectionnée (l'admin peut choisir n'importe quelle équipe ; un participant vote uniquement pour le compte de son équipe)
  const [voterTeamId, setVoterTeamId] = useState('');
  const [draftScores, setDraftScores] = useState({});
  const [draftComments, setDraftComments] = useState({});
  const [savingTargetId, setSavingTargetId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (!isAdmin && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAdmin, currentUser, navigate]);

  // Initialiser l'équipe votante par défaut
  useEffect(() => {
    if (!isAdmin && participantTeam) {
      setVoterTeamId(participantTeam.id);
    } else if (isAdmin && teams.length > 0 && (!voterTeamId || !teams.some((t) => t.id === voterTeamId))) {
      setVoterTeamId(teams[0].id);
    }
  }, [isAdmin, participantTeam, teams, voterTeamId]);

  // Synchroniser les notes brouillons avec les votes enregistrés de l'équipe votante active
  useEffect(() => {
    if (!voterTeamId) return;
    const nextScores = {};
    const nextComments = {};
    teams.forEach((t) => {
      if (t.id === voterTeamId) return;
      const existing = (votes || []).find(
        (v) => v.voter_team_id === voterTeamId && v.target_team_id === t.id
      );
      if (existing) {
        nextScores[t.id] = existing.score;
        nextComments[t.id] = existing.comment || '';
      } else {
        nextScores[t.id] = '';
        nextComments[t.id] = '';
      }
    });
    setDraftScores(nextScores);
    setDraftComments(nextComments);
  }, [voterTeamId, votes, teams]);

  const selectedVoterTeam = teams.find((t) => t.id === voterTeamId) || null;
  const otherTeams = useMemo(
    () => teams.filter((t) => t.id !== voterTeamId),
    [teams, voterTeamId]
  );

  // Calcul du Classement Final sur 20 pour chaque équipe
  const rankings = useMemo(() => {
    const computed = teams.map((team) => {
      // Votes reçus par cette équipe (provenant uniquement des AUTRES équipes)
      const receivedVotes = (votes || []).filter(
        (v) => v.target_team_id === team.id && v.voter_team_id !== team.id
      );
      const votesCount = receivedVotes.length;
      const maxExpectedVotes = Math.max(0, teams.length - 1);
      const totalPoints = receivedVotes.reduce((sum, v) => sum + (Number(v.score) || 0), 0);
      const avgScore = votesCount > 0 ? totalPoints / votesCount : 0;

      // Votes émis par cette équipe vers les autres équipes
      const givenVotesCount = (votes || []).filter(
        (v) => v.voter_team_id === team.id && v.target_team_id !== team.id
      ).length;

      return {
        ...team,
        receivedVotes,
        votesCount,
        maxExpectedVotes,
        totalPoints,
        avgScore,
        givenVotesCount
      };
    });

    return computed.sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.votesCount - a.votesCount;
    });
  }, [teams, votes]);

  const totalPossibleVotes = teams.length > 1 ? teams.length * (teams.length - 1) : 0;
  const totalCastVotes = (votes || []).filter((v) => v.voter_team_id !== v.target_team_id).length;
  const leaderTeam = rankings.find((r) => r.votesCount > 0) || null;

  const handleScoreChange = (targetTeamId, rawValue) => {
    if (rawValue === '') {
      setDraftScores((prev) => ({ ...prev, [targetTeamId]: '' }));
      return;
    }
    const num = Math.max(0, Math.min(20, Number(rawValue)));
    if (!Number.isNaN(num)) {
      setDraftScores((prev) => ({ ...prev, [targetTeamId]: num }));
    }
  };

  // Enregistrer le vote pour une seule équipe cible
  const handleSaveSingleVote = async (targetTeam) => {
    if (!voterTeamId) return;
    const scoreVal = draftScores[targetTeam.id];
    if (scoreVal === '' || scoreVal === undefined || scoreVal === null || Number.isNaN(Number(scoreVal))) {
      showToast(`⚠️ Veuillez attribuer une note entre 0 et 20 pour « ${targetTeam.name} ».`, 'warning');
      return;
    }

    setSavingTargetId(targetTeam.id);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_team_id: voterTeamId,
          target_team_id: targetTeam.id,
          score: Number(scoreVal),
          comment: draftComments[targetTeam.id] || ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement du vote.');
      showToast(`🗳️ Note de ${Number(scoreVal)}/20 attribuée à « ${targetTeam.name} » !`, 'success');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingTargetId(null);
    }
  };

  // Enregistrer tous les votes remplis par l'équipe votante active
  const handleSaveAllVotesForTeam = async () => {
    if (!voterTeamId || !selectedVoterTeam) return;
    const payloadVotes = otherTeams
      .filter((t) => draftScores[t.id] !== '' && draftScores[t.id] !== undefined && draftScores[t.id] !== null)
      .map((t) => ({
        target_team_id: t.id,
        score: Number(draftScores[t.id]),
        comment: draftComments[t.id] || ''
      }));

    if (payloadVotes.length === 0) {
      showToast('⚠️ Veuillez saisir au moins une note sur 20 avant de valider.', 'warning');
      return;
    }

    setSavingAll(true);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_team_id: voterTeamId,
          votes: payloadVotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement des votes.');
      showToast(
        `✅ Les votes (${payloadVotes.length}/${otherTeams.length}) de « ${selectedVoterTeam.name} » ont été enregistrés !`,
        'success'
      );
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingAll(false);
    }
  };

  // Réinitialiser tous les votes (Super Admin uniquement)
  const handleResetVotes = async () => {
    if (!isAdmin) return;
    if (!window.confirm('Voulez-vous vraiment remettre à zéro tous les votes inter-équipes ?')) {
      return;
    }
    try {
      const res = await fetch('/api/votes/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Erreur lors de la réinitialisation des votes.');
      showToast('🔄 Tous les votes ont été réinitialisés.', 'info');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  if (teams.length < 2) {
    return (
      <div className="view-panel active">
        <div className="dashboard-container">
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '14px',
              border: '1px dashed var(--border-glass)'
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🏆</span>
            <h4 style={{ color: '#fff', marginBottom: '0.4rem', fontSize: '1.15rem' }}>
              Au moins 2 équipes sont requises pour le vote sur 20
            </h4>
            <p style={{ fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
              Constituez d'abord les groupes dans l'onglet Lancement des Groupes afin que chaque équipe puisse évaluer les autres équipes sur 20.
            </p>
            {isAdmin && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/launch')}>
                👥 Aller au Lancement des Groupes
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-panel active">
      <div className="restitution-container">
        {/* Barre d'en-tête */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏆 Vote Inter-Équipes (/20) & Résultat Final</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Chaque équipe attribue une note sur <strong>20</strong> à chacune des autres équipes. Le classement final est calculé en temps réel.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {!isAdmin && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/team')}
              >
                ← Espace Équipe
              </button>
            )}
            <button type="button" className="btn btn-outline btn-sm" onClick={handleToggleFullscreen}>
              🖥️ Plein Écran
            </button>
            {isAdmin && totalCastVotes > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResetVotes}
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.08)'
                }}
              >
                🔄 Réinitialiser les Votes
              </button>
            )}
          </div>
        </div>

        {/* Bandeau KPI du Vote */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '14px',
              padding: '1rem 1.25rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Équipes en compétition
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              {teams.length} Équipes
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Chaque groupe note {teams.length - 1} autre{teams.length - 1 > 1 ? 's' : ''} groupe{teams.length - 1 > 1 ? 's' : ''}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '14px',
              padding: '1rem 1.25rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Progression des Votes
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
              {totalCastVotes} / {totalPossibleVotes}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {totalCastVotes === totalPossibleVotes && totalPossibleVotes > 0
                ? '✓ Tous les groupes ont voté !'
                : `${totalPossibleVotes - totalCastVotes} vote(s) restant(s)`}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '14px',
              padding: '1rem 1.25rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
              🥇 1ère Place Actuelle
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                marginTop: '6px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {leaderTeam ? leaderTeam.name : 'En attente des votes'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fde047', fontWeight: 700 }}>
              {leaderTeam
                ? `Moyenne : ${leaderTeam.avgScore.toFixed(2)} / 20 (${leaderTeam.totalPoints.toFixed(1)} pts)`
                : 'Aucune note enregistrée'}
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 1 : CLASSEMENT FINAL & PODIUM (/20)
           ============================================================ */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.85rem'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆 Résultat Final & Classement des Équipes (Note sur /20)</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Classement calculé automatiquement selon la moyenne des notes sur 20 reçues de la part des autres équipes.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {rankings.map((team, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1 && team.votesCount > 0;
              const isSecond = rank === 2 && team.votesCount > 0;
              const isThird = rank === 3 && team.votesCount > 0;

              const rankBadge =
                rank === 1 ? '🥇 1er' : rank === 2 ? '🥈 2ème' : rank === 3 ? '🥉 3ème' : `#${rank}`;

              const borderColor = isFirst
                ? 'rgba(251, 191, 36, 0.65)'
                : isSecond
                ? 'rgba(203, 213, 225, 0.45)'
                : isThird
                ? 'rgba(217, 119, 6, 0.45)'
                : 'rgba(255, 255, 255, 0.08)';

              const scorePercent = Math.min(100, Math.max(0, (team.avgScore / 20) * 100));

              return (
                <div
                  key={team.id}
                  style={{
                    background: isFirst
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    {/* Gauche : Rang + Avatar + Nom Équipe */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: '220px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '68px',
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontWeight: 900,
                          fontSize: '0.88rem',
                          background: isFirst
                            ? 'rgba(251, 191, 36, 0.22)'
                            : isSecond
                            ? 'rgba(203, 213, 225, 0.16)'
                            : isThird
                            ? 'rgba(217, 119, 6, 0.2)'
                            : 'rgba(255, 255, 255, 0.06)',
                          color: isFirst ? '#fde047' : isSecond ? '#e2e8f0' : isThird ? '#fbbf24' : '#94a3b8',
                          border: `1px solid ${borderColor}`
                        }}
                      >
                        {rankBadge}
                      </span>

                      <img
                        src={`/assets/images/${team.avatar}`}
                        alt={team.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${team.color || '#38bdf8'}`
                        }}
                      />

                      <div>
                        <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#fff' }}>
                          {team.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Profil : <strong style={{ color: team.color || '#38bdf8' }}>{getArchetypeDisplayName(team.archetype)}</strong>
                          {' • '}
                          {(team.members || []).map((m) => `${m.first_name} ${m.last_name}`).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Droite : Moyenne /20 + Total Points */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                          Votes reçus
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#cbd5e1' }}>
                          {team.votesCount} / {team.maxExpectedVotes} équipe{team.maxExpectedVotes > 1 ? 's' : ''}
                          {' • '}
                          <span style={{ color: '#38bdf8' }}>
                            Total : {team.totalPoints.toFixed(1)} / {team.maxExpectedVotes * 20} pts
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: team.votesCount > 0 ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${team.votesCount > 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                          padding: '8px 16px',
                          borderRadius: '12px',
                          minWidth: '125px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Moyenne Finale
                        </div>
                        <div
                          style={{
                            fontSize: '1.45rem',
                            fontWeight: 900,
                            color: isFirst ? '#fde047' : team.votesCount > 0 ? '#38bdf8' : '#64748b'
                          }}
                        >
                          {team.votesCount > 0 ? `${team.avgScore.toFixed(2)} / 20` : '— / 20'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression sur 20 */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${scorePercent}%`,
                        height: '100%',
                        background: isFirst
                          ? 'linear-gradient(90deg, #f59e0b, #fde047)'
                          : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {/* Détail des notes reçues des autres équipes */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      Notes attribuées par les autres équipes :
                    </span>
                    {teams
                      .filter((other) => other.id !== team.id)
                      .map((other) => {
                        const voteObj = team.receivedVotes.find((v) => v.voter_team_id === other.id);
                        return (
                          <span
                            key={other.id}
                            title={voteObj?.comment ? `Commentaire de ${other.name} : ${voteObj.comment}` : ''}
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              background: voteObj ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                              border: `1px solid ${voteObj ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                              color: voteObj ? '#34d399' : '#64748b',
                              fontWeight: voteObj ? 700 : 500
                            }}
                          >
                            {other.name} :{' '}
                            {voteObj ? `${Number(voteObj.score).toFixed(1).replace(/\.0$/, '')}/20` : 'En attente'}
                          </span>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            SECTION 2 : ESPACE DE VOTE PAR ÉQUIPE (CHAQUE ÉQUIPE VOTE POUR LES AUTRES SUR /20)
           ============================================================ */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗳️ Saisie des Votes sur 20 par Équipe</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#94a3b8' }}>
                {isAdmin
                  ? 'Sélectionnez l\'équipe qui vote ci-dessous, puis attribuez sa note sur 20 à chacune des autres équipes.'
                  : `Vous votez au nom de votre équipe « ${selectedVoterTeam?.name || ''} ». Attribuez une note sur 20 à chaque autre équipe.`}
              </p>
            </div>

            {selectedVoterTeam && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={savingAll}
                onClick={handleSaveAllVotesForTeam}
              >
                {savingAll
                  ? '⏳ Enregistrement...'
                  : `✅ Enregistrer tous les votes de « ${selectedVoterTeam.name} »`}
              </button>
            )}
          </div>

          {/* Sélecteur de l'équipe qui vote (Onglets pour Super Admin) */}
          {isAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                1. Choisir l'équipe qui vote (Équipe Votante) :
              </div>
              <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                {teams.map((t) => {
                  const givenCount = (votes || []).filter(
                    (v) => v.voter_team_id === t.id && v.target_team_id !== t.id
                  ).length;
                  const expected = Math.max(0, teams.length - 1);
                  const isComplete = givenCount >= expected && expected > 0;
                  const isSelected = voterTeamId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setVoterTeamId(t.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      <span>🗳️ {t.name}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: isComplete ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                          color: isComplete ? '#34d399' : '#cbd5e1',
                          fontWeight: 700
                        }}
                      >
                        {isComplete ? `✓ ${givenCount}/${expected}` : `${givenCount}/${expected}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cartes de notation des AUTRES équipes (l'équipe votante ne peut pas voter pour elle-même) */}
          {selectedVoterTeam && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                2. Notes sur /20 attribuées par « <span style={{ color: '#fff' }}>{selectedVoterTeam.name}</span> » aux {otherTeams.length} autres équipes :
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.1rem'
                }}
              >
                {otherTeams.map((targetTeam) => {
                  const savedVote = (votes || []).find(
                    (v) => v.voter_team_id === voterTeamId && v.target_team_id === targetTeam.id
                  );
                  const currentVal = draftScores[targetTeam.id] !== undefined ? draftScores[targetTeam.id] : '';
                  const d2 = (targetTeam.deliverables || []).find((d) => d.house_number === 2)?.content || {};
                  const d6 = (targetTeam.deliverables || []).find((d) => d.house_number === 6)?.content || {};
                  const projectSummary =
                    d2.conceptName || d6.pitchScript || d2.actions || 'Projet IoT présenté lors du pitch';

                  return (
                    <div
                      key={targetTeam.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: savedVote
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.9rem'
                      }}
                    >
                      {/* En-tête de l'équipe évaluée */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={`/assets/images/${targetTeam.avatar}`}
                            alt={targetTeam.name}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `2px solid ${targetTeam.color || '#38bdf8'}`
                            }}
                          />
                          <div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>
                              {targetTeam.name}
                            </h4>
                            <span style={{ fontSize: '0.76rem', color: targetTeam.color || '#38bdf8', fontWeight: 700 }}>
                              {getArchetypeDisplayName(targetTeam.archetype)}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            background: savedVote ? 'rgba(16, 185, 129, 0.18)' : 'rgba(251, 191, 36, 0.14)',
                            color: savedVote ? '#34d399' : '#fbbf24',
                            fontWeight: 700
                          }}
                        >
                          {savedVote ? `✓ Noté (${savedVote.score}/20)` : 'À noter'}
                        </span>
                      </div>

                      {/* Rappel synthétique du projet de l'équipe évaluée */}
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#94a3b8',
                          background: 'rgba(0, 0, 0, 0.25)',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${targetTeam.color || '#38bdf8'}`
                        }}
                      >
                        <strong style={{ color: '#cbd5e1' }}>Projet / Pitch :</strong>{' '}
                        {String(projectSummary).slice(0, 110)}
                        {String(projectSummary).length > 110 ? '…' : ''}
                      </div>

                      {/* Contrôle de la note sur 20 */}
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.45rem'
                          }}
                        >
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>
                            Note attribuée sur 20 :
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              placeholder="0-20"
                              value={currentVal}
                              onChange={(e) => handleScoreChange(targetTeam.id, e.target.value)}
                              style={{
                                width: '74px',
                                padding: '5px 8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(56, 189, 248, 0.5)',
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: '#38bdf8',
                                fontSize: '1.05rem',
                                fontWeight: 900,
                                textAlign: 'center'
                              }}
                            />
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#94a3b8' }}>/ 20</span>
                          </div>
                        </div>

                        {/* Curseur (Slider 0 à 20) */}
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={currentVal === '' ? 10 : Number(currentVal)}
                          onChange={(e) => handleScoreChange(targetTeam.id, e.target.value)}
                          style={{
                            width: '100%',
                            accentColor: '#38bdf8',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                          }}
                        />

                        {/* Boutons de sélection rapide sur 20 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {QUICK_SCORES.map((q) => {
                            const active = Number(currentVal) === q && currentVal !== '';
                            return (
                              <button
                                key={q}
                                type="button"
                                onClick={() => handleScoreChange(targetTeam.id, q)}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '0.73rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  border: active
                                    ? '1px solid #38bdf8'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                  background: active ? '#0284c7' : 'rgba(255, 255, 255, 0.04)',
                                  color: active ? '#fff' : '#cbd5e1'
                                }}
                              >
                                {q}/20
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Commentaire optionnel + Bouton Valider */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        <input
                          type="text"
                          placeholder="Appréciation (optionnel)..."
                          value={draftComments[targetTeam.id] || ''}
                          onChange={(e) =>
                            setDraftComments((prev) => ({ ...prev, [targetTeam.id]: e.target.value }))
                          }
                          style={{
                            flex: 1,
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(15, 23, 42, 0.7)',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          disabled={savingTargetId === targetTeam.id}
                          onClick={() => handleSaveSingleVote(targetTeam)}
                          style={{ whiteSpace: 'nowrap', padding: '7px 12px' }}
                        >
                          {savingTargetId === targetTeam.id ? '...' : '💾 Valider'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            SECTION 3 : MATRICE CROISÉE DES VOTES (/20) (VUE SUPER ADMIN)
           ============================================================ */}
        {isAdmin && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              overflowX: 'auto'
            }}
          >
            <h3 style={{ margin: '0 0 0.35rem', color: '#fff', fontSize: '1.15rem' }}>
              📊 Matrice Croisée des Votes (/20)
            </h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              Lecture : chaque <strong>ligne</strong> représente l'équipe qui vote, et chaque <strong>colonne</strong> représente l'équipe qui reçoit la note sur 20.
            </p>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
                minWidth: '580px'
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'center' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8' }}>
                    Équipe Votante ↓ \ Équipe Notée →
                  </th>
                  {teams.map((target) => (
                    <th key={target.id} style={{ padding: '10px 12px', color: '#fff', fontWeight: 700 }}>
                      {target.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((voter) => (
                  <tr key={voter.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#cbd5e1' }}>
                      🗳️ {voter.name}
                    </td>
                    {teams.map((target) => {
                      if (voter.id === target.id) {
                        return (
                          <td
                            key={target.id}
                            style={{
                              padding: '10px 12px',
                              textAlign: 'center',
                              color: '#475569',
                              background: 'rgba(255, 255, 255, 0.02)'
                            }}
                          >
                            —
                          </td>
                        );
                      }
                      const vObj = (votes || []).find(
                        (v) => v.voter_team_id === voter.id && v.target_team_id === target.id
                      );
                      return (
                        <td
                          key={target.id}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            fontWeight: vObj ? 800 : 400,
                            color: vObj ? '#34d399' : '#64748b'
                          }}
                        >
                          {vObj ? `${Number(vObj.score).toFixed(1).replace(/\.0$/, '')} / 20` : 'En attente'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    borderTop: '2px solid rgba(56, 189, 248, 0.35)',
                    background: 'rgba(2, 132, 199, 0.1)'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 900, color: '#38bdf8' }}>
                    🏆 MOYENNE FINALE (/20)
                  </td>
                  {teams.map((target) => {
                    const r = rankings.find((rk) => rk.id === target.id);
                    return (
                      <td
                        key={target.id}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.98rem',
                          color: r && r.votesCount > 0 ? '#fde047' : '#64748b'
                        }}
                      >
                        {r && r.votesCount > 0 ? `${r.avgScore.toFixed(2)} / 20` : '— / 20'}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
