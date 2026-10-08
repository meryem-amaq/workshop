import React from 'react';
import { ARCHETYPES } from '../../constants/workshopData';

export default function ArchetypeShowcaseCard({
  currentUser,
  meta,
  breakdown,
  scores75,
  totalSum
}) {
  const archetypesOrder = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];

  return (
    <div className="archetype-showcase-card" id="archetypeShowcaseCard">
      <div className="showcase-avatar-frame">
        <img
          src={meta.avatar}
          alt={meta.name}
          className="showcase-avatar"
          id="resArchetypeAvatar"
        />
        <div className="showcase-badge" id="resArchetypeBadge">
          {meta.badge}
        </div>
      </div>

      <div className="showcase-info">
        <h3 className="showcase-title" id="resArchetypeTitle">
          {meta.name}
        </h3>
        <p className="showcase-tagline" id="resArchetypeTagline">
          « {meta.tagline} »
        </p>
        <p className="showcase-desc" id="resArchetypeDesc">
          {meta.desc}
        </p>

        {/* Super-pouvoirs */}
        <div className="superpowers-box">
          <span className="superpowers-title">⚡ Vos Forces dans l'Équipe IoT :</span>
          <ul className="superpowers-list" id="resSuperpowersList">
            {meta.powers.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Grille Officielle des Scores sur 75 points & Pourcentages */}
        <div className="official-scoring-table-wrap">
          <h4 className="scoring-table-heading">
            📊 Grille de Calcul Officielle & Répartition (/75 pts) :
          </h4>
          <div className="scoring-table" id="resOfficialScoringTable">
            {archetypesOrder.map((arch) => {
              const item = breakdown[arch] || {};
              const scoreVal = item.score !== undefined ? item.score : scores75[arch] || 0;
              const rawSum = item.rawSum !== undefined ? item.rawSum : Math.round(scoreVal / 5);
              const pct = item.percent !== undefined ? item.percent : totalSum > 0 ? Math.round((scoreVal / totalSum) * 100) : 20;
              const level = item.level || (scoreVal >= 60 ? 'Trait Dominant majeur' : scoreVal >= 45 ? 'Trait Fort' : scoreVal >= 30 ? 'Trait Modéré' : 'Trait Secondaire');
              const isDominant = arch === currentUser.archetype;
              const archMeta = ARCHETYPES[arch];

              let levelClass = 'secondaire';
              if (scoreVal >= 60) levelClass = 'dominant';
              else if (scoreVal >= 45) levelClass = 'fort';
              else if (scoreVal >= 30) levelClass = 'modere';

              return (
                <div
                  key={arch}
                  className={`scoring-row ${isDominant ? 'dominant' : ''}`}
                >
                  <div className="scoring-archetype-name" style={{ color: archMeta.color }}>
                    {archMeta.displayName}
                  </div>
                  <div className="scoring-formula">
                    <span>{archMeta.associatedQuestions} = ({rawSum}) × 5</span>
                    <span className={`level-tag ${levelClass}`} style={{ marginLeft: '0.4rem' }}>
                      {level}
                    </span>
                  </div>
                  <div className="scoring-points" style={{ color: isDominant ? '#fbbf24' : '#fff' }}>
                    {scoreVal} / 75
                  </div>
                  <div className="scoring-pct">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barres visuelles de répartition */}
        <div className="scores-distribution">
          <div className="score-dist-title">Part relative dans votre profil global :</div>
          <div className="score-bars-container" id="resScoresBars">
            {archetypesOrder.map((arch) => {
              const item = breakdown[arch] || {};
              const scoreVal = item.score !== undefined ? item.score : scores75[arch] || 0;
              const pct = item.percent !== undefined ? item.percent : totalSum > 0 ? Math.round((scoreVal / totalSum) * 100) : 20;
              const traitMeta = ARCHETYPES[arch];

              return (
                <div key={arch} className="score-bar-row">
                  <span>{traitMeta.displayName}</span>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${pct}%`, backgroundColor: traitMeta.color }}
                    ></div>
                  </div>
                  <span style={{ color: traitMeta.color, fontWeight: 'bold' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
