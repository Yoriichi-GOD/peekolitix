import React, { useState } from 'react';
import './RightPanel.css';
import { Target, TrendingUp, ShieldAlert, Award, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RightPanel = ({ history = [] }) => {
  // Extract data for chart
  const chartData = history.map((h, i) => ({
    name: `T${i + 1}`,
    score: Number(h.dominanceScore || 5),
    query: h.query.substring(0, 15) + '...'
  }));

  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  const avgScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + Number(curr.dominanceScore || 5), 0) / history.length).toFixed(1)
    : 0;

  const getRank = (score) => {
    if (score === 0) return "UNRANKED";
    if (score < 4) return "ROOKIE ANALYST";
    if (score < 7) return "FIELD STRATEGIST";
    if (score < 9) return "DEBATE ARCHITECT";
    return "WAR ROOM KING";
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside className="right-panel-collapsed">
        <button className="rp-toggle-btn" onClick={() => setIsCollapsed(false)} title="Show Intel Panel">
          <PanelRightOpen size={16} />
          <span className="rp-toggle-text">INTEL</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="right-panel glass-panel">
      <button className="rp-collapse-btn" onClick={() => setIsCollapsed(true)} title="Hide Intel Panel">
        <PanelRightClose size={14} />
      </button>
      <div className="panel-section">
        <h3 className="panel-title">
          <Award size={16} className="text-accent" />
          INTELLIGENCE RANKING
        </h3>
        <div className="rank-card">
          <div className="rank-main">
            <span className="rank-label">CURRENT STATUS</span>
            <h2 className="rank-value">{getRank(avgScore)}</h2>
          </div>
          <div className="rank-stats">
            <div className="stat-item">
              <span className="stat-label">AVG SCORE</span>
              <span className="stat-num">{avgScore}/10</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">TURNS</span>
              <span className="stat-num">{history.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-separator"></div>

      <div className="panel-section flex-1">
        <h3 className="panel-title">
          <TrendingUp size={16} style={{ color: '#00d4ff' }} />
          DOMINANCE TREND
        </h3>
        <div className="chart-container">
          {history.length < 2 ? (
            <div className="empty-chart">
              <Target size={32} className="pulse" />
              <p>Gathering intelligence to build your combat profile...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2833" vertical={false} />
                <XAxis dataKey="name" stroke="#adb5bd" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13151c', border: '1px solid rgba(199,125,255,0.3)', borderRadius: '8px' }}
                  itemStyle={{ color: '#c77dff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#c77dff" 
                  strokeWidth={3} 
                  dot={{ fill: '#c77dff', r: 4 }} 
                  activeDot={{ r: 6, stroke: '#fff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel-separator"></div>

      <div className="panel-section">
        <h3 className="panel-title">
          <ShieldAlert size={16} style={{ color: lastEntry?.biasLevel === 'High' ? '#ff4d4d' : '#38b000' }} />
          LAST ENGAGEMENT
        </h3>
        <div className="stats-box">
          <div className="grid-stat">
            <span className="grid-label">BIAS DETECTED</span>
            <span className={`grid-value ${lastEntry?.biasLevel === 'High' ? 'text-danger' : 'text-success'}`}>
              {lastEntry?.biasLevel || 'N/A'}
            </span>
          </div>
          <div className="grid-stat">
            <span className="grid-label">WIN PROBABILITY</span>
            <span className="grid-value text-accent">{lastEntry?.winProbability || '0%'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
