import './env.js';

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import supabase from './src/config/supabase.js';

console.log("ENV CHECK:", process.env.SUPABASE_URL);


const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';

// Middleware
app.use(cors());
app.use(express.json());

console.log('ðŸš€ Backend starting...');
console.log(`API Key loaded: ${NVIDIA_API_KEY ? 'âœ“' : 'âœ—'}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    backend: 'running'
  });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { query, mode, perspective } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\nðŸ“Š New Request:`);
    console.log(`Query: ${query.substring(0, 50)}...`);
    console.log(`Mode: ${mode || 'debate'}`);
    console.log(`Perspective: ${perspective || 'neutral'}`);

    const systemPrompt = `You are an Indian Political Intelligence Engine. Your purpose is:
1. Present verifiable, structured, data-backed analysis
2. Break down narratives into measurable components
3. Expose weaknesses in arguments
4. Provide both sides when required
5. Maintain strict neutrality unless a perspective is explicitly selected

RULES:
* Always distinguish between FACT, INTERPRETATION, and NARRATIVE
* Prefer Indian government sources (PIB, MoSPI, RBI, PRS, Census)
* Use global sources (World Bank, IMF) only when relevant
* Never make vague claims without quantification
* Avoid emotional language
* If data is uncertain, explicitly say so

PERSPECTIVE: ${perspective === 'neutral' ? 'Neutral - balanced output' : perspective === 'pro-govt' ? 'Pro-Government - strengthen positive interpretation but do NOT fabricate data' : 'Anti-Government - highlight criticisms but do NOT ignore valid positives'}

OUTPUT STYLE:
* Structured
* Numbered points
* Clear headings
* Debate-ready
* No fluff

Return ONLY valid JSON (no markdown wrapper, no code blocks) with these fields:
- affirmative: array of strings (3-5 strong data-backed points)
- negative: array of strings (3-5 strong counterpoints)
- keyData: array of strings (quantified facts only)
- weakness: string (identify common flawed arguments and why they fail)
- punchline: string (1-2 sharp, viral-ready lines)
- conclusion: string (balanced synthesis)`;

    const userPrompt = `Analyze this query using ${mode || 'debate'} mode with ${perspective || 'neutral'} perspective:

"${query}"

Return ONLY valid JSON with: affirmative, negative, keyData, weakness, punchline, conclusion`;

    console.log('ðŸŒ Calling NVIDIA API...');

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-2-70b-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        top_p: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log(`API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`âŒ NVIDIA API Error ${response.status}:`, errorData);
      return res.status(response.status).json({
        error: `NVIDIA API Error: ${response.status}`,
        details: errorData,
        message: 'Failed to get analysis from NVIDIA API'
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('âŒ Invalid response structure from NVIDIA API');
      return res.status(500).json({
        error: 'Invalid API response structure',
        received: data
      });
    }

    const content = data.choices[0].message.content;
    console.log(`âœ… Got response (${content.length} chars)`);

    // Parse JSON from response
    let parsedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        console.log('âœ… JSON parsed successfully');
      } else {
        parsedData = JSON.parse(content);
        console.log('âœ… Content parsed as JSON');
      }
    } catch (parseError) {
      console.warn('âš ï¸ JSON parse failed, using content as fallback');
      parsedData = {
        affirmative: [content.substring(0, 300)],
        negative: [],
        keyData: [content.substring(300, 600)],
        weakness: 'See analysis above',
        punchline: 'Data-backed analysis generated',
        conclusion: content.substring(600, 1000) || 'See analysis above',
      };
    }

    console.log(`âœ… Analysis complete - sending response\n`);

    res.json({
      success: true,
      data: parsedData,
      timestamp: new Date(),
      query: query
    });

  } catch (error) {
    console.error(`\nâŒ Server Error: ${error.message}`);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
      type: error.constructor.name
    });
  }
});

// PERSISTENCE ENDPOINTS
// Save a new briefing
app.post('/api/save-briefing', async (req, res) => {
  try {
    const { query, mode, perspective, report, dominanceScore, biasLevel, winProbability } = req.body;
    
    const { data, error } = await supabase
      .from('debates')
      .insert([
        {
          topic: query,
          side: perspective,
          response: { 
            mode: mode || 'DEBATE',
            report, 
            dominanceScore, 
            biasLevel, 
            winProbability 
          }
        }
      ])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('âŒ Save Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch intelligence history
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('debates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform for frontend
    const history = data.map(item => ({
      id: item.id,
      query: item.topic,
      perspective: item.side,
      mode: item.response.mode || 'DEBATE',
      report: item.response.report,
      dominanceScore: item.response.dominanceScore || 5,
      biasLevel: item.response.biasLevel || 'Low',
      winProbability: item.response.winProbability || '50%',
      timestamp: item.created_at
    }));

    res.json({ success: true, history });
  } catch (error) {
    console.error('âŒ Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('ðŸš€ POLITICAL INTELLIGENCE BACKEND');
  console.log('='.repeat(60));
  console.log(`âœ… Server running on: http://localhost:${PORT}`);
  console.log(`ðŸ“Š API endpoint:     POST /api/analyze`);
  console.log(`ðŸ¥ Health check:     GET /health`);
  console.log('='.repeat(60));
  console.log('Waiting for requests...\n');
});


app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase
    .from('debates')
    .insert([
      {
        topic: 'test topic',
        side: 'government',
        response: { msg: 'db connected' }
      }
    ]);

  if (error) {
    console.log(error);
    return res.status(500).json({ error });
  }

  res.json({ success: true, data });
});