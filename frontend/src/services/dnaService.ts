import type { ReadingSession } from '../hooks/useReadingTracker';
import { getFinancialProfile } from './financialProfile';

const SESSIONS_KEY = 'et_vantage_sessions';

export interface TopicScore {
  topic: string;
  score: number;
}

export interface EmotionalTrigger {
  topic: string;
  behavior: 'Slows down' | 'Re-reads' | 'Screenshots' | 'Skips';
  intensity: number;
}

export interface DNAProfile {
  investorType: string;
  investorDescription: string;
  topTopics: TopicScore[];
  blindSpots: string[];
  totalSessions: number;
  avgTimeSpent: number;
  biasScore: number;
  biasLabel: string;
  traits: TopicScore[];
  emotionalTriggers: EmotionalTrigger[];
  lastUpdated: string;
}

const IMPORTANT_TOPICS = ['Global Macro', 'RBI', 'Markets', 'Mutual Funds', 'Banking'];

function getSessions(): ReadingSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ReadingSession[]) : [];
  } catch {
    return [];
  }
}

interface TopicStats {
  totalTime: number;
  totalScroll: number;
  count: number;
  skippedCount: number;
}

function groupByTopic(sessions: ReadingSession[]): Record<string, TopicStats> {
  const map: Record<string, TopicStats> = {};
  for (const s of sessions) {
    if (!map[s.topic]) map[s.topic] = { totalTime: 0, totalScroll: 0, count: 0, skippedCount: 0 };
    map[s.topic].totalTime += s.timeSpent;
    map[s.topic].totalScroll += s.scrollDepth;
    map[s.topic].count += 1;
    if (s.skipped) map[s.topic].skippedCount += 1;
  }
  return map;
}

function normalize(scores: Record<string, number>): TopicScore[] {
  const values = Object.values(scores);
  const max = Math.max(...values, 1);
  return Object.entries(scores).map(([topic, raw]) => ({
    topic,
    score: Math.round((raw / max) * 100),
  }));
}

function calcBiasScore(sessions: ReadingSession[]): { score: number; label: string } {
  let score = 50;
  const topicCounts: Record<string, number> = {};
  for (const s of sessions) topicCounts[s.topic] = (topicCounts[s.topic] ?? 0) + 1;
  const uniqueTopics = Object.keys(topicCounts).length;

  if (uniqueTopics <= 2) score += 20;
  if (uniqueTopics >= 5) score -= 10;

  const last10 = sessions.slice(-10).map(s => s.topic);
  if (last10.length === 10 && new Set(last10).size === 1) score += 15;

  score = Math.max(0, Math.min(100, score));
  let label = 'Balanced Reader';
  if (score >= 75) label = 'Tunnel Vision Detected';
  else if (score >= 60) label = 'Recency Bias Detected';
  else if (score <= 30) label = 'Well-Rounded Thinker';

  return { score, label };
}

function inferInvestorType(traits: TopicScore[]): { type: string; description: string } {
  const get = (t: string) => traits.find(x => x.topic === t)?.score ?? 0;
  const rbi = get('RBI');
  const it = get('IT Sector');
  const mf = get('Mutual Funds');
  const macro = get('Global Macro');
  const markets = get('Markets');

  if (rbi > 65 && markets < 40) return { type: 'Cautious Accumulator', description: 'You closely track policy signals before making any moves.' };
  if (it > 60 && (get('Tech') > 40 || get('Global Macro') > 40)) return { type: 'Growth Chaser', description: 'You chase high-growth opportunities and thrive on momentum plays.' };
  if (mf > 60) return { type: 'Steady Compounder', description: 'You believe in the power of long-term disciplined investing through SIPs.' };
  if (macro > 60) return { type: 'Global Thinker', description: 'You connect global macro events to domestic market opportunities.' };

  const spread = Math.max(...traits.map(t => t.score)) - Math.min(...traits.map(t => t.score));
  if (traits.length >= 4 && spread < 30) return { type: 'Curious Explorer', description: 'You consume a wide range of financial news without a defined focus yet.' };

  return { type: 'Emerging Investor', description: 'You are building your investing vocabulary and finding your style.' };
}

function calcEmotionalTriggers(
  stats: Record<string, TopicStats>,
  globalAvgTime: number,
  scoredTraits: TopicScore[]
): EmotionalTrigger[] {
  const triggers: EmotionalTrigger[] = [];
  for (const trait of scoredTraits.filter(t => t.score > 40)) {
    const s = stats[trait.topic];
    if (!s) continue;
    const avgScroll = s.totalScroll / s.count;
    const avgTime = s.totalTime / s.count;
    const skipRate = s.skippedCount / s.count;
    let behavior: EmotionalTrigger['behavior'] = 'Slows down';
    if (skipRate > 0.6) behavior = 'Skips';
    else if (avgTime > globalAvgTime * 2) behavior = 'Re-reads';
    else if (avgScroll > 75 && avgTime > globalAvgTime) behavior = 'Slows down';
    else if (avgScroll > 75) behavior = 'Screenshots';
    triggers.push({ topic: trait.topic, behavior, intensity: trait.score });
  }
  return triggers;
}

