import React, { useState } from 'react';
import './BriefingArea.css';
import PerspectiveFilter from './PerspectiveFilter';
import PremiumGate from './PremiumGate';
import {
  Terminal, Send, Search, Loader2, Wrench,
  Swords, PieChart, BookOpen, Globe, Zap, ShieldAlert, Scale
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

const BriefingArea = ({ currentMode, setMode, currentPerspective, setPerspective, onQuerySubmit, isLoading, intelligenceData, premiumGates = [] }) => {
  const [query, setQuery] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(false);

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
      // Deselect tool = back to chat
      setMode('CHAT');
    } else {
      setMode(toolId);
    }
  };

  const getModeTitle = () => {
    if (isChatMode) return 'FREE INTELLIGENCE CHAT';
    const tool = TOOLS.find(t => t.id === currentMode);
    if (tool) return tool.desc.toUpperCase();
    switch (currentMode) {
      case 'STUDENT_PREMIUM': return '🎓 STUDENT DEBATE PACK';
      case 'JOURNALIST_PREMIUM': return '📰 JOURNALIST SOURCE ENGINE';
      case 'CONSULTANT_PREMIUM': return '🏛️ WAR ROOM INTELLIGENCE';
      case 'BATTLE': return '⚔️ BATTLE MODE';
      case 'SIMULATE': return '🎭 DEBATE ARENA';
      default: return 'INTELLIGENCE BRIEFING';
    }
  };

  const getCompactModeTitle = () => {
    if (isChatMode) return 'CHAT';
    const tool = TOOLS.find(t => t.id === currentMode);
    if (tool) return tool.label.toUpperCase();
    switch (currentMode) {
      case 'STUDENT_PREMIUM': return 'STUDENT';
      case 'JOURNALIST_PREMIUM': return 'SOURCE';
      case 'CONSULTANT_PREMIUM': return 'WAR ROOM';
      case 'BATTLE': return 'BATTLE';
      case 'SIMULATE': return 'ARENA';
      default: return 'INTEL';
    }
  };

  const getPlaceholder = () => {
    if (isChatMode) return 'Ask anything about Indian politics, policy, or governance...';
    if (currentMode === 'BATTLE') return "Paste the opponent's claim/argument here to destroy it...";
    if (currentMode === 'SIMULATE') return "Describe the debate scenario (e.g., BJP vs Congress on Jobs)...";
    if (currentMode === 'VERIFY') return "Paste a claim or WhatsApp forward to fact-check...";
    if (currentMode === 'COMPARE') return "Enter two entities to compare (e.g., Modi vs Rahul on economy)...";
    const tool = TOOLS.find(t => t.id === currentMode);
    return tool ? `Enter subject for ${tool.desc}...` : 'Enter your query...';
  };

  return (
    <main className="briefing-area">
      <div className="briefing-header">
        <div className="mode-badge">
          <Terminal size={14} className="mobile-hidden-icon" />
          <span className="mode-label mobile-hidden">MODE: </span>
          <span className="mode-text-full">{getModeTitle()}</span>
          <span className="mode-text-compact">{getCompactModeTitle()}</span>
        </div>
        <PerspectiveFilter
          currentPerspective={currentPerspective}
          setPerspective={setPerspective}
        />
      </div>

      <div className="briefing-content">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p className="loading-text">Synthesizing intelligence data from verifiable sources...</p>
            <div className="progress-bar"><div className="progress-fill"></div></div>
          </div>
        ) : intelligenceData ? (
          <div className="intelligence-report">
            {intelligenceData}
            {premiumGates.map(gateKey => (
              <PremiumGate key={gateKey} modeKey={gateKey} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h2>AWAITING QUERY INPUT</h2>
            <p>{isChatMode
              ? 'Ask any question about Indian politics, policy, or governance. Or select a tool below for structured analysis.'
              : 'Select a mode and perspective, then enter your query below to generate a factual, data-driven report.'
            }</p>
          </div>
        )}
      </div>

      <div className="query-section">
        {/* Tool chips */}
        <div className="tools-bar">
          <button
            className="tools-toggle"
            onClick={() => setToolsExpanded(!toolsExpanded)}
            title="Analysis Tools"
          >
            <Wrench size={14} />
            <span className="tools-toggle-label">Tools</span>
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
                  title={tool.desc}
                >
                  <Icon size={13} />
                  <span>{tool.label}</span>
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
            EXECUTE
          </button>
        </form>
      </div>
    </main>
  );
};

export default BriefingArea;
