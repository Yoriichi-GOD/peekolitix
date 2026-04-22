import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './ResetPasswordRoom.css';

const ResetPasswordRoom = () => {
  const { setIsVaultLocked } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("IDENTITY CLASH: Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setIsVaultLocked(false);
        window.location.hash = ''; // Clear the security fragment
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-chamber-overlay">
      <div className="chamber-background">
        <Activity className="vault-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="reset-vault-card glass-panel"
      >
        <div className="vault-header">
          <div className="vault-icon-box">
            <Lock size={32} className="vault-lock-icon" />
          </div>
          <h2 className="vault-title">ESTABLISH NEW ACCESS CODE</h2>
          <p className="vault-subtitle">
            Your identity has been verified. Establish a new encrypted protocol for future intelligence access.
          </p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="vault-success-state"
          >
            <ShieldCheck size={48} color="#00ff00" />
            <h3>PROTOCOL SECURED</h3>
            <p>New credentials synchronized. Redirecting to War Room...</p>
          </motion.div>
        ) : (
          <form className="vault-form" onSubmit={handleUpdate}>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="NEW ACCESS CODE" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="CONFIRM ACCESS CODE" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            {error && <p className="vault-error">{error}</p>}

            <button className="vault-submit-btn" disabled={loading}>
              <span>{loading ? 'ENCRYPTING...' : 'FINALIZE PROTOCOL'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <div className="vault-footer-memo">
          <span>PEEKOLITIX SECURITY LAYER | V2.8 CYBER-ORACLE</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordRoom;
