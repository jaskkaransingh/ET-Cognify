"use client";

import { useEffect, useState } from "react";

function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return <span>{Math.floor(count).toLocaleString()}</span>;
}

export function PersonalImpact() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-16 z-20 animate-fade-in-up delay-600">
      {/* Positive Float */}
      <div className="glass-card px-6 py-4 rounded-2xl flex flex-col items-center gap-1 animate-float shadow-[0_8px_32px_rgba(52,211,153,0.08)] hover:bg-white/[0.05] transition-colors cursor-default">
        <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-sans tracking-tight drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
          +₹<CountUp end={340} />
        </span>
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Infosys</span>
      </div>

      {/* Negative Float */}
      <div className="glass-card px-6 py-4 rounded-2xl flex flex-col items-center gap-1 animate-float-delayed shadow-[0_8px_32px_rgba(248,113,113,0.08)] hover:bg-white/[0.05] transition-colors cursor-default">
        <span className="text-xl sm:text-2xl font-bold text-red-500 font-sans tracking-tight drop-shadow-[0_0_12px_rgba(248,113,113,0.3)]">
          −₹<CountUp end={4200} />
        </span>
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Gold</span>
      </div>

      {/* Hero Float (EMI) */}
      <div className="glass-card px-8 py-5 rounded-3xl flex flex-col items-center gap-1.5 animate-float shadow-[0_10px_40px_rgba(52,211,153,0.15)] border-emerald-500/30 hover:border-emerald-500/50 hover:bg-white/[0.05] transition-all cursor-default">
        <span className="text-3xl sm:text-4xl font-bold text-white font-sans tracking-tight">
          ₹<CountUp end={18400} />
        </span>
        <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">EMI Increase</span>
      </div>
    </div>
  );
}
