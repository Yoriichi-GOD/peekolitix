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
import { Menu, X } from 'lucide-react';
import { PremiumProvider, usePremium, TIERS } from './context/PremiumContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthView from './components/AuthView';
import UpgradeModal from './components/UpgradeModal';
import DevPanel from './components/DevPanel';

// Premium mode key map: what base mode to use as the underlying query
const PREMIUM_MODE_BASE = {
  STUDENT_PREMIUM: 'DEBATE',
  JOURNALIST_PREMIUM: 'DEBATE',
  CONSULTANT_PREMIUM: 'DEBATE',
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

function Dashboard() {
  const [currentMode, setMode] = useState('CHAT');
  const [currentPerspective, setPerspective] = useState('NEUTRAL');
  const [isLoading, setIsLoading] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { tier, openUpgradeModal, canQuery, incrementQuery } = usePremium();
  const { signOut, user } = useAuth();

  const isPremiumMode = (mode) => Object.keys(PREMIUM_MODE_BASE).includes(mode);

  // Persistence: Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.id })
        });
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Failed to load history securely", err);
      }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  const handleQuerySubmit = async (query) => {
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
      const finalQuery = currentMode === 'BATTLE' 
        ? `${query} (STRICT: DO NOT BE POLITE. SMASH THE OPPONENT'S LOGIC UNAPOLOGETICALLY. NO CONCESSIONS.)` 
        : query;

      const markdownRes = await generateIntelligenceReport(
        finalQuery, baseMode, currentPerspective, history.slice(-3), premiumKey
      );
      
      let dominanceData = { dominanceScore: 5, biasLevel: 'Low', winProbability: '50%' };
      try {
        // Try fenced JSON first, then raw JSON object
        const fencedMatch = markdownRes.match(/```json\n?([\s\S]*?)\n?```/);
        const rawMatch = markdownRes.match(/\{\s*"dominanceScore"\s*:\s*\d[\s\S]*?"winProbability"\s*:\s*"[^"]*"\s*\}/);
        const jsonStr = fencedMatch ? fencedMatch[1] : rawMatch ? rawMatch[0] : null;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.dominanceScore) {
            dominanceData.dominanceScore = Math.min(Number(parsed.dominanceScore), 10);
            dominanceData.biasLevel = parsed.biasLevel || 'Low';
            dominanceData.winProbability = parsed.winProbability || '50%';
          }
        }
      } catch (e) { console.error("Score parsing error", e); }

      const cleanMarkdown = markdownRes
        .replace(/```json\n?([\s\S]*?)\n?```/g, '')
        .replace(/\{\s*"dominanceScore"[\s\S]*?"winProbability"[\s\S]*?\}/g, '')
        .replace(/JSON[\s_]*BLOCK:?/gi, '')
        .replace(/### MANDATORY JSON FOOTER ###[\s\S]*$/gi, '')
        .replace(/\n\s*Note:\s*The (above|dominance|JSON|internal|hidden)[\s\S]*?$/gi, '')
        .replace(/PREMIUM LAYER:?/gi, '')
        .replace(/CONSULTANT_PREMIUM:?/gi, '')
        .trim();

      const newEntry = { 
        id: Date.now(), 
        query, 
        mode: currentMode, 
        perspective: currentPerspective, 
        report: cleanMarkdown,
        ...dominanceData
      };
      
      setHistory(prev => [newEntry, ...prev]); 

      fetch(`${BACKEND_URL}/api/save-briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          query,
          mode: currentMode,
          perspective: currentPerspective,
          report: cleanMarkdown,
          ...dominanceData
        })
      }).catch(err => console.error("Secure Supabase sync failed", err));
      
      let reportEl;
      if (currentMode === 'SIMULATE') {
        reportEl = <SimulateView markdownContent={cleanMarkdown} />;
      } else if (currentMode === 'VERIFY') {
        reportEl = <VerifyView markdownContent={cleanMarkdown} />;
      } else if (currentMode === 'COMPARE') {
        reportEl = <CompareView markdownContent={cleanMarkdown} />;
      } else {
        reportEl = <ReportView markdownContent={cleanMarkdown} />;
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

  // Premium gates only show when user explicitly clicks a locked premium mode
  const getPremiumGates = () => {
    return [];
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <button className="burger-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="mobile-logo">PEEKOLITIX</div>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <Sidebar 
        currentMode={currentMode} 
        setMode={(m) => { setMode(m); setIsMobileMenuOpen(false); }} 
        onSynthesize={handleCombineHistory}
        history={history}
        onSelectHistory={(item) => { 
          setIntelligenceData(<ReportView markdownContent={item.report} />);
          setIsMobileMenuOpen(false);
        }}
        onSignOut={signOut}
        user={user}
        isMobileOpen={isMobileMenuOpen}
      />
      
      <div className="main-content">
        <Header user={user} />
        
        <div className="content-grid">
          <BriefingArea
            currentMode={currentMode}
            setMode={setMode}
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
      <DevPanel />
    </div>
  );
}

const AuthWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="app-loading-screen">
      <div className="loader-orbit"></div>
      <span>SECURE BOOT INITIATED...</span>
    </div>
  );

  return user ? <Dashboard /> : <AuthView />;
};

function App() {
  return (
    <AuthProvider>
      <PremiumProvider>
        <AuthWrapper />
      </PremiumProvider>
    </AuthProvider>
  );
}

export default App;
