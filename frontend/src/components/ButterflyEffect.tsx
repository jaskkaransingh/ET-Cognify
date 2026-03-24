import { ArrowRight } from "lucide-react";

export function ButterflyEffect() {
  return (
    <section className="mt-16 mb-20 px-8 py-8 md:px-12 md:py-10 bg-zinc-900/20 rounded-2xl border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 blur-[80px] rounded-full group-hover:bg-amber-400/10 transition-colors duration-700" />
      <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-8 relative z-10">How this affects you</h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm sm:text-base text-zinc-300 font-medium relative z-10">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          <span>Dollar strengthens</span>
        </div>
        <ArrowRight size={16} className="text-zinc-600 hidden sm:block rotate-90 sm:rotate-0 my-2 sm:my-0" />
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          <span>IT stocks rise</span>
        </div>
        <ArrowRight size={16} className="text-zinc-600 hidden sm:block rotate-90 sm:rotate-0 my-2 sm:my-0" />
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-400/10 rounded-lg border border-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 font-semibold tracking-wide">+₹340 in your portfolio</span>
        </div>
      </div>
      <p className="text-xs text-zinc-500 italic mt-8 relative z-10">
        "This may impact your IT holdings considering your heavy allocation."
      </p>
    </section>
  );
}
