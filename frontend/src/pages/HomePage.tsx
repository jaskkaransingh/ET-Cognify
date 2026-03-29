import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Zap, Activity, Globe, ArrowUpRight, Loader2, TrendingUp, Filter, LogOut, Dna } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useReadingTracker } from "../hooks/useReadingTracker";
import { updateGuesses, confirmProduct, markAsked, getFinancialProfile, type ProductKey } from '../services/financialProfile';
import { getNextProductToAsk } from '../hooks/useFinancialConfirm';
import FinancialConfirmCard from '../components/FinancialConfirmCard';

interface Headline {
  id: string;
  tag: string;
  title: string;
  impact: string;
  time: string;
}

// Boost headlines that match the user's confirmed/likely financial products
const FINANCIAL_BOOST_KEYWORDS: Record<string, string[]> = {
  homeLoan: ['home loan', 'housing loan', 'emi', 'repo rate', 'rbi', 'interest rate', 'property', 'real estate', 'mortgage'],
  personalLoan: ['personal loan', 'credit score', 'cibil', 'unsecured loan', 'instant loan', 'digital lending', 'bnpl'],
  stocks: ['nifty', 'sensex', 'equity', 'stock market', 'demat', 'trading', 'portfolio', 'shares', 'ipo', 'bull run', 'bear market', 'smallcap', 'midcap', 'largecap'],
  fixedDeposit: ['fixed deposit', 'fd rate', 'bank deposit', 'term deposit', 'fd interest', 'recurring deposit', 'small savings'],
};

