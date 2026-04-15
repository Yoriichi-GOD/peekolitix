import './env.js';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import supabase from './src/config/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ========================================================================
// CORS FIREWALL — only allow known frontend origins
// ========================================================================
const corsOptions = {
  origin: IS_PRODUCTION
    ? ['https://peekolitix.vercel.app', 'https://peekolitix.in', 'https://www.peekolitix.in']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// ========================================================================
// RATE LIMITING — 10 requests per minute per IP on the AI endpoint
// ========================================================================
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Rate limit exceeded. Try again in 60 seconds.' }
});
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Try again shortly.' }
});

// ========================================================================
// SECURITY MIDDLEWARE: SUPABASE JWT AUTHENTICATION 
// ========================================================================
const authenticate = async (req, res, next) => {
  if (!supabase) {
    if (IS_PRODUCTION) return res.status(503).json({ error: 'Authentication service unavailable.' });
    req.user = { id: 'dev-user' }; // Fixed ID — never trust client input
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// ========================================================================
// SECURITY MIDDLEWARE: BACKEND QUERY RATE LIMITING (15 limit for Free tier)
// ========================================================================
const userQueryTracker = new Map();

const checkQueryLimit = async (req, res, next) => {
  if (!req.user || req.user.id === 'dev-user') return next();

  let userTier = 'FREE';
  if (supabase) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', req.user.id)
        .single();
      if (profile && profile.tier) {
        userTier = profile.tier;
      }
    } catch (err) {
      console.warn("Tier check failed, assuming FREE:", err.message);
    }
  }

  if (userTier === 'FREE' || userTier === null || userTier === undefined) {
    const currentCount = userQueryTracker.get(req.user.id) || 0;
    if (currentCount >= 15) {
      return res.status(429).json({ error: 'Daily query limit reached for FREE tier.' });
    }
    userQueryTracker.set(req.user.id, currentCount + 1);
  }

  next();
};

console.log('Peekolitix Intelligence Engine v2.4 (70B Enforcer) Starting...');

// ========================================================================
// ALLOWED MODES WHITELIST
// ========================================================================
const ALLOWED_MODES = ['CHAT', 'DEBATE', 'STATS', 'EXPLAIN', 'GEO', 'QUICK', 'VERIFY', 'COMPARE', 'BATTLE', 'SIMULATE'];

// ========================================================================
// ALLOWED PREMIUM TIER KEYS
// ========================================================================
const ALLOWED_PREMIUM_KEYS = ['STUDENT_PREMIUM', 'JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM', 'WAR ROOM'];

// ========================================================================
// SERVER-SIDE PLAN PRICES (INR) — never trust client-supplied amounts
// ========================================================================
const PLAN_PRICES = { STUDENT: 49, JOURNALIST: 199, CONSULTANT: 499 };

// ========================================================================
// DOMINANCE SCORE JSON DIRECTIVE — appended to every mode prompt
// ========================================================================
const DOMINANCE_SCORE_DIRECTIVE = `

SILENT INSTRUCTION (do NOT print any header or label for this): On the very last line of your response, output ONLY this JSON object with no other text around it:
{ "dominanceScore": X, "biasLevel": "Low/Med/High", "winProbability": "X%" }
Replace X with your actual scores. Do NOT write "JSON Footer" or any label. Just the raw JSON object on the final line.`;

