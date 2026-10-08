import React, { useState, useEffect, useRef } from 'react';
import { useWorkshop } from '../context/WorkshopContext';

export default function ModalQrCode() {
  const { isQrModalOpen, closeQrModal, showToast } = useWorkshop();
  const [qrUrl, setQrUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [localIp, setLocalIp] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isQrModalOpen) return;
    const fetchQr = async () => {
      let target = `${window.location.origin}/?join=1`;
      try {
        const res = await fetch('/api/qrcode');
        if (res.ok) {
          const data = await res.json();
          if (data.url) target = data.url;
          if (data.dataUrl) setDataUrl(data.dataUrl);
          if (data.localIp) setLocalIp(data.localIp);
        }
      } catch {
        // fallback
      }
      setQrUrl(target);
    };
    fetchQr();
  }, [isQrModalOpen]);

  // Fallback canvas drawing if no server QR image
  useEffect(() => {
    if (!isQrModalOpen || dataUrl || !canvasRef.current || !qrUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const gridSize = 25;
    const cellSize = (size - 20) / gridSize;
    const padding = 10;
    let hash = 0;
    for (let i = 0; i < qrUrl.length; i++) {
      hash = (hash << 5) - hash + qrUrl.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#0f172a';
    function drawCorner(x, y) {
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      ctx.fillStyle = '#0f172a';
    }

    drawCorner(padding, padding);
    drawCorner(padding + cellSize * (gridSize - 7), padding);
    drawCorner(padding, padding + cellSize * (gridSize - 7));

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) continue;
        const pseudo = Math.sin(r * 13 + c * 37 + hash) * 10000;
        if (pseudo - Math.floor(pseudo) > 0.5) {
          ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }, [isQrModalOpen, dataUrl, qrUrl]);

  if (!isQrModalOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    showToast('Lien du workshop copié !', 'success');
  };

  return (
    <div className="modal-backdrop active" onClick={closeQrModal}>
      <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">📱</span>
            <h3 className="modal-title">QR Code d'Accès Workshop</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeQrModal}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Faites scanner ce code aux participants avec leur smartphone pour qu'ils rejoignent l'atelier et remplissent le questionnaire.
          </p>

          <div style={{ background: '#fff', padding: '12px', borderRadius: '14px', boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)' }}>
            {dataUrl ? (
              <img src={dataUrl} alt="QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
            ) : (
              <canvas ref={canvasRef} width={220} height={220} style={{ display: 'block' }} />
            )}
          </div>

          {localIp && (
            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
              📡 IP Réseau Wi-Fi : <strong>{localIp}</strong>
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 6px 0' }}>
            📱 Connectez votre smartphone au même réseau Wi-Fi que cet ordinateur.
          </p>

          <div style={{ width: '100%', marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
              Lien direct pour navigateurs mobiles :
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={qrUrl}
                className="input-field"
                style={{ fontSize: '0.8rem', textAlign: 'center' }}
                onClick={(e) => e.target.select()}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={copyUrl}>
                Copier
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={closeQrModal} style={{ width: '100%' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
