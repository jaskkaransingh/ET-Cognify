const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'English': 'You must respond entirely in English.',
  'Hindi': 'You must respond entirely in Hindi. Write using the Devanagari script (हिंदी में लिखें). Do NOT use Roman/English letters at all. Every word must be in Devanagari script.',
  'Hinglish': 'You must respond in Hinglish — a natural mix of Hindi and English words. Write Hindi words in Devanagari script (e.g. "यह बहुत बड़ा problem है"). The mix should feel natural and conversational.',
  'Spanish': 'You must respond entirely in Spanish (español). Do NOT mix in English.',
};

const getLanguageInstruction = (language: string): string =>
  LANGUAGE_INSTRUCTIONS[language] || `You must respond entirely in ${language}.`;

const AGENT_PROFILES: Record<string, { name: string; systemInstruction: (lang: string) => string }> = {
  bull: {
    name: 'Bull Bhai',
    systemInstruction: (language: string) => `You are Bull Bhai, an extremely optimistic, enthusiastic, and bullish debate agent.
Your personality: Always sees the upside, the massive potential, and exponential growth. You think big and ignore minor risks.
Your tone: Energetic, hype, visionary.
Your goal: Strongly defend the given topic and counter any pessimistic arguments from your opponent (Bear Baba).
${getLanguageInstruction(language)}
STRICT RULES: Keep your response STRICTLY UNDER 120 WORDS. You MUST finish your thought naturally before running out of words. Do not let your sentence trail off. No markdown, asterisks, bullet points, or formatting. Pure spoken text only.`,
  },
  bear: {
    name: 'Bear Baba',
    systemInstruction: (language: string) => `You are Bear Baba, a deeply pessimistic, critical, and bearish debate agent.
Your personality: Always sees the downside, risks, the bubble, and impending crash. You are grounded in harsh reality.
Your tone: Skeptical, cautionary, dismissive.
Your goal: Strongly attack the given topic and counter any optimistic arguments from your opponent (Bull Bhai).
${getLanguageInstruction(language)}
STRICT RULES: Keep your response STRICTLY UNDER 120 WORDS. You MUST finish your thought naturally before running out of words. Do not let your sentence trail off. No markdown, asterisks, bullet points, or formatting. Pure spoken text only.`,
  },
};

export interface DebateHistoryItem {
  agent: string;
  text: string;
}

export async function generateDebateResponse(
  agentId: string,
  topic: string,
  language: string,
  history: DebateHistoryItem[]
): Promise<string> {
  const profile = AGENT_PROFILES[agentId];
  if (!profile) return `(Unknown agent: ${agentId})`;

  try {
    const response = await fetch(`${API_URL}/api/debate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        topic,
        language,
        history,
        systemInstruction: profile.systemInstruction(language),
        agentName: profile.name,
      }),
    });

    if (!response.ok) {
      return `(Error: Debate API returned ${response.status})`;
    }

    const data = await response.json();
    const text = typeof data?.text === 'string' ? data.text.trim() : '';

    return text;
  } catch (error) {
    console.error(`[${profile.name}] Error generating response:`, error);
    return `(Error: Could not generate response for ${profile.name})`;
  }
}
