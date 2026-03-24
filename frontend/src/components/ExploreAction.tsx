"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

export function ExploreAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 mb-16 max-w-2xl border-t border-zinc-900/60 pt-8 group animate-fade-in-up delay-700">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-[15px] font-medium text-amber-500/80 hover:text-amber-400 transition-colors w-full text-left"
      >
        <span className="tracking-wide">See why this is happening</span>
        <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "group-hover:translate-x-1"}`} />
      </button>

      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 text-zinc-400 font-light leading-relaxed">
            <p className="text-[1.15rem]">
              The shifting timeline for Federal Reserve cuts fundamentally strengthens the dollar index, pulling capital flows away from emerging markets and precious metals.
            </p>
            <div className="flex flex-col gap-4 pl-4 border-l border-zinc-900 mt-2 text-sm text-zinc-500">
              <div className="flex items-baseline gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                <p>Dollar Index surpasses 106.0 targets, extending currency pressure on INR.</p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                <p>Technology exporters (like Infosys) benefit from favorable currency realization.</p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0 animate-pulse" />
                <p className="text-amber-500/80">Domestic liquidity tightens, keeping your floating home loan rates elevated near peak bounds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
