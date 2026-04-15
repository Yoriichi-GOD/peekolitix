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

  // Fetch tier from Supabase on login (secure — no localStorage)
  useEffect(() => {
    if (!user?.id || !supabase) return;
    const fetchTier = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();
      if (data?.tier) {
        const dbTier = data.tier;
        setRealTier(dbTier);
        setTier(dbTier);
        setActiveTier(dbTier);
      }
    };
    fetchTier();
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
