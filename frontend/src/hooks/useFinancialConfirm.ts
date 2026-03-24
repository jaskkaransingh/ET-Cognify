import { getFinancialProfile, markAsked, type ProductKey } from '../services/financialProfile';

// ── Session count helper (reads directly from localStorage) ──────────────────
function getTotalSessions(): number {
  try {
    const raw = localStorage.getItem('et_vantage_sessions');
    if (!raw) return 0;
    const arr = JSON.parse(raw) as unknown[];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

// ── Decide which product to ask about next ────────────────────────────────────

export function getNextProductToAsk(): ProductKey | null {
  const totalSessions = getTotalSessions();
  if (totalSessions < 3) return null;

  const profile = getFinancialProfile();
  const keys: ProductKey[] = ['homeLoan', 'personalLoan', 'stocks', 'fixedDeposit'];

  // Build list of eligible products: likely + not confirmed + not recently asked
  type Candidate = { key: ProductKey; score: number };
  const candidates: Candidate[] = [];

  for (const key of keys) {
    const p = profile[key];
    if (p.confirmed) continue;
    if (p.status !== 'likely') continue;

    // Skip if asked recently (within last 5 sessions worth of time — ~10 minutes)
    if (p.askedAt) {
      const askedMs = new Date(p.askedAt).getTime();
      const fiveSessionsMs = 10 * 60 * 1000; // 10 minute cooldown
      if (Date.now() - askedMs < fiveSessionsMs) continue;
    }

    candidates.push({ key, score: p.guessScore });
  }

  if (candidates.length === 0) return null;

  // Return highest-scored candidate
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0].key;
  markAsked(winner);
  return winner;
}

// ── Human-readable helpers ────────────────────────────────────────────────────

export function getProductLabel(key: ProductKey): string {
  const labels: Record<ProductKey, string> = {
    homeLoan: 'a home loan',
    personalLoan: 'a personal loan',
    stocks: 'stocks or a demat account',
    fixedDeposit: 'a fixed deposit',
  };
  return labels[key];
}

export function getProductQuestion(key: ProductKey): string {
  const questions: Record<ProductKey, string> = {
    homeLoan: 'You seem interested in home loan & EMI news. Do you have a home loan?',
    personalLoan: 'You often read about credit & personal loans. Do you have a personal loan?',
    stocks: 'You read a lot about markets & equities. Do you have a demat account?',
    fixedDeposit: 'You follow FD & deposit rates closely. Do you have a fixed deposit?',
  };
  return questions[key];
}
