export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/10 blur-[150px] mix-blend-screen animate-pulse-glow" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[800px] bg-blue-500/5 blur-[120px] mix-blend-screen" />
      
      {/* Abstract metallic arcs */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[110%] h-[110%] border border-white/[0.03] rounded-[100%] rotate-12 scale-[1.5]" />
      <div className="absolute top-[15%] left-1/2 -translate-x-[45%] w-[110%] h-[110%] border border-white/[0.02] rounded-[100%] rotate-6 scale-[1.3]" />
      
      {/* Radial fade at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
    </div>
  );
}