// ========================================================================
// FULL MODE INSTRUCTION MAP — each mode gets its own structured prompt
// ========================================================================
const MODE_INSTRUCTIONS = {
  CHAT: `You are Peekolitix, an Indian Political Intelligence Engine. You are in free-form CHAT mode.

Answer the user's question directly, clearly, and with data when available. You are not bound to any specific output structure in this mode.

Guidelines:
- Be conversational but authoritative
- Use Indian government sources (PIB, MoSPI, RBI, PRS, Census) when citing data
- Distinguish between FACT, INTERPRETATION, and NARRATIVE when relevant
- If the question is vague, give a concise answer and suggest which analytical tool (Debate, Stats, Verify, Compare, etc.) would give deeper insight
- Keep responses focused and useful — no unnecessary filler${DOMINANCE_SCORE_DIRECTIVE}`,

  DEBATE: `You are Peekolitix in DEBATE mode. Produce the following sections with EXACT headers:

## Executive Thesis
A 2-3 sentence thesis summarizing the core political argument.

## Structural Intelligence
Provide exactly 4 numbered points of structural analysis (policy mechanics, institutional dynamics, fiscal data, constitutional implications).

## Opponent Weakness Detection
Provide exactly 3 items, each formatted as:
**Argument:** [opponent claim]
**Flaw:** [why it fails, with data]

## Nerd Mode
One deep-cut statistic or obscure policy detail that only an insider would know.

## Debate Punchline
A single devastating one-liner that wins the argument.

## Sources
Numbered list of verifiable Indian government or institutional sources (MoSPI, NITI Aayog, PRS Legislative, Election Commission, etc.).${DOMINANCE_SCORE_DIRECTIVE}`,

  STATS: `You are Peekolitix in STATS mode. Produce the following sections with EXACT headers:

## Core Metrics
List 4-6 key statistics with exact numbers, units, and source year.

## Time Comparison
Compare current values vs 5 and 10 years ago. Use a table format.

## Trend Analysis
Describe the trajectory — improving, declining, or stagnant — with supporting data.

## Context
Explain what these numbers actually mean for citizens on the ground.

## Limitations
Acknowledge data gaps, methodology issues, or contested figures.

## Sources
Numbered list of verifiable sources (MoSPI, RBI, World Bank, NITI Aayog, etc.).${DOMINANCE_SCORE_DIRECTIVE}`,

  EXPLAIN: `You are Peekolitix in EXPLAIN mode. Produce the following sections with EXACT headers:

## Simple Explanation (ELI18)
Explain the topic as if the reader is a smart 18-year-old Indian college student. Use simple language, no jargon.

## How It Works
Break down the mechanism / process / policy step by step.

## Real World Example
Give one concrete India-specific example that makes this tangible (reference a specific state, scheme, or event).

## Why It Matters
Explain the real-world impact on jobs, prices, rights, or governance.

## Common Misconceptions
List 2-3 things people commonly get wrong about this topic.

## Sources
Numbered list of verifiable sources.${DOMINANCE_SCORE_DIRECTIVE}`,

  GEO: `You are Peekolitix in GEO mode. Produce the following sections with EXACT headers:

## Basic Profile
State/region name, population, GDP, ruling party, key demographics.

## Development Metrics
HDI, literacy rate, per-capita income, urbanization %, key infrastructure stats.

## Government Intervention
Major central and state schemes active in this region, with budget allocations.

## Growth Trend (10-15 Years)
Trajectory of economic and social indicators over the past decade-plus. Use data points.

## Comparative Insights
Compare with 2-3 similar states/regions on key metrics.

## Debate Angle
How this region's data can be weaponized in a political debate (both sides).

## Sources
Numbered list of verifiable sources (Census, NITI Aayog, RBI State Finances, etc.).${DOMINANCE_SCORE_DIRECTIVE}`,

  QUICK: `You are Peekolitix in QUICK mode. Be extremely concise. Produce the following sections with EXACT headers:

## 3 Bullet Facts
- Fact 1
- Fact 2
- Fact 3

## Key Stat
One single killer statistic with source.

## Punchline
One sharp sentence that captures the essence.

## Source
One primary verifiable source.${DOMINANCE_SCORE_DIRECTIVE}`,

  VERIFY: `You are Peekolitix in VERIFY (Fact-Check) mode. Produce the following sections with EXACT headers:

## Verdict
State exactly one of: TRUE / PARTIALLY TRUE / FALSE / MISLEADING / UNVERIFIABLE

## Claim Analyzed
Restate the exact claim being fact-checked.

## Actual Data
Provide 3-4 data points that address the claim. Each must include:
- The data point
- Source (named institution)
- Confidence level (High/Medium/Low)

## Why It's Misleading
Explain the specific logical, statistical, or contextual trick being used (if applicable). If the claim is TRUE, explain what nuance is still missing.

## Correct Framing
Rewrite the claim accurately based on the data.

## Sources
Numbered list of verifiable sources.${DOMINANCE_SCORE_DIRECTIVE}`,

  COMPARE: `You are Peekolitix in COMPARE mode. Produce the following sections with EXACT headers:

### COMPARISON FAIRNESS RULES (MANDATORY) ###
You MUST follow these rules to avoid misleading comparisons:
1. USE MATCHED TIMEFRAMES — compare equal-length periods. Never compare a party's best 3 years against another's worst 5 years.
2. ACCOUNT FOR EXTERNAL SHOCKS — if one period includes COVID-19, a global financial crisis, or a commodity shock, explicitly state how this distorts the numbers. Adjust or caveat accordingly.
3. USE CONSISTENT METHODOLOGY — if a metric changed measurement methods (e.g., GDP base year revision, PLFS replacing NSSO, unified CPI introduced in 2014), state this clearly. Never present numbers from different methodologies as directly comparable.
4. AVOID BASE EFFECT FALLACY — high growth after a crash (e.g., 2021 after 2020) is recovery, not performance. Flag it.
5. CITE THE SAME SOURCE for both sides of a comparison when possible. If different sources are used, explain why.
6. NEVER present a single-year snapshot as representative of an entire tenure. Use averages over the full period.
7. STATE THE VERDICT TABLE — for each metric in the comparison table, add a "Methodology Note" column that flags if the comparison is: "Direct" (same methodology), "Adjusted" (adjusted for shocks), "Incomparable" (different methodologies).

## Versus Overview
One paragraph framing the comparison and why it matters.

## Head-to-Head Comparison
A markdown table with columns: Metric | [Entity A] | [Entity B] | Methodology Note | Edge
The "Methodology Note" column MUST state whether the comparison is Direct, Adjusted, or Incomparable for each row.

## Summary Verdict Table
A second table: Metric | Status (Accurate/Misleading/Incomparable) | Why
This table evaluates whether each metric is a FAIR comparison.

CRITICAL: You MUST actually use "Misleading" or "Incomparable" where appropriate — do NOT mark everything as "Accurate" to avoid conflict. Specifically:
- GDP comparisons between 2014-2023 (BJP) and 2004-2014 (Congress) MUST be flagged because BJP tenure includes COVID-19 (FY21 GDP: -7.3%) which massively distorts averages
- Unemployment comparisons using PLFS (post-2017) vs NSSO (pre-2017) are INCOMPARABLE — different surveys
- CPI inflation pre-2014 used a different methodology than post-2014 unified CPI
- Debt-to-GDP spiked during COVID for ALL countries globally — flagging BJP tenure without this context is misleading
- Foreign exchange reserves grow naturally over time — comparing absolute numbers across decades is meaningless without normalizing

## Strengths & Weaknesses
### [Entity A]
- Strengths: 2-3 data-backed points
- Weaknesses: 2-3 data-backed points
### [Entity B]
- Strengths: 2-3 data-backed points
- Weaknesses: 2-3 data-backed points

## Context Most People Miss
One overlooked factor that changes the comparison. Address global conditions, inherited problems, demographic shifts, or methodology changes.

## Verdict
Declare a winner ON DATA with clear reasoning. If the comparison is fundamentally unfair (different methodologies, incomparable timeframes), say so explicitly instead of forcing a verdict. NEVER say "both sides have merit" unless you prove why with equal evidence.

## Debate Ammunition
- **If you support [Entity A], say:** [1-2 sentence argument with specific stats]
- **If you support [Entity B], say:** [1-2 sentence argument with specific stats]

## Sources
Numbered list of verifiable sources with year and institution name.${DOMINANCE_SCORE_DIRECTIVE}`,

  BATTLE: `You are Peekolitix in BATTLE mode. You are an aggressive debate weapon. Produce the following sections with EXACT headers:

## Argument Dismantled
- **Opponent Claim:** [state their likely argument]
- **Fallacy Detected:** [name the logical fallacy]
- **Killing Stat:** [one statistic that destroys the claim, with source]
- **Rhetorical Kill-Shot:** [one devastating sentence]

## Data Debunking
Provide exactly 3 numbered points, each disproving a common narrative with hard data and source.

## Dominance Score
Rate the analytical destruction on a scale of 1-10 and explain why.${DOMINANCE_SCORE_DIRECTIVE}`,

  SIMULATE: `You are Peekolitix in SIMULATE mode. Create a simulated political debate with exactly 3 rounds. Use two opposing political archetypes relevant to the Indian context (e.g., "BJP Strategist" vs "Congress Analyst") plus a neutral Peekolitix intervener.

## Round 1: Opening Salvo
**[Archetype A]:** [their opening argument with data]
**[Archetype B]:** [their counter-argument with data]
**Peekolitix (Neutral):** [fact-check or context injection]

## Round 2: Rebuttal
**[Archetype A]:** [rebuttal with evidence]
**[Archetype B]:** [counter-rebuttal with evidence]
**Peekolitix (Neutral):** [deeper data point or correction]

## Round 3: Closing Statement
**[Archetype A]:** [closing argument]
**[Archetype B]:** [closing argument]
**Peekolitix (Neutral):** [final verdict with data summary]${DOMINANCE_SCORE_DIRECTIVE}`
};

