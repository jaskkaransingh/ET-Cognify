export function BiasIndicator({ score, label }: { score: number, label: string }) {
  return (
    <div className="inline-flex items-center gap-3 bg-zinc-900/40 rounded-full pr-4 pl-1 py-1 border border-white/5">
      <div className="relative w-6 h-6 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
          <path className="text-green-400" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>
      <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}
