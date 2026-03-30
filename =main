import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GraduationCap, Newspaper, Briefcase, Check, Zap } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';
import './UpgradeModal.css';

const PLAN_ICONS = {
  [TIERS.STUDENT]: GraduationCap,
  [TIERS.JOURNALIST]: Newspaper,
  [TIERS.CONSULTANT]: Briefcase,
};

const PLAN_FEATURES = {
  [TIERS.STUDENT]: [
    'Unlimited queries (Free: 15/day)',
    'All 5 modes + Combined History Output',
    'Argument Evaluator — AI scores your JAM/GD speech',
    'Counter-Argument Generator — 3 sharp rebuttals per query',
    'ELI18 Exam-Ready Summary — simplified with analogies',
    'PDF Export — one-click debate prep sheet',
    'Unlimited history storage',
  ],
  [TIERS.JOURNALIST]: [
    'Everything in Student',
    'RTI Angle Generator',
    'Policy Timeline Builder',
    'Hidden Story Angles (3 per query)',
    'Article Opener Draft',
    'Government Claim Tracker',
    'Multi-language summary',
  ],
  [TIERS.CONSULTANT]: [
    'Everything in Journalist',
    'Alliance Risk Scanner',
    'Swing Factor Analysis',
    'Narrative Stress Test (full 3-round)',
    'Opposition Research Dossier',
    'Constituency Impact Profile',
    'White-label PDF reports',
    'API access',
  ],
};

const UpgradeModal = () => {
  const { showUpgradeModal, closeUpgradeModal, upgradeTo, TIER_CONFIG, TIERS, targetTier, tier } = usePremium();

  const plans = [TIERS.STUDENT, TIERS.JOURNALIST, TIERS.CONSULTANT];

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeUpgradeModal}
        >
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Star size={20} className="modal-star" />
                <h2>UNLOCK PREMIUM INTELLIGENCE</h2>
              </div>
              <button className="modal-close" onClick={closeUpgradeModal}><X size={18} /></button>
            </div>

            <p className="modal-subtitle">
              Choose your tier. Analysts win debates. War Rooms win elections.
            </p>

            <div className="plans-grid">
              {plans.map(planKey => {
                const config = TIER_CONFIG[planKey];
                const Icon = PLAN_ICONS[planKey];
                const features = PLAN_FEATURES[planKey];
                const isHighlighted = targetTier === planKey;
                const isActive = tier === planKey;

                return (
                  <motion.div
                    key={planKey}
                    className={`plan-card ${isHighlighted ? 'plan-highlighted' : ''} ${isActive ? 'plan-active' : ''}`}
                    style={{ '--plan-color': config.color, '--plan-bg': config.bg, '--plan-border': config.border }}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {isHighlighted && <div className="plan-badge">RECOMMENDED</div>}
                    <div className="plan-icon-wrap" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
                      <Icon size={22} style={{ color: config.color }} />
                    </div>
                    <h3 className="plan-name" style={{ color: config.color }}>{config.label}</h3>
                    <div className="plan-price">{config.price}</div>

                    <ul className="plan-features">
                      {features.map((f, i) => (
                        <li key={i}>
                          <Check size={13} style={{ color: config.color, flexShrink: 0 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="plan-cta"
                      style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
                      onClick={() => upgradeTo(planKey)}
                      disabled={isActive}
                    >
                      {isActive ? '✓ CURRENT PLAN' : (
                        <><Zap size={14} /> ACTIVATE {config.label.toUpperCase()}</>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <p className="modal-disclaimer">
              ⚡ Demo mode — click any plan to simulate activation. No payment required.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
