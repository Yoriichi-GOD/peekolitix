import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './SimulateView.css';
import { Swords, ShieldAlert, Zap } from 'lucide-react';

const SimulateView = ({ markdownContent }) => {
  // Parsing the rounds (this is a simple split, assuming AI follows the system instruction exactly)
  const rounds = markdownContent.split(/### 🏛️/);
  const intro = rounds[0];
  const roundContent = rounds.slice(1);

  return (
    <div className="simulate-container">
      {intro && <div className="arena-intro"><ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown></div>}
      
      <div className="arena-feed">
        {roundContent.map((round, idx) => {
          const title = round.split('\n')[0].trim();
          const content = round.replace(title, '').trim();
          
          return (
            <div key={idx} className="arena-round">
              <div className="round-header">
                <Swords size={16} />
                <h4>ROUND {idx + 1}: {title}</h4>
              </div>
              <div className="round-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

      <div className="arena-footer">
        <div className="arena-badge">
          <Zap size={14} />
          <span>WAR ROOM SIMULATION COMPLETE</span>
        </div>
      </div>
    </div>
  );
};

export default SimulateView;
