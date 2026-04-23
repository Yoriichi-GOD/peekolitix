import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GraduationCap, Newspaper, Briefcase, Check, Zap } from 'lucide-react';
import { usePremium, TIERS } from '../context/PremiumContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useAnalytics } from '../context/AnalyticsContext';
import { Checkout } from 'capacitor-razorpay';
import { Capacitor } from '@capacitor/core';
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
  const [selectingMethod, setSelectingMethod] = React.useState(null); // planKey when selecting
  const [showQRGuide, setShowQRGuide] = React.useState(false);
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const handleUpgrade = async (planKey) => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative && !selectingMethod) {
      setSelectingMethod(planKey);
      return;
    }

    const config = TIER_CONFIG[planKey];
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

    trackEvent('upgrade_initiated', { plan: planKey, method: 'native' });

    try {
      let token = 'dev-token';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

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

      if (isNative) {
        // NATIVE FLOW (App)
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Peekolitix',
          description: `Upgrade to ${config.label} Tier`,
          order_id: orderData.order.id,
          prefill: {
            name: user?.email?.split('@')[0] || 'Analyst',
            email: user?.email || 'analyst@peekolitix.com',
          },
          theme: { color: config.color }
        };

        try {
          const result = await Checkout.open(options);
          const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: result.razorpay_order_id,
              razorpay_payment_id: result.razorpay_payment_id,
              razorpay_signature: result.razorpay_signature,
              user_id: user?.id,
              plan_key: planKey
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            upgradeTo(planKey);
            setSelectingMethod(null);
          }
        } catch (e) { console.error("Native Checkout Failure", e); }
      } else {
        // WEB FLOW (Browser)
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Peekolitix',
          description: `Upgrade to ${config.label} Tier`,
          order_id: orderData.order.id,
          handler: async function (response) {
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
            if (verifyData.success) upgradeTo(planKey);
          },
          prefill: {
            name: user?.email?.split('@')[0] || 'Analyst',
            email: user?.email || 'analyst@peekolitix.com',
          },
          theme: { color: config.color },
          modal: { method: { qr: true } }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert('Payment Error.');
    }
  };

  const handleQRGuide = (planKey) => {
    trackEvent('upgrade_qr_guide_shown', { plan: planKey });
    setShowQRGuide(true);
  };

  const plans = [TIERS.STUDENT, TIERS.JOURNALIST, TIERS.CONSULTANT];
  const isNative = Capacitor.isNativePlatform();

  return (
    <>
      <AnimatePresence>
        {/* ... existing modal ... */}
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

                      {(isNative && selectingMethod === planKey) ? (
                        <div className="method-selector">
                          <button className="method-btn native" onClick={() => handleUpgrade(planKey)}>
                            <Zap size={14} /> PAY VIA UPI (APP)
                          </button>
                          <button className="method-btn web" onClick={() => handleQRGuide(planKey)}>
                            <Star size={14} /> PAY VIA QR (OTHER DEVICE)
                          </button>
                          <button className="method-cancel" onClick={() => setSelectingMethod(null)}>CANCEL</button>
                        </div>
                      ) : (
                        <button
                          className="plan-cta"
                          style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
                          onClick={() => handleUpgrade(planKey)}
                          disabled={isActive || (selectingMethod && selectingMethod !== planKey)}
                        >
                          {isActive ? '✓ CURRENT PLAN' : (
                            <><Zap size={14} /> ACTIVATE {config.label.toUpperCase()}</>
                          )}
                        </button>
                      )}
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

      {/* QR Activation Guide Sub-Modal */}
      <AnimatePresence>
        {showQRGuide && (
          <motion.div
            className="qr-guide-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowQRGuide(false)}
          >
            <motion.div
              className="qr-guide-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: '#0f1117', border: '1px solid rgba(123,44,255,0.4)', borderRadius: 20,
                padding: 32, maxWidth: 450, width: '100%', position: 'relative',
                boxShadow: '0 0 50px rgba(123,44,191,0.3)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQRGuide(false)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ background: 'rgba(123,44,191,0.15)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Star color="#7b2cbf" fill="#7b2cbf" size={28} />
                </div>
                <h3 style={{ letterSpacing: 2, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>QR ACTIVATION GUIDE</h3>
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: 8 }}>FOLLOW THESE STEPS ON A SECOND DEVICE</p>
              </div>

              <div className="steps-list" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { n: '01', t: <>Open <b style={{ color: '#fff' }}>peekolitix.in</b> on a PC or Laptop browser.</> },
                  { n: '02', t: <>Login with your current ID: <br /><b style={{ color: '#7b2cbf', fontSize: '0.95rem', wordBreak: 'break-all' }}>{user?.email}</b></> },
                  { n: '03', t: <>Click <b style={{ color: '#fff' }}>UPGRADE</b> or the Query Limit icon in the sidebar.</> },
                  { n: '04', t: <>Choose your plan and scan the <b style={{ color: '#fff' }}>QR Code</b> shown on that screen.</> }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 20 }}>
                    <div style={{ color: '#7b2cbf', fontWeight: '900', fontSize: '1.1rem', minWidth: 25 }}>{step.n}</div>
                    <div style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>{step.t}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowQRGuide(false)}
                style={{
                  marginTop: 36, width: '100%', background: 'var(--brand-purple)', color: 'white',
                  border: 'none', padding: '14px', borderRadius: 10, fontWeight: '800', cursor: 'pointer',
                  letterSpacing: 1, boxShadow: '0 4px 15px rgba(123,44,191,0.4)'
                }}
              >
                UNDERSTOOD
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UpgradeModal;
