import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const PremiumContext = createContext(null);

export const TIERS = {
  FREE: 'FREE',
  STUDENT: 'STUDENT',
  JOURNALIST: 'JOURNALIST',
  CONSULTANT: 'CONSULTANT',
  DEV: 'DEV',
};

// Public tiers (visible to normal users)
export const PUBLIC_TIERS = ['FREE', 'STUDENT', 'JOURNALIST', 'CONSULTANT'];

export const TIER_CONFIG = {
  [TIERS.FREE]: {
    label: 'Free',
    color: '#adb5bd',
    bg: 'rgba(173,181,189,0.15)',
    border: 'rgba(173,181,189,0.3)',
    dailyLimit: 15,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','BATTLE','VERIFY','COMPARE'],
    premiumModes: [],
  },
  [TIERS.STUDENT]: {
    label: 'Student',
    color: '#38b000',
    bg: 'rgba(56,176,0,0.15)',
    border: 'rgba(56,176,0,0.35)',
    price: '₹49/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','BATTLE','VERIFY','COMPARE'],
    premiumModes: ['STUDENT_PREMIUM'],
  },
  [TIERS.JOURNALIST]: {
    label: 'Journalist',
    color: '#f4a261',
    bg: 'rgba(244,162,97,0.15)',
    border: 'rgba(244,162,97,0.35)',
    price: '₹199/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','JOURNALIST_PREMIUM','BATTLE','SIMULATE','VERIFY','COMPARE'],
    premiumModes: ['STUDENT_PREMIUM','JOURNALIST_PREMIUM'],
  },
  [TIERS.CONSULTANT]: {
    label: 'War Room',
    color: '#c77dff',
    bg: 'rgba(199,125,255,0.15)',
    border: 'rgba(199,125,255,0.35)',
    price: '₹499/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','JOURNALIST_PREMIUM','CONSULTANT_PREMIUM','BATTLE','SIMULATE','VERIFY','COMPARE'],
    premiumModes: ['STUDENT_PREMIUM','JOURNALIST_PREMIUM','CONSULTANT_PREMIUM'],
  },
  [TIERS.DEV]: {
    label: 'Developer',
    color: '#00ff88',
    bg: 'rgba(0,255,136,0.1)',
    border: 'rgba(0,255,136,0.35)',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','JOURNALIST_PREMIUM','CONSULTANT_PREMIUM','BATTLE','SIMULATE','VERIFY','COMPARE'],
    premiumModes: ['STUDENT_PREMIUM','JOURNALIST_PREMIUM','CONSULTANT_PREMIUM'],
  },
};

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }) => {
  const [tier, setTier] = useState(TIERS.FREE);
  const [activeTier, setActiveTier] = useState(TIERS.FREE); // For DEV tier switching
  const [realTier, setRealTier] = useState(TIERS.FREE); // The actual DB tier
  const [queryCount, setQueryCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetTier, setTargetTier] = useState(null);
  const { user } = useAuth() || {};

  // Fetch tier and usage from backend on login (replaces local Map with persistent DB tracking)
  useEffect(() => {
    if (!user?.id || !supabase) return;
    const syncStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';
        const res = await fetch(`${BACKEND_URL}/api/user-status`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setRealTier(data.tier);
          setTier(data.tier);
          setActiveTier(data.tier);
          setQueryCount(data.queryCount);
        }
      } catch (err) {
        console.error("Failed to sync premium status:", err);
      }
    };
    syncStatus();
  }, [user]);

  const isDev = realTier === TIERS.DEV;

  // DEV users can switch to any tier to test; normal users use their real tier
  const effectiveTier = isDev ? activeTier : tier;
  const effectiveConfig = TIER_CONFIG[effectiveTier] || TIER_CONFIG[TIERS.FREE];

  const canQuery = () => effectiveConfig.dailyLimit === Infinity || queryCount < effectiveConfig.dailyLimit;
  const incrementQuery = () => setQueryCount(c => c + 1);
  const canAccessMode = (mode) => effectiveConfig.modesAllowed.includes(mode);

  // DEV tier switching
  const devSwitchTier = (newTier) => {
    if (!isDev) return;
    setActiveTier(newTier);
  };

  const openUpgradeModal = (t = null) => {
    setTargetTier(t);
    setShowUpgradeModal(true);
  };

  const closeUpgradeModal = () => setShowUpgradeModal(false);

  const upgradeTo = (newTier) => {
    setTier(newTier);
    setActiveTier(newTier);
    setQueryCount(0);
    setShowUpgradeModal(false);
  };

  return (
    <PremiumContext.Provider value={{
      tier: effectiveTier, realTier, isDev, activeTier,
      setTier, queryCount, canQuery, incrementQuery,
      canAccessMode, showUpgradeModal, openUpgradeModal, closeUpgradeModal,
      upgradeTo, devSwitchTier, targetTier, TIER_CONFIG, TIERS, PUBLIC_TIERS
    }}>
      {children}
    </PremiumContext.Provider>
  );
};
