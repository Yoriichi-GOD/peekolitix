# Quick Setup Checklist 🚀
## Political Intelligence Engine - NVIDIA + Supabase Integration

---

## **PART 1: NVIDIA API SETUP (Already Done ✓)**

### API Key: 
```
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
```

### Model:
- **Meta Llama 2 70B Chat** (free tier available)
- Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`

### Status:
✅ API key configured  
✅ Integrated into dashboard  
✅ Calling in generateOutput function  

---

## **PART 2: SUPABASE SETUP - QUICK GUIDE**

### Step 1: Create Project (5 min)
```
1. Go to https://supabase.com
2. Click "New Project"
3. Name: political-intelligence-engine
4. Region: ap-south-1 (India)
5. Password: [Save securely]
6. Create
```

### Step 2: Copy API Keys (2 min)
After project loads:
```
Settings → API
Copy SUPABASE_URL
Copy SUPABASE_ANON_KEY
Copy SUPABASE_SERVICE_ROLE_KEY (backend only)
```

### Step 3: Create Database Schema (10 min)
In Supabase, go to **SQL Editor** and run the schema script:

**Option A: Copy from SUPABASE_SETUP_GUIDE.md (full schema)**

**Option B: Quick schema (minimal)**
```sql
-- Briefings table
CREATE TABLE briefings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  briefing_id VARCHAR(20) UNIQUE,
  user_id UUID NOT NULL,
  query TEXT,
  mode VARCHAR(50),
  perspective VARCHAR(50),
  analysis_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Geopolitical facts
CREATE TABLE geopolitical_facts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fact_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample facts
INSERT INTO geopolitical_facts (fact_text) VALUES
('India-Bangladesh maritime boundary: Settled by ICJ in 2009'),
('Chandrayaan-3 soft-landed on Moon south pole (2023)'),
('BRICS+ expansion: Trade with BRICS: $190B (2023)'),
('India-China LAC dispute: 2,179km undemarcated border'),
('India''s UPI dominance: 8.4B transactions/month');
```

### Step 4: Enable Row Level Security (RLS) (5 min)
```sql
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefings"
  ON briefings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefings"
  ON briefings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE geopolitical_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read facts"
  ON geopolitical_facts FOR SELECT
  USING (true);
```

### Step 5: Enable Authentication (2 min)
In Supabase:
```
Authentication → Providers
Enable "Email"
Confirm email: ON
```

### Step 6: Create `.env.local` in Your React Project
```env
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# NVIDIA API (already in dashboard)
REACT_APP_NVIDIA_API_KEY=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
```

### Step 7: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

---

## **PART 3: INTEGRATE SUPABASE INTO DASHBOARD**

### Replace Mock Supabase with Real Client

In `political-intelligence-dashboard-integrated.jsx`, replace this:

```javascript
// CURRENT (Mock)
const mockSupabase = { ... };
const supabase = mockSupabase;
```

With this:

```javascript
// REAL SUPABASE
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
```

### Uncomment Save Functionality

The `saveBriefing()` function is already written. Just uncomment or update:

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
          analysis_result: briefingData.data, // Store entire analysis
        }
      ]);

    if (error) throw error;
    alert('Briefing saved!');
    
  } catch (error) {
    console.error('Error saving:', error.message);
  }
};
```

### Fetch Recent Briefings

```javascript
const fetchRecentBriefings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('briefings')
      .select('query, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    setRecentBriefings(data);
  } catch (error) {
    console.error('Error fetching:', error);
  }
};
```

### Get Daily Fact from Supabase

```javascript
useEffect(() => {
  const fetchDailyFact = async () => {
    try {
      const { data, error } = await supabase
        .from('geopolitical_facts')
        .select('fact_text')
        .order('RANDOM()')
        .limit(1)
        .single();

      if (error) throw error;
      setDailyGeopoliticalFact(data.fact_text);
    } catch (error) {
      console.log('Using fallback fact');
      // Use fallback if error
    }
  };

  fetchDailyFact();
  checkUser();
}, []);
```

---

## **PART 4: TEST THE INTEGRATION**

