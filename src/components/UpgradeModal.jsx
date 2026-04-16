import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GraduationCap, Newspaper, Briefcase, Check, Zap } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useAnalytics } from '../context/AnalyticsContext';
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
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const handleUpgrade = async (planKey) => {
    const config = TIER_CONFIG[planKey];
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

    trackEvent('upgrade_initiated', { plan: planKey });

    try {
      let token = 'dev-token';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      // 1. Contact Backend: Create Order (server validates price)
      const response = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planKey, receipt: `rcpt_${planKey}_${Date.now()}` })
      });
      const orderData = await response.json();

      if (!orderData.success) throw new Error("Order creation failed");

      // 3. Spawns Razorpay Checkout Window
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Dynamically loaded from Vercel/Local Env
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Peekolitix',
        description: `Upgrade to ${config.label} Tier`,
        order_id: orderData.order.id,
        handler: async function (response) {
          // 4. Contact Backend: Verify Payment Signature
          const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user?.id,
              plan_key: planKey
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // 5. Upgrade User Clearance!
            trackEvent('upgrade_successful', { plan: planKey });
            upgradeTo(planKey);
          } else {
            trackEvent('upgrade_failed', { plan: planKey, reason: 'verification_failed' });
            alert('Payment secured but verification failed.');
          }
        },
        prefill: {
          name: 'Analyst',
          email: 'analyst@peekolitix.com',
        },
        theme: { color: config.color }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        trackEvent('upgrade_failed', { plan: planKey, reason: response.error.description });
      });
      rzp.open();

    } catch (err) {
      console.error("Payment Error:", err);
      trackEvent('upgrade_failed', { plan: planKey, reason: err.message });
      alert('Payment could not be processed. Please try again or contact support.');
    }
  };

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
                      onClick={() => handleUpgrade(planKey)}
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
              ⚡ Secured by Razorpay. End-to-end encrypted integration mapping.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
