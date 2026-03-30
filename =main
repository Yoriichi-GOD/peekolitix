import React, { createContext, useContext, useState } from 'react';

const PremiumContext = createContext(null);

export const TIERS = {
  FREE: 'FREE',
  STUDENT: 'STUDENT',
  JOURNALIST: 'JOURNALIST',
  CONSULTANT: 'CONSULTANT',
};

export const TIER_CONFIG = {
  [TIERS.FREE]: {
    label: 'Free',
    color: '#adb5bd',
    bg: 'rgba(173,181,189,0.15)',
    border: 'rgba(173,181,189,0.3)',
    dailyLimit: 15,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','BATTLE'],
    premiumModes: [],
  },
  [TIERS.STUDENT]: {
    label: 'Student',
    color: '#38b000',
    bg: 'rgba(56,176,0,0.15)',
    border: 'rgba(56,176,0,0.35)',
    price: '₹49/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','BATTLE'],
    premiumModes: ['STUDENT_PREMIUM'],
  },
  [TIERS.JOURNALIST]: {
    label: 'Journalist',
    color: '#f4a261',
    bg: 'rgba(244,162,97,0.15)',
    border: 'rgba(244,162,97,0.35)',
    price: '₹199/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK','STUDENT_PREMIUM','JOURNALIST_PREMIUM','BATTLE','SIMULATE'],
    premiumModes: ['STUDENT_PREMIUM','JOURNALIST_PREMIUM'],
  },
  [TIERS.CONSULTANT]: {
    label: 'War Room',
    color: '#c77dff',
    bg: 'rgba(199,125,255,0.15)',
    border: 'rgba(199,125,255,0.35)',
    price: '₹499/mo',
    dailyLimit: Infinity,
    modesAllowed: ['DEBATE','STATS','EXPLAIN','GEO','QUICK', 'STUDENT_PREMIUM', 'JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM', 'BATTLE', 'SIMULATE'],
    premiumModes: ['STUDENT_PREMIUM','JOURNALIST_PREMIUM','CONSULTANT_PREMIUM'],
  },
};

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }) => {
  const [tier, setTier] = useState(TIERS.FREE);
  const [queryCount, setQueryCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetTier, setTargetTier] = useState(null);

  const canQuery = () => {
    const config = TIER_CONFIG[tier];
    return queryCount < config.dailyLimit;
  };

  const incrementQuery = () => setQueryCount(c => c + 1);

  const canAccessMode = (mode) => TIER_CONFIG[tier].modesAllowed.includes(mode);

  const openUpgradeModal = (tier = null) => {
    setTargetTier(tier);
    setShowUpgradeModal(true);
  };

  const closeUpgradeModal = () => setShowUpgradeModal(false);

  const upgradeTo = (newTier) => {
    setTier(newTier);
    setQueryCount(0);
    setShowUpgradeModal(false);
  };

  return (
    <PremiumContext.Provider value={{
      tier, setTier, queryCount, canQuery, incrementQuery,
      canAccessMode, showUpgradeModal, openUpgradeModal, closeUpgradeModal,
      upgradeTo, targetTier, TIER_CONFIG, TIERS
    }}>
      {children}
    </PremiumContext.Provider>
  );
};
