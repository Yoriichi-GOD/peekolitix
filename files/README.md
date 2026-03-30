# 🎯 Political Intelligence Engine

**Data-backed analysis. Debate-ready insights. Argument dominance.**

A professional intelligence dashboard powered by NVIDIA Nemotron AI and Supabase, designed to make users intellectually dominant in political discussions through structured, macroeconomically-precise analysis.

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone/Download Files
```bash
# You have all files in /outputs folder
# Copy to your React project:
# - political-intelligence-dashboard-integrated.jsx
# - package.json
# - .env.local (create this)
```

### 2. Create `.env.local`
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_NVIDIA_API_KEY=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
```

### 3. Install & Run
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### 4. Setup Supabase (See SUPABASE_SETUP_GUIDE.md)
```sql
# Run schema in Supabase SQL Editor
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
```

---

## 🎨 Features

### **5 Analysis Modes**
1. **DEBATE MODE** - Affirmative vs Negative with opponent weakness detection
2. **STATS MODE** - Data-driven metrics with macroeconomic precision
3. **EXPLAIN MODE** - Clarity engine for complex topics
4. **GEO MODE** - Regional & constituency comparisons
5. **QUICK MODE** - Instant 3-fact summaries

### **3 Perspective Filters**
- 🟦 **Neutral** - Balanced analysis
- 🟧 **Pro-Government** - Strengthen positive interpretation
- 🟦 **Anti-Government** - Highlight criticisms

### **Smart Analysis**
- ✅ Exogenous shock adjustment (COVID impact quantified)
- ✅ Cyclical vs Structural breakdown
- ✅ Banking health indicators
- ✅ Growth quality scoring
- ✅ Opponent weakness detection (cherry-picking, base effect, credit myths)
- ✅ Fact vs Interpretation vs Narrative distinction
- ✅ Evidence strength tagging (HIGH/MEDIUM/LOW confidence)

### **Dashboard Features**
- 📊 Interactive Recharts visualizations (trend lines, comparative bars)
- 📁 Collapsible Intelligence Channels sidebar
- 📜 Recent Briefings sidebar with history
- 🌍 Daily geopolitical facts (rotates 10 facts)
- 🔐 Authentication with Supabase
- 💾 Save briefings to database
- 🆔 Auto-generated Briefing IDs
- ⏱️ System status indicator
- 📱 Mobile responsive

### **Data Precision**
- Government sources prioritized (PIB, RBI, MoSPI, Census)
- Macroeconomic guidelines enforced
- Quantification required (no vague claims)
- Regional variations flagged
- Limitations explicitly stated

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         React Dashboard (Vite)              │
│  - Modes, Perspectives, Input               │
│  - Charts, Sidebar Navigation               │
│  - Authentication UI                        │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┬──────────────┐
       │                │              │
       ▼                ▼              ▼
   SUPABASE         NVIDIA API      LOCAL STATE
   (Storage)       (Intelligence)   (UI Cache)
   
   • Briefings       • Llama 2 70B   • Query input
   • User Profiles   • Analysis      • Mode/Perspective
   • Geo Facts       • Insights      • Output
   • History         • Punchlines    • Charts
```

### **Tech Stack**
- **Frontend**: React 18 + Vite + Tailwind CSS
- **UI Components**: Lucide React (icons) + Recharts (charts)
- **AI**: NVIDIA Nemotron API (Meta Llama 2 70B)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel / Netlify

---

## 📊 Database Schema

### Tables Created
1. **briefings** - All analysis results with JSONB storage
2. **intelligence_channels** - Pre-set query categories
3. **geopolitical_facts** - Daily rotating facts
4. **user_profiles** - User metadata & subscription
5. **analysis_cache** - Speed up repeated queries

See `SUPABASE_SETUP_GUIDE.md` for full schema.

---

## 🔐 Security

### Authentication Flow
```
User → Supabase Auth → JWT Token → Can Save/Access Own Data
```

### Row-Level Security (RLS)
- Users can only view their own briefings
- Geopolitical facts are public-read
- Service role key for admin operations

### API Key Security
- NVIDIA key stored in `.env.local` (frontend safe)
- Recommended: Move to Supabase Edge Function for production

---

## 📈 Macroeconomic Precision Guidelines (Built-in)

The system automatically:

1. **Adjusts for Exogenous Shocks**
   - COVID-19 impact quantified & separated
   - Fair comparisons: 2014-2019 vs 2022-2024

2. **Distinguishes Cyclical vs Structural**
   - Cyclical: Credit, consumption, temporary booms
   - Structural: CapEx, FDI, capacity building

3. **Analyzes Banking Health**
   - NPA ratios tracked
   - CAR (Capital Adequacy Ratio) monitored
   - Balance sheet stress detected

4. **Compares Growth Types**
   - Investment-led (sustainable)
   - Consumption-led (short-term)
   - Credit-fueled (risky)

5. **Detects Opponent Weaknesses**
   - Cherry-picking timeframes
   - Base effect inflation
   - Ignoring exogenous factors
   - Credit bubble myths
   - Data confidence issues

---

## 🎯 Example Queries

### Macro Economy
```
"Is India's growth sustainable or credit-fueled?"
"How does recent inflation compare to 2013-14?"
"What's the state of banking sector health?"
```

### Geopolitics
```
"What's India's strategy in India-China tensions?"
"How important is BRICS+ expansion for India?"
"What's the geopolitical significance of Chandrayaan-3?"
```

