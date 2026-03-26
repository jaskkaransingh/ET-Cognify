import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Zap, TrendingUp, User, Landmark, Briefcase, TrendingDown,
  Users, Loader2, Radio, Globe, Dna,
  X, Send, Bot, ExternalLink, FileText
} from 'lucide-react';
import { generateInsight, ETCognifyInsight, Perspective } from '../services/geminiService';
import { useReadingTracker, savePerspectiveClick } from '../hooks/useReadingTracker';
import NexoraCTA from '../components/NexoraCTA';

// --- Background Decoration ---
const UnifiedSquares = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastX = 0;
    let lastY = 0;

    const updatePosition = () => {
      if (containerRef.current && contentRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Only update DOM if it actually moved to save paint cycles
        if (rect.left !== lastX || rect.top !== lastY) {
          contentRef.current.style.transform = `translate(${-rect.left}px, ${-rect.top}px)`;
          lastX = rect.left;
          lastY = rect.top;
        }
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20 mix-blend-screen">
      <div ref={contentRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        willChange: 'transform'
      }}>
        {/* Row 1: Right to Left */}
        <div className="absolute top-[35vh] left-[-5vw] flex rotate-[-12deg] origin-left">
          <div className="flex animate-slide-infinite w-max" style={{ animationDuration: '24s' }}>
            <div className="flex gap-16 pr-16">
              {[...Array(12)].map((_, i) => (
                <div key={`g1-${i}`} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.25] shadow-[0_0_40px_rgba(237,28,36,0.3)]" />
              ))}
            </div>
            <div className="flex gap-16 pr-16">
              {[...Array(12)].map((_, i) => (
                <div key={`g2-${i}`} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.25] shadow-[0_0_40px_rgba(237,28,36,0.3)]" />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="absolute top-[55vh] right-[-5vw] flex rotate-[-12deg] origin-right">
          <div className="flex gap-20 animate-slide-right-hero w-max" style={{ animationDuration: '14s' }}>
            {[...Array(3)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex gap-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.2] shadow-[0_0_30px_rgba(237,28,36,0.2)]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Types ---
interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface StoryData {
  id: string;
  tag: string;
  title: string;
  impact: string;
  time: string;
  link: string;
}




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

// --- RAG Chatbot Component ---
const RAGChatbot = ({ storyTitle, articleContent }: { storyTitle: string; articleContent: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: `I've analyzed the article: **"${storyTitle}"**. Ask me anything about this piece — key insights, market impact, what it means for your portfolio, or how it fits into the bigger picture.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const generateContextualResponse = (query: string): string => {
    const q = query.toLowerCase();
    // Pull key phrases from article content (RAG-like sim)
    const contextSnippet = articleContent ? articleContent.slice(0, 300) : '';

    if (q.includes('impact') || q.includes('effect') || q.includes('affect')) {
      return `Based on the article, the key impact areas include: ${contextSnippet ? '"' + contextSnippet.split('.')[0] + '."' : 'the market story requires real-time data to identify specific ripple effects. I can see this involves ' + storyTitle.split(' ').slice(0, 5).join(' ') + '...'}. This appears to be a ${q.includes('market') ? 'market-moving' : 'significant'} development worth tracking closely.`;
    }
    if (q.includes('invest') || q.includes('buy') || q.includes('sell') || q.includes('portfolio')) {
      return `From an investment standpoint, articles like "${storyTitle}" suggest watching for: sector rotation into related plays, derivative positioning around the core event, and any regulatory announcements that might follow. Always pair RAG context with your own financial advisor's view before acting.`;
    }
    if (q.includes('summar') || q.includes('explain') || q.includes('what')) {
      return contextSnippet
        ? `Here's what the article says: "${contextSnippet.trim()}" — This is the opening context. Want me to clarify any specific aspect or discuss the market angle?`
        : `The article covers: ${storyTitle}. This story touches on ${storyTitle.split(' ').slice(0, 4).join(', ')}. Want me to break down the bull case, bear case, or sector implications?`;
    }
    if (q.includes('risk')) {
      return `Key risks associated with this story: regulatory uncertainty, macro headwinds if global sentiment shifts, and liquidity concerns if retail participation drops. The headline suggests near-term volatility is possible — manage position sizing accordingly.`;
    }
    if (q.includes('sector') || q.includes('industry')) {
      return `This story is most directly tied to the ${storyTitle.includes('RBI') || storyTitle.includes('Bank') ? 'Banking & NBFC' : storyTitle.includes('Tech') || storyTitle.includes('AI') ? 'Technology' : 'Broader Market'} sector. Look at adjacent plays in supply chains and regulatory beneficiaries for additional alpha.`;
    }
    return `That's a sharp angle on this story. Based on the headline context — "${storyTitle.slice(0, 60)}..." — the intelligence I can surface suggests monitoring sector signals closely. Try asking me about: impact, investment angle, key risks, or sector implications.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply: ChatMessage = {
        role: 'bot',
        content: generateContextualResponse(userMsg.content),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  const suggestions = ['What is the key impact?', 'Investment angle?', 'Key risks?', 'Sector implications?'];

  return (
    <div className="bg-transparent border border-white/10 rounded-xl flex flex-col relative overflow-hidden h-full z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <UnifiedSquares />
      {/* Header */}
      <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="w-8 h-8 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black animate-pulse" />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Intel Analyst</h3>
          <p className="text-[8px] text-white/40 font-medium">RAG · Context-Aware</p>
        </div>
        <div className="ml-auto px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] font-black text-emerald-500 uppercase tracking-tighter">
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-6 h-6 shrink-0 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md flex items-center justify-center mt-1">
                  <Bot className="w-3 h-3 text-[#FFD700]" />
                </div>
              )}
              <div className={`max-w-[80%] group`}>
                <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed font-medium shadow-md ${msg.role === 'user'
                  ? 'bg-[#ED1C24] text-white rounded-br-sm'
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-md'
                  }`}>
                  {msg.content}
                </div>
                <div className={`text-[7px] text-white/20 font-mono mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 shrink-0 bg-white/5 border border-white/10 rounded-md flex items-center justify-center mt-1">
                  <User className="w-3 h-3 text-white/50" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
            <div className="w-6 h-6 shrink-0 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md flex items-center justify-center">
              <Bot className="w-3 h-3 text-[#FFD700]" />
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl rounded-bl-sm flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-[#FFD700]/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => { setInput(s); }}
            className="text-[8px] font-bold text-white/40 border border-white/10 px-2 py-1 rounded-full hover:border-[#FFD700]/40 hover:text-[#FFD700] transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex gap-2 bg-transparent border border-white/50 rounded-xl overflow-hidden focus-within:border-white transition-colors p-1.5 pl-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this story…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/50 px-2 py-2 outline-none font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="group px-6 py-2 bg-[#ED1C24] hover:bg-[#ED1C24] hover:text-black text-white rounded-lg font-white uppercase text-[10px] sm:text-xs tracking-[0.3em] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(237,28,36,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] border border-[#ED1C24]/50 hover:border-[#FFD700] disabled:opacity-100 disabled:shadow-none disabled:hover:bg-[#FFD700] disabled:hover:text-black disabled:hover:border-[#ED1C24]/50 shrink-0"
          >
            <Send className="w-4 h-4 text-white group-hover:text-black transition-colors" /> SEND
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Perspectives + Article Component (full center column) ---
const ArenaCenterColumn = ({
  headline, summary, perspectives, articleContent, articleLink
}: {
  headline: string;
  summary: string;
  perspectives: ETCognifyInsight['perspectives'];
  articleContent: string;
  articleLink?: string;
}) => {
  const [activePerspective, setActivePerspective] = useState<Perspective | null>('Neutral');
  const [showArticleModal, setShowArticleModal] = useState(false);

  const icons: Record<Perspective, React.ReactNode> = {
    'Neutral': <Landmark className="w-4 h-4" />,
    'Shareholder': <Briefcase className="w-4 h-4" />,
    'Gig Worker': <Users className="w-4 h-4" />,
    'FII': <TrendingUp className="w-4 h-4" />,
    'Farmer': <Landmark className="w-4 h-4" />,
    'Short Seller': <TrendingDown className="w-4 h-4" />
  };

  const perspectiveNames: Record<Perspective, string> = {
    'Neutral': 'Neutral',
    'Shareholder': 'Shareholder',
    'Gig Worker': 'Gig Worker',
    'FII': 'FII',
    'Farmer': 'Farmer',
    'Short Seller': 'Short Seller',
  };

  const articleParagraphs = articleContent
    ? articleContent.split('\n\n').filter(p => p.trim())
    : [];

  return (
    <>
      <AnimatePresence>
        {showArticleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          >
            <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md" onClick={() => setShowArticleModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#050505]/95 backdrop-blur-3xl border border-white/20 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_100px_rgba(237,28,36,0.15)] ring-1 ring-[#ED1C24]/10"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-[#ED1C24]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#ED1C24]">Full Intelligence Briefing</h3>
                </div>
                <div className="flex items-center gap-4">
                  {articleLink && (
                    <a href={articleLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ED1C24]/10 text-white font-black uppercase text-[9px] tracking-widest hover:bg-[#ED1C24] transition-colors rounded-lg border border-[#ED1C24]/30"
                    >
                      <ExternalLink className="w-3 h-3" /> Read on ET
                    </a>
                  )}
                  <button onClick={() => setShowArticleModal(false)} className="p-2 hover:bg-[#ED1C24]/20 rounded-full transition-colors text-white hover:text-[#ED1C24]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6 relative z-10 custom-scrollbar">
                <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.95] mb-8">
                  {headline}
                </h1>

                <div className="border-l-4 border-[#FFD700] pl-6 mb-10 bg-[#FFD700]/5 py-5 pr-5 rounded-r-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] mb-2">Core Summary</p>
                  <p className="text-lg text-white/90 font-medium leading-relaxed">{summary}</p>
                </div>

                <div className="space-y-6 pb-12">
                  {articleParagraphs.length > 0 ? articleParagraphs.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`leading-[1.9] font-medium ${i === 0
                        ? 'text-xl text-white first-letter:text-6xl first-letter:font-black first-letter:text-[#ED1C24] first-letter:float-left first-letter:leading-none first-letter:mr-3 first-letter:mt-1'
                        : 'text-lg text-white/70'
                        }`}
                    >
                      {para}
                    </motion.p>
                  )) : (
                    <div className="text-center py-20">
                      <Globe className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-xl text-white/40 font-medium">Full article unavailable.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`col-span-12 lg:col-span-6 row-span-6 flex flex-col gap-3 h-full overflow-hidden transition-all duration-500`}>
        {/* Header bar with bigger headline */}
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-6 shrink-0 relative overflow-hidden z-20">
          <UnifiedSquares />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#ED1C24] text-white text-[12px] font-black px-3 py-1 rounded-sm uppercase tracking-[0.25em] shrink-0">Flash Report</div>
                  <div className="h-[1px] w-12 bg-white/20 hidden sm:block" />
                </div>
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="bg-[#FFD700] hover:bg-[#ED1C24] hover:text-white text-black text-[10px] sm:text-xs font-black px-4 sm:px-6 py-2 sm:py-2.5 uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_20px_rgba(237,28,36,0.6)] rounded-sm"
                >
                  <FileText className="w-4 h-4 text-inherit" /> Read Full Article
                </button>
              </div>
              <h2 className="text-4xl xl:text-[3.25rem] font-black text-white leading-[0.9] tracking-tighter italic uppercase drop-shadow-md">
                {headline.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 0 ? 'text-white' : 'text-[#ED1C24]'}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
            </div>
          </div>
        </div>

        {/* Perspectives Container (Takes remaining height) */}
        <div className="flex-1 overflow-hidden bg-transparent border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl flex flex-col relative z-20">
          <UnifiedSquares />
          <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center gap-2 flex-wrap bg-white/[0.02] relative z-20">
            {(Object.keys(perspectives) as Perspective[]).map(p => (
              <button
                key={p}
                onClick={() => { setActivePerspective(p); savePerspectiveClick(p); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all ${activePerspective === p
                  ? 'bg-[#ED1C24] text-white border-[#ED1C24] shadow-[0_5px_15px_rgba(237,28,36,0.4)]'
                  : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {icons[p]}
                {perspectiveNames[p]}
              </button>
            ))}
            <button
              onClick={() => setActivePerspective(null)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all ${activePerspective === null
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/5 text-white/30 border-white/10 hover:text-white'
                }`}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 relative z-20">
            <AnimatePresence mode="wait">
              {activePerspective ? (
                <motion.div
                  key={activePerspective}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-xl flex items-center justify-center">
                      <div className="[&>svg]:w-6 [&>svg]:h-6">{icons[activePerspective]}</div>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Viewing as</p>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{activePerspective}</h3>
                    </div>
                    <div className="ml-auto px-3 py-1 bg-[#ED1C24]/10 border border-[#ED1C24]/20 rounded text-[9px] font-black text-[#ED1C24] uppercase tracking-widest">AI Lens</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:p-8 relative">
                    <div className="absolute top-0 left-8 -translate-y-1/2 px-3 py-1 bg-[#FFD700] text-black text-[9px] font-black uppercase tracking-[0.25em] rounded-sm shadow-lg">
                      {activePerspective} Perspective
                    </div>
                    <p className="text-lg md:text-xl text-white/90 italic font-medium leading-relaxed">
                      "{perspectives[activePerspective]}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors">
                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingDown className="w-3 h-3 text-[#ED1C24]" /> Key Risk</p>
                      <p className="text-sm text-white/70 font-medium leading-relaxed">Market volatility driven by macroeconomic headwinds may impact this stakeholder's position disproportionately.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors">
                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="w-3 h-3 text-emerald-400" /> Opportunity</p>
                      <p className="text-sm text-white/70 font-medium leading-relaxed">Structural tailwinds in this sector present a medium-term accumulation opportunity at corrected valuations.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4"
                >
                  <Globe className="w-12 h-12 text-white/10" />
                  <p className="text-sm text-white/30 text-center max-w-sm">Select a perspective above to see the story through different stakeholder lenses.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Export ─────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<ETCognifyInsight | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [topicIndex, setTopicIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const { startTracking, stopTracking } = useReadingTracker();

  const topics = [
    "Latest Indian Market Trends and Global Economic Impact",
    "The Rise of AI in Indian Fintech and Regulatory Challenges",
    "Green Energy Transition in India: Investment Opportunities and Risks",
    "Global Supply Chain Shifts: India's Role as a Manufacturing Hub",
    "The Impact of US Fed Rates on Emerging Market Equities",
    "Digital Rupee and the Future of Programmable Money in India"
  ];

  const fetchArticleContent = async (url: string) => {
    if (!url) return;
    try {
      const apiUrl = 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/article?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setArticleContent(data.content || '');
    } catch {
      setArticleContent('');
    }
  };

  const fetchInsight = async (index: number, story?: StoryData) => {
    setCurrentStory(story || null);
    try {
      setLoading(true);
      const data = await generateInsight(topics[index], story?.link);
      setInsight(data);
    } catch (error: any) {
      const headline = story?.title || "RBI Monetary Policy: Stability Amidst Global Volatility";
      const summary = story
        ? `[${story.tag}] ${story.impact} — This story was published at ${story.time} and is classified as ${story.impact} by our intelligence engine.`
        : "The Reserve Bank of India has maintained its benchmark interest rates, signaling a focus on inflation management while supporting domestic growth momentum.";
      const debateTopic = story?.title || "Is the RBI being overly cautious on inflation?";

      setInsight({
        headline,
        summary,
        perspectives: {
          Neutral: "This development represents a balanced signal in current market conditions. The macroeconomic implications are significant but the market has partially priced in this scenario.",
          Shareholder: "Banking stocks may see positive momentum as net interest margins remain protected, though NBFCs might face continued pressure on borrowing costs.",
          'Gig Worker': "Stable economic signals prevent immediate spikes in EMI for personal loans, providing some relief to urban workers and delivery partners.",
          FII: "Foreign investors view the consistency as a sign of macroeconomic stability, potentially increasing debt market inflows into Indian government bonds.",
          Farmer: "Rural demand remains sensitive to credit availability; the status quo ensures that agricultural loan rates don't rise before the crucial sowing season.",
          'Short Seller': "Risks remain in the mid-cap space where high valuations are predicated on future catalysts that are now being pushed further into the year."
        },
        butterflyEffect: {
          trigger: story?.tag || "Market Signal",
          directImpact: story ? `${story.impact} detected in ${story.tag} sector. Analysis suggests downstream effects across related industries.` : "10-year G-Sec yields stabilize at 7.1%",
          personalRipples: [
            { label: "Portfolio Impact", value: story ? `Monitor ${story.tag} sector exposure` : "No immediate change", cost: "Dependent on allocation" },
            { label: "Watch Level", value: story?.impact || "Medium Impact", cost: story?.time || "Now" }
          ]
        },
        debate: {
          topic: debateTopic,
          bull: "Prudence now prevents a hard landing later. Maintaining high real rates is essential to anchor inflation expectations permanently.",
          bear: "High borrowing costs are stifling private capex. The central bank risks falling behind the curve as other major economies begin their pivot."
        },
        newsDNA: {
          profile: "Adaptive Market Watcher",
          blindSpot: story
            ? `Focusing only on this headline may cause you to miss adjacent sector movements triggered by ${story.tag} dynamics.`
            : "Impact of global 'higher for longer' rates on domestic tech valuations."
        }
      });
    } finally {
      setLoading(false);
    }

    // Fetch article content separately
    if (story?.link) {
      fetchArticleContent(story.link);
    }
  };

  useEffect(() => {
    const story = location.state?.story as StoryData | undefined;
    fetchInsight(0, story);
    if (story) startTracking(story.id, story.title, story.tag);
  }, []);

  const handleNextNews = () => {
    const nextIndex = (topicIndex + 1) % topics.length;
    setTopicIndex(nextIndex);
    stopTracking();
    startTracking(`arena_${topics[nextIndex]}`, topics[nextIndex], 'Arena');
    fetchInsight(nextIndex, undefined);
    setArticleContent('');
  };

  return (
    <div className="h-screen bg-[#050505] text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col overflow-hidden relative">
      <Header onNext={handleNextNews} onDNA={() => navigate('/dna')} />
      <Seismograph />

      <main className="flex-1 p-3 grid grid-cols-12 grid-rows-6 gap-3 overflow-hidden relative z-10">
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
              {/* Left Column - RAG Chatbot */}
              <div className="col-span-12 lg:col-span-3 row-span-6">
                <RAGChatbot
                  storyTitle={currentStory?.title || insight.headline}
                  articleContent={articleContent}
                />
              </div>

              {/* Center Column - Article / Perspectives tabs */}
              <ArenaCenterColumn
                headline={insight.headline}
                summary={insight.summary}
                perspectives={insight.perspectives}
                articleContent={articleContent}
                articleLink={currentStory?.link}
              />

              {/* Right Column - CTA & Butterfly Effect */}
              <div className="col-span-12 lg:col-span-3 row-span-6 grid grid-rows-6 gap-4">
                {/* Nexora Debate System */}
                <div className="row-span-3 relative group rounded-xl overflow-hidden z-20">
                  <NexoraCTA topic={insight.headline} />
                </div>

                {/* Butterfly Effect */}
                <div className="row-span-3 bg-transparent border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-6 flex flex-col relative z-20 group overflow-hidden">
                  <UnifiedSquares />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <Zap className="text-[#FFD700] w-5 h-5" />
                      <h3 className="text-[10px] font-black text-white italic uppercase tracking-[0.3em]">Butterfly Effect</h3>
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                      <span className="text-[8px] font-black text-[#FFD700] uppercase tracking-widest">{insight.butterflyEffect.trigger}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar relative z-10">
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(237,28,36,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(237,28,36,0.5); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
