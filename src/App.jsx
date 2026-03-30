import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import BriefingArea from './components/BriefingArea';
import { generateIntelligenceReport, synthesizeHistory } from './services/gemini';
import ReportView from './components/ReportView';
import { motion } from 'framer-motion';

function App() {
  const [currentMode, setMode] = useState('DEBATE');
  const [currentPerspective, setPerspective] = useState('NEUTRAL');
  const [isLoading, setIsLoading] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  
  // App state for history management
  const [history, setHistory] = useState([]);

  const handleQuerySubmit = async (query) => {
    setIsLoading(true);
    setIntelligenceData(null);
    try {
      const markdownRes = await generateIntelligenceReport(query, currentMode, currentPerspective, history.slice(-3));
      
      const newEntry = { id: Date.now(), query, mode: currentMode, perspective: currentPerspective, report: markdownRes };
      setHistory(prev => [...prev, newEntry]); 
      
      setIntelligenceData(
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          <ReportView markdownContent={markdownRes} />
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
          />
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
