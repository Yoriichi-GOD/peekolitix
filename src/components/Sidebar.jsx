import React, { useState } from 'react';
import './Sidebar.css';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
  Layers,
  GraduationCap,
  Newspaper,
  Briefcase,
  Star,
  Lock,
  Target,
  Users,
  Zap,
  Power,
  User as UserIcon,
  X as CloseIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePremium, TIERS } from '../context/PremiumContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';

const Sidebar = ({ currentMode, setMode, onSynthesize, history = [], onSelectHistory, onSignOut, user, isMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { tier, canAccessMode, openUpgradeModal, TIER_CONFIG } = usePremium();
  const { lang } = useLanguage();

  const tierConfig = TIER_CONFIG[tier];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const premiumChannels = [
    {
      id: 'STUDENT_PREMIUM', label: 'Debate Pack', icon: GraduationCap,
      tier: TIERS.STUDENT, color: '#38b000', border: 'rgba(56,176,0,0.3)',
    },
    {
      id: 'JOURNALIST_PREMIUM', label: 'Source Engine', icon: Newspaper,
      tier: TIERS.JOURNALIST, color: '#f4a261', border: 'rgba(244,162,97,0.3)',
    },
    {
      id: 'CONSULTANT_PREMIUM', label: 'War Room', icon: Briefcase,
      tier: TIERS.CONSULTANT, color: '#c77dff', border: 'rgba(199,125,255,0.3)',
    },
  ];

  const combatChannels = [
    { id: 'BATTLE', label: 'Battle Mode', icon: Target, color: '#ff4d4d', border: 'rgba(255,77,77,0.3)' },
    { id: 'SIMULATE', label: 'Simulation', icon: Users, color: '#00d4ff', border: 'rgba(0,212,255,0.3)' },
  ];

  const handleModeClick = (channel) => {
    if (channel.tier && !canAccessMode(channel.id)) {
      openUpgradeModal(channel.tier);
    } else {
      setMode(channel.id);
    }
  };

  return (
    <motion.aside
      className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      initial={{ width: 260 }}
      animate={{ width: isCollapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </div>

      {isMobileOpen && (
        <div className="mobile-close-container">
          <span className="mobile-drawer-title">COMMAND HUB</span>
          <button className="mobile-close-btn" onClick={() => setMode(currentMode)}>
            <CloseIcon size={20} />
          </button>
        </div>
      )}

      {/* Tier badge */}
      {!isCollapsed && (
        <motion.div
          className="tier-badge"
          style={{ background: tierConfig.bg, border: `1px solid ${tierConfig.border}`, color: tierConfig.color }}
          onClick={() => openUpgradeModal()}
          whileHover={{ scale: 1.02 }}
        >
          <Star size={12} />
          <span>{tierConfig.label} Plan</span>
          {tier === TIERS.FREE && <span className="tier-upgrade-hint">Upgrade →</span>}
        </motion.div>
      )}

      {/* Premium modes */}
      <div className="sidebar-section">
        {!isCollapsed && <h3 className="section-title"><Star size={14} style={{ color: '#ffd166' }} /> {t('PREMIUM MODES', lang)}</h3>}
        <ul className="nav-list">
          {premiumChannels.map((channel) => {
            const Icon = channel.icon;
            const isActive = currentMode === channel.id;
            const hasAccess = canAccessMode(channel.id);
            return (
              <li
                key={channel.id}
                className={`nav-item premium-nav-item ${isActive ? 'active' : ''} ${!hasAccess ? 'premium-locked' : ''}`}
                style={ hasAccess ? { '--pm-color': channel.color, '--pm-border': channel.border } : {} }
                onClick={() => handleModeClick(channel)}
                title={isCollapsed ? channel.label : ''}
              >
                <Icon size={18} style={ hasAccess ? { color: channel.color } : {}} />
                {!isCollapsed && <span>{t(channel.label, lang)}</span>}
                {!isCollapsed && !hasAccess && <Lock size={12} className="lock-icon" />}
              </li>
            );
          })}
        </ul>

        {!isCollapsed && tier === TIERS.FREE && (
          <button className="upgrade-sidebar-btn" onClick={() => openUpgradeModal()}>
            <Zap size={14} /> UPGRADE NOW
          </button>
        )}
      </div>

      <div className="sidebar-separator" />

      {/* Combat modes */}
      <div className="sidebar-section">
        {!isCollapsed && <h3 className="section-title"><Target size={14} style={{ color: '#ff4d4d' }} /> {t('COMBAT ARENA', lang)}</h3>}
        <ul className="nav-list">
          {combatChannels.map((channel) => {
            const Icon = channel.icon;
            const isActive = currentMode === channel.id;
            return (
              <li
                key={channel.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={ isActive ? { '--pm-color': channel.color, '--pm-border': channel.border } : {} }
                onClick={() => setMode(channel.id)}
                title={isCollapsed ? channel.label : ''}
              >
                <Icon size={18} style={{ color: channel.color }} />
                {!isCollapsed && <span>{t(channel.label, lang)}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-separator" />

      {/* History */}
      <div className="sidebar-section h-full">
        {!isCollapsed && <h3 className="section-title"><History size={14} /> {t('RECENT BRIEFINGS', lang)}</h3>}
        {isCollapsed && <div className="collapsed-icon"><History size={18} className="brand-icon"/></div>}

        <ul className="nav-list briefing-list">
          {history.length === 0 && !isCollapsed && (
            <div className="empty-history text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic', padding: '10px' }}>
              No intelligence gathered yet.
            </div>
          )}
          {[...history].reverse().map((item) => (
            <li
              key={item.id}
              className="nav-item briefing-item"
              title={item.query}
              onClick={() => onSelectHistory(item)}
            >
              <MessageSquare size={16} className="text-muted" style={{ flexShrink: 0 }} />
              {!isCollapsed && <span className="truncate">{item.query}</span>}
            </li>
          ))}
        </ul>

        {history.length > 0 && (
          <button
            className={`synthesize-btn ${isCollapsed ? 'synthesize-collapsed' : ''}`}
            onClick={onSynthesize}
            title="Combine History"
          >
            <Layers size={18} />
            {!isCollapsed && <span>{t('COMBINE HISTORY', lang)}</span>}
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="analyst-profile glass-panel" title={user.email}>
            <div className="profile-icon">
              <UserIcon size={14} />
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <span className="profile-alias">{user.email?.split('@')[0].toUpperCase()}</span>
                <span className="profile-status">{t('VERIFIED ANALYST', lang)}</span>
              </div>
            )}
          </div>
        )}

        <div className="sidebar-compliance" style={{ 
          padding: '8px 12px', 
          fontSize: '0.65rem', 
          opacity: 0.5, 
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '8px'
        }}>
          {!isCollapsed && <span>Independent AI Platform • Not Gov Affiliated</span>}
        </div>

        <button className="logout-btn" onClick={onSignOut} title={isCollapsed ? "Switch Identity" : ""}>
          <Power size={18} />
          {!isCollapsed && <span>SWITCH IDENTITY</span>}
        </button>
      </div>

    </motion.aside>
  );
};

export default Sidebar;
