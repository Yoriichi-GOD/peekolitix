import React, { useState } from 'react';
import './Sidebar.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Radio, 
  History,
  BookOpen,
  PieChart,
  Globe,
  Zap,
  Swords,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ currentMode, setMode, onSynthesize, history = [], onSelectHistory }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const channels = [
    { id: 'DEBATE', label: 'Pro/Con Analysis', icon: Swords },
    { id: 'STATS', label: 'Data & Trends', icon: PieChart },
    { id: 'EXPLAIN', label: 'Policy Breakdown', icon: BookOpen },
    { id: 'GEO', label: 'Global Impact', icon: Globe },
    { id: 'QUICK', label: 'Rapid Response', icon: Zap },
  ];

  return (
    <motion.aside 
      className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}
      initial={{ width: 260 }}
      animate={{ width: isCollapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </div>

      <div className="sidebar-section">
        {!isCollapsed && <h3 className="section-title"><Radio size={14} /> INTELLIGENCE MODES</h3>}
        {isCollapsed && <div className="collapsed-icon"><Radio size={18} className="brand-icon" /></div>}
        
        <ul className="nav-list">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isActive = currentMode === channel.id;
            return (
              <li 
                key={channel.id} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMode(channel.id)}
                title={isCollapsed ? channel.label : ''}
              >
                <Icon size={18} className={isActive ? 'active-icon' : ''} />
                {!isCollapsed && <span>{channel.label}</span>}
              </li>
            );
          })}
        </ul>

        {history.length > 0 && (
          <button 
            className="synthesize-btn" 
            onClick={onSynthesize}
            title={isCollapsed ? "Synthesize History" : ""}
          >
            <Layers size={18} />
            {!isCollapsed && <span>COMBINE HISTORY</span>}
          </button>
        )}
      </div>

      <div className="sidebar-separator"></div>

      <div className="sidebar-section h-full">
        {!isCollapsed && <h3 className="section-title"><History size={14} /> RECENT BRIEFINGS</h3>}
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
      </div>
    </motion.aside>
  );
};

export default Sidebar;
