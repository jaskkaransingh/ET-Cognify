import { useRef, useEffect, useCallback } from 'react';

export interface ReadingSession {
  articleId: string;
  topic: string;
  title: string;
  timeSpent: number;
  scrollDepth: number;
  timestamp: string;
  skipped: boolean;
}

const SESSIONS_KEY = 'et_vantage_sessions';
const PERSPECTIVES_KEY = 'et_vantage_perspective_clicks';
const MAX_SESSIONS = 200;

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'RBI': ['rbi', 'repo rate', 'monetary policy', 'interest rate', 'reserve bank'],
  'IT Sector': ['infosys', 'tcs', 'wipro', 'hcl', 'it sector', 'software', 'tech'],
  'Global Macro': ['fed', 'federal reserve', 'us economy', 'dollar', 'global', 'china'],
  'Mutual Funds': ['mutual fund', 'sip', 'nav', 'amc', 'sebi', 'nfo'],
  'Commodities': ['gold', 'silver', 'crude', 'oil', 'commodity'],
  'Markets': ['nifty', 'sensex', 'bse', 'nse', 'market', 'index', 'rally'],
  'Banking': ['bank', 'nbfc', 'loan', 'emi', 'hdfc', 'sbi', 'icici'],
  'Supply Chain': ['supply chain', 'logistics', 'port', 'shipping'],
  'Budget': ['budget', 'fiscal', 'tax', 'gst', 'finance minister'],
};

function detectTopic(title: string, fallbackTag?: string): string {
  const lower = title.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return topic;
  }
  return fallbackTag ?? 'General';
}

function getSessions(): ReadingSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ReadingSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ReadingSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS)));
  } catch {
    // fail silently
  }
}

export function savePerspectiveClick(perspective: string): void {
  try {
    const raw = localStorage.getItem(PERSPECTIVES_KEY);
    const clicks: Record<string, number> = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    clicks[perspective] = (clicks[perspective] ?? 0) + 1;
    localStorage.setItem(PERSPECTIVES_KEY, JSON.stringify(clicks));
  } catch {
    // fail silently
  }
}

export function useReadingTracker(): {
  startTracking: (articleId: string, title: string, tag?: string) => void;
  stopTracking: () => void;
} {
  const startTimeRef = useRef<number | null>(null);
  const currentSessionRef = useRef<Omit<ReadingSession, 'timeSpent' | 'scrollDepth' | 'skipped'> | null>(null);
  const maxScrollRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (!currentSessionRef.current) return;
    const el = document.documentElement;
    const scrolled = el.scrollTop + el.clientHeight;
    const total = el.scrollHeight;
    if (total <= el.clientHeight) {
      maxScrollRef.current = 100;
      return;
    }
    const depth = Math.round((scrolled / total) * 100);
    if (depth > maxScrollRef.current) maxScrollRef.current = depth;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const stopTracking = useCallback(() => {
    if (!currentSessionRef.current || startTimeRef.current === null) return;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const scrollDepth = maxScrollRef.current;
    const session: ReadingSession = {
      ...currentSessionRef.current,
      timeSpent,
      scrollDepth,
      skipped: timeSpent < 8,
    };
    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);
    // Reset
    currentSessionRef.current = null;
    startTimeRef.current = null;
    maxScrollRef.current = 0;
  }, []);

  const startTracking = useCallback((articleId: string, title: string, tag?: string) => {
    currentSessionRef.current = {
      articleId,
      topic: detectTopic(title, tag),
      title,
      timestamp: new Date().toISOString(),
    };
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
  }, []);

  // Auto-stop when component unmounts
  useEffect(() => () => { stopTracking(); }, [stopTracking]);

  return { startTracking, stopTracking };
}
