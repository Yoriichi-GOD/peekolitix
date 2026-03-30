import React, { useState } from 'react';
import './BriefingArea.css';
import PerspectiveFilter from './PerspectiveFilter';
import PremiumGate from './PremiumGate';
import { Terminal, Send, Search, Loader2 } from 'lucide-react';

const BriefingArea = ({ currentMode, currentPerspective, setPerspective, onQuerySubmit, isLoading, intelligenceData, premiumGates = [] }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query);
      setQuery('');
    }
  };

  const getModeTitle = () => {
    switch (currentMode) {
      case 'DEBATE': return 'PRO/CON DEBATE ANALYSIS';
      case 'STATS': return 'NUMERICAL DATA & TRENDS';
      case 'EXPLAIN': return 'POLICY & BUDGET EXPLANATION';
      case 'GEO': return 'GLOBAL GEOPOLITICAL IMPACT';
      case 'QUICK': return 'RAPID RESPONSE BRIEFING';
      case 'STUDENT_PREMIUM': return '🎓 STUDENT DEBATE PACK';
      case 'JOURNALIST_PREMIUM': return '📰 JOURNALIST SOURCE ENGINE';
      case 'CONSULTANT_PREMIUM': return '🏛️ WAR ROOM INTELLIGENCE';
      case 'BATTLE': return '⚔️ BATTLE MODE: OPPONENT DESTROYER';
      case 'SIMULATE': return '🎭 DEBATE ARENA: AI SIMULATION';
      default: return 'INTELLIGENCE BRIEFING';
    }
  };

  const getPlaceholder = () => {
    if (currentMode === 'BATTLE') return "Paste the opponent's claim/argument here to destroy it...";
    if (currentMode === 'SIMULATE') return "Describe the debate scenario (e.g., BJP vs Congress on Jobs)...";
    return `Enter subject for ${getModeTitle()}...`;
  };

  return (
    <main className="briefing-area">
      <div className="briefing-header">
        <div className="mode-badge">
          <Terminal size={14} />
          <span>MODE: {getModeTitle()}</span>
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

            {/* Premium gate sections below free results */}
            {premiumGates.map(gateKey => (
              <PremiumGate key={gateKey} modeKey={gateKey} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h2>AWAITING QUERY INPUT</h2>
            <p>Select a mode and perspective, then enter your query below to generate a factual, data-driven report based on verified sources (PIB, Lok Sabha, RBI, NITI Aayog).</p>
          </div>
        )}
      </div>

      <div className="query-section">
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
