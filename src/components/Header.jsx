import React, { useState } from 'react';
import './Header.css';
import { Activity, Menu, Terminal, Zap, Languages } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';

const Header = ({ user, onToggleMobileMenu, onLogoClick }) => {
  const [briefingId] = useState(() => `BRF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().toISOString().substring(2, 10).replace(/-/g, '')}`);
  const { tier, openUpgradeModal, TIER_CONFIG, queryCount } = usePremium();
  const { lang, toggleLang, isHindi } = useLanguage();
  const tierConfig = TIER_CONFIG[tier];

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <button className="mobile-burger-btn" onClick={onToggleMobileMenu}>
          <Menu size={20} />
        </button>
        <div className="logo" onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
          <img src="/tiger-logo.png" alt="Peekolitix Tiger" className="brand-tiger-logo" />
          <h1>PEEKOLITIX</h1>
        </div>

        {/* Language Toggle — desktop only */}
        <button 
          className={`lang-toggle desktop-only ${isHindi ? 'lang-hi' : 'lang-en'}`}
          onClick={toggleLang}
          title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
        >
          <Languages size={14} />
          <span className="lang-label">{isHindi ? 'हि' : 'EN'}</span>
        </button>

        <div className="status-indicator mobile-hidden">
          <Activity size={16} className="status-icon" />
          <span>{t('SYSTEM: SECURE & ACTIVE', lang)}</span>
        </div>
        <div className="status-pulse-mobile" title="SYSTEM SECURE"></div>
      </div>
      
      <div className="header-right">
        {tier === TIERS.FREE && (
          <div className="query-counter desktop-only">
            <span>{15 - queryCount} {t('queries left today', lang)}</span>
            <button className="header-upgrade-btn" onClick={() => openUpgradeModal()}>
              <Zap size={12} /> {t('Upgrade', lang)}
            </button>
          </div>
        )}

        <div 
          className="tier-pill desktop-only"
          style={{ background: tierConfig.bg, border: `1px solid ${tierConfig.border}`, color: tierConfig.color }}
          onClick={() => openUpgradeModal()}
        >
          {tierConfig.label}
        </div>

        <div className="briefing-info mobile-hidden">
          <Terminal size={14} />
          <span>{t('SESSION', lang)}: {briefingId}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
