import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const LANGUAGE_INSTRUCTIONS = {
  'English': 'You must respond entirely in English.',
  'Hindi': 'You must respond entirely in Hindi. Write using the Devanagari script (हिंदी में लिखें). Do NOT use Roman/English letters at all. Every word must be in Devanagari script.',
  'Hinglish': 'You must respond in Hinglish — a natural mix of Hindi and English words. Write Hindi words in Devanagari script (e.g. "यह बहुत बड़ा problem है"). The mix should feel natural and conversational.',
  'Spanish': 'You must respond entirely in Spanish (español). Do NOT mix in English.',
};

const getLanguageInstruction = (language) =>
  LANGUAGE_INSTRUCTIONS[language] || `You must respond entirely in ${language}.`;

const AGENT_PROFILES = {
  bull: {
    name: 'Bull Bhai',
    systemInstruction: (language) => `You are Bull Bhai, an extremely optimistic, enthusiastic, and bullish debate agent.
Your personality: Always sees the upside, the massive potential, and exponential growth. You think big and ignore minor risks.
Your tone: Energetic, hype, visionary.
Your goal: Strongly defend the given topic and counter any pessimistic arguments from your opponent (Bear Baba).
${getLanguageInstruction(language)}
STRICT RULES: Keep your response STRICTLY UNDER 120 WORDS. You MUST finish your thought naturally before running out of words. Do not let your sentence trail off. No markdown, asterisks, bullet points, or formatting. Pure spoken text only.`,
  },
  bear: {
    name: 'Bear Baba',
    systemInstruction: (language) => `You are Bear Baba, a deeply pessimistic, critical, and bearish debate agent.
Your personality: Always sees the downside, risks, the bubble, and impending crash. You are grounded in harsh reality.
Your tone: Skeptical, cautionary, dismissive.
Your goal: Strongly attack the given topic and counter any optimistic arguments from your opponent (Bull Bhai).
${getLanguageInstruction(language)}
STRICT RULES: Keep your response STRICTLY UNDER 120 WORDS. You MUST finish your thought naturally before running out of words. Do not let your sentence trail off. No markdown, asterisks, bullet points, or formatting. Pure spoken text only.`,
  }
};

/**
 * Generate a response for an agent in the debate
 * @param {string} agentId - 'bull' or 'bear'
 * @param {string} topic - The debate topic
 * @param {string} language - The language to speak in
 * @param {Array<{agent: string, text: string}>} history - Previous messages in the debate
 * @returns {Promise<string>}
 */
export async function generateDebateResponse(agentId, topic, language, history) {
  const profile = AGENT_PROFILES[agentId];
  
  try {
    console.log(`[${profile.name}] Generating response...`);
    
    // Build conversation history
    let promptText = `Debate Topic: "${topic}"\n\n`;
    if (history.length > 0) {
      promptText += `Previous turns:\n`;
      history.forEach(msg => {
        const speakerName = AGENT_PROFILES[msg.agent]?.name || msg.agent;
        promptText += `${speakerName}: ${msg.text}\n`;
      });
      promptText += `\nNow, generate your response as ${profile.name}.`;
    } else {
      promptText += `You are starting the debate. Make your opening statement as ${profile.name}.`;
    }

    promptText += `\n\nCRITICAL INSTRUCTION: ${getLanguageInstruction(language)}`;

    const requestConfig = {
      model: 'gemini-2.5-flash-lite',
      contents: [{
        role: 'user',
        parts: [{ text: promptText }]
      }],
      systemInstruction: profile.systemInstruction(language),
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 250, // Keep responses short
      }
    };

    const response = await ai.models.generateContent(requestConfig);
    const text = response.text?.trim() || '';
    
    console.log(`[${profile.name}] Generated:`, text);
    return text;
  } catch (error) {
    console.error(`[${profile.name}] Error generating response:`, error);
    return `(Error: Could not generate response for ${profile.name})`;
  }
}
