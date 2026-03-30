import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { usePremium } from '../context/PremiumContext';
import { motion } from 'framer-motion';
import './PremiumGate.css';

const GATE_CONFIG = {
  STUDENT_PREMIUM: {
    title: 'Student Debate Pack',
    tier: 'STUDENT',
    color: '#38b000',
    border: 'rgba(56,176,0,0.3)',
    bg: 'rgba(56,176,0,0.08)',
    preview: `### 🎯 ARGUMENT EVALUATOR
- **Logic:** 8/10 — Strong structural argument with clear premise
- **Evidence:** 6/10 — Some data cited; needs more sourcing
- **Persuasion:** 7/10 — Effective framing, weak closing
- **Overall Debate Score:** 7/10

### ⚔️ COUNTER-ARGUMENT GENERATOR
> **Counter 1:** The GDP growth figures cited ignore the base effect of FY21 contraction...

### 📝 EXAM-READY SUMMARY (ELI18)
India's fiscal policy has shifted from consumption to investment-led growth since 2016...`,
  },
  JOURNALIST_PREMIUM: {
    title: 'Journalist Intelligence Pack',
    tier: 'JOURNALIST',
    color: '#f4a261',
    border: 'rgba(244,162,97,0.3)',
    bg: 'rgba(244,162,97,0.08)',
    preview: `### 📋 RTI ANGLE
> **RTI to:** Ministry of Finance  
> **Ask for:** District-wise MGNREGS fund utilization FY23-24

### 🕐 POLICY TIMELINE
**2014:** NDA comes to power, MAKE IN INDIA launched
**2016:** Demonetization shock to informal economy
**2020:** COVID lockdown, GDP contracts -6.6%...

### ✍️ ARTICLE OPENER
"While the government celebrates 8% GDP growth, the 45-year high in unemployment among urban youth tells a different story..."`,
  },
  CONSULTANT_PREMIUM: {
    title: 'War Room Pack',
    tier: 'CONSULTANT',
    color: '#c77dff',
    border: 'rgba(199,125,255,0.3)',
    bg: 'rgba(199,125,255,0.08)',
    preview: `### 🏛️ ALLIANCE RISK SCANNER
- **Coalition Fragility Score:** HIGH
- **Ideological Fault Lines:** Seat-sharing disputes in UP, Bihar

### 🗳️ SWING FACTOR ANALYSIS
> **Factor 1:** Farmer income stagnation in MP, Rajasthan, HP
> **Impact:** Shifts 8-12% rural votes against incumbent...

### 🎭 NARRATIVE STRESS TEST
**Ruling Party says:** "Inflation is under control at 4.7%"
**Opposition counters:** "Food inflation at 7.6% hits the poor hardest"...`,
  },
};

const PremiumGate = ({ modeKey }) => {
  const { openUpgradeModal, TIER_CONFIG, TIERS } = usePremium();
  const config = GATE_CONFIG[modeKey];
  if (!config) return null;

  const tierConfig = TIER_CONFIG[config.tier ? TIERS[config.tier] : TIERS.STUDENT];

  return (
    <motion.div
      className="premium-gate"
      style={{ '--gate-color': config.color, '--gate-border': config.border, '--gate-bg': config.bg }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="gate-preview-wrap">
        <div className="gate-preview-content">
          <pre className="gate-preview-text">{config.preview}</pre>
        </div>
        <div className="gate-blur-overlay" />
      </div>

      <div className="gate-cta-panel">
        <div className="gate-lock-icon">
          <Lock size={28} style={{ color: config.color }} />
        </div>
        <h3 className="gate-title">{config.title}</h3>
        <p className="gate-subtitle">
          This section is available on the <strong style={{ color: config.color }}>{config.tier}</strong> plan.
          Upgrade to unlock the full analysis layer.
        </p>
        <button
          className="gate-cta-btn"
          style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
          onClick={() => openUpgradeModal(config.tier === 'CONSULTANT' ? 'CONSULTANT' : config.tier)}
        >
          <Zap size={16} /> Unlock {config.title} →
        </button>
      </div>
    </motion.div>
  );
};

export default PremiumGate;
