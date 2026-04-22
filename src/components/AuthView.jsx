import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AuthView.css';
import { useAuth } from '../context/AuthContext';

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);


  const handleAuth = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRecovery) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://www.peekolitix.in'
        });
        if (error) throw error;
        setSuccess("RECOVERY PROTOCOL: Reset link dispatched to your secure mail.");
        setCooldown(15);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: 'https://www.peekolitix.in'
          }
        });
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          setError("This identity is already established. Please attempt access via Login.");
        } else {
          setSuccess("SECURITY PROTOCOL: Verification link dispatched. Check your encrypted mail.");
          setCooldown(15);
        }
      }
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError("IDENTITY CLASH: This email is already registered in our systems.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-overlay">
      <div className="auth-background">
        <Activity className="bg-icon-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="auth-card glass-panel"
      >
        <div className="auth-header">
            <img src="/peekolitix_logo.png" alt="Peekolitix Mask" className="auth-mask-logo" />
          <h2 className="auth-title">
            {isRecovery ? 'RECOVER ACCESS' : isLogin ? 'SECURITY CLEARANCE' : 'ESTABLISH IDENTITY'}
          </h2>
          <p className="auth-subtitle">
            {isRecovery ? 'Initiate protocol to reset your access code.' : isLogin ? 'Enter your credentials to access the War Room.' : 'Join the elite strategic intelligence network.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="email" 
              placeholder="STRATEGIC EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {!isRecovery && (
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="ACCESS CODE" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">{error}</motion.p>}
          {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-success" style={{ color: '#00ff00', fontSize: '0.8rem', padding: '10px' }}>{success}</motion.p>}

          <button className="auth-submit-btn" disabled={loading || cooldown > 0}>
            <span>
              {loading ? 'VERIFYING...' : 
               cooldown > 0 ? `RETRY IN ${cooldown}s` :
               isRecovery ? 'INITIATE RECOVERY' : 
               isLogin ? 'INITIATE ACCESS' : 'CREATE PROTOCOL'}
            </span>
            {!loading && cooldown === 0 && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin && !isRecovery && (
            <button className="toggle-auth-btn" onClick={() => setIsRecovery(true)} style={{ marginBottom: 10, opacity: 0.7 }}>
              FORGOT ACCESS CODE?
            </button>
          )}
          
          {isRecovery ? (
             <button className="toggle-auth-btn" onClick={() => setIsRecovery(false)}>
                RETURN TO LOGIN
             </button>
          ) : (
            <button className="toggle-auth-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "DON'T HAVE AN IDENTITY? CREATE ONE" : "ALREADY VERIFIED? LOGIN"}
            </button>
          )}
        </div>

        <div className="auth-security-memo">
          <Activity size={10} />
          <span>ENCRYPTED END-TO-END POINT | MARCH 2026</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
