import React, { useState, useEffect } from 'react';
import { Send, Activity, ShieldCheck, Terminal, TrendingUp, Map, Zap, BookOpen, Target, History, Sparkles, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Backend URL - change this based on where you deploy
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function PoliticalIntelligenceDashboard() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('debate');
  const [perspective, setPerspective] = useState('neutral');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [briefingId, setBriefingId] = useState('BRF-2024-0847');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dailyGeopoliticalFact, setDailyGeopoliticalFact] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  const dailyGeopoliticalFacts = [
    "🌍 India-Bangladesh maritime boundary: Settled by ICJ in 2009, but South China Sea tensions persist.",
    "🛰️ Chandrayaan-3 soft-landed on Moon's south pole (2023) — strategic positioning for lunar resources.",
    "📊 BRICS+ expansion: Trade with BRICS members: $190B (2023).",
    "🤝 India-China LAC dispute: 2,179km undemarcated border since 2020.",
    "💰 India's UPI: 8.4B transactions/month — global fintech standard.",
    "⚡ India's renewable energy: 175 GW installed (4th largest globally).",
    "🗳️ Indian diaspora: 18M overseas Indians → $111B remittances.",
    "🔐 India defense spending: $72.6B (2023, 5th globally).",
    "🌾 Agricultural subsidies: ₹3.2L cr — supports 140M farmers.",
    "🚢 Indian Ocean: Controls Malacca Strait; 26% of world trade."
  ];

  useEffect(() => {
    const randomFact = dailyGeopoliticalFacts[Math.floor(Math.random() * dailyGeopoliticalFacts.length)];
    setDailyGeopoliticalFact(randomFact);
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.warn('Backend not available:', error.message);
      setBackendStatus('disconnected');
    }
  };

  const modes = [
    { id: 'debate', label: 'DEBATE', icon: Target },
    { id: 'stats', label: 'STATS', icon: TrendingUp },
    { id: 'explain', label: 'EXPLAIN', icon: BookOpen },
    { id: 'geo', label: 'GEO', icon: Map },
    { id: 'quick', label: 'QUICK', icon: Zap },
  ];

  const perspectives = [
    { id: 'neutral', label: 'Neutral', color: 'bg-slate-700' },
    { id: 'pro-govt', label: 'Pro-Govt', color: 'bg-orange-900' },
    { id: 'anti-govt', label: 'Anti-Govt', color: 'bg-blue-900' },
  ];

  const getConfidenceColor = (confidence) => {
    if (confidence?.includes('HIGH')) return 'text-green-400';
    if (confidence?.includes('MEDIUM')) return 'text-yellow-400';
    if (confidence?.includes('LOW')) return 'text-red-400';
    return 'text-slate-400';
  };

  const generateOutput = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setBriefingId(`BRF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
    
    try {
      console.log(`📤 Sending to backend: ${BACKEND_URL}/api/analyze`);

      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          mode: mode,
          perspective: perspective,
        }),
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Backend error: ${response.status}`);
      }

      const apiData = await response.json();
      console.log(`✅ Got response:`, apiData);

      const chartData = [
        { year: '2014', GDP: 5.2, Investment: 4.1 },
        { year: '2015', GDP: 5.5, Investment: 4.3 },
        { year: '2016', GDP: 5.8, Investment: 4.6 },
        { year: '2017', GDP: 6.1, Investment: 4.9 },
        { year: '2018', GDP: 6.5, Investment: 5.1 },
        { year: '2019', GDP: 4.2, Investment: 5.0 },
        { year: '2020', GDP: -6.2, Investment: 4.2 },
        { year: '2021', GDP: 8.9, Investment: 5.3 },
        { year: '2022', GDP: 7.2, Investment: 5.8 },
        { year: '2023', GDP: 6.5, Investment: 5.9 },
        { year: '2024', GDP: 6.2, Investment: 6.0 },
      ];

      setOutput({
        mode,
        perspective,
        timestamp: new Date().toLocaleTimeString(),
        data: {
          ...apiData.data,
          chartData,
        },
        query: input,
      });

    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}\n\nMake sure backend is running: npm run dev (in backend folder)`);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!output?.data?.chartData) return null;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase">📈 GDP Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={output.data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404854" />
            <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #404854' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="GDP" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Investment" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
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
            <h3 className="text-lg font-bold text-white underline">{modes.find(m => m.id === mode)?.label}</h3>
            <p className="text-xs text-slate-400 mt-2">Q: {output.query}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">ID: <span className="text-purple-400">{briefingId}</span></p>
            <p className="text-xs text-slate-400">{output.timestamp}</p>
          </div>
        </div>

        {renderCharts()}

        {data.affirmative && (
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-green-400 mb-2">✓ AFFIRMATIVE</h4>
              {(Array.isArray(data.affirmative) ? data.affirmative : [data.affirmative]).map((item, i) => (
                <p key={i} className="text-sm text-slate-300 mb-1">
                  • {typeof item === 'string' ? item : item.point || item}
                </p>
              ))}
            </div>

            {data.negative && (Array.isArray(data.negative) ? data.negative.length : 0) > 0 && (
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-bold text-red-400 mb-2">✗ NEGATIVE</h4>
                {(Array.isArray(data.negative) ? data.negative : [data.negative]).map((item, i) => (
                  <p key={i} className="text-sm text-slate-300 mb-1">
                    • {typeof item === 'string' ? item : item.point || item}
                  </p>
                ))}
              </div>
            )}

            {data.punchline && (
              <div className="bg-purple-900 rounded p-3 border border-purple-500">
                <h4 className="font-bold text-purple-300 mb-2">💥 PUNCHLINE</h4>
                <p className="text-sm italic">"{data.punchline}"</p>
              </div>
            )}

            {data.conclusion && (
              <div className="bg-slate-700 rounded p-3">
                <h4 className="font-bold text-cyan-400 mb-2">🏁 CONCLUSION</h4>
                <p className="text-sm">{data.conclusion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row">
      {/* LEFT SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all ${mobileOpen ? 'block' : 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className={`flex items-center gap-2 ${sidebarOpen ? 'flex' : 'hidden'}`}>
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold text-slate-300 uppercase">INTEL</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {['📈 Macro Economy', '🌍 Geopolitics', '📋 Policy', '🗺️ Regional', '✓ Fact Check'].map((item, i) => (
            <button key={i} className="w-full text-left p-2 rounded mb-2 hover:bg-slate-800">
              <p className={`text-xs text-slate-400 ${sidebarOpen ? 'block' : 'hidden'}`}>{item}</p>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className={`text-xs ${sidebarOpen ? 'inline' : 'hidden'} ${
              backendStatus === 'connected' ? 'text-green-400' : backendStatus === 'disconnected' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {backendStatus === 'connected' ? 'Backend OK' : backendStatus === 'disconnected' ? 'Backend Down' : 'Checking...'}
            </span>
          </div>
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
            <span>v2.5 (Backend)</span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Backend Status Alert */}
          {backendStatus === 'disconnected' && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-100 text-sm">
                ⚠️ Backend is not running. Start it with: <code className="bg-red-800 px-2 py-1 rounded">npm run dev</code> in the backend folder
              </p>
            </div>
          )}

          {/* Daily Fact */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-300 mb-1">🌍 DAILY GEOPOLITICAL</h4>
                <p className="text-sm text-slate-300">{dailyGeopoliticalFact}</p>
              </div>
            </div>
          </div>

          {/* MODES */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase">MODE</label>
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
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-bold">{m.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PERSPECTIVE */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase">PERSPECTIVE</label>
            <div className="flex gap-3 flex-wrap">
              {perspectives.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPerspective(p.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                    perspective === p.id
                      ? `${p.color} border-purple-400 text-white`
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase">QUERY</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateOutput()}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-purple-500 focus:outline-none"
                disabled={backendStatus === 'disconnected'}
              />
              <button
                onClick={generateOutput}
                disabled={!input.trim() || loading || backendStatus === 'disconnected'}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
              >
                {loading ? '⏳' : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OUTPUT */}
          {renderOutput()}

          {!output && (
            <div className="text-center text-slate-400 mt-12">
              <p className="mb-4">🚀 Ready?</p>
              <p className="text-sm">Mode → Perspective → Query → Analyze</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={`${historyOpen ? 'w-72' : 'w-0'} bg-slate-900 border-l border-slate-800 flex flex-col transition-all overflow-hidden`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">RECENT</span>
          </div>
          <button onClick={() => setHistoryOpen(!historyOpen)} className="text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
