import './env.js';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import supabase from './src/config/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// Strict Firewall: Only allow the Vercel frontend to query the Llama 70B Engine
const corsOptions = {
  origin: ['https://peekolitix.vercel.app', 'http://localhost:5174'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

console.log('🚀 Peekolitix Intelligence Engine v2.3 (70B Enforcer) Starting...');

const GET_TIER_INSTRUCTION = (tier) => {
  if (tier === 'STUDENT_PREMIUM') return `### 🎓 STUDENT PREMIUM DELIVERABLES (MANDATORY) ###
- [JAM/GD EVALUATOR]: Critical logic score (1-10) for this politician/policy.
- [ELI18 SUMMARY]: Simplified analogy using cricket or college exams.
- [DEBATE PUNCHLINES]: 3 high-impact rebuttals.`;

  if (tier === 'JOURNALIST_PREMIUM') return `### 📰 JOURNALIST PREMIUM DELIVERABLES (MANDATORY) ###
- [RTI ANGLE]: 3 RTI queries to unlock hidden data.
- [THE HIDDEN STORY]: 1 under-reported investigative angle.
- [NEWS HEADLINE]: Compelling lead article opener.`;

  if (tier === 'CONSULTANT_PREMIUM' || tier === 'WAR ROOM') return `### ⚔️ CONSULTANT/WAR ROOM DELIVERABLES (MANDATORY) ###
- [ALLIANCE RISK SCANNER]: Coalitional stability assessment.
- [SWING FACTOR]: 3-5% voter block impact (caste/region) analysis.
- [NARRATIVE STRESS TEST]: 3 logical cracks in the opponent's PR narrative.
- [STRATEGIC ASYMMETRY]: Local power imbalance evaluation.`;

  return "";
};

app.post('/api/ai/analyze-v2', async (req, res) => {
  try {
    const { query, mode, perspective, history = [], systemInstruction, premiumModeKey } = req.body;

    console.log(`\n📊 New Request: Tier=${premiumModeKey || 'FREE'}`);

    const chatHistory = history.map(h => ({
      role: "assistant",
      content: h.report || h.content || ''
    }));

    const tierHeader = GET_TIER_INSTRUCTION(premiumModeKey);
    const userPrompt = `You are a Senior Political Strategist. Perform a deep ${mode} analysis of: "${query}".

${tierHeader}

STRICT: You MUST output the above deliverables using the exact headers provided.
STRICT: Avoid vague language. Use Indian official metrics (MPLADS, LGD, MoSPI).`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: `You are Peekolitix, the Indian Political Intelligence Engine. Present verifiable, structured, data-backed analysis.` },
          ...chatHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        top_p: 1.0,
        max_tokens: 3500,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "NVIDIA Engine Error");

    res.json({
      success: true,
      content: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ==== SECURE PERSISTENCE LAYER ====
app.post('/api/save-briefing', async (req, res) => {
  try {
    const { query, mode, perspective, report, dominanceScore, biasLevel, winProbability, user_id } = req.body;

    // SECURITY: Reject unsecured requests
    if (!user_id) return res.status(401).json({ error: "Unauthorized. User ID missing." });

    const { error } = await supabase
      .from('debates')
      .insert([{
        user_id: user_id,
        topic: query,
        side: perspective,
        response: { mode, report, dominanceScore, biasLevel, winProbability }
      }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/history', async (req, res) => {
  try {
    const { user_id } = req.body;

    // SECURITY: Ensure absolute dashboard isolation
    if (!user_id) return res.status(401).json({ error: "Unauthorized. User ID missing." });

    const { data, error } = await supabase
      .from('debates')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const history = data.map(item => ({
      id: item.id, query: item.topic, perspective: item.side, mode: item.response.mode || 'DEBATE',
      report: item.response.report, dominanceScore: item.response.dominanceScore || 5,
      biasLevel: item.response.biasLevel || 'Low', winProbability: item.response.winProbability || '50%',
      timestamp: item.created_at
    }));
    res.json({ success: true, history });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==== RAZORPAY MONETIZATION ENGINE ====
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // Amount is in currency subunits (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ error: 'Failed to create order' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, plan_key } = req.body;

    // Secure cryptographic signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Security Check Passed! Valid Payment.

      // Upgrade the Analyst's Global Clearance in Supabase
      if (user_id && plan_key) {
        const { error } = await supabase
          .from('profiles')
          .update({ tier: plan_key })
          .eq('id', user_id);

        if (error) throw new Error("Payment verified, but failed to upgrade Supabase profile.");
      }

      res.json({ success: true, message: 'Payment verified and identity upgraded.' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid Payment Signature' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ PEAKOLITIX V2.3 ACTIVE (70B): http://localhost:${PORT}\n`));
app.get("/", (req, res) => {
  res.send("🚀 Peekolitix Backend is Running");
});
