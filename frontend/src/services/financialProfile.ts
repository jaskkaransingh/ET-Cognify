// ── Types ────────────────────────────────────────────────────────────────────

export type ProductKey = 'homeLoan' | 'personalLoan' | 'stocks' | 'fixedDeposit';

export type ProductStatus = 'confirmed_yes' | 'confirmed_no' | 'likely' | 'unlikely' | 'unknown';

export interface FinancialProduct {
  status: ProductStatus;
  confirmed: boolean;
  value: boolean | null;
  guessScore: number;
  askedAt: string | null;
  answeredAt: string | null;
}

export interface FinancialProfile {
  homeLoan: FinancialProduct;
  personalLoan: FinancialProduct;
  stocks: FinancialProduct;
  fixedDeposit: FinancialProduct;
  lastUpdated: string;
}

interface StoredSession {
  title: string;
  topic: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PROFILE_KEY = 'et_vantage_financial_profile';
const SESSIONS_KEY = 'et_vantage_sessions';

const PRODUCT_KEYWORDS: Record<ProductKey, string[]> = {
  homeLoan: [
    'home loan', 'housing loan', 'emi', 'repo rate', 'rbi rate', 'rbi cuts',
    'rbi hikes', 'property', 'real estate', 'home buyer', 'interest rate cut',
    'interest rate hike', 'mortgage',
  ],
  personalLoan: [
    'personal loan', 'credit score', 'cibil', 'unsecured loan', 'instant loan',
    'consumer credit', 'loan app', 'digital lending', 'bnpl', 'buy now pay later',
  ],
  stocks: [
    'nifty', 'sensex', 'equity', 'stock market', 'demat', 'trading', 'portfolio',
    'shares', 'ipo', 'bull run', 'bear market', 'smallcap', 'midcap', 'largecap',
    'stock pick', 'multibagger',
  ],
  fixedDeposit: [
    'fixed deposit', 'fd rate', 'bank deposit', 'term deposit', 'senior citizen fd',
    'fd interest', 'recurring deposit', 'rd', 'post office', 'small savings',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyProduct(): FinancialProduct {
  return {
    status: 'unknown',
    confirmed: false,
    value: null,
    guessScore: 0,
    askedAt: null,
    answeredAt: null,
  };
}

function defaultProfile(): FinancialProfile {
  return {
    homeLoan: emptyProduct(),
    personalLoan: emptyProduct(),
    stocks: emptyProduct(),
    fixedDeposit: emptyProduct(),
    lastUpdated: new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getFinancialProfile(): FinancialProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as FinancialProfile) : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export function saveFinancialProfile(profile: FinancialProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // fail silently
  }
}

export function confirmProduct(key: ProductKey, hasIt: boolean): void {
  const profile = getFinancialProfile();
  profile[key] = {
    ...profile[key],
    confirmed: true,
    value: hasIt,
    status: hasIt ? 'confirmed_yes' : 'confirmed_no',
    answeredAt: new Date().toISOString(),
  };
  profile.lastUpdated = new Date().toISOString();
  saveFinancialProfile(profile);
}

export function markAsked(key: ProductKey): void {
  const profile = getFinancialProfile();
  profile[key] = { ...profile[key], askedAt: new Date().toISOString() };
  profile.lastUpdated = new Date().toISOString();
  saveFinancialProfile(profile);
}

export function updateGuesses(): void {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: StoredSession[] = raw ? (JSON.parse(raw) as StoredSession[]) : [];
    const total = Math.max(sessions.length, 1);

    const profile = getFinancialProfile();
    const keys: ProductKey[] = ['homeLoan', 'personalLoan', 'stocks', 'fixedDeposit'];

    for (const key of keys) {
      if (profile[key].confirmed) continue;

      const keywords = PRODUCT_KEYWORDS[key];
      const matches = sessions.filter(s => {
        const combined = (s.title + ' ' + s.topic).toLowerCase();
        return keywords.some(kw => combined.includes(kw));
      }).length;

      const rawScore = (matches / total) * 100;
      const guessScore = Math.min(Math.round(rawScore * 1.5), 100);

      let status: ProductStatus = 'unlikely';
      if (guessScore >= 60) status = 'likely';
      else if (guessScore >= 25) status = 'unknown';

      profile[key] = { ...profile[key], guessScore, status };
    }

    profile.lastUpdated = new Date().toISOString();
    saveFinancialProfile(profile);
  } catch {
    // fail silently
  }
}
