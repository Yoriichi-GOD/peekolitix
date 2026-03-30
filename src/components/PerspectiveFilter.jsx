import React from 'react';
import './PerspectiveFilter.css';
import { Eye, Shield, AlertTriangle } from 'lucide-react';

const PerspectiveFilter = ({ currentPerspective, setPerspective }) => {
  const perspectives = [
    { id: 'NEUTRAL', label: 'Neutral Analysis', icon: Eye, colorClass: 'neutral' },
    { id: 'PRO_GOV', label: 'Pro-Gov Emphasis', icon: Shield, colorClass: 'pro' },
    { id: 'ANTI_GOV', label: 'Critical Review', icon: AlertTriangle, colorClass: 'anti' }
  ];

  return (
    <div className="perspective-filter">
      <span className="filter-label">PERSPECTIVE:</span>
      <div className="filter-buttons">
        {perspectives.map((p) => {
          const Icon = p.icon;
          const isActive = currentPerspective === p.id;
          return (
            <button
              key={p.id}
              className={`filter-btn ${isActive ? `active ${p.colorClass}` : ''}`}
              onClick={() => setPerspective(p.id)}
            >
              <Icon size={14} className="filter-icon" />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PerspectiveFilter;
