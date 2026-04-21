import React, { useState } from 'react';
import './BriefingArea.css';
import PerspectiveFilter from './PerspectiveFilter';
import PremiumGate from './PremiumGate';
import { useLanguage } from '../context/LanguageContext';
import { usePremium, TIERS } from '../context/PremiumContext';
import { t } from '../i18n/translations';
import {
  Terminal, Send, Search, Loader2, Wrench,
  Swords, PieChart, BookOpen, Globe, Zap, ShieldAlert, Scale, Languages
} from 'lucide-react';

const TOOLS = [
  { id: 'DEBATE', label: 'Debate', icon: Swords, desc: 'Pro/Con Analysis' },
  { id: 'STATS', label: 'Stats', icon: PieChart, desc: 'Data & Trends' },
  { id: 'EXPLAIN', label: 'Explain', icon: BookOpen, desc: 'Policy Breakdown' },
  { id: 'GEO', label: 'Geo', icon: Globe, desc: 'Regional Impact' },
  { id: 'QUICK', label: 'Quick', icon: Zap, desc: 'Rapid Response' },
  { id: 'VERIFY', label: 'Verify', icon: ShieldAlert, desc: 'Fact Check' },
  { id: 'COMPARE', label: 'Compare', icon: Scale, desc: 'Side-by-Side' },
];

import GovernmentDisclaimer from './GovernmentDisclaimer';

