import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';

export default function ModalAdminAuth() {
  const { isAdminModalOpen, closeAdminModal, setAdminMode } = useWorkshop();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    if (cleanPin === 'admin' || cleanPin === '1234' || cleanPin === 'animateur') {
      setAdminMode(true);
      setError(false);
      setPin('');
      closeAdminModal();
      if (['/', '/register', '/quiz', '/waiting'].includes(location.pathname)) {
        navigate('/admin');
      }
    } else {
      setError(true);
    }
  };

  return (
    <div className="modal-backdrop active" onClick={closeAdminModal}>
      <div className="modal-card modal-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">👑</span>
            <h3 className="modal-title">Espace Animateur du Workshop</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeAdminModal}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc" style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Cet espace est strictement réservé à l'équipe pédagogique et aux animateurs pour superviser les groupes, changer le porteur de stylo et piloter les livrables.
            </p>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="adminPinInput" style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                Code d'accès / Mot de passe :
              </label>
              <input
                id="adminPinInput"
                type="password"
                className="input-field"
                placeholder="Ex : admin"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                autoFocus
                style={{ width: '100%' }}
              />
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  ❌ Code incorrect. Essayez <code>admin</code> ou <code>1234</code>.
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              💡 Code par défaut de l'atelier : <strong>admin</strong>
            </div>
          </div>
          
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={closeAdminModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Déverrouiller le Pupitre ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
