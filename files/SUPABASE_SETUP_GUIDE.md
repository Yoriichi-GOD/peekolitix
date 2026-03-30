# Supabase Backend Setup Guide
## Political Intelligence Engine Database & API Configuration

---

## **PART 1: SUPABASE PROJECT SETUP**

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill details:
   - **Project Name**: political-intelligence-engine
   - **Database Password**: Create strong password (save it!)
   - **Region**: ap-south-1 (India region recommended)
   - **Pricing Tier**: Free (start) → Pro ($25/month for production)
4. Click "Create new project"
5. Wait 2-3 minutes for initialization

### Step 2: Get Your API Keys
After project creation:
1. Go to **Settings** → **API**
2. Copy these keys (store in `.env.local`):
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (Backend only!)
   ```

---

## **PART 2: DATABASE SCHEMA**

### Table 1: Briefings (stores all analysis results)
```sql
CREATE TABLE briefings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  briefing_id VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  query TEXT NOT NULL,
  mode VARCHAR(50) NOT NULL,
  perspective VARCHAR(50) NOT NULL,
  affirmative JSONB,
  negative JSONB,
  key_data JSONB,
  weakness TEXT,
  punchline TEXT,
  conclusion TEXT,
  fact TEXT,
  interpretation TEXT,
  narrative TEXT,
  macro_analysis JSONB,
  confidence_scores JSONB,
  sources JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_briefings_user_id ON briefings(user_id);
