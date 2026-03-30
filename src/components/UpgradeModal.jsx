import React from 'react';
import { usePremium } from '../context/PremiumContext';

const UpgradeModal = () => {
  const { showUpgradeModal, closeUpgradeModal, targetTier } = usePremium();

  if (!showUpgradeModal) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}
      onClick={closeUpgradeModal}
    >
      <div
        style={{
          background: 'var(--bg-secondary, #1a1a2e)', borderRadius: '12px',
          padding: '32px', maxWidth: '420px', width: '90%',
          border: '1px solid var(--brand-purple, #7c3aed)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--brand-purple, #7c3aed)', marginBottom: '12px' }}>
          Upgrade Required
        </h2>
        <p style={{ color: 'var(--text-muted, #999)', marginBottom: '24px' }}>
          This feature requires a premium tier. Upgrade to unlock advanced intelligence modes.
        </p>
        <button
          onClick={closeUpgradeModal}
          style={{
            background: 'var(--brand-purple, #7c3aed)', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '10px 24px',
            cursor: 'pointer', fontSize: '0.95rem'
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
