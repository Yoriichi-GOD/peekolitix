import React from 'react';
import './Header.css';
import { Activity, ShieldCheck, Terminal } from 'lucide-react';

const Header = () => {
  const briefingId = `BRF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().toISOString().substring(2, 10).replace(/-/g, '')}`;

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <div className="logo">
          <ShieldCheck size={24} className="brand-icon" />
          <h1>PEEKOLITIX</h1>
        </div>
        <div className="status-indicator">
          <Activity size={16} className="status-icon" />
          <span>SYSTEM: SECURE & ACTIVE</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="briefing-info">
          <Terminal size={14} />
          <span>SESSION: {briefingId}</span>
        </div>
        <div className="user-profile">
          <div className="avatar">A</div>
          <span>Analyst</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
