import { AlertTriangle } from "lucide-react";

export function HookStrip() {
  return (
    <div className="w-full bg-red-950/40 border-b border-red-900/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-20 py-2.5 flex items-center gap-3">
        <AlertTriangle size={14} className="text-amber-500" />
        <p className="text-[13px] font-medium text-amber-500/90 tracking-wide">
          <span className="font-bold text-amber-400">Important:</span> This may increase your EMI by ₹18,400
        </p>
      </div>
    </div>
  );
}
