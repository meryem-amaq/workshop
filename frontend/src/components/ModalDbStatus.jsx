import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';

export default function ModalDbStatus() {
  const { isDbModalOpen, closeDbModal, dbHealth } = useWorkshop();

  if (!isDbModalOpen) return null;

  const h = dbHealth || {
    isMySQL: false,
    message: 'Chargement du statut...',
    config: { host: '127.0.0.1', port: 3306, database: 'smurf_iot_village', user: 'root' }
  };

  return (
    <div className="modal-backdrop active" onClick={closeDbModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">📡</span>
            <h3 className="modal-title">Statut Base de Données & Réseau</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeDbModal}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Statut :</strong>{' '}
              <span style={{ color: h.isMySQL ? '#34d399' : '#fbbf24', fontWeight: 'bold' }}>
                {h.message}
              </span>
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Hôte :</strong> {h.config?.host}:{h.config?.port}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Base :</strong> {h.config?.database}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Utilisateur :</strong> {h.config?.user}
            </p>
            <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.75rem 0' }} />
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {h.isMySQL
                ? 'Toutes les écritures (participants, profils Schtroumpfs, équipes, livrables des 6 Maisons) sont persistées en direct dans les tables MySQL.'
                : 'Mode autonome actif avec persistance sécurisée JSON locale. Vos données sont préservées.'}
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={closeDbModal}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
