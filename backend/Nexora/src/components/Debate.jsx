import { useState, useEffect, useRef } from 'react';
import './Debate.css';
import DebateAgentCard from './DebateAgentCard';
import { generateDebateResponse } from '../services/debateService';
import { VapiVoiceManager, VAPI_VOICE_IDS } from '../services/vapiService';

const MAX_TURNS = 6;

function Debate() {
  const [inputTopic, setInputTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [isDebating, setIsDebating] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [transcripts, setTranscripts] = useState({ bull: [], bear: [] });
  const [history, setHistory] = useState([]);

  const voiceManagerRef = useRef(null);
  const debateInProgressRef = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (voiceManagerRef.current) voiceManagerRef.current.dispose();
    };
  }, []);

  // ─── Typewriter effect (runs independently of audio) ──────────────────────
  const typewriterReveal = (agent, words, durationMs) => {
    return new Promise((resolve) => {
      const msPerWord = Math.max(80, durationMs / words.length);
      let idx = 0;

      const tick = () => {
        if (idx >= words.length) { resolve(); return; }
        const revealed = words.slice(0, idx + 1).join(' ');
        setTranscripts(prev => {
          const msgs = [...prev[agent]];
          msgs[msgs.length - 1] = revealed;
          return { ...prev, [agent]: msgs };
        });
        idx++;
        setTimeout(tick, msPerWord);
      };
      tick();
    });
  };

  // ─── Speak text with Vapi (async, non-blocking for transcript) ─────────────
  const speakWithVapi = (text, voiceId, lang) => {
    return new Promise((resolve) => {
      if (!voiceManagerRef.current) { resolve(); return; }
      const el = voiceManagerRef.current;
      el.onSpeechEnd = () => resolve();
      el.speak(text, voiceId, lang).catch(err => {
        console.error('[Debate] speak error:', err);
        resolve();
      });
    });
  };

  // ─── Main debate loop ──────────────────────────────────────────────────────
  const runDebateLoop = async (currentTopic, currentLanguage) => {
    let currentHistory = [];
    const agents = ['bull', 'bear'];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      if (!debateInProgressRef.current) break;

      const agent = agents[turn % 2];
      const voiceId = VAPI_VOICE_IDS[agent];

      setActiveSpeaker(agent);

      // 1. Show "Thinking..." placeholder
      setTranscripts(prev => ({
        ...prev,
        [agent]: [...prev[agent], 'Thinking...']
      }));

      // 2. Generate text from Gemini
      const rawText = await generateDebateResponse(agent, currentTopic, currentLanguage, currentHistory);
      if (!debateInProgressRef.current) break;

      console.log(`[Debate] ${agent} said (${currentLanguage}):`, rawText.slice(0, 80));

      // 3. Prepare words and smartly truncate at the last sentence boundary under 130 words
      const rawWords = rawText.trim().split(/\s+/).filter(Boolean);
      let finalText = rawText;
      let finalWords = rawWords;

      if (rawWords.length > 130) {
        // Find the last sentence-ending punctuation before the 130th word
        const sliceStr = rawWords.slice(0, 130).join(' ');
        // Regex looks for period, exclamation, question mark, or Hindi Purna Viram (।)
        const lastPunctuationIndex = Math.max(
          sliceStr.lastIndexOf('.'),
          sliceStr.lastIndexOf('!'),
          sliceStr.lastIndexOf('?'),
          sliceStr.lastIndexOf('|'),
          sliceStr.lastIndexOf('।')
        );

        if (lastPunctuationIndex > 0) {
          finalText = sliceStr.substring(0, lastPunctuationIndex + 1);
        } else {
          // Fallback if no punctuation found (rare)
          finalText = sliceStr + '...';
        }
        finalWords = finalText.split(/\s+/).filter(Boolean);
      }

      // 4. Clear "Thinking..." slot
      setTranscripts(prev => {
        const msgs = [...prev[agent]];
        msgs[msgs.length - 1] = '';
        return { ...prev, [agent]: msgs };
      });

      currentHistory.push({ agent, text: finalText });
      setHistory([...currentHistory]);

      if (!debateInProgressRef.current) break;

      // Clean text for TTS (remove stage directions in parentheses/brackets and markdown)
      const cleanTextForAudio = finalText
        .replace(/\([^)]+\)/g, '')
        .replace(/\[[^\]]+\]/g, '')
        .replace(/\*/g, '')
        .trim();

      // Estimate ~180 wpm for timing (much faster sync to keep pace with ElevenLabs)
      const estimatedMs = Math.max(2000, (finalWords.length / 180) * 60000);
      await Promise.all([
        typewriterReveal(agent, finalWords, estimatedMs),
        speakWithVapi(cleanTextForAudio, voiceId, currentLanguage)
      ]);

      await new Promise(r => setTimeout(r, 600));
    }

    if (debateInProgressRef.current) {
      setIsDebating(false);
      setActiveSpeaker(null);
      debateInProgressRef.current = false;
    }
  };

  // ─── Start / Stop Handlers ─────────────────────────────────────────────────
  const handleStartDebate = async () => {
    if (!inputTopic.trim() || isDebating) return;

    // Init or re-init voice manager for selected language
    if (voiceManagerRef.current) {
      voiceManagerRef.current.dispose();
      voiceManagerRef.current = null;
    }
    voiceManagerRef.current = new VapiVoiceManager();
    try {
      await voiceManagerRef.current.initialize(language);
    } catch (err) {
      console.error('[Debate] Audio init failed:', err);
    }

    setIsDebating(true);
    debateInProgressRef.current = true;
    setTranscripts({ bull: [], bear: [] });
    setHistory([]);

    runDebateLoop(inputTopic, language);
  };

  const handleStopDebate = () => {
    debateInProgressRef.current = false;
    setIsDebating(false);
    setActiveSpeaker(null);
    if (voiceManagerRef.current) voiceManagerRef.current.stop();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  const glowClass = activeSpeaker === 'bull' ? 'glow-bull' : activeSpeaker === 'bear' ? 'glow-bear' : '';

  return (
    <div className="debate-container">
      <div className={"debate-background-glow " + glowClass}></div>

      <header className="debate-header">
        <div className="debate-title">
          <h1>Nexora Debate Arena</h1>
        </div>

        <div className="debate-controls">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isDebating}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Hinglish">Hinglish</option>
            <option value="Spanish">Spanish</option>
          </select>

          <div className="topic-input-container">
            <input
              type="text"
              className="topic-input"
              placeholder="Enter a topic (e.g., AI taking jobs)"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              disabled={isDebating}
              onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
            />
            {!isDebating ? (
              <button className="start-btn" onClick={handleStartDebate} disabled={!inputTopic.trim()}>
                Start Debate
              </button>
            ) : (
              <button className="start-btn" style={{ background: '#ff6464', color: '#fff' }} onClick={handleStopDebate}>
                Stop
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="debate-arena">
        <DebateAgentCard
          name="Bear Baba"
          role="The Pessimist"
          themeColor="#ff6464"
          themeRgb="255, 100, 100"
          isActive={activeSpeaker === 'bear'}
          transcripts={transcripts.bear}
        />

        <div className="debate-vs">VS</div>

        <DebateAgentCard
          name="Bull Bhai"
          role="The Optimist"
          themeColor="#64ffda"
          themeRgb="100, 255, 218"
          isActive={activeSpeaker === 'bull'}
          transcripts={transcripts.bull}
        />
      </div>
    </div>
  );
}

export default Debate;
