import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, TrendingUp, User, Landmark, Briefcase, TrendingDown, Users, Fingerprint, Loader2, Play, Radio, AlertTriangle, Globe, Dna } from 'lucide-react';
import { generateInsight, ETCognifyInsight } from '../services/geminiService';
import { useReadingTracker, savePerspectiveClick } from '../hooks/useReadingTracker';

// --- Types ---
type Perspective = 'Neutral' | 'Shareholder' | 'Gig Worker' | 'FII' | 'Farmer' | 'Short Seller';

// --- Components ---

const Header = ({ onNext, onDNA }: { onNext: () => void; onDNA: () => void }) => (
  <header className="border-b border-white/10 py-3 px-6 flex justify-between items-center bg-black/80 backdrop-blur-2xl z-50 sticky top-0">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-10 h-10 bg-[#ED1C24] flex items-center justify-center shadow-[0_0_20px_rgba(237,28,36,0.5)] transform -skew-x-12">
          <Radio className="text-white w-6 h-6 animate-pulse skew-x-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full border-2 border-black animate-bounce" />
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white italic leading-none">
          ET<span className="text-[#ED1C24]">COGNIFY</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Intelligence OS v4.0</span>
          <div className="h-[1px] w-8 bg-white/10" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={onNext}
        className="group flex items-center gap-3 bg-white/5 hover:bg-[#ED1C24] border border-white/10 hover:border-[#ED1C24] px-4 py-2 rounded-lg transition-all duration-500"
      >
        <div className="flex flex-col items-start">
          <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60">Next Signal</span>
          <span className="text-[10px] font-black uppercase tracking-tighter text-white">Load Intelligence</span>
        </div>
        <Zap className="w-4 h-4 text-[#FFD700] group-hover:text-white animate-pulse" />
      </button>

      <button
        onClick={onDNA}
        className="flex items-center gap-2 px-3 py-2 border border-[#FFD700]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60 hover:text-[#FFD700] hover:border-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
      >
        <Dna className="w-3 h-3" />
        <span className="hidden sm:inline">DNA</span>
      </button>

      <div className="hidden xl:flex items-center gap-6">
        {[
          { label: 'NIFTY 50', value: '23,452.10', change: '+0.4%', up: true },
          { label: 'SENSEX', value: '77,124.50', change: '+0.3%', up: true },
          { label: 'USD/INR', value: '83.42', change: '-0.1%', up: false },
        ].map((m, i) => (
          <div key={i} className="flex flex-col items-end group cursor-pointer">
            <span className="text-white/30 text-[7px] font-black uppercase tracking-widest group-hover:text-[#FFD700] transition-colors">{m.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-xs font-bold">{m.value}</span>
              <span className={`text-[9px] font-black ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>{m.change}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#ED1C24] hover:border-[#ED1C24] transition-all duration-500 cursor-pointer group">
        <User className="w-5 h-5 text-white/60 group-hover:text-white" />
      </div>
    </div>
  </header>
);

const Seismograph = () => {
  const [tremors] = useState([
    { id: 'ALPHA', company: 'ZEE ENT', confidence: 74, status: 'VOLATILE', color: 'text-red-500' },
    { id: 'BETA', company: 'ADANI PORTS', confidence: 62, status: 'STABLE', color: 'text-emerald-500' },
    { id: 'GAMMA', company: 'RELIANCE', confidence: 51, status: 'WATCH', color: 'text-amber-500' },
    { id: 'DELTA', company: 'HDFC BANK', confidence: 88, status: 'CRITICAL', color: 'text-red-600' },
  ]);

  return (
    <section className="bg-black border-b border-white/5 py-2 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
      <div className="flex items-center gap-12 px-4 whitespace-nowrap animate-marquee">
        {Array(4).fill(0).map((_, groupIdx) => (
          <React.Fragment key={groupIdx}>
            <div className="flex items-center gap-3 text-[#FFD700] font-black text-[9px] uppercase tracking-[0.4em]">
              <Activity className="w-4 h-4" />
              Live Signal
            </div>
            {tremors.map((t) => (
              <div key={t.id} className="flex items-center gap-4 text-[11px] font-bold group cursor-crosshair">
                <span className="text-white/20 font-mono tracking-tighter">[{t.id}]</span>
                <span className="text-white group-hover:text-[#ED1C24] transition-colors">{t.company}</span>
                <div className={`h-1 w-8 bg-white/5 rounded-full overflow-hidden`}>
                  <div className={`h-full bg-current ${t.color}`} style={{ width: `${t.confidence}%` }} />
                </div>
                <span className={`${t.color} text-[8px] font-black border border-current/30 px-1.5 py-0.5 rounded-sm`}>{t.status}</span>
                <span className="text-white/10">/</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const PersonalitySection = ({ dna }: { dna: ETCognifyInsight['newsDNA'] }) => (
  <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 h-full relative overflow-hidden group flex flex-col justify-center">
    {/* Atmospheric Background */}
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FFD700]/5 blur-[100px] rounded-full group-hover:bg-[#FFD700]/10 transition-all duration-700" />
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
      <Fingerprint className="w-32 h-32 text-[#FFD700]" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-4 bg-[#FFD700]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700]">Behavioral DNA</h3>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">Investor Archetype</p>
          <h4 className="text-3xl xl:text-4xl font-black text-white italic leading-none tracking-tighter group-hover:text-[#FFD700] transition-colors duration-500">
            {dna.profile}
          </h4>
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm transform group-hover:translate-x-2 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ED1C24]">Strategic Blind Spot</p>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-medium italic">
            "{dna.blindSpot}"
          </p>
        </div>
      </div>
    </div>

    <div className="absolute bottom-6 right-6 flex gap-1">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
      ))}
    </div>
  </div>
);

const NewsReportWithPerspectives = ({ headline, summary, perspectives }: {
  headline: string;
  summary: string;
  perspectives: ETCognifyInsight['perspectives']
}) => {
  const [active, setActive] = useState<Perspective>('Neutral');

  const icons: Record<Perspective, React.ReactNode> = {
    'Neutral': <Landmark className="w-4 h-4" />,
    'Shareholder': <Briefcase className="w-4 h-4" />,
    'Gig Worker': <Users className="w-4 h-4" />,
    'FII': <TrendingUp className="w-4 h-4" />,
    'Farmer': <Landmark className="w-4 h-4" />,
    'Short Seller': <TrendingDown className="w-4 h-4" />
  };

  return (
    <div className="row-span-4 bg-[#121212] border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden group w-full">
      {/* Editorial Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
      </div>

      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#ED1C24] text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(237,28,36,0.3)]">
            Flash Report
          </div>
          <div className="h-[1px] w-8 bg-white/10" />
          <span className="text-white/40 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Globe className="w-2.5 h-2.5" />
            Global Intel
          </span>
        </div>

        <div className="flex gap-1.5">
          {(Object.keys(perspectives) as Perspective[]).map(p => (
            <button
              key={p}
              onClick={() => { setActive(p); savePerspectiveClick(p); }}
              title={p}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${active === p
                  ? 'bg-[#ED1C24] text-white scale-110 shadow-[0_10px_25px_rgba(237,28,36,0.5)] rotate-3'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white hover:-translate-y-1'
                }`}
            >
              {icons[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center z-10">
        <motion.h2
          key={headline}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl xl:text-5xl font-black text-white leading-[0.85] tracking-tighter italic uppercase mb-4"
        >
          {headline.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 0 ? 'text-white' : 'text-[#ED1C24]'}>
              {word}{' '}
            </span>
          ))}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Core Intelligence</p>
            </div>
            <p className="text-sm xl:text-base text-white/70 font-medium leading-relaxed border-l-2 border-[#ED1C24] pl-4">
              {summary}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xl relative group/card"
            >
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[#FFD700] text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg">
                {active} Perspective
              </div>
              <p className="text-xs xl:text-sm text-white italic font-medium leading-relaxed">
                "{perspectives[active]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<ETCognifyInsight | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const { startTracking, stopTracking } = useReadingTracker();

  const topics = [
    "Latest Indian Market Trends and Global Economic Impact",
    "The Rise of AI in Indian Fintech and Regulatory Challenges",
    "Green Energy Transition in India: Investment Opportunities and Risks",
    "Global Supply Chain Shifts: India's Role as a Manufacturing Hub",
    "The Impact of US Fed Rates on Emerging Market Equities",
    "Digital Rupee and the Future of Programmable Money in India"
  ];

  const fetchInsight = async (index: number) => {
    try {
      setLoading(true);
      const data = await generateInsight(topics[index]);
      setInsight(data);
    } catch (error) {
      console.error("Failed to fetch insight:", error);
      // Fallback to static data if API fails
      setInsight({
        headline: "RBI Monetary Policy: Stability Amidst Global Volatility",
        summary: "The Reserve Bank of India has maintained its benchmark interest rates, signaling a focus on inflation management while supporting domestic growth momentum.",
        perspectives: {
          Neutral: "The MPC's decision to keep the repo rate at 6.5% was widely expected by economists, reflecting a 'wait and watch' approach towards monsoon progress and global commodity prices.",
          Shareholder: "Banking stocks may see positive momentum as net interest margins remain protected, though NBFCs might face continued pressure on borrowing costs.",
          'Gig Worker': "Stable rates prevent immediate spikes in EMI for personal loans and two-wheeler financing, providing some relief to urban delivery partners.",
          FII: "Foreign investors view the consistency as a sign of macroeconomic stability, potentially increasing debt market inflows into Indian government bonds.",
          Farmer: "Rural demand remains sensitive to credit availability; the status quo ensures that agricultural loan rates don't rise before the crucial sowing season.",
          'Short Seller': "Risks remain in the mid-cap space where high valuations are predicated on future rate cuts that are now being pushed further into the year."
        },
        butterflyEffect: {
          trigger: "Repo Rate Status Quo",
          directImpact: "10-year G-Sec yields stabilize at 7.1%",
          personalRipples: [
            { label: "Home Loan EMI", value: "No immediate change", cost: "₹0" },
            { label: "Fixed Deposit Yields", value: "Peak rates maintained", cost: "₹2,500/mo gain" }
          ]
        },
        debate: {
          topic: "Is the RBI being overly cautious on inflation?",
          bull: "Prudence now prevents a hard landing later. Maintaining high real rates is essential to anchor inflation expectations permanently.",
          bear: "High borrowing costs are stifling private capex. The central bank risks falling behind the curve as other major economies begin their pivot."
        },
        newsDNA: {
          profile: "Conservative Growth Seeker",
          blindSpot: "Impact of global 'higher for longer' rates on domestic tech valuations."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight(0);
  }, []);

  const handleNextNews = () => {
    const nextIndex = (topicIndex + 1) % topics.length;
    setTopicIndex(nextIndex);
    stopTracking();
    startTracking(`arena_${topics[nextIndex]}`, topics[nextIndex], 'Arena');
    fetchInsight(nextIndex);
  };

  return (
    <div className="h-screen bg-[#050505] text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col overflow-hidden">
      <Header onNext={handleNextNews} onDNA={() => navigate('/dna')} />
      <Seismograph />

      <main className="flex-1 p-3 grid grid-cols-12 grid-rows-6 gap-3 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-12 row-span-6 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#ED1C24] animate-spin" />
                <div className="absolute inset-0 bg-[#ED1C24]/20 blur-xl rounded-full animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Synthesizing Intelligence</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Analyzing Global Market Ripples</p>
              </div>
            </motion.div>
          ) : insight && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-12 row-span-6 grid grid-cols-12 grid-rows-6 gap-3 h-full"
            >
              {/* Left Column - Personality DNA */}
              <div className="col-span-12 lg:col-span-3 row-span-6">
                <PersonalitySection dna={insight.newsDNA} />
              </div>

              {/* Center Column - Main News & Debate */}
              <div className="col-span-12 lg:col-span-6 row-span-6 grid grid-rows-6 gap-4 h-full">
                <NewsReportWithPerspectives
                  headline={insight.headline}
                  summary={insight.summary}
                  perspectives={insight.perspectives}
                />

                {/* Debate Section - Now in Center Bottom */}
                <div className="row-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col overflow-hidden group w-full h-full shadow-2xl">
                  <div className="bg-white/5 px-6 py-2.5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#ED1C24] rounded-full animate-pulse shadow-[0_0_10px_rgba(237,28,36,0.8)]" />
                      <h3 className="text-white font-black uppercase text-[9px] tracking-[0.5em]">Intelligence Debate</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Channel 01</span>
                      <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[7px] font-black text-red-500 uppercase tracking-tighter">Live</div>
                    </div>
                  </div>
                  <div className="p-6 xl:p-8 flex-1 flex flex-col justify-center gap-4 xl:gap-6 overflow-y-auto custom-scrollbar">
                    <h4 className="text-lg xl:text-2xl font-black text-white text-center italic uppercase tracking-tighter leading-tight">
                      "{insight.debate.topic}"
                    </h4>
                    <div className="grid grid-cols-2 gap-8 xl:gap-12 relative w-full">
                      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10 -translate-x-1/2" />
                      <div className="space-y-2 xl:space-y-3 group/bull">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                          <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[8px] xl:text-[9px]">Bull Thesis</span>
                        </div>
                        <p className="text-white/60 text-[10px] xl:text-xs leading-relaxed italic group-hover/bull:text-white transition-colors duration-300">
                          "{insight.debate.bull}"
                        </p>
                      </div>
                      <div className="space-y-2 xl:space-y-3 group/bear">
                        <div className="flex items-center gap-3 justify-end">
                          <span className="text-red-500 font-black uppercase tracking-[0.3em] text-[8px] xl:text-[9px]">Bear Thesis</span>
                          <div className="w-1.5 h-4 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                        </div>
                        <p className="text-white/60 text-[10px] xl:text-xs leading-relaxed italic text-right group-hover/bear:text-white transition-colors duration-300">
                          "{insight.debate.bear}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - CTA & Butterfly Effect */}
              <div className="col-span-12 lg:col-span-3 row-span-6 grid grid-rows-6 gap-4">
                <div className="row-span-2 bg-gradient-to-br from-[#ED1C24] to-red-900 p-6 rounded-xl flex flex-col justify-center shadow-[0_15px_35px_rgba(237,28,36,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <h3 className="text-white font-black italic text-xl mb-1 uppercase tracking-tighter z-10">Eager to Watch?</h3>
                  <p className="text-white/70 text-[11px] font-medium mb-4 leading-tight z-10">Get real-time alerts as this story unfolds.</p>
                  <button className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-sm flex items-center justify-center gap-3 hover:bg-[#FFD700] hover:scale-[1.02] transition-all duration-300 z-10 shadow-xl">
                    <Play className="w-4 h-4 fill-current" />
                    Start Stream
                  </button>
                </div>

                {/* Butterfly Effect Mapper - Now in Right Column */}
                <div className="row-span-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Zap className="text-[#FFD700] w-5 h-5" />
                      <h3 className="text-[10px] font-black text-white italic uppercase tracking-[0.3em]">Butterfly Effect</h3>
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                      <span className="text-[8px] font-black text-[#FFD700] uppercase tracking-widest">{insight.butterflyEffect.trigger}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                      <h4 className="text-white/30 font-black uppercase text-[8px] tracking-[0.3em] mb-2">Direct Impact</h4>
                      <p className="text-white/90 text-xs font-medium leading-relaxed italic">{insight.butterflyEffect.directImpact}</p>
                    </div>
                    {insight.butterflyEffect.personalRipples.map((ripple, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group/ripple">
                        <h4 className="text-white/30 font-black uppercase text-[8px] tracking-[0.3em] mb-2 group-hover/ripple:text-[#FFD700] transition-colors">{ripple.label}</h4>
                        <p className="text-white font-bold text-sm mb-1">{ripple.value}</p>
                        {ripple.cost && <span className="text-[#ED1C24] font-black text-[9px] tracking-widest">COST: {ripple.cost}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global CSS for marquee and scrollbars */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(237, 28, 36, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(237, 28, 36, 0.5);
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
