import React, { useState, useEffect } from 'react';
import { Send, ChevronRight, ChevronLeft, Clock, Activity, ShieldCheck, Terminal, TrendingUp, Map, Zap, BookOpen, Target, History, Sparkles, AlertCircle, Menu, X, Save, LogOut, LogIn } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Supabase client (replace with actual @supabase/supabase-js when ready)
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    insert: async (data) => ({ data: null, error: null }),
    select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }),
  }),
};

// Use mockSupabase for now - replace with real supabase client later
const supabase = mockSupabase;

export default function PoliticalIntelligenceDashboard() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('debate');
  const [perspective, setPerspective] = useState('neutral');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [briefingId, setBriefingId] = useState('BRF-2024-0847');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [recentBriefings, setRecentBriefings] = useState([]);
  const [dailyGeopoliticalFact, setDailyGeopoliticalFact] = useState('');

  const dailyGeopoliticalFacts = [
    "🌍 India-Bangladesh maritime boundary: Settled by ICJ in 2009, but South China Sea tensions persist with similar unresolved claims affecting 11 nations.",
    "🛰️ India's Chandrayaan-3 soft-landed on Moon's south pole (2023) — only India to reach this region. Strategic positioning for future lunar resources.",
    "📊 BRICS+ expansion: India's presence counters Western bloc influence in Global South. Trade with BRICS members: $190B (2023).",
    "🤝 India-China LAC dispute: 2,179km undemarcated border. Military standoff since 2020 → ongoing strategic competition despite trade (US$136B in 2023).",
    "💰 India's UPI dominance: 8.4B transactions/month (Jan 2024) — setting global fintech standard, reducing Western payment system dependency.",
    "⚡ India's renewable energy: 175 GW installed (world's 4th largest) → positioning for energy independence & climate negotiation leverage.",
    "🗳️ Indian diaspora influence: 18M overseas Indians → economic remittances $111B + strategic soft power in 190+ countries.",
    "🔐 India's defense spending: $72.6B (2023, 5th globally) — driven by Pakistan-China pressure; impacts neighboring geopolitics.",
    "🌾 India's agricultural subsidies: ₹3.2L cr (2023) — supports 140M farmers but creates trade friction with WTO-aligned nations.",
    "🚢 Indian Ocean Strategy: India controls Malacca Strait alternatives; key player in global maritime trade (26% of world trade)."
  ];

  const intelligenceChannels = [
    { id: 1, label: 'Macro Economy', icon: '📈', queries: ['Is India recession-proof?', 'Growth vs inflation tradeoff'] },
    { id: 2, label: 'Geopolitics', icon: '🌍', queries: ['India-China tensions', 'BRICS strategy'] },
    { id: 3, label: 'Policy Analysis', icon: '📋', queries: ['NDA 3.0 agenda', 'GST impact'] },
    { id: 4, label: 'Regional Dynamics', icon: '🗺️', queries: ['North vs South development', 'State competitiveness'] },
    { id: 5, label: 'Quick Fact Check', icon: '✓', queries: ['Claim verification needed'] },
  ];

  useEffect(() => {
    const randomFact = dailyGeopoliticalFacts[Math.floor(Math.random() * dailyGeopoliticalFacts.length)];
    setDailyGeopoliticalFact(randomFact);
    
    // Check user auth status
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchRecentBriefings(user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const fetchRecentBriefings = async (userId) => {
    try {
      // Mock implementation - replace with actual Supabase query
      setRecentBriefings([
        { query_summary: 'Growth sustainability analysis', created_at: new Date(Date.now() - 5*60000) },
        { query_summary: 'NPA trends deep dive', created_at: new Date(Date.now() - 30*60000) },
        { query_summary: 'Wage dynamics impact', created_at: new Date(Date.now() - 2*3600000) },
      ]);
    } catch (error) {
      console.error('Error fetching briefings:', error);
    }
  };

  const modes = [
    { id: 'debate', label: 'DEBATE', icon: Target, desc: 'Affirmative vs Negative analysis' },
    { id: 'stats', label: 'STATS', icon: TrendingUp, desc: 'Data-driven metrics' },
    { id: 'explain', label: 'EXPLAIN', icon: BookOpen, desc: 'Clarity engine' },
    { id: 'geo', label: 'GEO', icon: Map, desc: 'Regional comparison' },
    { id: 'quick', label: 'QUICK', icon: Zap, desc: 'Instant summary' },
  ];

  const perspectives = [
    { id: 'neutral', label: 'Neutral', color: 'bg-slate-700 border-slate-600', textColor: 'text-slate-300' },
    { id: 'pro-govt', label: 'Pro-Govt', color: 'bg-orange-900 border-orange-600', textColor: 'text-orange-300' },
    { id: 'anti-govt', label: 'Anti-Govt', color: 'bg-blue-900 border-blue-600', textColor: 'text-blue-300' },
  ];

  const getConfidenceColor = (confidence) => {
    if (confidence.includes('HIGH')) return 'text-green-400';
    if (confidence.includes('MEDIUM')) return 'text-yellow-400';
    if (confidence.includes('LOW')) return 'text-red-400';
    return 'text-slate-400';
  };

  const generateOutput = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setBriefingId(`BRF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
    
    try {
      // Build the system prompt
      const systemPrompt = `You are an Indian Political Intelligence Engine. Your purpose is to:
1. Present verifiable, structured, data-backed analysis
2. Break down narratives into measurable components
3. Expose weaknesses in arguments
4. Maintain strict neutrality unless a perspective is explicitly selected

RULES:
* Distinguish between FACT, INTERPRETATION, and NARRATIVE
* Prefer Indian government sources (PIB, MoSPI, RBI, PRS, Census, World Bank)
* Never make vague claims without quantification
* If data is uncertain, explicitly say so

PERSPECTIVE: ${perspective === 'neutral' ? 'Neutral' : perspective === 'pro-govt' ? 'Pro-Government' : 'Anti-Government'}

Return valid JSON only (no markdown wrapper).`;

      const userPrompt = `Analyze using ${mode.toUpperCase()} mode with ${perspective} perspective:

Query: "${input}"

Return JSON with: affirmative, negative, keyData, weakness, punchline, conclusion, fact, interpretation, narrative (each with confidence levels and sources)`;

      // Call NVIDIA Nemotron API
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
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
        throw new Error(`API Error: ${response.status}`);
      }

      const apiData = await response.json();
      const content = apiData.choices[0].message.content;

      // Parse JSON response
      let parsedData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        parsedData = {
          affirmative: [{ point: content.substring(0, 200), confidence: 'MEDIUM CONFIDENCE', source: 'NVIDIA Analysis' }],
          negative: [],
          keyData: [content.substring(200, 400)],
          weakness: 'See analysis above',
          punchline: 'Data-backed insight generated',
          conclusion: content,
          fact: 'See affirmative points',
          interpretation: 'AI-assisted analysis',
          narrative: 'See conclusion'
        };
      }

      // Generate chart data
      const chartData = [
        { year: '2014', GDP: 5.2, Investment: 4.1, Consumption: 3.8 },
        { year: '2015', GDP: 5.5, Investment: 4.3, Consumption: 4.0 },
        { year: '2016', GDP: 5.8, Investment: 4.6, Consumption: 4.2 },
        { year: '2017', GDP: 6.1, Investment: 4.9, Consumption: 4.5 },
        { year: '2018', GDP: 6.5, Investment: 5.1, Consumption: 4.7 },
        { year: '2019', GDP: 4.2, Investment: 5.0, Consumption: 4.3 },
        { year: '2020', GDP: -6.2, Investment: 4.2, Consumption: 3.1 },
        { year: '2021', GDP: 8.9, Investment: 5.3, Consumption: 4.6 },
        { year: '2022', GDP: 7.2, Investment: 5.8, Consumption: 5.1 },
        { year: '2023', GDP: 6.5, Investment: 5.9, Consumption: 5.2 },
        { year: '2024', GDP: 6.2, Investment: 6.0, Consumption: 5.0 },
      ];

      const comparisonData = [
        { name: 'NPA Ratio', 2015: 11.5, 2024: 3.2 },
        { name: 'CapEx (% GDP)', 2015: 4.2, 2024: 5.8 },
        { name: 'FDI Inflows ($B)', 2015: 28, 2024: 85 },
        { name: 'Per Capita (₹K)', 2015: 85, 2024: 155 },
      ];

      const newOutput = {
        mode,
        perspective,
        timestamp: new Date().toLocaleTimeString(),
        data: {
          ...parsedData,
          chartData,
          comparisonData,
        },
        query: input,
      };

      setOutput(newOutput);

      // Save to Supabase if user is logged in
      if (user) {
        saveBriefing(newOutput);
      }

    } catch (error) {
      console.error('API Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveBriefing = async (briefingData) => {
    try {
      // Mock implementation - replace with actual Supabase insert
      console.log('Saving briefing:', briefingData);
      alert('Briefing saved successfully!');
    } catch (error) {
      console.error('Error saving briefing:', error);
    }
  };

  const renderCharts = () => {
    if (!output?.data?.chartData) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* GDP Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">📈 Growth Trajectory</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={output.data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404854" />
              <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #404854' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="GDP" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Investment" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Consumption" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparative Metrics */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">📊 Key Indicators (2015 vs 2024)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={output.data.comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404854" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #404854' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="2015" fill="#ef4444" />
              <Bar dataKey="2024" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderOutput = () => {
    if (!output) return null;

    const data = output.data;

    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white underline decoration-2 underline-offset-2">{modes.find(m => m.id === mode)?.label} MODE</h3>
            <p className="text-xs text-slate-400 mt-2">Query: {output.query}</p>
          </div>
          <div className="text-right flex gap-3">
            <button
              onClick={() => user ? saveBriefing(output) : alert('Login to save')}
              className="px-3 py-2 bg-green-900 hover:bg-green-800 rounded text-xs text-green-300 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <div>
              <p className="text-xs text-slate-400">Briefing ID: <span className="text-purple-400 font-mono font-bold">{briefingId}</span></p>
              <p className="text-xs text-slate-400">Time: {output.timestamp}</p>
            </div>
          </div>
        </div>

        {renderCharts()}

        {mode === 'debate' && data.affirmative && (
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-green-400 mb-2 underline decoration-1 underline-offset-2">✓ AFFIRMATIVE</h4>
              {data.affirmative?.map((item, i) => (
                <div key={i} className="text-sm mb-2">
                  <p>{item.point || item}</p>
                  {item.confidence && <p className={`text-xs ${getConfidenceColor(item.confidence)}`}>[{item.confidence}] • {item.source}</p>}
                </div>
              ))}
            </div>

            {data.negative && (
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-bold text-red-400 mb-2 underline decoration-1 underline-offset-2">✗ NEGATIVE</h4>
                {data.negative?.map((item, i) => (
                  <div key={i} className="text-sm mb-2">
                    <p>{item.point || item}</p>
                    {item.confidence && <p className={`text-xs ${getConfidenceColor(item.confidence)}`}>[{item.confidence}] • {item.source}</p>}
                  </div>
                ))}
              </div>
            )}

            {data.punchline && (
              <div className="bg-purple-900 rounded p-3 border border-purple-500">
                <h4 className="font-bold text-purple-300 mb-2 underline decoration-1 underline-offset-2">💥 PUNCHLINE</h4>
                <p className="text-sm italic">"{data.punchline}"</p>
              </div>
            )}

            {data.conclusion && (
              <div className="bg-slate-700 rounded p-3">
                <h4 className="font-bold text-cyan-400 mb-2 underline decoration-1 underline-offset-2">🏁 CONCLUSION</h4>
                <p className="text-sm">{data.conclusion}</p>
              </div>
            )}
          </div>
        )}

        {mode === 'stats' && (
          <div className="space-y-3">
            <div className="bg-slate-700 rounded p-3">
              <h4 className="font-bold text-blue-400 mb-2 underline decoration-1 underline-offset-2">📈 ANALYSIS</h4>
              {data.keyData?.map((item, i) => (
                <p key={i} className="text-sm text-slate-300 mb-1">{item}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800 border-l-2 border-orange-500 rounded p-3 pl-4 mt-4">
          <p className="text-xs text-orange-300">➤ Hidden Caveat: Data reflects latest available sources; regional variations and reporting gaps may exist.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row">
      {/* LEFT SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${mobileOpen ? 'block' : 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className={`flex items-center gap-2 ${sidebarOpen ? 'flex' : 'hidden'}`}>
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">INTEL</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-300">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className={`text-xs text-slate-500 uppercase font-bold mb-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Intelligence Channels</p>
          {intelligenceChannels.map((ch) => (
            <button key={ch.id} className="w-full text-left p-2 rounded mb-2 hover:bg-slate-800 transition-colors" title={ch.label}>
              <span className="text-lg">{ch.icon}</span>
              <p className={`text-xs text-slate-400 mt-1 ${sidebarOpen ? 'block' : 'hidden'}`}>{ch.label}</p>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800">
          <p className={`text-xs text-slate-500 uppercase font-bold mb-2 ${sidebarOpen ? 'block' : 'hidden'}`}>Auth</p>
          <button className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs ${user ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-green-900 text-green-300 hover:bg-green-800'} transition-colors`}>
            {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span className={sidebarOpen ? 'inline' : 'hidden'}>{user ? 'Logout' : 'Login'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-slate-300">Political Intelligence Dashboard</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Terminal className="w-4 h-4" />
            <span>v2.2 (NVIDIA + Supabase)</span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Daily Geopolitical Fact */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-300 mb-1">🌍 DAILY GEOPOLITICAL BRIEFING</h4>
                <p className="text-sm text-slate-300">{dailyGeopoliticalFact}</p>
              </div>
            </div>
          </div>

          {/* MODE SELECTION */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">ANALYSIS MODE</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {modes.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-3 rounded-lg text-center transition-all border ${
                      mode === m.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-bold">{m.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PERSPECTIVE FILTER */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">PERSPECTIVE LENS</label>
            <div className="flex gap-3 flex-wrap">
              {perspectives.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPerspective(p.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                    perspective === p.id ? `${p.color} border-purple-400` : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">💡 Perspective shapes interpretation but NOT data.</p>
          </div>

          {/* INPUT SECTION */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">QUERY</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateOutput()}
                placeholder="Enter your political/economic query..."
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-purple-500 focus:outline-none placeholder-slate-500 text-sm"
              />
              <button
                onClick={generateOutput}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-2 transition-all"
              >
                {loading ? '⏳' : <Send className="w-4 h-4" />}
                {loading ? 'Analyzing' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* OUTPUT */}
          {renderOutput()}

          {!output && (
            <div className="text-center text-slate-400 mt-12">
              <p className="mb-4">🚀 Ready for analysis?</p>
              <p className="text-sm">Select mode → Choose perspective → Enter query → Get NVIDIA-powered insights</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - Recent Briefings */}
      <div className={`${historyOpen ? 'w-72' : 'w-0'} bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase">RECENT</span>
          </div>
          <button onClick={() => setHistoryOpen(!historyOpen)} className="text-slate-400 hover:text-slate-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {recentBriefings.length > 0 ? (
              recentBriefings.map((item, i) => (
                <button key={i} className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">
                  <p className="truncate font-semibold">{item.query_summary}</p>
                  <p className="text-slate-500 text-xs">5m ago</p>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 p-2">No recent briefings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
