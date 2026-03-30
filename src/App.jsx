import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import BriefingArea from './components/BriefingArea';
import { generateIntelligenceReport, synthesizeHistory } from './services/gemini';
import ReportView from './components/ReportView';
import SimulateView from './components/SimulateView';
import VerifyView from './components/VerifyView';
import CompareView from './components/CompareView';
import { motion } from 'framer-motion';
import { PremiumProvider, usePremium, TIERS } from './context/PremiumContext';
import UpgradeModal from './components/UpgradeModal';
import PremiumGate from './components/PremiumGate';

// Premium mode key map: what base mode to use as the underlying query
const PREMIUM_MODE_BASE = {
  STUDENT_PREMIUM: 'DEBATE',
  JOURNALIST_PREMIUM: 'DEBATE',
  CONSULTANT_PREMIUM: 'DEBATE',
};

const BACKEND_URL = 'http://localhost:3001';

function AppInner() {
  const [currentMode, setMode] = useState('DEBATE');
  const [currentPerspective, setPerspective] = useState('NEUTRAL');
  const [isLoading, setIsLoading] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [history, setHistory] = useState([]);

  const { tier, openUpgradeModal, canAccessMode, canQuery, incrementQuery } = usePremium();

  const isPremiumMode = (mode) => Object.keys(PREMIUM_MODE_BASE).includes(mode);

  // Persistence: Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/history`);
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Failed to load history from Supabase", err);
      }
    };
    fetchHistory();
  }, []);

  const handleQuerySubmit = async (query) => {
    // Free plan query limit check
    if (!canQuery()) {
      openUpgradeModal(TIERS.STUDENT);
      return;
    }

    setIsLoading(true);
    setIntelligenceData(null);
    incrementQuery();

    try {
      const baseMode = isPremiumMode(currentMode) ? PREMIUM_MODE_BASE[currentMode] : currentMode;
      const premiumKey = isPremiumMode(currentMode) ? currentMode : null;

      const markdownRes = await generateIntelligenceReport(
        query, baseMode, currentPerspective, history.slice(-3), premiumKey
      );
      
      // Extract dominance data from the hidden JSON block
      let dominanceData = { dominanceScore: 5, biasLevel: 'Low', winProbability: '50%' };
      try {
        const jsonMatch = markdownRes.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.dominanceScore) {
            dominanceData = {
              dominanceScore: parsed.dominanceScore,
              biasLevel: parsed.biasLevel || 'Low',
              winProbability: parsed.winProbability || '50%'
            };
          }
        }
      } catch (e) { console.error("Score parsing error", e); }

      const newEntry = { 
        id: Date.now(), 
        query, 
        mode: currentMode, 
        perspective: currentPerspective, 
        report: markdownRes,
        ...dominanceData
      };
      
      setHistory(prev => [newEntry, ...prev]); 

      // PERSIST TO SUPABASE
      fetch(`${BACKEND_URL}/api/save-briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode: currentMode,
          perspective: currentPerspective,
          report: markdownRes,
          ...dominanceData
        })
      }).catch(err => console.error("Supabase sync failed", err));
      
      let reportEl;
      if (currentMode === 'SIMULATE') {
        reportEl = <SimulateView markdownContent={markdownRes} />;
      } else if (currentMode === 'VERIFY') {
        reportEl = <VerifyView markdownContent={markdownRes} />;
      } else if (currentMode === 'COMPARE') {
        reportEl = <CompareView markdownContent={markdownRes} />;
      } else {
        reportEl = <ReportView markdownContent={markdownRes} />;
      }

      setIntelligenceData(
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          {reportEl}
        </motion.div>
      );
    } catch (error) {
      console.error(error);
      setIntelligenceData(
        <div className="error-state" style={{ color: 'var(--status-anti)' }}>
          <h3>INTELLIGENCE GATHERING FAILED</h3>
          <p>{error.message}</p>
          <p>Verify network connection or API Key configuration.</p>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCombineHistory = async () => {
    if (history.length === 0) return;
    setIsLoading(true);
    setIntelligenceData(null);
    try {
      const summaryMarkdown = await synthesizeHistory(history);
      setIntelligenceData(
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '16px', color: 'var(--brand-purple-hover)', fontWeight: 'bold' }}>
            [SYNTHESIZED INTELLIGENCE REPORT]
          </div>
          <ReportView markdownContent={summaryMarkdown} />
        </motion.div>
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistoryItem = (item) => {
    setIntelligenceData(null);
    setTimeout(() => {
      setIntelligenceData(
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            [ARCHIVED BRIEFING]: <span style={{ color: 'var(--brand-purple-hover)' }}>{item.query}</span> (Mode: {item.mode} | Perspective: {item.perspective})
          </div>
          <ReportView markdownContent={item.report} />
        </motion.div>
      );
    }, 50);
  };

  // Premium gate sections to show below free results
  const getPremiumGates = () => {
    const gates = [];
    if (tier === TIERS.FREE && intelligenceData && !isLoading) {
      gates.push('STUDENT_PREMIUM', 'JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM');
    } else if (tier === TIERS.STUDENT && intelligenceData && !isLoading) {
      gates.push('JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM');
    } else if (tier === TIERS.JOURNALIST && intelligenceData && !isLoading) {
      gates.push('CONSULTANT_PREMIUM');
    }
    return gates;
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentMode={currentMode} 
        setMode={setMode} 
        onSynthesize={handleCombineHistory}
        history={history}
        onSelectHistory={viewHistoryItem}
      />
      
      <div className="main-content">
        <Header />
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <BriefingArea 
            currentMode={currentMode}
            currentPerspective={currentPerspective}
            setPerspective={setPerspective}
            onQuerySubmit={handleQuerySubmit}
            isLoading={isLoading}
            intelligenceData={intelligenceData}
            premiumGates={getPremiumGates()}
          />
          <RightPanel history={history} />
        </div>
      </div>

      <UpgradeModal />
    </div>
  );
}

function App() {
  return (
    <PremiumProvider>
      <AppInner />
    </PremiumProvider>
  );
}

export default App;
