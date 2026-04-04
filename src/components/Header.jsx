import React, { useState } from 'react';
import './Header.css';
import { Activity, Menu, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';

const Header = ({ user, onToggleMobileMenu }) => {
  const [briefingId] = useState(() => `BRF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().toISOString().substring(2, 10).replace(/-/g, '')}`);
  const { tier, openUpgradeModal, TIER_CONFIG, queryCount } = usePremium();
  const tierConfig = TIER_CONFIG[tier];

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <button className="mobile-burger-btn" onClick={onToggleMobileMenu}>
          <Menu size={20} />
        </button>
        <div className="logo">
          <ShieldCheck size={24} className="brand-icon" />
          <h1>PEEKOLITIX</h1>
        </div>
        <div className="status-indicator mobile-hidden">
          <Activity size={16} className="status-icon" />
          <span>SYSTEM: SECURE & ACTIVE</span>
        </div>
        <div className="status-pulse-mobile" title="SYSTEM SECURE"></div>
      </div>
      
      <div className="header-right">
        {tier === TIERS.FREE && (
          <div className="query-counter mobile-hidden">
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

        <div className="briefing-info mobile-hidden">
          <Terminal size={14} />
          <span>SESSION: {briefingId}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
