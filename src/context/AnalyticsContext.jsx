import posthog from 'posthog-js';
import React, { createContext, useContext, useEffect } from 'react';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  useEffect(() => {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (key) {
      posthog.init(key, {
        api_host: host,
        autocapture: true, // Captures clicks and pageviews automatically
        capture_pageview: true,
        persistence: 'localStorage',
      });
    } else if (import.meta.env.PROD) {
      console.warn('[ANALYTICS]: VITE_POSTHOG_KEY is missing. No analytics will be recorded in production.');
    }
  }, []);

  const trackEvent = (eventName, properties = {}) => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture(eventName, properties);
    } else {
      console.log(`[POSTHOG DEV]: ${eventName}`, properties);
    }
  };

  const identifyUser = (userId, email) => {
    if (import.meta.env.VITE_POSTHOG_KEY && userId) {
      posthog.identify(userId, { email });
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, identifyUser }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
