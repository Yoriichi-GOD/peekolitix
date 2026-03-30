import React from 'react';
import './Header.css';
import { Activity, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';

const Header = () => {
  const briefingId = `BRF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().toISOString().substring(2, 10).replace(/-/g, '')}`;
  const { tier, openUpgradeModal, TIER_CONFIG, queryCount } = usePremium();
  const tierConfig = TIER_CONFIG[tier];

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <div className="logo">
          <ShieldCheck size={24} className="brand-icon" />
          <h1>PEEKOLITIX</h1>
        </div>
        <div className="status-indicator">
          <Activity size={16} className="status-icon" />
          <span>SYSTEM: SECURE & ACTIVE</span>
        </div>
      </div>
      
      <div className="header-right">
        {tier === TIERS.FREE && (
          <div className="query-counter">
            <span>{15 - queryCount} queries left today</span>
            <button className="header-upgrade-btn" onClick={() => openUpgradeModal()}>
              <Zap size={12} /> Upgrade
            </button>
          </div>
        )}

        <div 
          className="tier-pill"
          style={{ background: tierConfig.bg, border: `1px solid ${tierConfig.border}`, color: tierConfig.color }}
          onClick={() => openUpgradeModal()}
        >
          {tierConfig.label}
        </div>

        <div className="briefing-info">
          <Terminal size={14} />
          <span>SESSION: {briefingId}</span>
        </div>
        <div className="user-profile">
          <div className="avatar" style={{ background: tierConfig.color }}>A</div>
          <span>Analyst</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