CREATE INDEX idx_briefings_created_at ON briefings(created_at DESC);
```

### Table 2: Intelligence Channels (pre-set query categories)
```sql
CREATE TABLE intelligence_channels (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  sample_queries JSONB,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default channels
INSERT INTO intelligence_channels (name, icon, description, sample_queries, category) VALUES
('Macro Economy', '📈', 'Economic growth, inflation, investment trends', '["Is India recession-proof?", "Growth vs inflation tradeoff", "CapEx sustainability"]', 'economics'),
('Geopolitics', '🌍', 'India-China relations, BRICS, maritime disputes', '["India-China tensions", "BRICS strategy", "Indo-Pacific dynamics"]', 'geopolitics'),
('Policy Analysis', '📋', 'Government schemes, regulatory changes', '["NDA 3.0 agenda", "GST impact", "Inflation targeting"]', 'policy'),
('Regional Dynamics', '🗺️', 'State development, regional competitiveness', '["North vs South development", "State competitiveness", "Regional inequality"]', 'regional'),
('Quick Fact Check', '✓', 'Instant claim verification', '["Claim verification", "Fact checking", "Data validation"]', 'factcheck');
```

### Table 3: Briefing History (recent queries for sidebar)
```sql
CREATE TABLE briefing_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  briefing_id VARCHAR(20) NOT NULL REFERENCES briefings(briefing_id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  query_summary VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_user_id ON briefing_history(user_id);
```

### Table 4: Daily Geopolitical Facts
```sql
CREATE TABLE geopolitical_facts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fact_text TEXT NOT NULL,
  category VARCHAR(50),
  region VARCHAR(50),
  relevance_score INT DEFAULT 5,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample facts (run this SQL in Supabase)
INSERT INTO geopolitical_facts (fact_text, category, region, source) VALUES
('India-Bangladesh maritime boundary: Settled by ICJ in 2009. South China Sea tensions persist with 11 unresolved claims.', 'maritime', 'south-asia', 'ICJ Records'),
('Chandrayaan-3 soft-landed on Moon south pole (2023) — only nation to reach here. Strategic positioning for lunar resources.', 'space', 'global', 'ISRO'),
('BRICS+ expansion: India''s presence counters Western influence. Trade with BRICS: $190B (2023).', 'trade', 'global', 'World Bank'),
('India-China LAC dispute: 2,179km undemarcated border. Military standoff since 2020. Trade: $136B (2023) despite tensions.', 'military', 'south-asia', 'Indian Ministry of Defence'),
('India''s UPI dominance: 8.4B transactions/month (Jan 2024) — setting global fintech standard.', 'fintech', 'global', 'NPCI'),
('India''s renewable energy: 175 GW installed (4th largest globally) — positioning for energy independence.', 'energy', 'global', 'IEA'),
('Indian diaspora: 18M overseas Indians → $111B remittances + strategic soft power in 190+ countries.', 'diaspora', 'global', 'World Bank'),
('India''s defense spending: $72.6B (2023, 5th globally) — driven by Pakistan-China pressure.', 'defense', 'regional', 'SIPRI'),
('India''s agricultural subsidies: ₹3.2L cr (2023) — supports 140M farmers but creates WTO trade friction.', 'trade', 'domestic', 'Ministry of Agriculture'),
('Indian Ocean Strategy: Controls Malacca Strait alternatives. Key player in 26% of world maritime trade.', 'maritime', 'regional', 'Naval Strategy Papers');
```

### Table 5: Analysis Cache (speed up repeated queries)
```sql
CREATE TABLE analysis_cache (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  query_hash VARCHAR(64) NOT NULL UNIQUE,
  mode VARCHAR(50) NOT NULL,
  perspective VARCHAR(50) NOT NULL,
  analysis_result JSONB NOT NULL,
  hit_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_cache_query_hash ON analysis_cache(query_hash);
```

---

## **PART 3: SUPABASE AUTHENTICATION SETUP**

### Enable Email/Password Auth:
1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Under Email Auth:
   - Enable "Confirm email"
   - Template: Default (or customize)

### Setup User Profiles Table:
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  organization VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  total_briefings INT DEFAULT 0,
  last_briefing_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger to auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## **PART 4: ROW LEVEL SECURITY (RLS) POLICIES**

Enable RLS to ensure users see only their data:

```sql
-- Enable RLS on briefings table
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own briefings
CREATE POLICY "Users can view own briefings"
  ON briefings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own briefings
CREATE POLICY "Users can insert own briefings"
  ON briefings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow public read on geopolitical_facts (no auth needed)
ALTER TABLE geopolitical_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read geopolitical facts"
  ON geopolitical_facts
  FOR SELECT
  USING (true);

-- Enable RLS on intelligence_channels (public)
ALTER TABLE intelligence_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read channels"
  ON intelligence_channels
  FOR SELECT
  USING (true);
```

---

## **PART 5: API INTEGRATION IN REACT**

### Install Supabase Client:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

### Create `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Update `.env.local`:
```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://xxx.supabase.co (for Vite)
VITE_SUPABASE_ANON_KEY=eyJhbGc... (for Vite)
```

### Save Briefing to Supabase:
```javascript
const saveBriefing = async (briefingData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in to save briefings');
      return;
    }

    const { data, error } = await supabase
      .from('briefings')
      .insert([
        {
          briefing_id: briefingId,
          user_id: user.id,
          query: input,
          mode: mode,
          perspective: perspective,
          affirmative: briefingData.affirmative,
          negative: briefingData.negative,
          key_data: briefingData.keyData,
          weakness: briefingData.weakness,
          punchline: briefingData.punchline,
          conclusion: briefingData.conclusion,
          fact: briefingData.fact,
          interpretation: briefingData.interpretation,
          narrative: briefingData.narrative,
          macro_analysis: briefingData.macroAnalysis,
        }
      ]);

    if (error) throw error;
    console.log('Briefing saved:', data);
    
    // Also update history
    await supabase.from('briefing_history').insert([
      {
        briefing_id: briefingId,
        user_id: user.id,
        query_summary: input.substring(0, 200),
      }
    ]);

  } catch (error) {
    console.error('Error saving briefing:', error.message);
  }
};
```

### Fetch Recent Briefings for Sidebar:
```javascript
const fetchRecentBriefings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('briefing_history')
      .select('query_summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching briefings:', error.message);
  }
};
```

### Get Daily Geopolitical Fact:
```javascript
const getDailyFact = async () => {
  try {
    const { data, error } = await supabase
      .from('geopolitical_facts')
      .select('*')
      .order('RANDOM()')
      .limit(1)
      .single();

    if (error) throw error;
    setDailyGeopoliticalFact(data.fact_text);
  } catch (error) {
    console.error('Error fetching fact:', error.message);
  }
};
```

---

## **PART 6: ENVIRONMENT VARIABLES CHECKLIST**

### Frontend `.env.local`:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_NVIDIA_API_KEY=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
```

### Backend `.env` (if using Node.js):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NVIDIA_API_KEY=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
NODE_ENV=production
```

---

## **PART 7: ADVANCED: SUPABASE EDGE FUNCTIONS (Optional)**

Create a backend function to call NVIDIA API securely (hides API key):

### Deploy Edge Function:
```bash
supabase functions new analyze-political-query
```

### Create `supabase/functions/analyze-political-query/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, mode, perspective } = await req.json()

    // Call NVIDIA API with hidden key
    const nvidiaResponse = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('NVIDIA_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-2-70b-chat',
          messages: [
            {
              role: 'user',
              content: `Mode: ${mode}, Perspective: ${perspective}\n\nAnalyze: ${query}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    )

    const data = await nvidiaResponse.json()

    return new Response(
      JSON.stringify({ result: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### Deploy:
```bash
supabase functions deploy analyze-political-query --project-id your_project_id
```

---

## **PART 8: MONITORING & LOGGING**

### Enable Supabase Logging:
1. Go to **Logs** → **Edge Functions**
2. Monitor API calls and errors
3. Check **Database Activity** for query performance

### Setup Alerts:
1. **Settings** → **Billing**
2. Enable email alerts for quota usage

---

## **QUICK REFERENCE: IMPORTANT TABLES**

| Table | Purpose | Queries |
|-------|---------|---------|
| `briefings` | Store all analyses | `SELECT * FROM briefings WHERE user_id = ?` |
| `intelligence_channels` | Pre-set query categories | `SELECT * FROM intelligence_channels` |
| `geopolitical_facts` | Daily facts | `SELECT * FROM geopolitical_facts ORDER BY RANDOM() LIMIT 1` |
| `analysis_cache` | Cache results | `SELECT * FROM analysis_cache WHERE query_hash = ?` |
| `user_profiles` | User metadata | `SELECT * FROM user_profiles WHERE id = ?` |

---

## **TROUBLESHOOTING**

### Issue: "SUPABASE_URL is undefined"
**Fix**: Check `.env.local` has `REACT_APP_SUPABASE_URL` (React) or `VITE_SUPABASE_URL` (Vite)

### Issue: "Unauthorized" error on save
**Fix**: Ensure user is logged in + RLS policies are correct

### Issue: NVIDIA API 401
**Fix**: Check API key is correct in environment variables

### Issue: Slow queries
**Fix**: Create indexes on frequently queried columns (done in schema above)

---

## **PRICING NOTES**

- **Free Tier**: 500MB storage, 2M requests/month, perfect for MVP
- **Pro Tier**: $25/month, 8GB storage, unlimited requests (use for production)
- **NVIDIA API**: Free tier available, $0.002 per 1K input tokens

---

## **NEXT STEPS**

1. ✅ Create Supabase project
2. ✅ Run all SQL schema scripts
3. ✅ Enable authentication
4. ✅ Set up RLS policies
5. ✅ Add environment variables
6. ✅ Test with React integration
7. ✅ Deploy Edge Function (optional, for security)
8. ✅ Monitor Supabase logs

---

**Your backend is ready! 🚀**
