import React from 'react';

export default function House4Prototype({
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
            Passer de l'idée à une première représentation concrète et tangible du produit.
          </div>
          <p className="house-mission-desc">
            Matérialiser la forme, l'ergonomie et le fonctionnement conceptuel sans matériel complexe requis.
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>À quoi ressemble le produit ? (Dimensions, forme, matériaux, boutons)</li>
            <li>Comment fonctionne-t-il dans les mains de l'utilisateur ?</li>
            <li>Quels composants logent à l'intérieur du boîtier ?</li>
            <li>Comment le prototype est-il fabriqué ? (Carton, maquette Figma, schéma Tinkercad, impression 3D)</li>
          </ul>
        </div>
      </div>


      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 4 (Prototype) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            Descriptif du Prototype & Scénario de Test :
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={data.testProtocol || ''}
            onChange={(e) => onChange('testProtocol', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 4...&#10;Exemple : Maquette en carton échelle 1:1 du boîtier étanche IP65 avec pointeau de terre amovible, voyant LED d'état tricolore et bouton d'appairage."
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
              onClick={() => onSaveDraft(4)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(4)}
            >
              {canEdit ? 'Valider la Maison 4 et Passer au Business ➔' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
