import './env.js';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import supabase from './src/config/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';

app.use(cors());
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

app.listen(PORT, () => console.log(`✅ PEAKOLITIX V2.3 ACTIVE (70B): http://localhost:${PORT}\n`));
