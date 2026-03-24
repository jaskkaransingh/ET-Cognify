export function DashboardPreview() {
  return (
    <div className="mt-20 sm:mt-28 w-full max-w-6xl mx-auto px-6 relative z-0 animate-fade-in-up delay-800 opacity-60 hover:opacity-100 transition-opacity duration-700 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-10 pointer-events-none h-full w-full" />
      
      <div className="w-full h-[500px] rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-3xl overflow-hidden flex flex-col relative shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/5">
        {/* Fake Dashboard Header */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-white/5">
          <div className="flex gap-4">
            <div className="h-8 w-28 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
          </div>
          <div className="h-8 w-36 bg-emerald-500/20 rounded-lg" />
        </div>
        
        {/* Fake Chart Area */}
        <div className="flex-1 flex items-end px-12 gap-3 pb-8 pt-12 opacity-40">
          {[40, 50, 45, 60, 55, 75, 70, 85, 80, 100, 90, 75, 85, 95, 110, 105].map((height, i) => (
            <div 
              key={i} 
              className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-500/5 rounded-t-md shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