const BriefingArea = ({ currentMode, setMode, currentPerspective, setPerspective, onQuerySubmit, isLoading, intelligenceData, premiumGates = [] }) => {
  const [query, setQuery] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const { lang, toggleLang, isHindi } = useLanguage();
  const { tier, queryCount, openUpgradeModal, TIER_CONFIG } = usePremium();
  const tierConfig = TIER_CONFIG[tier];

  const isToolMode = TOOLS.some(t => t.id === currentMode);
  const isChatMode = currentMode === 'CHAT';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query);
      setQuery('');
    }
  };

  const handleToolClick = (toolId) => {
    if (currentMode === toolId) {
      setMode('CHAT');
    } else {
      setMode(toolId);
    }
  };

  const getModeTitle = () => {
    if (isChatMode) return t('FREE INTELLIGENCE CHAT', lang);
    const tool = TOOLS.find(tl => tl.id === currentMode);
    if (tool) return t(tool.desc.toUpperCase(), lang);
    switch (currentMode) {
      case 'STUDENT_PREMIUM': return t('🎓 STUDENT DEBATE PACK', lang);
      case 'JOURNALIST_PREMIUM': return t('📰 JOURNALIST SOURCE ENGINE', lang);
      case 'CONSULTANT_PREMIUM': return t('🏛️ WAR ROOM INTELLIGENCE', lang);
      case 'BATTLE': return t('⚔️ BATTLE MODE', lang);
      case 'SIMULATE': return t('🎭 DEBATE ARENA', lang);
      default: return t('INTELLIGENCE BRIEFING', lang);
    }
  };

  const getCompactModeTitle = () => {
    if (isChatMode) return t('CHAT', lang);
    const tool = TOOLS.find(tl => tl.id === currentMode);
    if (tool) return t(tool.label.toUpperCase(), lang);
    switch (currentMode) {
      case 'STUDENT_PREMIUM': return t('STUDENT', lang);
      case 'JOURNALIST_PREMIUM': return t('SOURCE', lang);
      case 'CONSULTANT_PREMIUM': return t('WAR ROOM', lang);
      case 'BATTLE': return t('BATTLE', lang);
      case 'SIMULATE': return t('ARENA', lang);
      default: return t('INTEL', lang);
    }
  };

  const getPlaceholder = () => {
    if (isChatMode) return t('Ask anything about Indian politics, policy, or governance...', lang);
    if (currentMode === 'BATTLE') return t("Paste the opponent's claim/argument here to destroy it...", lang);
    if (currentMode === 'SIMULATE') return t('Describe the debate scenario (e.g., BJP vs Congress on Jobs)...', lang);
    if (currentMode === 'VERIFY') return t('Paste a claim or WhatsApp forward to fact-check...', lang);
    if (currentMode === 'COMPARE') return t('Enter two entities to compare (e.g., Modi vs Rahul on economy)...', lang);
    const tool = TOOLS.find(tl => tl.id === currentMode);
    return tool ? `${t('Enter subject for', lang)} ${t(tool.desc, lang)}...` : t('Enter your query...', lang);
  };

  return (
    <main className="briefing-area">
      <div className="briefing-header">
        <div className="mode-badge">
          <Terminal size={14} className="mobile-hidden-icon" />
          <span className="mode-label mobile-hidden">{t('MODE', lang)}: </span>
          <span className="mode-text-full">{getModeTitle()}</span>
          <span className="mode-text-compact">{getCompactModeTitle()}</span>
        </div>
        <PerspectiveFilter
          currentPerspective={currentPerspective}
          setPerspective={setPerspective}
        />
      </div>

      {/* Mobile Control Bar — tier, queries, language */}
      <div className="mobile-control-bar">
        <div 
          className="mcb-tier"
          style={{ background: tierConfig.bg, border: `1px solid ${tierConfig.border}`, color: tierConfig.color }}
          onClick={() => openUpgradeModal()}
        >
          {tierConfig.label}
        </div>
        {tier === TIERS.FREE && (
          <div className="mcb-queries" onClick={() => openUpgradeModal()}>
            <Zap size={11} />
            <span>{15 - queryCount}</span>
          </div>
        )}
        <button 
          className={`mcb-lang ${isHindi ? 'mcb-lang-hi' : ''}`}
          onClick={toggleLang}
        >
          <Languages size={12} />
          <span>{isHindi ? 'हि' : 'EN'}</span>
        </button>
      </div>

      <div className="briefing-content">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p className="loading-text">{t('Synthesizing intelligence data from verifiable sources...', lang)}</p>
            <div className="progress-bar"><div className="progress-fill"></div></div>
          </div>
        ) : intelligenceData ? (
          <div className="intelligence-report">
            {intelligenceData}
            {premiumGates.map(gateKey => (
              <PremiumGate key={gateKey} modeKey={gateKey} />
            ))}
            <GovernmentDisclaimer />
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h2>{t('AWAITING QUERY INPUT', lang)}</h2>
            <p>{isChatMode
              ? t('Ask any question about Indian politics, policy, or governance. Or select a tool below for structured analysis.', lang)
              : t('Select a mode and perspective, then enter your query below to generate a factual, data-driven report.', lang)
            }</p>
            <div style={{ marginTop: 'auto', width: '100%', maxWidth: '600px' }}>
               <GovernmentDisclaimer />
            </div>
          </div>
        )}
      </div>


      <div className="query-section">
        <div className="tools-bar">
          <button
            className="tools-toggle"
            onClick={() => setToolsExpanded(!toolsExpanded)}
            title="Analysis Tools"
          >
            <Wrench size={14} />
            <span className="tools-toggle-label">{t('Tools', lang)}</span>
          </button>

          <div className={`tools-chips ${toolsExpanded ? 'tools-expanded' : ''}`}>
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              const isActive = currentMode === tool.id;
              return (
                <button
                  key={tool.id}
                  className={`tool-chip ${isActive ? 'tool-chip-active' : ''}`}
                  onClick={() => handleToolClick(tool.id)}
                  title={t(tool.desc, lang)}
                >
                  <Icon size={13} />
                  <span>{t(tool.label, lang)}</span>
                </button>
              );
            })}
          </div>

          {isToolMode && (
            <button className="tool-clear" onClick={() => setMode('CHAT')} title="Back to chat">
              ✕
            </button>
          )}
        </div>

        <form className="query-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <span className="prompt-symbol">&gt;</span>
            <input
              type="text"
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={!query.trim() || isLoading}>
            <Send size={16} />
            {t('EXECUTE', lang)}
          </button>
        </form>
      </div>
    </main>
  );
};

export default BriefingArea;
