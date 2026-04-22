import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Dev mode: skip auth when Supabase is not configured
  const devMode = !supabase;
  const [user, setUser] = useState(devMode ? { id: 'dev-user', email: 'dev@peekolitix.local' } : null);
  const [loading, setLoading] = useState(!devMode);

  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(() => setIsRecovery(true), 0);
        setIsRecovery(true);
      }
    });

    // Check URL immediately
    if (window.location.href.includes('type=recovery') || window.location.hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out error:', error.message);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isRecovery, setIsRecovery }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
