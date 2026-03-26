import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Dna, ArrowLeft, TrendingUp, AlertTriangle, Zap, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { analyzeDNA, generateDNAInsight, type DNAProfile } from '../services/dnaService';

// ─── Circular Bias Ring ──────────────────────────────────────────────────────
function BiasRing({ score }: { score: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 70 ? '#ED1C24' : score >= 45 ? '#FFD700' : '#00FF41';
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="absolute w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
      </svg>
      <div className="z-10 text-center">
        <span className="text-xl font-black text-white">{score}</span>
        <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">/100</span>
      </div>
    </div>
  );
}

// ─── Topic Bar ───────────────────────────────────────────────────────────────
function TopicBar({ topic, score, isBlindSpot }: { topic: string; score: number; isBlindSpot: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest text-white/60 w-28 shrink-0 truncate">{topic}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background: isBlindSpot ? '#ED1C24' : score > 60 ? '#00FF41' : '#FFD700',
            boxShadow: isBlindSpot ? '0 0 8px rgba(237,28,36,0.5)' : undefined,
          }}
        />
      </div>
      <span className="text-[9px] font-mono text-white/40 w-8 text-right">{score}%</span>
    </div>
  );
}

// ─── Blind Spot Card ─────────────────────────────────────────────────────────
const BLIND_SPOT_CONTEXT: Record<string, { why: string; risk: string; color: string }> = {
  'RBI': { why: 'RBI policy decisions affect your EMIs, bond yields, and banking stocks.', risk: 'High Risk', color: '#ED1C24' },
  'Markets': { why: 'Ignoring market trends can cost you entry/exit timing.', risk: 'High Risk', color: '#ED1C24' },
  'Mutual Funds': { why: 'MF regulations and category changes affect your SIP returns.', risk: 'Medium Risk', color: '#FFD700' },
  'Banking': { why: 'Banking health signals credit cycles that impact all your holdings.', risk: 'Medium Risk', color: '#FFD700' },
};

function BlindSpotCard({ topic }: { topic: string }) {
  const ctx = BLIND_SPOT_CONTEXT[topic] ?? { why: 'Staying updated here improves your overall portfolio view.', risk: 'Medium Risk', color: '#FFD700' };
  return (
    <div className="flex gap-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 group hover:border-white/20 transition-all">
      <div className="w-1 rounded-full shrink-0" style={{ background: ctx.color }} />
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-black text-white uppercase tracking-tight">{topic}</span>
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border"
            style={{ color: ctx.color, borderColor: `${ctx.color}40` }}>{ctx.risk}</span>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">{ctx.why}</p>
      </div>
    </div>
  );
}

