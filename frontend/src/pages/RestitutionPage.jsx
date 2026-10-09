import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';
import { RestitutionTeamCard } from '../components/restitution';

export default function RestitutionPage() {
  const { teams, showToast } = useWorkshop();
  const [filterTeamId, setFilterTeamId] = useState('all');

  const filteredTeams = filterTeamId === 'all' ? teams : teams.filter((t) => t.id === filterTeamId);

  // Export en Document PDF imprimable haute fidélité
  const handleExportPdf = () => {
    const teamsToExport = filterTeamId === 'all' ? teams : teams.filter((t) => t.id === filterTeamId);
    
    if (!teamsToExport || teamsToExport.length === 0) {
      showToast('⚠️ Aucun livrable disponible pour générer le PDF.', 'error');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      showToast('⚠️ Veuillez autoriser les pop-ups pour exporter le PDF.', 'error');
      return;
    }

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Restitution Projets IoT - Le Village des Schtroumpfs</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 20px;
      line-height: 1.5;
    }
    .header-box {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title h1 {
      font-size: 22px;
      color: #0369a1;
      margin-bottom: 4px;
    }
    .header-title p {
      font-size: 12px;
      color: #64748b;
    }
    .header-date {
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    .team-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      margin-bottom: 24px;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .team-header {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .team-name {
      font-size: 16px;
      font-weight: bold;
      color: #0369a1;
    }
    .team-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      background: #0284c7;
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
    }
    .team-meta {
      padding: 10px 16px;
      background: #f8fafc;
      font-size: 11px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .houses-grid {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .house-row {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .house-tag {
      font-size: 12px;
      font-weight: bold;
      color: #0284c7;
      margin-bottom: 6px;
    }
    .house-content-p {
      font-size: 12px;
      color: #334155;
      margin-bottom: 4px;
    }
    .pitch-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #eab308;
      padding: 8px 12px;
      border-radius: 4px;
      font-style: italic;
      color: #713f12;
      font-size: 12px;
      margin-top: 6px;
    }
    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .no-print-bar {
      margin-bottom: 20px;
      padding: 12px;
      background: #0284c7;
      color: white;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #ffffff;
      color: #0284c7;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>📄 Aperçu prêt pour l'exportation PDF</span>
    <button class="btn-print" onclick="window.print()">🖨️ Enregistrer en PDF</button>
  </div>
  <div class="header-box">
    <div class="header-title">
      <h1>Le Village IoT des Schtroumpfs</h1>
      <p>Compte Rendu & Restitution Officielle des Livrables</p>
    </div>
    <div class="header-date">
      Exporté le ${dateStr}
    </div>
  </div>
`;

    teamsToExport.forEach((t, idx) => {
      const dels = t.deliverables || [];
      const d1 = dels.find((d) => d.house_number === 1)?.content || {};
      const d2 = dels.find((d) => d.house_number === 2)?.content || {};
      const d3 = dels.find((d) => d.house_number === 3)?.content || {};
      const d4 = dels.find((d) => d.house_number === 4)?.content || {};
      const d5 = dels.find((d) => d.house_number === 5)?.content || {};
      const d6 = dels.find((d) => d.house_number === 6)?.content || {};

      const scribeMember =
        (t.members || []).find((m) => m.id === t.scribe_participant_id || m.is_scribe) || t.scribe;
      const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

      html += `
  <div class="team-card">
    <div class="team-header">
      <span class="team-name">Groupe ${idx + 1} : ${t.name}</span>
      <span class="team-badge">${getArchetypeDisplayName(t.archetype)}</span>
    </div>
    <div class="team-meta">
      <div><strong>Progression :</strong> Maison ${t.current_house}/6 (${t.progress_percent}%)</div>
      <div><strong>Rédacteur (Scribe) :</strong> ${scribeName}</div>
      <div><strong>Membres :</strong> ${(t.members || []).map((m) => `${m.first_name} ${m.last_name}`).join(', ') || 'Aucun'}</div>
    </div>
    <div class="houses-grid">
      <div class="house-row">
        <div class="house-tag">🛖 Maison 1 — Besoin & Problématique</div>
        <div class="house-content-p"><strong>Utilisateur Cible :</strong> ${d1.targetUser || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Problème :</strong> ${d1.problem || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Formulation Canonique :</strong> ${d1.formulation || 'Non formulé'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 2 — Idée & Dispositif IoT</div>
        <div class="house-content-p"><strong>Nom du Produit :</strong> ${d2.conceptName || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Mesures (Capteurs) :</strong> ${d2.measures || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Connectivité :</strong> ${d2.connectivity || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 3 — Faisabilité & Architecture</div>
        <div class="house-content-p"><strong>Capteurs :</strong> ${d3.sensors || 'Non spécifié'} | <strong>Microcontrôleur :</strong> ${d3.processing || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Protocole :</strong> ${d3.protocol || 'Non spécifié'} | <strong>Cloud & Dashboard :</strong> ${d3.cloudUser || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 4 — Prototype & Algorithme</div>
        <div class="house-content-p"><strong>Type de Prototype :</strong> ${d4.prototypeType || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Scénario :</strong> ${d4.usageScenario || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 5 — Business Model Canvas</div>
        <div class="house-content-p"><strong>Proposition de Valeur :</strong> ${d5.bmcValue || 'Non spécifié'}</div>
        <div class="house-content-p"><strong>Clients :</strong> ${d5.bmcSegments || 'Non spécifié'} | <strong>Revenus :</strong> ${d5.bmcRevenues || 'Non spécifié'}</div>
      </div>
      <div class="house-row">
        <div class="house-tag">🛖 Maison 6 — Marché & Pitch Final</div>
        <div class="house-content-p"><strong>Plan de Lancement :</strong> ${d6.launchPlan || 'Non spécifié'}</div>
        ${d6.pitchScript ? `<div class="pitch-box"><strong>Script du Pitch :</strong> "${d6.pitchScript}"</div>` : ''}
      </div>
    </div>
  </div>`;
    });

    html += `
  <div class="footer-note">
    Document généré automatiquement par la plateforme Workshop IoT • Le Village des Schtroumpfs
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    showToast('📑 Préparation du document PDF en cours...', 'success');
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="view-panel active">
      <div className="restitution-container">
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊 Restitution Finale des Projets IoT</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Synthèse complète des livrables des 6 Maisons par groupe Schtroumpf pour le débriefing et la soutenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleToggleFullscreen}>
              🖥️ Plein Écran
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleExportPdf}>
              📄 Exporter en PDF (.pdf)
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button
            type="button"
            className={`filter-pill ${filterTeamId === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTeamId('all')}
          >
            Tous les Groupes ({teams.length})
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`filter-pill ${filterTeamId === t.id ? 'active' : ''}`}
              onClick={() => setFilterTeamId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Team Deliverables Sheets */}
        {filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h3>Aucun livrable disponible pour l'instant.</h3>
            <p>Les fiches de restitution apparaîtront au fur et à mesure que les équipes valident les 6 Maisons.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredTeams.map((team) => (
              <RestitutionTeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
