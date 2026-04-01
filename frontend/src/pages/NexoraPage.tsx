import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NexoraDebate from '../components/NexoraDebate';

export default function NexoraPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { topic?: string, language?: string } || {};

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col p-4 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0 pointer-events-none" />

      <header className="flex items-center justify-between mb-4 z-10 shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#ED1C24] border border-white/10 hover:border-[#ED1C24] text-white/40 hover:text-white uppercase text-[10px] sm:text-xs font-black tracking-widest transition-all rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Arena
        </button>
        <div className="flex flex-col items-end">
           <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white italic leading-none">
            ET<span className="text-[#ED1C24]">COGNIFY</span>
           </h1>
           <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#FFD700]">Debate Arena Phase 2</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 z-10">
         <NexoraDebate topic={state.topic || 'Impact of Artificial Intelligence on Global Markets'} initialLanguage={state.language} autoStart={true} />
      </div>
    </div>
  );
}