### Test Flow:
1. ✅ Start development server: `npm run dev`
2. ✅ Check console for Supabase connection
3. ✅ Try to login/signup
4. ✅ Enter a query (e.g., "Is India recession-proof?")
5. ✅ Click "Analyze" → NVIDIA API calls
6. ✅ See results with "Save" button
7. ✅ Click "Save" → stores in Supabase
8. ✅ Refresh page → should see recent briefing in sidebar

### Expected Behavior:

**Without Login:**
- ✓ Can read daily geopolitical fact
- ✓ Can select mode & perspective
- ✓ Can analyze queries (NVIDIA API works)
- ✗ Cannot save briefings
- ✗ Cannot see briefing history

**With Login:**
- ✓ Everything above
- ✓ Can save briefings to Supabase
- ✓ Can see recent briefings in sidebar
- ✓ Can access old briefings

---

## **PART 5: DEPLOYMENT OPTIONS**

### Option 1: Vercel (Recommended for Frontend)
```bash
npm install -g vercel
vercel
# Follow prompts
# Add env vars in Vercel dashboard
```

### Option 2: Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
# Add env vars in Site Settings
```

### Option 3: Self-hosted (AWS, DigitalOcean)
- Build: `npm run build`
- Deploy `dist/` folder
- Set environment variables on server

---

## **PART 6: MONITORING & DEBUGGING**

### Check NVIDIA API Status
```javascript
// Add to console
console.log('NVIDIA API Key:', process.env.REACT_APP_NVIDIA_API_KEY ? 'Set ✓' : 'Missing ✗');
```

### Check Supabase Connection
```javascript
// Add to useEffect
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Supabase connected:', !!data, error ? error.message : '');
});
```

### Monitor Supabase in Dashboard
1. Go to Supabase project dashboard
2. **Logs** → **Edge Functions** (if using edge functions)
3. **Database** → **Logs** (see all queries)
4. **Auth** → **Users** (see registered users)

---

## **PART 7: COMMON ERRORS & FIXES**

### Error: "SUPABASE_URL is undefined"
```
FIX: Check .env.local has REACT_APP_ prefix for React
     or VITE_ prefix for Vite
```

### Error: "401 Unauthorized - NVIDIA API"
```
FIX: Verify API key in .env.local
     Check: https://integrate.api.nvidia.com/v1/chat/completions
```

### Error: "RLS policy violation"
```
FIX: Make sure user is logged in before saving
     Check RLS policies in Supabase SQL
```

### Error: "CORS error when calling API"
```
FIX: NVIDIA API should work from frontend
     If using Node backend, pass token securely
```

### Briefings not saving
```
FIX: 1. Check user is logged in
     2. Check RLS policies allow user to insert
     3. Check briefing_id is unique
     4. Check user_id matches auth user
```

---

## **PART 8: NEXT FEATURES TO ADD**

- [ ] Export briefings to PDF
- [ ] Search historical briefings
- [ ] Bookmark favorite queries
- [ ] Share briefing link with others
- [ ] Compare two briefings side-by-side
- [ ] Create briefing templates
- [ ] Set up scheduled reports
- [ ] Integration with external data sources (PIB, RBI API)
- [ ] Real-time notifications for policy changes
- [ ] Advanced analytics on briefing trends

---

## **QUICK REFERENCE**

| Task | Time | Status |
|------|------|--------|
| Create Supabase project | 5 min | ⏳ TODO |
| Copy API keys | 2 min | ⏳ TODO |
| Run database schema | 10 min | ⏳ TODO |
| Enable RLS | 5 min | ⏳ TODO |
| Create .env.local | 2 min | ⏳ TODO |
| Install Supabase client | 1 min | ⏳ TODO |
| Update React component | 5 min | ⏳ TODO |
| Test login/save flow | 5 min | ⏳ TODO |
| Deploy to Vercel | 3 min | ⏳ TODO |
| **TOTAL** | **~40 min** | ⏳ TODO |

---

## **YOU'RE DONE! 🎉**

Your dashboard now has:
- ✅ **NVIDIA Nemotron AI** for intelligent analysis
- ✅ **Supabase** for data persistence & authentication
- ✅ **Real-time briefing history**
- ✅ **User authentication**
- ✅ **Geopolitical facts database**
- ✅ **Professional dashboard UI**

Start using it immediately! 🚀

---

**Questions? Issues? Check SUPABASE_SETUP_GUIDE.md for detailed instructions.**
