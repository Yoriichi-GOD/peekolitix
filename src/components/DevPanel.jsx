import React, { useState } from 'react';
import { usePremium } from '../context/PremiumContext';
import { Code2, ChevronDown, ChevronUp } from 'lucide-react';
import './DevPanel.css';

const DevPanel = () => {
  const { isDev, activeTier, devSwitchTier, TIERS, TIER_CONFIG, PUBLIC_TIERS, queryCount } = usePremium();
  const [isOpen, setIsOpen] = useState(false);

  if (!isDev) return null;

  const switchableTiers = [...PUBLIC_TIERS, 'DEV'];

  return (
    <div className={`dev-panel ${isOpen ? 'dev-panel-open' : ''}`}>
      <button className="dev-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Code2 size={14} />
        <span>DEV</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {isOpen && (
        <div className="dev-content">
          <div className="dev-header">TIER SWITCHER</div>
          <div className="dev-tier-grid">
            {switchableTiers.map(t => {
              const config = TIER_CONFIG[t];
              const isActive = activeTier === t;
              return (
                <button
                  key={t}
                  className={`dev-tier-btn ${isActive ? 'dev-tier-active' : ''}`}
                  style={{
                    '--btn-color': config.color,
                    '--btn-bg': config.bg,
                    '--btn-border': config.border,
                  }}
                  onClick={() => devSwitchTier(t)}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
          <div className="dev-info">
            <span>Active: <strong style={{ color: TIER_CONFIG[activeTier].color }}>{TIER_CONFIG[activeTier].label}</strong></span>
            <span>Queries: {queryCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevPanel;
