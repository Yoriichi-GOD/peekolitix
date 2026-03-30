// backend/server.js
// Simple Node.js backend to proxy NVIDIA API calls

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Proxy endpoint for NVIDIA API
app.post('/api/analyze', async (req, res) => {
  try {
    const { query, mode, perspective } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`📊 Analyzing: ${query.substring(0, 50)}...`);

    const systemPrompt = `You are an Indian Political Intelligence Engine.
- Present verifiable, data-backed analysis
- Distinguish between FACT, INTERPRETATION, and NARRATIVE
- Prefer Indian government sources (PIB, RBI, MoSPI, World Bank)
- Return valid JSON only`;

    const userPrompt = `Analyze using ${mode || 'debate'} mode: "${query}"
Return JSON with: affirmative (array), negative (array), keyData (array), weakness, punchline, conclusion`;

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ NVIDIA API Error: ${response.status}`);
      return res.status(response.status).json({ 
        error: `NVIDIA API Error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsedData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsedData = {
        affirmative: [content.substring(0, 300)],
        negative: [],
        keyData: [],
        weakness: 'See analysis above',
        punchline: 'Analysis complete',
        conclusion: content,
      };
    }

    console.log(`✅ Analysis complete`);
    res.json({ 
      success: true, 
      data: parsedData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error(`❌ Server Error: ${error.message}`);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Political Intelligence Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log(`🏥 Health check: GET http://localhost:${PORT}/health`);
});