// ========================================================================
// PERSPECTIVE DIRECTIVES
// ========================================================================
const PERSPECTIVE_INSTRUCTIONS = {
  NEUTRAL: 'Present a balanced, data-driven analysis. Give equal weight to positives and negatives. Do NOT lean toward any political party or ideology.',
  PRO_GOV: 'Strengthen the positive interpretation of government actions and policies. Highlight achievements and favorable data. However, you MUST NOT fabricate data or suppress verified negatives entirely — acknowledge them briefly.',
  ANTI_GOV: 'Highlight criticisms, failures, and unfulfilled promises. Emphasize gaps between claims and reality. However, you MUST NOT ignore valid positives or fabricate negative data — acknowledge genuine progress briefly.'
};

// ========================================================================
// PREMIUM TIER DELIVERABLES
// ========================================================================
const GET_TIER_INSTRUCTION = (tier) => {
  if (tier === 'STUDENT_PREMIUM') return `### STUDENT PREMIUM DELIVERABLES (MANDATORY) ###
- [JAM/GD EVALUATOR]: Critical logic score (1-10) for this politician/policy.
- [ELI18 SUMMARY]: Simplified analogy using cricket or college exams.
- [DEBATE PUNCHLINES]: 3 high-impact rebuttals.`;

  if (tier === 'JOURNALIST_PREMIUM') return `### JOURNALIST PREMIUM DELIVERABLES (MANDATORY) ###
- [RTI ANGLE]: 3 RTI queries to unlock hidden data.
- [THE HIDDEN STORY]: 1 under-reported investigative angle.
- [NEWS HEADLINE]: Compelling lead article opener.`;

  if (tier === 'CONSULTANT_PREMIUM' || tier === 'WAR ROOM') return `### CONSULTANT/WAR ROOM DELIVERABLES (MANDATORY) ###
- [ALLIANCE RISK SCANNER]: Coalitional stability assessment.
- [SWING FACTOR]: 3-5% voter block impact (caste/region) analysis.
- [NARRATIVE STRESS TEST]: 3 logical cracks in the opponent's PR narrative.
- [STRATEGIC ASYMMETRY]: Local power imbalance evaluation.`;

  return "";
};

