import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Menu, X, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import { PremiumProvider, usePremium, TIERS } from './context/PremiumContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import AuthView from './components/AuthView';
import UpgradeModal from './components/UpgradeModal';
import DevPanel from './components/DevPanel';
import ResetPasswordRoom from './components/ResetPasswordRoom';

// =====================================================================
// TranslatedReport — wraps any report view with Hindi translation layer
// =====================================================================
const TranslatedReport = ({ markdown, ViewComponent = ReportView }) => {
  const { lang, isHindi } = useLanguage();
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!isHindi || !markdown) {
      setTranslatedText(null);
      setTranslateError(null);
      return;
    }

    // Check cache first
    const cacheKey = markdown.substring(0, 100);
    if (cacheRef.current[cacheKey]) {
      setTranslatedText(cacheRef.current[cacheKey]);
      return;
    }

    // Translate via backend
    const translateReport = async () => {
      setIsTranslating(true);
      setTranslateError(null);
      try {
        let token = 'dev-token';
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) token = session.access_token;
        }

        const BACKEND_URL_T = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';
        const res = await fetch(`${BACKEND_URL_T}/api/translate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: markdown, targetLang: 'hi' }),
        });
        const data = await res.json();
        if (data.success && data.translated) {
          cacheRef.current[cacheKey] = data.translated;
          setTranslatedText(data.translated);
        } else {
          const errMsg = data.error || `HTTP ${res.status}`;
          console.error('Translation API error:', errMsg);
          setTranslateError(errMsg);
        }
      } catch (err) {
        console.error('Translation failed:', err);
        setTranslateError(err.message);
      } finally {
        setIsTranslating(false);
      }
    };
    translateReport();
  }, [isHindi, markdown]);

  if (isHindi && isTranslating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40, color: '#ffa500' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: 1 }}>हिंदी में अनुवाद हो रहा है...</span>
      </div>
    );
  }

  if (isHindi && translateError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: '10px 16px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 6, color: '#ff8080', fontSize: '0.85rem' }}>
          ⚠️ अनुवाद सेवा वर्तमान में अनुपलब्ध है। (Translation service is temporarily unavailable)
        </div>
        <ViewComponent markdownContent={markdown} />
      </div>
    );
  }

  const displayMarkdown = (isHindi && translatedText) ? translatedText : markdown;
  return <ViewComponent markdownContent={displayMarkdown} />;
};

// Premium mode key map: what base mode to use as the underlying query
const PREMIUM_MODE_BASE = {
  STUDENT_PREMIUM: 'DEBATE',
  JOURNALIST_PREMIUM: 'DEBATE',
  CONSULTANT_PREMIUM: 'DEBATE',
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

const DeepLinkHandler = () => {
  const [showRedirect, setShowRedirect] = useState(false);
  const [type, setType] = useState('verification');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    // Only handle verification here; recovery is handled by the ResetPasswordRoom gate
    if (hash.includes('type=signup')) {
      setShowRedirect(true);
      setType('verification');
      const isMob = /Android|iPhone/i.test(navigator.userAgent);
      setIsMobile(isMob);
    }
  }, []);

  if (!showRedirect) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="deep-link-bridge glass-panel"
      style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 40000, padding: '30px', width: '90%', maxWidth: '400px',
        textAlign: 'center', background: 'rgba(17,17,17,0.98)', border: '2px solid #7b2cbf',
        boxShadow: '0 0 50px rgba(123,78,191,0.6)', color: '#fff', borderRadius: '16px'
      }}
    >
      <div style={{ color: '#00ff00', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '10px', fontSize: '1.2rem' }}>
        IDENTITY CONFIRMED
      </div>
      <p style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '30px' }}>
        {isMobile 
          ? 'Your strategic clearance has been validated. Return to the mobile application to continue.'
          : 'Security clearance granted. You are now logged into the Strategic Intelligence Dashboard.'}
      </p>
      
      {isMobile ? (
        <a 
          href="com.peekolitix.app://auth-callback" 
          style={{
            display: 'block', background: '#7b2cbf', color: '#fff', padding: '16px',
            borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(123,78,191,0.4)', letterSpacing: '1px'
          }}
          onClick={() => setShowRedirect(false)}
        >
          RETURN TO MOBILE APP
        </a>
      ) : (
        <button 
          style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '16px',
            borderRadius: '8px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            letterSpacing: '1px'
          }}
          onClick={() => setShowRedirect(false)}
        >
          ENTER THE WAR ROOM
        </button>
      )}
    </motion.div>
  );
};


function Dashboard() {
  const [currentMode, setMode] = useState('CHAT');
  const [currentPerspective, setPerspective] = useState('NEUTRAL');
  const [isLoading, setIsLoading] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { tier, openUpgradeModal, canQuery, incrementQuery } = usePremium();
  const { signOut, user } = useAuth();
  const { trackEvent, identifyUser } = useAnalytics();

  const [debugTaps, setDebugTaps] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const handleLogoClick = () => {
    const newTaps = debugTaps + 1;
    setDebugTaps(newTaps);
    if (newTaps >= 5) {
      setShowDebug(true);
      setDebugTaps(0);
    }
  };

  // Identify user on login
  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, user.email);
      trackEvent('user_logged_in', { email: user.email });
    }
  }, [user]);

  const DebugPanel = () => (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, background: '#111', border: '1px solid #7b2cbf',
      padding: 15, borderRadius: 8, fontSize: '0.7rem', color: '#fff', zIndex: 9999, maxWidth: '320px',
      boxShadow: '0 0 20px rgba(123,78,191,0.5)', fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#c77dff', letterSpacing: '1px' }}>🔍 SYSTEM DIAGNOSTICS</h4>
      <div style={{ marginBottom: 5 }}><strong>BACKEND:</strong> {BACKEND_URL}</div>
      <div style={{ marginBottom: 5 }}><strong>SUPABASE:</strong> {import.meta.env.VITE_SUPABASE_URL}</div>
      <div style={{ marginBottom: 5, borderTop: '1px solid #333', paddingTop: 5 }}>
        <strong>USER ID:</strong><br/>
        <span style={{ color: '#00ff00', fontSize: '0.6rem' }}>{user?.id || 'NOT LOGGED IN'}</span>
      </div>
      <div style={{ marginBottom: 5 }}><strong>SESSION:</strong> {user ? 'ACTIVE' : 'NONE'}</div>
      <div style={{ marginBottom: 10 }}><strong>HISTORY CACHE:</strong> {history.length} items</div>
      <button onClick={() => setShowDebug(false)} style={{ width: '100%', background: '#7b2cbf', border: 'none', color: '#fff', padding: '6px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>CLOSE DIAGNOSTICS</button>
    </div>
  );

  const isPremiumMode = (mode) => Object.keys(PREMIUM_MODE_BASE).includes(mode);

  // Wake-up pulse for Render (Free Tier takes time to boot)
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/ping`);
        console.log("Backend pulse successful.");
      } catch (e) {
        console.warn("Backend pulse failed - server might be sleeping.");
      }
    };
    wakeBackend();
  }, []);

  // Persistence: Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let token = 'dev-token';
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }

        const response = await fetch(`${BACKEND_URL}/api/history`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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

    try {
      const baseMode = isPremiumMode(currentMode) ? PREMIUM_MODE_BASE[currentMode] : currentMode;
      const premiumKey = isPremiumMode(currentMode) ? currentMode : null;
      const finalQuery = currentMode === 'BATTLE' 
        ? `${query} (STRICT: DO NOT BE POLITE. SMASH THE OPPONENT'S LOGIC UNAPOLOGETICALLY. NO CONCESSIONS.)` 
        : query;

      const markdownRes = await generateIntelligenceReport(
        finalQuery, baseMode, currentPerspective, history.slice(-3), premiumKey
      );
      
      // Successfully fetched; permanently deduct query
      incrementQuery();

      
      let dominanceData = { dominanceScore: 5, biasLevel: 'Low', winProbability: '50%' };
      try {
        // High-Fidelity Front-Load Parser: Look for the [METRICS] tag at the very start
        const metricsMatch = markdownRes.match(/^\[METRICS:Score=(\d+),Win=([^\]]+)\]/i);
        if (metricsMatch) {
          dominanceData.dominanceScore = Math.min(Math.max(Number(metricsMatch[1]), 1), 10);
          dominanceData.winProbability = metricsMatch[2].trim();
        } else {
          // Fallback to searching the whole text for the signature if not at the start
          const looseMatch = markdownRes.match(/\[METRICS:Score=(\d+),Win=([^\]]+)\]/i);
          if (looseMatch) {
            dominanceData.dominanceScore = Math.min(Math.max(Number(looseMatch[1]), 1), 10);
            dominanceData.winProbability = looseMatch[2].trim();
          }
        }
      } catch (e) { 
        console.warn("Front-load parse failed; using defaults.", e); 
      }

      // Cleaning: Slice off the [METRICS] tag from the user report and other garbage
      const cleanMarkdown = markdownRes
        .replace(/^\[METRICS:[^\]]+\]\s*/i, '') // Remove the front-loaded metrics
        .replace(/\[METRICS:[^\]]+\]/gi, '')    // Remove any accidental duplicates
        .replace(/```json[\s\S]*?```/gi, '')
        .replace(/\{[\s\S]*?"dominanceScore"[\s\S]*?"winProbability"[\s\S]*?\}/gi, '')
        .replace(/JSON[\s_]*BLOCK:?/gi, '')
        .replace(/JSON[\s_]*Footer:?/gi, '')
        .replace(/### MANDATORY JSON FOOTER ###[\s\S]*$/gi, '')
        .replace(/### INTERNAL METRICS ###/gi, '')
        .replace(/\[DOMINANCE DATA SCANNED\]/gi, '')
        .replace(/SILENT INSTRUCTION[\s\S]*$/gi, '')
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

      // Track successful query
      trackEvent('briefing_generated', {
        mode: currentMode,
        perspective: currentPerspective,
        dominanceScore: dominanceData.dominanceScore
      });

      const saveBriefing = async () => {
        let token = 'dev-token';
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }

        fetch(`${BACKEND_URL}/api/save-briefing`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user?.id,
            query,
            mode: currentMode,
            perspective: currentPerspective,
            report: cleanMarkdown,
            ...dominanceData
          }),
        }).catch(err => console.error("Secure Supabase sync failed", err));
      };
      saveBriefing();
      
      let reportEl;
      if (currentMode === 'SIMULATE') {
        reportEl = <TranslatedReport markdown={cleanMarkdown} ViewComponent={SimulateView} />;
      } else if (currentMode === 'VERIFY') {
        reportEl = <TranslatedReport markdown={cleanMarkdown} ViewComponent={VerifyView} />;
      } else if (currentMode === 'COMPARE') {
        reportEl = <TranslatedReport markdown={cleanMarkdown} ViewComponent={CompareView} />;
      } else {
        reportEl = <TranslatedReport markdown={cleanMarkdown} />;
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
          setIntelligenceData(<TranslatedReport markdown={item.report} />);
          setIsMobileMenuOpen(false);
        }}
        onSignOut={signOut}
        user={user}
        isMobileOpen={isMobileMenuOpen}
      />
      
      <div className="main-content">
        <Header user={user} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} onLogoClick={handleLogoClick} />
        
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
      {showDebug && <DebugPanel />}
    </div>
  );
}

const AuthWrapper = () => {
  const { user, loading, isVaultLocked } = useAuth();

  if (loading) return (
    <div className="app-loading-screen">
      <div className="loader-orbit"></div>
      <span>SECURE BOOT INITIATED...</span>
    </div>
  );


  // LEVEL 0 GATE: If the Security Vault is locked (Token detected), show Reset Room ONLY.
  if (isVaultLocked) {
    return <ResetPasswordRoom />;
  }

  return user ? <Dashboard /> : <AuthView />;
};

function App() {
  return (
    <LanguageProvider>
      <AnalyticsProvider>
        <AuthProvider>
          <PremiumProvider>
            <AuthWrapper />
          </PremiumProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </LanguageProvider>
  );
}

export default App;
