import React, { useState, useEffect } from 'react';
import './RightPanel.css';
import { Lightbulb, CalendarDays } from 'lucide-react';

const funFacts = [
  "India's Parliament (Sansad Bhavan) circular shape was inspired by the Chausath Yogini temple in Madhya Pradesh.",
  "The Rajya Sabha carpet is red (representing royalty and the blood of martyrs), while Lok Sabha's is green (representing agriculture).",
  "The original Indian Constitution was handwritten by Prem Behari Narain Raizada in a flowing italic style.",
  "India has the world's largest biometric ID system, Aadhaar, covering over 1.3 billion residents.",
  "The phrase 'Satyameva Jayate' from the Mundaka Upanishad is inscribed below the State Emblem of India."
];

const RightPanel = () => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Rotate facts every 15 seconds
    const idx = Math.floor(Math.random() * funFacts.length);
    setFactIndex(idx);
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="right-panel glass-panel">
      <div className="panel-section">
        <h3 className="panel-title">
          <CalendarDays size={16} className="text-accent" />
          DAILY SUMMARY
        </h3>
        <div className="summary-card">
          <p className="summary-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <ul className="summary-list">
            <li>Cabinet approves new semiconductor manufacturing policy.</li>
            <li>Monsoon session of Parliament expected to address 15 new bills.</li>
            <li>RBI maintains repo rate at 6.5% for the 8th consecutive time.</li>
          </ul>
        </div>
      </div>

      <div className="panel-separator"></div>

      <div className="panel-section fact-section flex-1">
        <h3 className="panel-title">
          <Lightbulb size={16} className="text-warning" style={{ color: '#ffd166' }} />
          GEOPOLITICAL FACT
        </h3>
        <div className="fact-card">
          <p className="fact-text">{funFacts[factIndex]}</p>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
