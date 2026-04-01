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
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-[#ED1C24] z-30" />
      <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FFD700]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700]">NEXORA ENGINE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40">Standby</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center gap-6 z-20">
        <div>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-2">Subject Pipeline</p>
          <p className="text-lg font-black italic text-white/90 leading-tight">{topic || 'Awaiting signal...'}</p>
        </div>

        <div className="space-y-4">
          <div>
             <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-2">Select Language</p>
             <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-black/50 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-3 outline-none focus:border-[#ED1C24] rounded-lg"
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
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#ED1C24] hover:bg-[#FFD700] text-white hover:text-black font-black uppercase text-xs tracking-[0.3em] transition-all disabled:opacity-50 disabled:hover:bg-[#ED1C24] disabled:hover:text-white rounded-lg group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" /> Initiate Debate
          </button>
        </div>
      </div>
    </div>
  );
}
