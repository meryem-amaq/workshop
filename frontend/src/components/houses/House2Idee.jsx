import React from 'react';

export default function House2Idee({
  data,
  onChange,
  canEdit,
  scribeName,
  onSaveDraft,
  onSaveDeliverable,
  onPrevHouse
}) {
  return (
    <div className="house-step-content">
      {/* 1. Guide Pédagogique & Mission (Lecture seule) */}
      <div className="house-pedagogical-grid">
        <div className="house-guide-card">
          <div className="house-mission-title">✨ MISSION DE L'ÉQUIPE</div>
          <div className="house-mission-heading">
            Transformer le besoin identifié en idée de solution IoT pertinente et connectée.
          </div>
          <p className="house-mission-desc">
            Définir la promesse de valeur : que va capter, traiter et déclencher l'objet intelligent ?
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>Que va faire concrètement le produit ?</li>
            <li>Que va-t-il mesurer ou détecter ? (Grandeur physique : humidité, son, présence...)</li>
            <li>Que va-t-il automatiser ? (Actionneur : pompe, alerte, moteur, LED...)</li>
            <li>Quelle information va-t-il transmettre et à qui ?</li>
          </ul>
        </div>
      </div>


      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 2 (Idée IoT) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            Concept de la Solution IoT & Valeur pour l'Usager :
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={data.actions || ''}
            onChange={(e) => onChange('actions', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 2...&#10;Exemple : « Un boîtier connecté solaire qui mesure l'humidité du sol et la température au pied des plants, et déclenche une micro-irrigation automatique tout en alertant le maraîcher par notification. »"
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={onPrevHouse}>
            ← Maison précédente
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canEdit}
              onClick={() => onSaveDraft(2)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(2)}
            >
              {canEdit ? 'Valider la Maison 2 et Passer à la Faisabilité ➔' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