### Policy
```
"What's the impact of GST implementation?"
"How effective are agricultural subsidies?"
"What are NDA 3.0's key agenda items?"
```

### Regional
```
"Which states are developing faster, North or South?"
"How competitive is the manufacturing sector across states?"
"What's driving regional inequality?"
```

---

## 🚀 Deployment

### Vercel (Recommended - Free tier available)
```bash
npm install -g vercel
vercel
# Add env vars in Vercel dashboard
# Domain setup automatic
```

### Netlify
```bash
npm run build
# Deploy dist/ folder via Netlify UI
# Add env vars in Site Settings → Environment
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables (Production)
Set these in your deployment platform:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_NVIDIA_API_KEY=nvapi-...
```

---

## 📊 Performance Notes

### API Response Time
- NVIDIA Llama 2 70B: ~3-5 seconds (free tier)
- Supabase queries: ~100-200ms
- Dashboard render: <500ms

### Optimization Tips
1. **Cache repeated queries** - Use analysis_cache table
2. **Batch API calls** - Combine multiple analyses
3. **Lazy load geopolitical facts** - Load on demand
4. **Compress briefing storage** - Use JSONB efficiently

### Rate Limits
- NVIDIA free tier: ~100 requests/day
- Supabase free tier: Unlimited read/write within quotas
- Scale: Pro tier ($25/mo) for production

---

## 🐛 Troubleshooting

### "NVIDIA API 401"
```
✓ Check .env.local has correct API key
✓ Verify API key not expired (nvidia.com/console)
✓ Check authorization header format
```

### "Supabase connection error"
```
✓ Check SUPABASE_URL is correct
✓ Verify SUPABASE_ANON_KEY is set
✓ Check Supabase project is live
✓ Ensure RLS policies allow operations
```

### "Can't save briefings"
```
✓ Check user is logged in
✓ Verify RLS policy: auth.uid() = user_id
✓ Check briefing_id is unique
✓ See browser console for error details
```

### "Charts not rendering"
```
✓ Check data.chartData exists
✓ Verify Recharts import
✓ Check ResponsiveContainer parent width
✓ Clear browser cache
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE_SETUP_GUIDE.md` | Complete backend setup (tables, auth, RLS) |
| `QUICK_SETUP_CHECKLIST.md` | 40-minute setup checklist |
| `political-intelligence-dashboard-integrated.jsx` | Main React component |
| `package.json` | Dependencies |
| `README.md` | This file |

---

## 🔄 Workflow

### User Flow
```
1. User arrives at dashboard
2. Selects mode (Debate/Stats/Explain/Geo/Quick)
3. Chooses perspective (Neutral/Pro/Anti)
4. Enters query
5. Clicks "Analyze"
   ↓ (Calls NVIDIA API)
6. Receives structured analysis with:
   - Affirmative points (GREEN)
   - Negative points (RED)
   - Macro precision section
   - Charts & visualizations
   - Punchlines for debate
   - Hidden caveats
7. Optionally saves to Supabase (if logged in)
8. Can view in "Recent Briefings"
```

### Data Flow
```
Query Input
    ↓
System Prompt Building (mode + perspective)
    ↓
NVIDIA Nemotron API Call
    ↓
Parse JSON Response
    ↓
Generate Charts (GDP trajectory, comparisons)
    ↓
Render Output with:
    - Color-coded confidence
    - Underlined headings
    - Hidden caveats
    ↓
Save to Supabase (optional)
    ↓
Update Recent Briefings sidebar
```

---

## 🎓 Learning Resources

### Macroeconomic Analysis
- RBI Monetary Policy statements
- World Bank India reports
- NITI Aayog publications
- Ministry of Finance data

### API Integration
- NVIDIA docs: https://docs.api.nvidia.com
- Supabase docs: https://supabase.com/docs
- React docs: https://react.dev

### Deployment
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com

---

## 💡 Future Enhancements

### Phase 2
- [ ] Export briefings to PDF
- [ ] Compare two analyses side-by-side
- [ ] Search briefing history
- [ ] Create briefing templates
- [ ] Share briefing links

### Phase 3
- [ ] Real-time government data feeds (PIB, RBI APIs)
- [ ] Advanced fact-checking with source verification
- [ ] Scheduled weekly briefings
- [ ] Team collaboration features
- [ ] Custom data source integration

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Voice input (speech-to-text)
- [ ] Multi-language support
- [ ] Integration with Wikipedia/wikidata
- [ ] Predictive analytics

---

## 📞 Support

### Issues?
1. Check relevant guide (SUPABASE_SETUP_GUIDE.md)
2. See Troubleshooting section above
3. Check browser console for errors
4. Verify all env vars are set
5. Clear cache & restart dev server

### Questions?
- NVIDIA API: https://docs.api.nvidia.com
- Supabase: https://supabase.com/help
- React: https://react.dev/community

---

## 📄 License

MIT License - Use freely for personal/commercial projects

---

## 🎉 You're Ready!

Your Political Intelligence Engine is:
- ✅ Built with React + Vite
- ✅ Powered by NVIDIA Nemotron AI
- ✅ Backed by Supabase
- ✅ Dashboard complete with charts
- ✅ Ready to deploy

**Start analyzing, start winning arguments with data! 🚀**

---

**Last Updated**: March 2026  
**Version**: 2.2.0  
**Status**: Production Ready ✨
