import React from 'react';

export default function House5Business({
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
            Transformer le prototype en projet entrepreneurial viable et structuré.
          </div>
          <p className="house-mission-desc">
            Construire le Business Model Canvas (BMC) simplifié en 9 blocs stratégiques.
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>1. Clients : Qui va acheter ? (Segments précis, B2B ou B2C)</li>
            <li>2. Proposition de valeur : Quel problème résolvons-nous mieux que quiconque ?</li>
            <li>3. Canaux : Comment toucher nos clients ?</li>
            <li>4. Relation client : Comment fidéliser et assister nos utilisateurs ?</li>
          </ul>
        </div>
      </div>

      {/* PARTIE 1 — EXPLICATION PÉDAGOGIQUE */}
      <div className="house-guide-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.2rem' }}>
          PARTIE 1 — EXPLICATION PÉDAGOGIQUE
        </div>
        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📐 Les 9 Blocs du Business Model Canvas
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 0.85rem 0' }}>
          Découvrez et maîtrisez les 9 composantes stratégiques indispensables à la viabilité de votre projet IoT.
        </p>

        <div className="house-bmc-grid" style={{ gap: '0.6rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>1. CLIENTS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Qui va acheter ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#38bdf8' }}>2. PROPOSITION DE VALEUR</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Quel problème résolvons-nous ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>3. CANAUX</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Comment atteindre les clients ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>4. RELATION CLIENT</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Comment accompagner les utilisateurs ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>5. REVENUS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Comment gagner de l'argent ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>6. RESSOURCES CLÉS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>De quoi avons-nous besoin ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>7. ACTIVITÉS CLÉS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Que devons-nous faire ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24' }}>8. PARTENAIRES CLÉS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Avec qui travailler ?</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444' }}>9. COÛTS</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Quelles sont les principales dépenses ?</div>
          </div>
        </div>
      </div>

      {/* PARTIE 2 — TRAVAIL DE L'ÉQUIPE : SAISIE DES 9 BLOCS */}
      <div className="house-guide-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.2rem' }}>
          PARTIE 2 — TRAVAIL DE L'ÉQUIPE
        </div>
        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Complétez les 9 blocs de votre Business Model Canvas
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1rem 0' }}>
          Saisissez les réponses de votre équipe pour chaque bloc ci-dessous. Vos réponses sont sauvegardées automatiquement.
        </p>

        <div className="house-bmc-grid">
          {/* 1. Clients */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>1. Clients</strong><br />Qui va acheter ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcSegments || ''}
              onChange={(e) => onChange('bmcSegments', e.target.value)}
              placeholder="Votre réponse pour clients..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 2. Proposition de valeur */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.3rem', fontWeight: 'bold' }}>
              <strong>2. Proposition de valeur</strong><br />Quel problème résolvons-nous ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcValue || ''}
              onChange={(e) => onChange('bmcValue', e.target.value)}
              placeholder="Votre réponse pour proposition de valeur..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem', borderColor: '#38bdf8' }}
            />
          </div>

          {/* 3. Canaux */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>3. Canaux</strong><br />Comment atteindre les clients ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcChannels || ''}
              onChange={(e) => onChange('bmcChannels', e.target.value)}
              placeholder="Votre réponse pour canaux..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 4. Relation client */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>4. Relation client</strong><br />Comment accompagner les utilisateurs ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcRelations || ''}
              onChange={(e) => onChange('bmcRelations', e.target.value)}
              placeholder="Votre réponse pour relation client..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 5. Revenus */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginBottom: '0.3rem', fontWeight: 'bold' }}>
              <strong>5. Revenus</strong><br />Comment gagner de l'argent ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcRevenues || ''}
              onChange={(e) => onChange('bmcRevenues', e.target.value)}
              placeholder="Votre réponse pour revenus..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 6. Ressources clés */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>6. Ressources clés</strong><br />De quoi avons-nous besoin ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcResources || ''}
              onChange={(e) => onChange('bmcResources', e.target.value)}
              placeholder="Votre réponse pour ressources clés..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 7. Activités clés */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>7. Activités clés</strong><br />Que devons-nous faire ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcActivities || ''}
              onChange={(e) => onChange('bmcActivities', e.target.value)}
              placeholder="Votre réponse pour activités clés..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 8. Partenaires clés */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              <strong>8. Partenaires clés</strong><br />Avec qui travailler ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcPartners || ''}
              onChange={(e) => onChange('bmcPartners', e.target.value)}
              placeholder="Votre réponse pour partenaires clés..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {/* 9. Coûts */}
          <div className="bmc-block">
            <label style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginBottom: '0.3rem' }}>
              <strong>9. Coûts</strong><br />Quelles sont les principales dépenses ?
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={data.bmcCosts || ''}
              onChange={(e) => onChange('bmcCosts', e.target.value)}
              placeholder="Votre réponse pour coûts..."
              className="input-field"
              style={{ width: '100%', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Livrable Exigé (Lecture seule) */}
      <div className="house-livrable-box">
        <div className="house-livrable-title">
          📄 Livrable exigé pour la Maison 5 : Business Model Canvas (9 blocs)
        </div>
        <div className="house-formula-code">
          Les 9 blocs du BMC complétés pour valider la viabilité économique de la solution IoT.
        </div>
        <p className="house-example-sub">
          Exemple inspirant : Matrice BMC complétée : Vente du boîtier 79€ + abonnement cloud 4,99€/mois, distribué via magasins bio et coopératives horticoles.
        </p>
      </div>

      {/* 3. Section Saisie Synthèse */}
      <div className="house-input-section">
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
              onClick={() => onSaveDraft(5)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(5)}
            >
              {canEdit ? 'Valider la Maison 5 et Passer au Marché & Pitch ➔' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
