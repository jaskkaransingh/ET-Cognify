import { Compass, BarChart2, Layers, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-10 gap-10 bg-[#050505]/40 backdrop-blur-2xl border-r border-white/5 z-50 transition-all duration-300 group">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_20px_rgba(52,211,153,0.5)] flex items-center justify-center text-[#050505] font-black text-sm cursor-pointer hover:shadow-[0_0_30px_rgba(52,211,153,0.8)] transition-shadow">
        <span className="-mt-0.5">V</span>
      </div>
      <nav className="flex flex-col gap-6 w-full items-center mt-6">
        <button className="p-3.5 bg-white/10 text-emerald-400 rounded-2xl shadow-[0_0_15px_rgba(52,211,153,0.15)] border border-emerald-500/30 transition-all"><Compass size={22} strokeWidth={2.5} /></button>
        <button className="p-3.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><BarChart2 size={22} strokeWidth={2} /></button>
        <button className="p-3.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><Layers size={22} strokeWidth={2} /></button>
      </nav>
      <button className="p-3.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/10 rounded-2xl transition-all mt-auto mb-2"><Settings size={22} strokeWidth={2} /></button>
    </aside>
  );
}
