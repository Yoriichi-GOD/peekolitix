import React, { useState } from 'react';
import './BriefingArea.css';
import PerspectiveFilter from './PerspectiveFilter';
import { Terminal, Send, Search, Loader2 } from 'lucide-react';

const BriefingArea = ({ currentMode, currentPerspective, setPerspective, onQuerySubmit, isLoading, intelligenceData }) => {
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
      case 'VERIFY': return 'CLAIM VERIFICATION ENGINE';
      case 'COMPARE': return 'POLITICIAN / POLICY COMPARISON';
      default: return 'INTELLIGENCE BRIEFING';
    }
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
            {/* The report content will be formatted securely here */}
            {intelligenceData}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h2>AWAITING QUERY INPUT</h2>
            <p>{currentMode === 'VERIFY'
              ? 'Paste a claim, WhatsApp forward, or political statement to fact-check it against verified sources.'
              : currentMode === 'COMPARE'
              ? 'Enter two politicians, parties, or policies to compare. E.g. "Modi vs Rahul Gandhi economic policy"'
              : 'Select a mode and perspective, then enter your query below to generate a factual, data-driven report based on verified sources (PIB, Lok Sabha, RBI, NITI Aayog).'
            }</p>
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
              placeholder={`Enter subject for ${getModeTitle()}...`}
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
