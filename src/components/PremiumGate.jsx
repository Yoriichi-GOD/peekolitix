import React from 'react';
import { usePremium } from '../context/PremiumContext';

const PremiumGate = ({ featureKey, children }) => {
  const { tier, openUpgradeModal } = usePremium();

  // Stub: allow all content through for now
  return <>{children}</>;
};

export default PremiumGate;
