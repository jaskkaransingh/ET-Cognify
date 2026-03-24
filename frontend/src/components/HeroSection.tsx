import { PersonalImpact } from "./PersonalImpact";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center mt-20 sm:mt-28 relative z-10 w-full max-w-5xl mx-auto px-6">
      
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8 animate-fade-in-up shadow-[0_0_15px_rgba(52,211,153,0.2)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,1)]" />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">Live Analysis</span>
      </div>

      <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-bold leading-[0.9] tracking-tighter text-white animate-fade-in-up delay-200 drop-shadow-lg">
        Rate hikes are done.
      </h1>
      
      <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-medium text-zinc-400 mt-6 tracking-tight animate-fade-in-up delay-400">
        You'll pay <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">₹18,400 more</span> in EMI
      </h2>

      <PersonalImpact />

      <button className="mt-20 group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-white/5 border border-white/10 rounded-full animate-fade-in-up delay-800 overflow-hidden hover:scale-105 hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all duration-300 z-30">
        <span className="absolute inset-0 w-full h-full rounded-full opacity-0 bg-gradient-to-b from-transparent via-transparent to-emerald-500/40 pointer-events-none group-hover:opacity-100 transition-opacity" />
        <span className="relative flex items-center gap-3">
          See full impact <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
      
    </div>
  );
}
