import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';

export default function ModalChangeScribe() {
  const {
    scribeModalTeamId,
    closeScribeModal,
    teams,
    refreshWorkshopData,
    showToast
  } = useWorkshop();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!scribeModalTeamId) return null;

  const currentTeam = teams.find((t) => t.id === scribeModalTeamId);
  if (!currentTeam) return null;

  const members = currentTeam.members || [];

  const handleConfirm = async () => {
    const targetId = selectedMemberId || currentTeam.scribe_participant_id || (members[0]?.id);
    if (!targetId) {
      showToast('Veuillez sélectionner un membre.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${currentTeam.id}/scribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: targetId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de rédacteur');

      showToast('✍️ Nouveau Porteur de stylo désigné avec succès !', 'success');
      await refreshWorkshopData();
      closeScribeModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop active" onClick={closeScribeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">✍️</span>
            <h3 className="modal-title">Désigner le Porteur de Stylo (Rédacteur Unique)</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeScribeModal}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Équipe : <strong style={{ color: currentTeam.color }}>{currentTeam.name}</strong>
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Seul le porteur de stylo dispose des droits d'écriture sur les livrables des 6 Maisons. Les autres membres sont en mode consultation active (Conseillers).
          </p>

          {members.length === 0 ? (
            <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>
              Aucun membre inscrit dans ce groupe pour le moment.
            </div>
          ) : (
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                Choisir le nouveau rédacteur parmi les membres :
              </label>
              <select
                className="input-field"
                value={selectedMemberId || currentTeam.scribe_participant_id || ''}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ width: '100%' }}
              >
                {members.map((m) => {
                  const isCurrent = m.id === currentTeam.scribe_participant_id || m.is_scribe;
                  return (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} {isCurrent ? '(Actuel porteur de stylo ✍️)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeScribeModal} disabled={loading}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading || members.length === 0}
          >
            {loading ? 'Mise à jour...' : 'Confirmer la Désignation ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