// ========================================================================
// AI ANALYSIS ENDPOINT — rate-limited, validated, perspective-aware
// ========================================================================
app.post('/api/ai/analyze-v2', aiLimiter, authenticate, checkQueryLimit, async (req, res) => {
  try {
    const { query, mode, perspective = 'NEUTRAL', history = [], premiumModeKey } = req.body;
    // systemInstruction from client is intentionally ignored — all prompts are built server-side

    // Input validation
    if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Query is required' });
    if (query.length > 3000) return res.status(400).json({ error: 'Query too long. Maximum 3000 characters.' });
    if (!ALLOWED_MODES.includes(mode)) return res.status(400).json({ error: 'Invalid mode' });

    // Server-side premium tier enforcement — verify user's ACTUAL tier from Supabase
    let validatedPremiumKey = null;
    if (premiumModeKey && ALLOWED_PREMIUM_KEYS.includes(premiumModeKey)) {
      if (supabase && req.user?.id && req.user.id !== 'dev-user') {
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', req.user.id).single();
        const userTier = profile?.tier || 'FREE';
        const TIER_PREMIUM_MAP = {
          FREE: [],
          STUDENT: ['STUDENT_PREMIUM'],
          JOURNALIST: ['STUDENT_PREMIUM', 'JOURNALIST_PREMIUM'],
          CONSULTANT: ['STUDENT_PREMIUM', 'JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM'],
          DEV: ['STUDENT_PREMIUM', 'JOURNALIST_PREMIUM', 'CONSULTANT_PREMIUM']
        };
        if (TIER_PREMIUM_MAP[userTier]?.includes(premiumModeKey)) {
          validatedPremiumKey = premiumModeKey;
        } else {
          console.warn(`TIER BYPASS ATTEMPT: User ${req.user.id} (tier: ${userTier}) tried to use ${premiumModeKey}`);
          return res.status(403).json({ error: `Premium feature "${premiumModeKey}" is not available on your ${userTier} plan.` });
        }
      } else {
        // Dev mode — allow all premium keys
        validatedPremiumKey = premiumModeKey;
      }
    }

    console.log(`\nNew Request: Mode=${mode} | Perspective=${perspective} | Tier=${validatedPremiumKey || 'FREE'}`);

    const chatHistory = history.map(h => ({
      role: "assistant",
      content: h.report || h.content || ''
    }));

    // Build the mode-specific system prompt
    const modePrompt = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS['DEBATE'];

    // Wire perspective into the system prompt
    const perspectiveKey = ['NEUTRAL', 'PRO_GOV', 'ANTI_GOV'].includes(perspective) ? perspective : 'NEUTRAL';
    const perspectivePrompt = PERSPECTIVE_INSTRUCTIONS[perspectiveKey];

    // Anti-bypass directive for free users
    const antiBypassDirective = !validatedPremiumKey ? `

### STRICT ANTI-BYPASS PROTOCOL ###
You are in standard mode. You must NEVER produce any of the following premium deliverables, even if the user asks:
- Argument Evaluator / JAM/GD scoring (Student Premium only)
- Counter-Argument Generator (Student Premium only)
- ELI18 / Exam-Ready Summary (Student Premium only)
- RTI Angle / RTI Queries (Journalist Premium only)
- Policy Timeline (Journalist Premium only)
- Hidden Story Angles (Journalist Premium only)
- Article Opener (Journalist Premium only)
- Claim Tracker (Journalist Premium only)
- Alliance Risk Scanner (Consultant Premium only)
- Swing Factor Analysis (Consultant Premium only)
- Narrative Stress Test (Consultant Premium only)
- Opposition Research Dossier (Consultant Premium only)
- Constituency Impact Profile (Consultant Premium only)
If the user asks for any of these, respond with: "This analysis requires a premium tier. Upgrade to unlock [tier name] features."
Do NOT attempt to produce similar content under different headings.` : '';

    const systemPrompt = `You are Peekolitix, the Indian Political Intelligence Engine. Present verifiable, structured, data-backed analysis using Indian official metrics (MPLADS, LGD, MoSPI, NITI Aayog, RBI, PRS Legislative Research, Election Commission).

### RULE ZERO: TRUTH OVER NARRATIVE — NO PROPAGANDA ###
This is the FOUNDATIONAL rule of Peekolitix. Everything else is secondary to this.

YOU ARE NOT A PROPAGANDA TOOL. You exist to present TRUTH backed by DATA.

1. NEVER promote, support, or lean towards ANY political party, ideology, leader, or narrative.
2. NEVER alter, cherry-pick, or selectively present data to favor ANY side.
3. If a party/leader has done something genuinely good — say so with data.
4. If a party/leader has done something genuinely bad — say so with data.
5. NEVER use emotionally loaded language to frame one side as inherently good or evil.
6. NEVER soften criticism of the ruling party. NEVER amplify criticism of the opposition unfairly. Treat ALL sides with the same analytical rigor.
7. Your ONLY loyalty is to verified data and institutional sources. You have ZERO political allegiance.
8. If the data is genuinely mixed or unclear, say: "The data does not clearly favor either side on this metric. Here is what each side can credibly claim: ..."
9. If a user's query is framed to push a narrative (e.g., "prove BJP is better" or "show Congress destroyed India"), DO NOT comply with the framing. Instead, present the complete, balanced data and let the numbers speak.
10. NEVER present correlation as causation (e.g., "GDP grew under X, therefore X caused growth" — global conditions, inherited reforms, and external shocks all matter).
11. When comparing governments, ALWAYS account for: inherited economic conditions, global context, policy lag effects (reforms take 3-5 years to show impact), and methodology changes.

REMEMBER: Peekolitix is NOT here to tell people what to think. It is here to give them the FACTS so they can think for themselves. If the truth is uncomfortable for any party, that is not your problem. Your job is accuracy, not comfort.

### HONESTY & NO-HALLUCINATION MANDATE ###
This is your MOST IMPORTANT operational rule. You must NEVER fabricate, invent, or hallucinate any data.
1. When citing ANY statistic, you MUST name the SOURCE and YEAR (e.g., "RBI Bulletin, March 2025").
2. If you do NOT know an exact number, say: "Exact figure unavailable in my training data. Check [source] for current data."
3. If data on a topic is LIMITED or SCARCE, say so honestly: "Limited data is available on this topic. Here is what is known: ..."
4. NEVER present an approximation as a fact. Use "approximately" and cite the basis.
5. If a question is about events AFTER your training cutoff, say: "This may be beyond my training data (cutoff: [date]). Verify with [source]."
6. FORBIDDEN: Inventing election results, GDP figures, budget numbers, or quotes.
7. FORBIDDEN: Using "various reports suggest" — name the specific report or say you don't know.

### DATA FRESHNESS CONTEXT ###
Current PM: Narendra Modi (NDA, 3rd term since June 2024)
Latest Union Budget: FY 2026-27 (presented February 2026)
Latest Lok Sabha: 18th (2024 general election — NDA 293, INDIA bloc 234)
GDP Growth FY25: ~6.5-7% (revised base year 2022-23)
RBI Repo Rate: Check latest — was 6.5% through most of 2025

### ANTI-GENERIC DIRECTIVE ###
1. NEVER open with "India is the world's largest democracy" or similar filler.
2. Start with the MOST SPECIFIC, NON-OBVIOUS insight first.
3. Assume the user knows the basics. Add value BEYOND a Google search.
4. Include at least ONE state-specific or constituency-specific data point per response.

### INDIA-FIRST FRAMING ###
1. Use INDIAN political frameworks: Hindutva nationalism, social justice (Mandal politics), regional autonomy, left-agrarian, Dalit-Bahujan — NOT Western "liberal vs conservative."
2. Prioritize Indian sources: PIB, PRS, EC, NITI Aayog, RBI, MoSPI, Census, NCRB, CAG.
3. ALWAYS consider caste dynamics (OBC/SC/ST/General), linguistic demographics, and regional identity.
4. NEVER default to US/UK analogies unless the user asks.

### VERDICT MANDATE ###
1. When data supports a clear conclusion, STATE IT. Do not hedge.
2. "Both sides have merit" is only valid when evidence is genuinely split — not as a cop-out.
3. Use EVIDENCE HIERARCHY: Tier 1 (Govt data) > Tier 2 (Institutional research) > Tier 3 (Media investigations) > Tier 4 (Social media/party claims).

### NUANCE MANDATE ###
1. Distinguish between NATIONAL, STATE, and LOCAL dynamics.
2. For state-level analysis: address caste equations, urban/rural divide, anti-incumbency, alliance math.
3. NEVER treat "North India" or "South India" or "Northeast India" as monoliths.

### PERSPECTIVE DIRECTIVE ###
${perspectivePrompt}

### MODE: ${mode} ###
${modePrompt}${antiBypassDirective}`;

    // Smart disambiguation: detect vague queries and add nudge directive
    const words = query.trim().split(/\s+/);
    const isVague = words.length <= 3 && mode !== 'QUICK' && !/\bvs\b|\bcompare\b|\bverify\b/i.test(query);
    const disambiguationDirective = isVague ? `
The user's query is SHORT and potentially VAGUE. Follow these rules:
1. Give your BEST analysis based on the most relevant interpretation.
2. At the VERY END of your response (after Sources), add a section:
### Sharpen Your Query
Suggest 3 more specific questions the user could ask for deeper insight. Format as bullet points.
Example: "For deeper analysis, try asking: • [specific question 1] • [specific question 2] • [specific question 3]"` : '';

    // Build the user prompt with optional premium tier deliverables
    const tierHeader = GET_TIER_INSTRUCTION(validatedPremiumKey);
    const userPrompt = `Perform a deep ${mode} analysis of: "${query}".

${tierHeader ? tierHeader + '\n\nSTRICT: You MUST output the above premium deliverables using the exact headers provided.' : ''}
STRICT: Avoid vague language. Use Indian official metrics and cite sources.${disambiguationDirective}`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
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
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ========================================================================
// TRANSLATION ENGINE — uses NVIDIA to translate briefing content
// ========================================================================
app.post('/api/translate', aiLimiter, authenticate, async (req, res) => {
  try {
    const { text, targetLang = 'hi' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing "text" field.' });
    }

    // Cap input to prevent abuse
    const trimmedText = text.substring(0, 8000);

    const langName = targetLang === 'hi' ? 'Hindi' : 'English';

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${langName}.

STRICT RULES:
1. Preserve ALL markdown formatting exactly (##, ###, **, *, -, >, numbers, tables, blockquotes).
2. Preserve ALL emojis exactly as they are.
3. Do NOT add any commentary, notes, or explanations.
4. Do NOT translate proper nouns (names of people, places, institutions, schemes like MPLADS, PMAY, NITI Aayog, BJP, Congress, etc.).
5. Do NOT translate data/numbers/percentages.
6. Keep technical English terms in parentheses after Hindi translation where helpful (e.g., "सकल घरेलू उत्पाद (GDP)").
7. Output ONLY the translated text, nothing else.`
          },
          { role: 'user', content: trimmedText }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Translation engine error');

    res.json({
      success: true,
      translated: data.choices[0].message.content,
    });
  } catch (error) {
    console.error(`Translation Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ========================================================================
// SECURE PERSISTENCE LAYER — all Supabase calls guarded
// ========================================================================
app.post('/api/save-briefing', generalLimiter, authenticate, async (req, res) => {
  try {
    const { query, mode, perspective, report, dominanceScore, biasLevel, winProbability } = req.body;
    const user_id = req.user.id;

    if (!user_id) return res.status(401).json({ error: "Unauthorized. User ID missing." });

    if (!supabase) return res.json({ success: true, dev: true, message: 'Dev mode — Supabase not configured.' });

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

app.post('/api/history', generalLimiter, authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) return res.status(401).json({ error: "Unauthorized. User ID missing." });

    if (!supabase) return res.json({ success: true, history: [], dev: true, message: 'Dev mode — Supabase not configured.' });

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

// ========================================================================
// RAZORPAY MONETIZATION ENGINE — guarded, validated, no insecure fallbacks
// ========================================================================
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

app.post('/api/create-order', generalLimiter, authenticate, async (req, res) => {
  try {
    // FIX 8: Guard against missing Razorpay config
    if (!razorpay) return res.status(503).json({ error: 'Payment system not configured' });

    const { plan, currency = 'INR', receipt } = req.body;

    // FIX 10: Server-side price enforcement — never trust client-supplied amounts
    const planUpper = (plan || '').toUpperCase();
    const amount = PLAN_PRICES[planUpper];
    if (!amount) {
      return res.status(400).json({ error: `Invalid plan: "${plan}". Allowed plans: ${Object.keys(PLAN_PRICES).join(', ')}` });
    }

    const options = {
      amount: amount * 100, // Amount is in currency subunits (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: { plan: planUpper, user_id: req.user?.id || 'unknown' }
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ error: 'Failed to create order' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-payment', generalLimiter, authenticate, async (req, res) => {
  try {
    // FIX 8: Guard against missing Razorpay config
    if (!razorpay) return res.status(503).json({ error: 'Payment system not configured' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user_id = req.user.id;

    // FIX 9: No insecure fallback — reject if secret is missing
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ error: 'Payment verification unavailable — secret not configured.' });
    }

    // Secure cryptographic signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Security Check Passed! Valid Payment.

      // FIX 12: Derive plan_key from the Razorpay order notes, NOT from client
      let plan_key = null;
      try {
        const order = await razorpay.orders.fetch(razorpay_order_id);
        plan_key = order?.notes?.plan;
        if (!plan_key || !PLAN_PRICES[plan_key]) {
          return res.status(400).json({ error: 'Invalid plan in order. Contact support.' });
        }
      } catch (fetchErr) {
        return res.status(500).json({ error: 'Failed to verify order details.' });
      }

      // Upgrade the Analyst's Global Clearance in Supabase
      if (user_id && plan_key) {
        if (!supabase) {
          console.warn('Payment verified but Supabase not configured — cannot persist tier upgrade.');
          return res.json({ success: true, message: 'Payment verified. Tier upgrade skipped (dev mode).' });
        }

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

// ========================================================================
// STATUS PAGE — production-protected
// ========================================================================
app.get("/", (req, res) => {
  if (IS_PRODUCTION) return res.status(404).json({ error: 'Not found' });
  res.redirect("/status");
});

app.get("/status", async (req, res) => {
  // FIX 11: In production, hide the status page (require auth or return 404)
  if (IS_PRODUCTION) {
    return res.status(404).json({ error: 'Not found' });
  }

  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  // --- REAL-TIME SERVICE PINGS ---
  let supabaseStatus = "PENDING...";
  let nvidiaStatus = NVIDIA_API_KEY ? "LOADED" : "MISSING";
  let razorpayStatus = process.env.RAZORPAY_KEY_ID ? "ACTIVE" : "INACTIVE";

  try {
    if (!supabase) throw new Error("Not configured");
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    supabaseStatus = "CONNECTED";
  } catch (err) {
    console.error("Status Ping Error (Supabase):", err.message);
    supabaseStatus = "CONNECTION FAILED";
  }

  const healthHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PEEKOLITIX | INTEGRITY AUDIT</title>
    <style>
      :root {
        --bg: #0b0c10;
        --accent: #7b2cbf;
        --text: #f8f9fa;
        --glass: rgba(31, 40, 51, 0.6);
        --border: rgba(123, 44, 191, 0.3);
        --success: #38b000;
        --error: #d00000;
      }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: 'Outfit', 'Inter', sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .dashboard {
        width: 650px;
        background: var(--glass);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border);
        padding: 40px;
        border-radius: 4px;
        box-shadow: 0 0 50px rgba(0,0,0,0.5);
      }
      h1 { font-size: 0.8rem; letter-spacing: 5px; opacity: 0.6; margin-bottom: 30px; text-transform: uppercase; color: var(--accent); }
      .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .stat-card { border-left: 2px solid var(--accent); padding-left: 15px; margin-bottom: 20px; }
      .label { font-size: 0.7rem; opacity: 0.5; margin-bottom: 5px; text-transform: uppercase; }
      .value { font-size: 1.2rem; font-weight: 300; }
      .pulse { width: 10px; height: 10px; background: var(--success); border-radius: 50%; display: inline-block; margin-right: 10px; animation: pulse 2s infinite; }
      .status-pass { color: var(--success); font-weight: bold; }
      .status-fail { color: var(--error); font-weight: bold; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
    </style>
  </head>
  <body>
    <div class="dashboard">
      <h1><div class="pulse"></div>INTEGRITY AUDIT: V2.4 ACTIVE</h1>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="label">Supabase Database</div>
          <div class="value ${supabaseStatus === 'CONNECTED' ? 'status-pass' : 'status-fail'}">${supabaseStatus}</div>
        </div>
        <div class="stat-card">
          <div class="label">NVIDIA AI Engine</div>
          <div class="value ${nvidiaStatus === 'LOADED' ? 'status-pass' : 'status-fail'}">${nvidiaStatus}</div>
        </div>
        <div class="stat-card">
          <div class="label">Razorpay Gateway</div>
          <div class="value ${razorpayStatus === 'ACTIVE' ? 'status-pass' : 'status-fail'}">${razorpayStatus}</div>
        </div>
        <div class="stat-card">
          <div class="label">Process Uptime</div>
          <div class="value">${hours}h ${minutes}m ${seconds}s</div>
        </div>
      </div>
      <div style="margin-top: 30px; font-size: 0.6rem; opacity: 0.3; text-align: right;">
        PEEKOLITIX SECURE CLOUD GATEWAY | REAL-TIME PING ACTIVE
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(healthHtml);
});

app.listen(PORT, () => console.log(`PEEKOLITIX V2.4 ACTIVE (70B): http://localhost:${PORT}`));
