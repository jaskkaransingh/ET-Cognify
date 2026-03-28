import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Activity } from 'lucide-react';

interface NexoraCTAProps {
  topic: string;
}

export default function NexoraCTA({ topic }: NexoraCTAProps) {
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/nexora', { state: { topic, language } });
  };

  return (
    <div className="flex flex-col h-full bg-black/60 rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20 overflow-hidden">
      {/* Top Banner */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-[#ED1C24] z-30" />
      {/* Header */}
      <div className="px-3 py-2 bg-black border-b border-white/10 flex items-center justify-between z-20 relative shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#FFD700]" />
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#FFD700]">NEXORA ENGINE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="text-[6px] font-black uppercase tracking-[0.3em] text-white/40">Standby</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-2 z-20 overflow-hidden">
        {/* Subject */}
        <div className="min-w-0 flex-1 min-h-0 overflow-hidden">
          <p className="text-[7px] text-white/40 font-bold uppercase tracking-widest mb-1">Subject Pipeline</p>
          <p className="text-sm font-black italic text-white/90 leading-snug line-clamp-4">{topic || 'Awaiting signal...'}</p>
        </div>

        {/* Controls */}
        <div className="space-y-2 shrink-0">
          <div>
            <p className="text-[7px] text-white/40 font-bold uppercase tracking-widest mb-1">Select Language</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-black/50 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 outline-none focus:border-[#ED1C24] rounded-md"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Spanish">Español</option>
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={!topic}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#ED1C24] hover:bg-[#FFD700] text-white hover:text-black font-black uppercase text-[9px] tracking-[0.25em] transition-all disabled:opacity-50 disabled:hover:bg-[#ED1C24] disabled:hover:text-white rounded-lg group"
          >
            <Play className="w-3 h-3 shrink-0 group-hover:scale-110 transition-transform" />
            Initiate Debate
          </button>
        </div>
      </div>
    </div>
  );
}