export function analyzeDNA(): DNAProfile {
  const sessions = getSessions();
  const totalSessions = sessions.length;

  if (totalSessions === 0) {
    return {
      investorType: 'Emerging Investor',
      investorDescription: 'Start reading to build your News DNA profile.',
      topTopics: [],
      blindSpots: IMPORTANT_TOPICS,
      totalSessions: 0,
      avgTimeSpent: 0,
      biasScore: 50,
      biasLabel: 'No data yet',
      traits: [],
      emotionalTriggers: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  const globalAvgTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0) / totalSessions;
  const stats = groupByTopic(sessions);

  const rawScores: Record<string, number> = {};
  for (const [topic, s] of Object.entries(stats)) {
    const avgTime = s.totalTime / s.count;
    const avgScroll = s.totalScroll / s.count;
    const nonSkipRate = 1 - s.skippedCount / s.count;
    const raw =
      (avgTime / Math.max(globalAvgTime, 1)) * 50 +
      (avgScroll / 100) * 30 +
      nonSkipRate * 20;
    rawScores[topic] = raw;
  }

  const traits = normalize(rawScores).sort((a, b) => b.score - a.score);
  const topTopics = traits.slice(0, 3);
  const blindSpots = IMPORTANT_TOPICS.filter(t => (rawScores[t] ?? 0) < 25);

  const { type, description } = inferInvestorType(traits);
  const { score: biasScore, label: biasLabel } = calcBiasScore(sessions);
  const emotionalTriggers = calcEmotionalTriggers(stats, globalAvgTime, traits);

  return {
    investorType: type,
    investorDescription: description,
    topTopics,
    blindSpots,
    totalSessions,
    avgTimeSpent: Math.round(globalAvgTime),
    biasScore,
    biasLabel,
    traits,
    emotionalTriggers,
    lastUpdated: new Date().toISOString(),
  };
}

export async function generateDNAInsight(profile: DNAProfile): Promise<string> {
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return 'Add VITE_ANTHROPIC_API_KEY to your .env.local to unlock personalized insights.';

  try {
    const fin = getFinancialProfile();
    const confirmedProducts: string[] = [];
    if (fin.homeLoan.value === true) confirmedProducts.push('home loan');
    if (fin.personalLoan.value === true) confirmedProducts.push('personal loan');
    if (fin.stocks.value === true) confirmedProducts.push('stocks/demat account');
    if (fin.fixedDeposit.value === true) confirmedProducts.push('fixed deposits');
    const likelyProducts: string[] = [];
    if (fin.homeLoan.status === 'likely' && !fin.homeLoan.confirmed) likelyProducts.push('home loan');
    if (fin.personalLoan.status === 'likely' && !fin.personalLoan.confirmed) likelyProducts.push('personal loan');
    if (fin.stocks.status === 'likely' && !fin.stocks.confirmed) likelyProducts.push('stocks');
    if (fin.fixedDeposit.status === 'likely' && !fin.fixedDeposit.confirmed) likelyProducts.push('fixed deposits');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `You are ET Vantage, a personalized financial news AI for Indian investors.

A user has the following reading DNA profile:
- Investor type: ${profile.investorType}
- Top topics they engage with: ${profile.topTopics.map(t => t.topic).join(', ')}
- Topics they are ignoring (blind spots): ${profile.blindSpots.join(', ')}
- Total reading sessions: ${profile.totalSessions}
- Average time spent per article: ${profile.avgTimeSpent} seconds
- Bias score: ${profile.biasScore}/100 (${profile.biasLabel})
- Confirmed financial products: ${confirmedProducts.length > 0 ? confirmedProducts.join(', ') : 'none confirmed yet'}
- Likely financial products (from reading behavior): ${likelyProducts.length > 0 ? likelyProducts.join(', ') : 'none detected'}

Write a 3-sentence personalized insight for this investor.
Sentence 1: Describe their reading personality warmly.
Sentence 2: Point out their most important blind spot and why it is hurting them financially RIGHT NOW (be specific, mention real Indian market context).
Sentence 3: Give one actionable suggestion.

If the user has a home loan: mention how current RBI/interest rate news specifically affects their EMI.
If the user has stocks: mention how the current market news affects their equity holdings.
If the user has fixed deposits: mention how rate decisions affect their FD returns.
If the user has a personal loan: mention credit cost implications.
Be specific with rupee amounts where possible (e.g. "your EMI may change by ₹2,000/month").

Write in second person ("You are..."). Keep it under 80 words. Be direct, not generic.`,
          },
        ],
      }),
    });
    const data = await response.json() as { content?: { text: string }[] };
    return data.content?.[0]?.text ?? 'Unable to generate insight right now.';
  } catch {
    return 'Unable to generate insight right now. Please try again later.';
  }
}
