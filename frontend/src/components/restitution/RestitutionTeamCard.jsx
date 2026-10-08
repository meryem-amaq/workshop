import React from 'react';
import { getArchetypeDisplayName } from '../../constants/workshopData';

export default function RestitutionTeamCard({ team }) {
  const dels = team.deliverables || [];
  const d1 = dels.find((d) => d.house_number === 1)?.content || {};
  const d2 = dels.find((d) => d.house_number === 2)?.content || {};
  const d3 = dels.find((d) => d.house_number === 3)?.content || {};
  const d4 = dels.find((d) => d.house_number === 4)?.content || {};
  const d5 = dels.find((d) => d.house_number === 5)?.content || {};
  const d6 = dels.find((d) => d.house_number === 6)?.content || {};

  const scribeMember =
    (team.members || []).find((m) => m.id === team.scribe_participant_id || m.is_scribe) || team.scribe;
  const scribeName = scribeMember
    ? `${scribeMember.first_name} ${scribeMember.last_name}`
    : 'Non désigné';

  return (
    <article
      className="restitution-team-sheet"
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: `1px solid ${team.color}44`,
        borderRadius: '18px',
        padding: '1.75rem',
        boxShadow: '0 4px 25px rgba(0,0,0,0.3)'
      }}
    >
      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
        <img
          src={`/assets/images/${team.avatar}`}
          alt={team.name}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${team.color}`,
            boxShadow: `0 0 20px ${team.color}55`
          }}
        />
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>{team.name}</h3>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Archétype : <strong style={{ color: team.color }}>{getArchetypeDisplayName(team.archetype)}</strong> •{' '}
            Rédacteur Unique : <strong style={{ color: '#fbbf24' }}>{scribeName}</strong> •{' '}
            Progression : <strong>{team.progress_percent}% (Maison {team.current_house}/6)</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Membres : {(team.members || []).map((m) => `${m.first_name} ${m.last_name}`).join(', ') || 'Aucun'}
          </div>
        </div>
      </div>

      {/* 6 Houses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Maison 1 */}
        <div className="restitution-house-block" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>🛖 Maison 1 : Le Besoin</span>
            <span style={{ color: '#10b981' }}>16%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Utilisateur :</strong> {d1.targetUser || '—'}</div>
            <div><strong>Douleur :</strong> {d1.problem || '—'}</div>
            <div style={{ marginTop: '0.4rem', color: '#38bdf8' }}><strong>Formule :</strong> {d1.formulation || '—'}</div>
          </div>
        </div>

        {/* Maison 2 */}
        <div className="restitution-house-block" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>💡 Maison 2 : Concept IoT</span>
            <span style={{ color: '#10b981' }}>33%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Produit :</strong> {d2.conceptName || '—'}</div>
            <div><strong>Capteurs :</strong> {d2.measures || '—'}</div>
            <div><strong>Réseau :</strong> {d2.connectivity || '—'}</div>
            <div><strong>Action :</strong> {d2.actions || '—'}</div>
          </div>
        </div>

        {/* Maison 3 */}
        <div className="restitution-house-block" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>⚙️ Maison 3 : Faisabilité</span>
            <span style={{ color: '#10b981' }}>50%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Capteurs :</strong> {d3.sensors || '—'}</div>
            <div><strong>Traitement :</strong> {d3.processing || '—'}</div>
            <div><strong>Protocole :</strong> {d3.protocol || '—'}</div>
            <div><strong>Cloud :</strong> {d3.cloudUser || '—'}</div>
          </div>
        </div>

        {/* Maison 4 */}
        <div className="restitution-house-block" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>🔌 Maison 4 : Prototype</span>
            <span style={{ color: '#10b981' }}>66%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Maquette :</strong> {d4.prototypeType || '—'}</div>
            <div><strong>Scénario :</strong> {d4.usageScenario || '—'}</div>
            <div><strong>Test :</strong> {d4.testProtocol || '—'}</div>
          </div>
        </div>

        {/* Maison 5 - BMC 9 blocs */}
        <div className="restitution-house-block" style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <span>📊 Maison 5 : Synthèse Business Model Canvas (9 Blocs)</span>
            <span style={{ color: '#10b981' }}>83%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong>Partenaires :</strong><br />{d5.bmcPartners || '—'}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong style={{ color: '#38bdf8' }}>Proposition Valeur :</strong><br />{d5.bmcValue || '—'}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong>Segments Clients :</strong><br />{d5.bmcSegments || '—'}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong>Activités / Ressources :</strong><br />{d5.bmcActivities || '—'} / {d5.bmcResources || '—'}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong>Canaux / Relations :</strong><br />{d5.bmcChannels || '—'} / {d5.bmcRelations || '—'}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}><strong style={{ color: '#10b981' }}>Revenus & Coûts :</strong><br />{d5.bmcRevenues || '—'} / {d5.bmcCosts || '—'}</div>
          </div>
        </div>

        {/* Maison 6 - Marché & Pitch */}
        <div className="restitution-house-block" style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>🏆 Maison 6 : Marché & Pitch 3 Minutes</span>
            <span style={{ color: '#10b981' }}>100%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Lancement :</strong> {d6.launchPlan || '—'}</div>
            <div><strong>Métriques 12 Mois :</strong> {d6.targetMetrics || '—'}</div>
            {d6.pitchScript && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.05)', borderLeft: '3px solid #38bdf8', borderRadius: '4px' }}>
                <strong style={{ color: '#38bdf8' }}>🎤 Script du Pitch 3 Minutes :</strong>
                <div style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>« {d6.pitchScript} »</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
