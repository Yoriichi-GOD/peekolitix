import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, CreditCard, Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const PaySafeRoom = () => {
    const [status, setStatus] = useState('initializing'); // initializing, ready, paid, error
    const [orderData, setOrderData] = useState(null);
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('oid');
    const plan = searchParams.get('plan') || 'Premium';

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            return;
        }

        // Wait for Razorpay script to be ready (it's injected in index.html)
        const checkRzp = setInterval(() => {
            if (window.Razorpay) {
                clearInterval(checkRzp);
                setStatus('ready');
                triggerCheckout();
            }
        }, 500);

        return () => clearInterval(checkRzp);
    }, [orderId]);

    const triggerCheckout = () => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: 0, // Will be handled by order_id
            order_id: orderId,
            name: 'Peekolitix',
            description: `Sovereign Intelligence: ${plan}`,
            handler: function (response) {
                setStatus('paid');
            },
            modal: {
                ondismiss: function() {
                    // Logic to stay on page or redirect
                }
            },
            theme: { color: '#7b2cbf' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#0a0b10',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(123,44,191,0.2)' }}
            >
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(123,44,191,0.2)', padding: 16, borderRadius: '50%' }}>
                        <ShieldCheck size={40} color="#7b2cbf" />
                    </div>
                </div>
                
                <h2 style={{ letterSpacing: 2, marginBottom: 8 }}>PEEKOLITIX SECURE CHECKOUT</h2>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 32 }}>Handover established for Order: {orderId?.substring(0, 10)}...</p>

                {status === 'initializing' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" />
                        <span>Initializing Secure Relay...</span>
                    </div>
                )}

                {status === 'ready' && (
                    <button 
                        onClick={triggerCheckout}
                        style={{
                            background: '#7b2cbf',
                            color: 'white',
                            border: 'none',
                            padding: '12px 32px',
                            borderRadius: 8,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <CreditCard size={18} /> OPEN PAYMENT GATEWAY
                    </button>
                )}

                {status === 'paid' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8 }}>✓ PAYMENT SUCCESSFUL</div>
                        <p style={{ color: '#888' }}>Intelligence clearance granted. You can now close this tab and return to the app.</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <div style={{ color: '#ff5252' }}>⚠️ INVALID ORDER ID. PLEASE RE-INITIATE FROM THE APP.</div>
                )}

                <div style={{ marginTop: 40, fontSize: '0.7rem', color: '#444', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <Lock size={10} /> SECURED BY RAZORPAY ENCRYPTION
                </div>
            </motion.div>
        </div>
    );
};

export default PaySafeRoom;
