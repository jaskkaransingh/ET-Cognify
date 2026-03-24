interface SignalItemProps {
  impact: "high" | "medium" | "low";
  headline: string;
  context: string;
}

export function SignalItem({ impact, headline, context }: SignalItemProps) {
  const isHigh = impact === "high";
  
  return (
    <article className="flex flex-col gap-3 relative max-w-4xl py-8 border-t border-zinc-900/50 group cursor-pointer hover:bg-white/[0.012] -mx-8 px-8 transition-colors duration-500 rounded-3xl">
      <h2 className={`font-serif leading-[1.1] text-zinc-200 transition-colors duration-400 group-hover:text-zinc-50 ${
        isHigh ? "text-[2.5rem] sm:text-[3.25rem] max-w-3xl" : "text-[1.5rem] sm:text-[2rem] font-light text-zinc-400 max-w-2xl group-hover:text-zinc-300"
      }`}>
        {headline}
      </h2>
      <p className={`text-[15px] font-medium tracking-wide opacity-60 transition-opacity duration-300 group-hover:opacity-100 ${isHigh ? 'text-amber-500/80' : 'text-zinc-500'}`}>
        {context}
      </p>
    </article>
  );
}
