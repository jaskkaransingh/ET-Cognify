import { useState, useEffect } from 'react';
import type { ProductKey } from '../services/financialProfile';
import { getProductQuestion } from '../hooks/useFinancialConfirm';

interface FinancialConfirmCardProps {
  productKey: ProductKey;
  onAnswer: (key: ProductKey, answer: boolean) => void;
  onSkip: () => void;
}

export default function FinancialConfirmCard({ productKey, onAnswer, onSkip }: FinancialConfirmCardProps) {
  const [visible, setVisible] = useState(false);

  // Trigger mount animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const question = getProductQuestion(productKey);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 transition-all duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
          <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FFD700]">
            Financial DNA
          </span>
          <button
            onClick={onSkip}
            className="ml-auto text-white/20 hover:text-white/50 transition-colors text-[10px] font-black uppercase tracking-widest"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          <p className="text-sm text-white/80 font-medium leading-relaxed">
            {question}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onAnswer(productKey, true)}
              className="px-4 py-2 bg-[#ED1C24] text-white font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-[#c41018] transition-all shadow-[0_0_15px_rgba(237,28,36,0.3)] active:scale-95"
            >
              Yes, I do
            </button>
            <button
              onClick={() => onAnswer(productKey, false)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              No
            </button>
            <button
              onClick={onSkip}
              className="text-white/20 font-black uppercase text-[8px] tracking-widest hover:text-white/40 transition-colors ml-auto"
            >
              Ask later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
