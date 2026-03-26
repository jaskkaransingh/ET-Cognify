import { useState, useEffect, useRef } from 'react';
import { Play, Square, ThumbsUp, Activity } from 'lucide-react';
import { generateDebateResponse, DebateHistoryItem } from '../services/debateService';
import { VapiVoiceManager, VAPI_VOICE_IDS } from '../services/vapiService';

interface NexoraDebateProps {
  topic: string;
  initialLanguage?: string;
  autoStart?: boolean;
}

const MAX_TURNS = 6;

export default function NexoraDebate({ topic, initialLanguage = 'English', autoStart = false }: NexoraDebateProps) {
  const [language, setLanguage] = useState(initialLanguage);
  const [isDebating, setIsDebating] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, string[]>>({ bull: [], bear: [] });
  const [votes, setVotes] = useState({ bull: 0, bear: 0 });
  const [userVoted, setUserVoted] = useState<string | null>(null);

  const voiceManagerRef = useRef<any>(null);
  const debateInProgressRef = useRef(false);
  const bearScrollRef = useRef<HTMLDivElement>(null);
  const bullScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (voiceManagerRef.current) voiceManagerRef.current.dispose();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      handleStopDebate();
    };
  }, []);

  useEffect(() => {
    if (autoStart && topic) {
      handleStartDebate();
    }
  }, [autoStart, topic]);

  useEffect(() => {
    if (bearScrollRef.current) bearScrollRef.current.scrollTop = bearScrollRef.current.scrollHeight;
  }, [transcripts.bear]);

  useEffect(() => {
    if (bullScrollRef.current) bullScrollRef.current.scrollTop = bullScrollRef.current.scrollHeight;
  }, [transcripts.bull]);

  const handleVote = (agent: 'bull' | 'bear') => {
    if (userVoted) return;
    setVotes(prev => ({ ...prev, [agent]: prev[agent] + 1 }));
    setUserVoted(agent);
  };

  const typewriterReveal = (agent: string, words: string[], durationMs: number) => {
    return new Promise<void>((resolve) => {
      const msPerWord = Math.max(80, durationMs / words.length);
      let idx = 0;

      const tick = () => {
        if (idx >= words.length) { resolve(); return; }
        const revealed = words.slice(0, idx + 1).join(' ');
        setTranscripts(prev => {
          const msgs = [...prev[agent]];
          msgs[msgs.length - 1] = revealed;
          return { ...prev, [agent]: msgs };
        });
        idx++;
        setTimeout(tick, msPerWord);
      };
      tick();
    });
  };

  const speakWithVapi = (text: string, voiceId: string, lang: string) => {
    return new Promise<void>((resolve) => {
      if (!voiceManagerRef.current) { resolve(); return; }
      const el = voiceManagerRef.current;
      el.onSpeechEnd = () => resolve();
      el.speak(text, voiceId, lang).catch((err: any) => {
        console.error('[Debate] speak error:', err);
        resolve();
      });
    });
  };

  const runDebateLoop = async (currentTopic: string, currentLanguage: string) => {
    let currentHistory: DebateHistoryItem[] = [];
    const agents = ['bull', 'bear'];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      if (!debateInProgressRef.current) break;

      const agent = agents[turn % 2];
      const voiceId = VAPI_VOICE_IDS[agent];

      setActiveSpeaker(agent);
      setTranscripts(prev => ({ ...prev, [agent]: [...prev[agent], 'Thinking...'] }));

      const rawText = await generateDebateResponse(agent, currentTopic, currentLanguage, currentHistory);
      if (!debateInProgressRef.current) break;

      const rawWords = rawText.trim().split(/\s+/).filter(Boolean);
      let finalText = rawText;
      let finalWords = rawWords;

      if (rawWords.length > 130) {
        const sliceStr = rawWords.slice(0, 130).join(' ');
        const lastPunctuationIndex = Math.max(
          sliceStr.lastIndexOf('.'), sliceStr.lastIndexOf('!'), sliceStr.lastIndexOf('?'),
          sliceStr.lastIndexOf('|'), sliceStr.lastIndexOf('।')
        );
        finalText = lastPunctuationIndex > 0 ? sliceStr.substring(0, lastPunctuationIndex + 1) : sliceStr + '...';
        finalWords = finalText.split(/\s+/).filter(Boolean);
      }

      setTranscripts(prev => {
        const msgs = [...prev[agent]];
        msgs[msgs.length - 1] = '';
        return { ...prev, [agent]: msgs };
      });

      currentHistory.push({ agent, text: finalText });

      if (!debateInProgressRef.current) break;

      const cleanTextForAudio = finalText.replace(/\([^)]+\)/g, '').replace(/\[[^\]]+\]/g, '').replace(/\*/g, '').trim();
      const estimatedMs = Math.max(2000, (finalWords.length / 180) * 60000);

      await Promise.all([
        typewriterReveal(agent, finalWords, estimatedMs),
        speakWithVapi(cleanTextForAudio, voiceId, currentLanguage)
      ]);

      await new Promise(r => setTimeout(r, 600));
    }

    if (debateInProgressRef.current) {
      setIsDebating(false);
      setActiveSpeaker(null);
      debateInProgressRef.current = false;
    }
  };

  const handleStartDebate = async () => {
    if (!topic || isDebating) return;

    if (voiceManagerRef.current) {
      voiceManagerRef.current.dispose();
      voiceManagerRef.current = null;
    }
    voiceManagerRef.current = new VapiVoiceManager();
    try {
      await voiceManagerRef.current.initialize(language);
    } catch (err) {
      console.error('[Debate] Audio init failed:', err);
    }

    setIsDebating(true);
    debateInProgressRef.current = true;
    setTranscripts({ bull: [], bear: [] });

    runDebateLoop(topic, language);
  };

  const handleStopDebate = () => {
    debateInProgressRef.current = false;
    setIsDebating(false);
    setActiveSpeaker(null);
    if (voiceManagerRef.current) voiceManagerRef.current.stop();
  };

  const totalVotes = votes.bull + votes.bear;
  const bullPercentage = totalVotes > 0 ? Math.round((votes.bull / totalVotes) * 100) : 50;
  const bearPercentage = totalVotes > 0 ? 100 - bullPercentage : 50;

  return (
    <div className="flex flex-col h-full bg-black/60 rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20 overflow-hidden">
      
      {/* Top Banner */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-[#ED1C24] z-30" />
      <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FFD700]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700]">NEXORA ENGINE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_#ED1C24] ${isDebating ? 'bg-[#ED1C24] animate-pulse' : 'bg-white/20'}`} />
          <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${isDebating ? 'text-[#ED1C24] animate-pulse' : 'text-white/40'}`}>
            {isDebating ? 'Live Debate' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between gap-4 z-20 relative shrink-0">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isDebating}
          className="bg-black border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 outline-none focus:border-[#ED1C24] disabled:opacity-50"
        >
          <option value="English">ENG</option>
          <option value="Hindi">HIN</option>
          <option value="Hinglish">HGL</option>
          <option value="Spanish">ESP</option>
        </select>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1 truncate">Subject Pipeline</p>
          <p className="text-sm font-medium italic text-white/90 truncate">{topic || 'Awaiting signal...'}</p>
        </div>

        {!isDebating ? (
          <button
            onClick={handleStartDebate}
            disabled={!topic}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#ED1C24] hover:bg-[#FFD700] text-white hover:text-black font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-50 disabled:hover:bg-[#ED1C24] disabled:hover:text-white"
          >
            <Play className="w-3 h-3" /> Start
          </button>
        ) : (
          <button
            onClick={handleStopDebate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[#ED1C24] text-[#ED1C24] hover:bg-[#ED1C24] hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all"
          >
            <Square className="w-3 h-3" /> Stop
          </button>
        )}
      </div>

      {/* Arena Space */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10 overflow-hidden">
        
        {/* Bull Section */}
        <div className={`flex-1 flex flex-col transition-colors duration-500 overflow-hidden relative ${activeSpeaker === 'bull' ? 'bg-emerald-500/5' : 'bg-transparent'}`}>
          <div className="p-4 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Bull Bhai</span>
              <div className={`w-1.5 h-1.5 rounded-full ${activeSpeaker === 'bull' ? 'bg-emerald-500 animate-pulse' : 'bg-transparent'}`} />
            </div>
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center text-2xl transition-all ${activeSpeaker === 'bull' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110' : 'border-white/10 bg-white/5 grayscale'}`}>
              🐂
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4" ref={bullScrollRef}>
            {transcripts.bull.map((msg, i) => (
              <div key={i} className={`mb-3 text-sm font-medium leading-relaxed ${i === transcripts.bull.length - 1 ? 'text-white' : 'text-white/40'}`}>
                {msg}
              </div>
            ))}
            {transcripts.bull.length === 0 && <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Awaiting transmission...</p>}
          </div>
        </div>

        {/* VS Divider (Mobile hidden) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black border border-white/20 rounded-full items-center justify-center z-20 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] font-black italic text-[#FFD700]">VS</span>
        </div>

        {/* Bear Section */}
        <div className={`flex-1 flex flex-col transition-colors duration-500 overflow-hidden relative ${activeSpeaker === 'bear' ? 'bg-[#ED1C24]/5' : 'bg-transparent'}`}>
          <div className="p-4 flex flex-col shrink-0 items-end">
            <div className="flex items-center justify-between w-full mb-2 flex-row-reverse">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ED1C24]">Bear Baba</span>
              <div className={`w-1.5 h-1.5 rounded-full ${activeSpeaker === 'bear' ? 'bg-[#ED1C24] animate-pulse' : 'bg-transparent'}`} />
            </div>
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center text-2xl transition-all ${activeSpeaker === 'bear' ? 'border-[#ED1C24] bg-[#ED1C24]/20 shadow-[0_0_20px_rgba(237,28,36,0.3)] scale-110' : 'border-white/10 bg-white/5 grayscale'}`}>
              🐻
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 text-right" ref={bearScrollRef}>
             {transcripts.bear.map((msg, i) => (
              <div key={i} className={`mb-3 text-sm font-medium leading-relaxed ${i === transcripts.bear.length - 1 ? 'text-white' : 'text-white/40'}`}>
                {msg}
              </div>
            ))}
            {transcripts.bear.length === 0 && <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Awaiting transmission...</p>}
          </div>
        </div>

      </div>

      {/* Voting Section */}
      <div className="p-4 bg-black border-t border-white/10 shrink-0 z-20 relative flex flex-col gap-2">
        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">
          <span>Community Verdict</span>
          <span>{totalVotes} Votes</span>
        </div>
        
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bullPercentage}%` }} />
          <div className="h-full bg-[#ED1C24] transition-all duration-500" style={{ width: `${bearPercentage}%` }} />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => handleVote('bull')}
            disabled={!!userVoted}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[9px] font-black uppercase tracking-wider transition-all
              ${userVoted === 'bull' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30'}
            `}
          >
            <ThumbsUp className="w-3 h-3" /> Bull ({bullPercentage}%)
          </button>
          <button 
            onClick={() => handleVote('bear')}
            disabled={!!userVoted}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[9px] font-black uppercase tracking-wider transition-all
              ${userVoted === 'bear' ? 'bg-[#ED1C24]/20 border-[#ED1C24] text-[#ED1C24]' : 'bg-white/5 border-white/10 text-white/60 hover:border-[#ED1C24] hover:text-[#ED1C24] disabled:opacity-30'}
            `}
          >
            Bear ({bearPercentage}%) <ThumbsUp className="w-3 h-3 rotate-180" />
          </button>
        </div>
      </div>

    </div>
  );
}