function boostHeadlines(headlines: Headline[]): Headline[] {
  try {
    const profile = getFinancialProfile();
    const boostWeights: Record<string, number> = {
      homeLoan: profile.homeLoan.status === 'confirmed_yes' ? 2 : profile.homeLoan.status === 'likely' ? 1 : 0,
      personalLoan: profile.personalLoan.status === 'confirmed_yes' ? 2 : profile.personalLoan.status === 'likely' ? 1 : 0,
      stocks: profile.stocks.status === 'confirmed_yes' ? 2 : profile.stocks.status === 'likely' ? 1 : 0,
      fixedDeposit: profile.fixedDeposit.status === 'confirmed_yes' ? 2 : profile.fixedDeposit.status === 'likely' ? 1 : 0,
    };

    const hasAnySignal = Object.values(boostWeights).some(w => w > 0);
    if (!hasAnySignal) return headlines;

    const scored = headlines.map(h => {
      const text = (h.title + ' ' + h.tag).toLowerCase();
      let score = 0;
      for (const [product, weight] of Object.entries(boostWeights)) {
        if (weight === 0) continue;
        const matched = FINANCIAL_BOOST_KEYWORDS[product]?.some(kw => text.includes(kw));
        if (matched) score += weight;
      }
      return { h, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.h);
  } catch {
    return headlines;
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTracking, stopTracking } = useReadingTracker();

  const handleLogout = async () => {
    stopTracking();
    await signOut(auth);
    navigate("/auth");
  };
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>("All");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [activeConfirmKey, setActiveConfirmKey] = useState<ProductKey | null>(null);

  const fallbackHeadlines = [
    { id: '2', tag: "Tech", title: "European regulators mandate cloud infrastructure breakup.", impact: "High Impact", time: "14 mins ago" },
    { id: '3', tag: "Industry", title: "Semiconductor fabrication yields miss Q3 targets by 14%.", impact: "Watchlist", time: "1 hour ago" },
    { id: '4', tag: "Markets", title: "Private lenders expand credit limits amidst liquidity crunch.", impact: "Medium Impact", time: "2 hours ago" },
    { id: '5', tag: "Wealth", title: "Brent crude stabilizes at $84 as supply concerns recede.", impact: "Watchlist", time: "3 hours ago" },
    { id: '6', tag: "Sports", title: "Global sports leagues embrace AI data analytics.", impact: "Medium Impact", time: "4 hours ago" }
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/headlines");
        if (response.ok) {
          const data = await response.json();
          setHeadlines(boostHeadlines(data.headlines));
        } else {
          setHeadlines(boostHeadlines(fallbackHeadlines));
        }
      } catch (error) {
        setHeadlines(boostHeadlines(fallbackHeadlines));
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Derive all unique tags dynamically from the live feed and ensure Sports is always present
  const availableTags = useMemo(() => {
    const tags = Array.from(new Set(headlines.map(h => h.tag)));
    if (!tags.includes('Sports')) {
      tags.push('Sports');
    }
    return ["All", ...tags].filter(Boolean);
  }, [headlines]);

  // Dynamically filter headlines
  const filteredHeadlines = useMemo(() => {
    return activeTag === "All"
      ? headlines
      : headlines.filter(h => h.tag === activeTag);
  }, [headlines, activeTag]);

  // Handle Tag Change implicitly resets selected story if it's not in the new filter
  useEffect(() => {
    if (selectedStoryId && !filteredHeadlines.find(h => h.id === selectedStoryId)) {
      setSelectedStoryId(null);
    }
  }, [activeTag, filteredHeadlines, selectedStoryId]);

  // Financial Fingerprint: run guess logic once headlines are loaded
  useEffect(() => {
    if (headlines.length > 0) {
      updateGuesses();
      const next = getNextProductToAsk();
      if (next) {
        setActiveConfirmKey(next);
        markAsked(next);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlines.length]);

  // Layout assignment
  const selectedStory = useMemo(() => {
    return selectedStoryId ? filteredHeadlines.find(h => h.id === selectedStoryId) || filteredHeadlines[0] : filteredHeadlines[0];
  }, [filteredHeadlines, selectedStoryId]);

  const remainingStories = useMemo(() => {
    if (!selectedStory) return [];
    return filteredHeadlines.filter(h => h.id !== selectedStory.id);
  }, [filteredHeadlines, selectedStory]);

  const topStory = selectedStory; // Separate feeds
  const featuredStories = useMemo(() => {
    let stories = remainingStories.filter(h => h.tag === "Market" || h.tag === "World").slice(0, 2);
    if (stories.length < 2) {
      const extra = remainingStories.filter(h => !stories.some(s => s.id === h.id)).slice(0, 2 - stories.length);
      stories = [...stories, ...extra];
    }
    return stories;
  }, [remainingStories]);
  const terminalFeedStories = filteredHeadlines;
  const tickerStories = headlines.slice(0, 10); // Enforce only the absolute latest news

  return (
    <div className="h-screen bg-transparent text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col overflow-hidden relative">
      <header className="border-b border-white/10 py-3 px-6 flex justify-between items-center bg-black/80 backdrop-blur-2xl z-50 sticky top-0 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-[#ED1C24] flex items-center justify-center shadow-[0_0_20px_rgba(237,28,36,0.5)] transform -skew-x-12">
              <Radio className="text-white w-6 h-6 animate-pulse skew-x-12" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full border-2 border-black animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic leading-none cursor-pointer" onClick={() => window.location.reload()}>
              ET<span className="text-[#ED1C24]">COGNIFY</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Global Feed v4.0</span>
              <div className="h-[1px] w-8 bg-white/10" />
            </div>
          </div>
        </div>
        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full border border-[#ED1C24]/50 bg-[#ED1C24]/20 flex items-center justify-center">
              <span className="text-sm font-black text-white">
                {(user?.displayName || user?.email || 'O')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col leading-none hidden sm:flex">
            <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[120px]">
              {user?.displayName || user?.email?.split('@')[0] || 'Operative'}
            </span>
          </div>
          <button
            onClick={() => navigate('/dna')}
            className="ml-2 flex items-center gap-2 px-3 py-2 border border-[#FFD700]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60 hover:text-[#FFD700] hover:border-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
          >
            <Dna className="w-3 h-3" />
            <span className="hidden sm:inline">DNA</span>
          </button>
          <button
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-[#ED1C24]/50 hover:bg-[#ED1C24]/10 transition-all"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Brutalist Grid Layout */}
      <main className="flex-1 p-3 flex flex-col overflow-hidden relative">

        {/* Dynamic Filter Bar */}
        <div className="flex items-center gap-2 mb-3 shrink-0 overflow-x-auto custom-scrollbar pb-2">
          <Filter className="w-4 h-4 text-white/40 mr-2 shrink-0" />
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap ${activeTag === tag
                ? 'bg-[#ED1C24] text-white border-[#ED1C24] shadow-[0_0_15px_rgba(237,28,36,0.3)]'
                : 'bg-[#121212] text-white/40 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20'
                }`}
            >
              {tag}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pl-4 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate">
              {filteredHeadlines.length} Signals Captured
            </span>
          </div>
        </div>

        {/* Dynamic Seismograph Ticker (Moved Below Filter) */}
        {!loading && (
          <section className="bg-[#121212] border border-white/5 rounded-lg py-2 mb-3 overflow-hidden relative shrink-0 flex items-center">
            {/* Static Label */}
            <div className="flex items-center gap-3 px-4 text-[#00FF41] font-black text-[9px] uppercase tracking-[0.4em] z-20 shrink-0 bg-[#121212] border-r border-white/10 h-full">
              <Activity className="w-4 h-4 animate-pulse" />
              Live Intel
            </div>

            {/* Scrolling Area */}
            <div className="flex-1 overflow-hidden relative flex">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none" />
              <div className="flex whitespace-nowrap group">
                {[...Array(2)].map((_, groupIdx) => (
                  <div 
                    key={groupIdx} 
                    className="flex shrink-0 items-center gap-12 pl-12 pr-12 animate-slide-infinite group-hover:[animation-play-state:paused]"
                    style={{ animationDuration: `${Math.max(tickerStories.length * 6, 60)}s` }}
                  >
                    {tickerStories.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-[11px] font-bold cursor-crosshair" onClick={() => navigate('/arena', { state: { story: t } })}>
                        <span className="text-[#ED1C24] font-mono tracking-tighter">[{t.time}]</span>
                        <span className="text-[#00FF41] hover:text-white transition-colors">{t.title}</span>
                        <span className="text-white/10">/</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] rounded-xl border border-white/5">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-[#ED1C24] animate-spin" />
              <div className="absolute inset-0 bg-[#ED1C24]/20 blur-xl rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Connecting to Feed</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Parsing ET Markets</p>
            </div>
          </div>
        ) : filteredHeadlines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] rounded-xl border border-white/5 text-[10px] uppercase font-black tracking-widest text-white/30">
            No signals match this frequency.
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

            {/* Primary Analysis Column (Hero & Featured) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0">

              {/* Featured Left Hero */}
              {topStory && (
                <div className="flex-1 bg-[#121212] border border-white/10 rounded-xl p-8 flex flex-col relative overflow-hidden group w-full cursor-pointer shadow-[0_0_50px_rgba(0,0,0,0.5)]" onClick={() => { stopTracking(); startTracking(topStory.id, topStory.title, topStory.tag); navigate('/arena', { state: { story: topStory } }); }}>


                  <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                    <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white transition-opacity duration-500 group-hover:opacity-50" />
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white transition-opacity duration-500 group-hover:opacity-50" />
                  </div>

                  {/* Integrated Animated Squares for Hero Background - Two Opposite Rows */}
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
                    {/* Row 1: Forward (Right to Left) */}
                    <div className="absolute top-[8%] left-[-10%] flex rotate-[-10deg] origin-left scale-100">
                      <div className="flex gap-12 animate-slide-infinite w-max pr-12" style={{ animationDuration: '12s' }}>
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.5] shadow-[0_0_100px_rgba(237,28,36,0.4)]" />
                        ))}
                      </div>
                      <div className="flex gap-12 animate-slide-infinite w-max pr-12" style={{ animationDuration: '12s' }}>
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.5] shadow-[0_0_100px_rgba(237,28,36,0.4)]" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Row 2: Reverse (Left to Right, Starting Right) */}
                    <div className="absolute top-[55%] right-[-5%] flex rotate-[-10deg] origin-right scale-100">
                      <div className="flex gap-16 animate-slide-right-hero w-max" style={{ animationDuration: '14s' }}>
                        {[...Array(3)].map((_, groupIdx) => (
                          <div key={groupIdx} className="flex gap-16">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.4] shadow-[0_0_100px_rgba(237,28,36,0.3)]" />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col h-full justify-between z-10 w-full relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#ED1C24] text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(237,28,36,0.3)]">
                          Primary Intel
                        </div>
                        <div className="h-[1px] w-8 bg-white/10" />
                        <span className="text-white/40 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                          <Globe className="w-2.5 h-2.5" />
                          {topStory.tag}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#ED1C24] font-bold">{topStory.time}</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-4">
                      <h2 className="text-4xl xl:text-6xl font-black text-white leading-[0.85] tracking-tighter italic uppercase mb-6 drop-shadow-xl pr-8">
                        {topStory.title.split(' ').map((word, i) => (
                          <span key={i} className={i % 3 === 2 ? 'text-[#ED1C24]' : 'text-white'}>
                            {word}{' '}
                          </span>
                        ))}
                      </h2>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Priority:</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                          {topStory.impact}
                        </p>
                      </div>

                      <button className="group/btn flex items-center justify-center gap-4 bg-gradient-to-r from-[#ED1C24] via-[#5C0307] to-[#ED1C24] bg-[length:200%_auto] animate-bg-gradient border border-[#ED1C24]/50 px-8 py-4 rounded-xl transition-all duration-500 shadow-[0_0_15px_rgba(237,28,36,0.5)] hover:shadow-[0_0_25px_rgba(237,28,36,0.8)] hover:-translate-y-1">
                        <span className="text-sm font-black uppercase tracking-widest text-white z-10">Enter Arena</span>
                        <Zap className="w-5 h-5 text-white animate-pulse z-10" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pair of Secondary Cards below Hero */}
              {featuredStories.length > 0 && (
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {featuredStories.map(story => (
                    <div key={story.id} onClick={() => navigate('/arena', { state: { story } })} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden h-48">
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFD700]/5 blur-[60px] rounded-full group-hover:bg-[#FFD700]/10 transition-all duration-700 pointer-events-none" />

                      <div className="flex items-center justify-between z-10 border-b border-white/5 pb-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-3 bg-[#ED1C24]" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#ED1C24] truncate">{story.tag}</span>
                        </div>
                        <span className="text-[8px] font-mono text-white/30 shrink-0">{story.time}</span>
                      </div>

                      <h3 className="text-sm xl:text-lg font-black text-white italic leading-tight tracking-tighter group-hover:text-[#ED1C24] transition-colors duration-500 z-10 pr-2 line-clamp-3">
                        {story.title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto pt-3 z-10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{story.impact}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#FFD700] opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comprehensive Right Terminal Feed */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-0 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[50px] pointer-events-none" />

              {/* Feed Header */}
              <div className="flex items-center gap-3 p-4 pb-3 border-b border-white/10 shrink-0 bg-[#121212]/50 backdrop-blur-md relative z-10">
                <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Terminal Feed</h3>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#ED1C24] rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-[#ED1C24]">LIVE STREAM</span>
                </div>
              </div>

              {/* Massive Scrollable List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative z-10">
                <div className="flex flex-col gap-1">
                  {terminalFeedStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => { stopTracking(); startTracking(story.id, story.title, story.tag); setSelectedStoryId(story.id); }}
                      className="group p-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#ED1C24]">
                          {story.tag}
                        </span>
                        <span className="text-[8px] font-mono text-[#FFD700] group-hover:text-white transition-colors">
                          {story.time}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium leading-snug text-white/80 group-hover:text-white transition-colors">
                        {story.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        )}
      </main>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite alternate ease-in-out;
        }
        
        @keyframes bg-gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        .animate-bg-gradient {
          animation: bg-gradient 4s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(237, 28, 36, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(237, 28, 36, 0.6);
        }
      `}</style>

      {/* Financial Fingerprint Confirm Card — only visible on HomePage */}
      {activeConfirmKey && (
        <FinancialConfirmCard
          productKey={activeConfirmKey}
          onAnswer={(key, answer) => {
            confirmProduct(key, answer);
            setActiveConfirmKey(null);
          }}
          onSkip={() => setActiveConfirmKey(null)}
        />
      )}
    </div>
  );
}