// ─── Insight Panel ───────────────────────────────────────────────────────────
function InsightPanel({ profile }: { profile: DNAProfile }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    generateDNAInsight(profile).then(text => {
      if (!cancelled) { setInsight(text); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [profile]);

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Zap className="w-4 h-4 text-[#FFD700]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700]">Just For You</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#ED1C24] rounded-full animate-pulse" />
          <span className="text-[7px] font-mono text-[#ED1C24]">AI</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col gap-3">
          {[80, 100, 60].map((w, i) => (
            <div key={i} className="h-3 bg-white/5 rounded-full animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/80 leading-relaxed font-medium italic flex-1">"{insight}"</p>
      )}

      {!loading && profile.topTopics.length > 0 && (
        <div className="mt-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">You Should Also Read</p>
          <div className="flex flex-col gap-2">
            {profile.blindSpots.slice(0, 3).map((topic, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-[#ED1C24]/30 transition-all cursor-pointer group">
                <ChevronRight className="w-3 h-3 text-[#ED1C24] shrink-0" />
                <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onboarding State ────────────────────────────────────────────────────────
function OnboardingState({ sessions }: { sessions: number }) {
  const navigate = useNavigate();
  const steps = 5;
  const pct = Math.round((sessions / steps) * 100);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Dna className="w-10 h-10 text-[#ED1C24]" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-3">
          Build Your <span className="text-[#ED1C24]">DNA</span>
        </h2>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          Read {steps - sessions} more {steps - sessions === 1 ? 'article' : 'articles'} to unlock your personalized News DNA profile.
        </p>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Progress</span>
            <span className="text-[10px] font-black text-[#FFD700]">{sessions}/{steps} Reads</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#ED1C24] to-[#FFD700] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 mx-auto px-6 py-3 bg-[#ED1C24] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#c41018] transition-all shadow-[0_0_20px_rgba(237,28,36,0.4)]"
        >
          <ArrowLeft className="w-4 h-4" /> Go Read News
        </button>
      </div>
    </div>
  );
}


// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DNAPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setProfile(analyzeDNA());
  }, [refreshKey]);

  const firstName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Operative';

  if (!profile) return null;

  const isOnboarding = profile.totalSessions < 5;

  return (
    <div className="h-screen bg-transparent text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col overflow-hidden relative">

      {/* Header */}
      <header className="border-b border-white/10 py-3 px-6 flex justify-between items-center bg-black/80 backdrop-blur-2xl z-50 sticky top-0 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#ED1C24] flex items-center justify-center shadow-[0_0_20px_rgba(237,28,36,0.5)] transform -skew-x-12">
              <Radio className="text-white w-6 h-6 animate-pulse skew-x-12" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full border-2 border-black animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic leading-none cursor-pointer" onClick={() => navigate('/')}>
              ET<span className="text-[#ED1C24]">COGNIFY</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">News DNA</span>
              <div className="h-[1px] w-8 bg-white/10" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all">
            <ArrowLeft className="w-3 h-3" /> Feed
          </button>
          <button onClick={() => navigate('/arena')} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all">
            Arena
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-2 px-3 py-2 border border-[#ED1C24]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#ED1C24]/70 hover:text-[#ED1C24] hover:border-[#ED1C24] transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </header>

      {isOnboarding ? <OnboardingState sessions={profile.totalSessions} /> : (
        <main className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(237,28,36,0.3) transparent' }}>

          {/* Hero Section */}
          <section className="bg-[#121212] border border-white/10 rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ED1C24] blur-[100px] rounded-full" />
            </div>
            <BiasRing score={profile.biasScore} />
            <div className="flex-1 z-10">
              <div className="flex items-center gap-3 mb-2">
                <Dna className="w-4 h-4 text-[#ED1C24]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Your Reading Style</span>
              </div>
              <h2 className="text-3xl xl:text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">
                {firstName}'s <span className="text-[#ED1C24]">News DNA</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                Built from {profile.totalSessions} reading {profile.totalSessions === 1 ? 'session' : 'sessions'}
              </p>
              <p className="text-sm text-white/60 max-w-lg leading-relaxed">{profile.investorDescription}</p>
            </div>
            <div className="z-10 flex flex-col items-end gap-2">
              <div className="bg-[#ED1C24] text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(237,28,36,0.4)]">
                {profile.investorType}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{profile.biasLabel}</span>
            </div>
          </section>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

            {/* Column 1 — Reading Traits */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col gap-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 shrink-0">
                <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700]">What You Read</h3>
              </div>
              {profile.traits.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.traits.map(t => (
                    <TopicBar key={t.topic} topic={t.topic} score={t.score} isBlindSpot={profile.blindSpots.includes(t.topic)} />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/30 uppercase tracking-widest">No trait data yet.</p>
              )}

              {profile.emotionalTriggers.length > 0 && (
                <>
                  <div className="h-[1px] bg-white/10 shrink-0" />
                  <div className="flex items-center gap-3 shrink-0">
                    <Zap className="w-3 h-3 text-[#ED1C24]" />
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">What Moves You</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {profile.emotionalTriggers.map((trig, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-[10px] font-bold text-white/70 truncate mr-2">{trig.topic}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700] shrink-0">{trig.behavior}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Column 2 — Blind Spots */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col gap-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ED1C24]">What You're Missing</h3>
                <span className="ml-auto text-[9px] font-black text-white/30">{profile.blindSpots.length} detected</span>
              </div>
              {profile.blindSpots.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.blindSpots.map(topic => (
                    <BlindSpotCard key={topic} topic={topic} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-12 h-12 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#00FF41]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">You're reading it all. Nothing is missing.</p>
                </div>
              )}
            </div>

            {/* Column 3 — AI Insight */}
            <InsightPanel profile={profile} />
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">
              Your DNA updates every time you read
            </p>
            <button
              onClick={() => navigate('/arena')}
              className="flex items-center gap-2 px-4 py-2 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#ED1C24] hover:bg-[#ED1C24] hover:text-white transition-all"
            >
              View Deep Intelligence <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
