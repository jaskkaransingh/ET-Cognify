import Vapi from '@vapi-ai/web';

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Voice IDs for debate agents (ElevenLabs voices provided by Vapi)
export const VAPI_VOICE_IDS: Record<string, string> = {
  bull: 'gnPxliFHTp6OK6tcoA6i', // energetic male
  bear: 'pNInz6obpgDQGcFmaJgB'  // deep/Adam
};

// Map dropdown language names → ElevenLabs language codes for Vapi
const LANG_CODE: Record<string, string> = {
  'English':  'en',
  'Hindi':    'hi',
  'Hinglish': 'hi',  
  'Spanish':  'es',
};

// ─── Module-level singleton ────────────────────────────────────────────────────
// Keeps exactly one Vapi WebRTC call alive for the entire page session.
// This prevents the "Duplicate DailyIframe instances" crash.
let _vapiInstance: any = null;
let _isCallActive  = false;
let _initPromise: Promise<void> | null = null;
let _currentLang: string | null = null;

export async function destroyVapiCall(): Promise<void> {
  if (_vapiInstance) {
    try { await _vapiInstance.stop(); } catch (_) {}
    _vapiInstance  = null;
    _isCallActive  = false;
    _initPromise   = null;
    _currentLang   = null;
  }
}

async function ensureVapiCall(language: string = 'English'): Promise<void> {
  const langCode = LANG_CODE[language] || 'en';

  // If language changed, we must restart the Vapi call to load the correct ElevenLabs phonology
  if (_isCallActive && _currentLang !== langCode) {
    console.log('[VAPI] Language changed, reinitialising call...');
    await destroyVapiCall();
  }

  if (_isCallActive && _vapiInstance) return;
  if (_initPromise) { await _initPromise; return; }

  _initPromise = (async () => {
    try {
      console.log('[VAPI] Creating WebRTC call for language:', langCode);

      // Initialize Vapi SDK
      _vapiInstance = new Vapi(PUBLIC_KEY);

      _vapiInstance.on('call-start', () => { 
        _isCallActive = true; 
        console.log('[VAPI] Call started'); 
        
        // --- Critical Fix ---
        // Force Mute the microphone here! This stops the background noise from 
        // triggering GPT-4o-mini and hallucinating extra chatter!
        _vapiInstance.setMuted(true);
      });
      _vapiInstance.on('call-end',   () => { _isCallActive = false; console.log('[VAPI] Call ended'); });
      _vapiInstance.on('error',      (e: any) => { console.error('[VAPI] Error:', e); _isCallActive = false; });

      // Dummy assistant that acts entirely as a TTS engine
      // By using an empty firstMessage, it won't spontaneously greeting us.
      const assistant = {
        name: 'Debate TTS',
        firstMessage: '', 
        voice: {
          provider: '11labs',
          voiceId: VAPI_VOICE_IDS.bull, // Default, will override per-turn via parameter
          model: 'eleven_multilingual_v2'
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [{ 
            role: 'system', 
            content: 'CRITICAL INSTRUCTION: You are a pure, silent Text-to-Speech proxy. NEVER generate conversational responses. When a user provides text, you must return EXACTLY the same text, verbatim, word-for-word, 100% exactly the same. Do not add intro or outro phrases. Do not summarize.' 
          }],
          temperature: 0.0 // Ensure deterministic output
        },
        silenceTimeoutSeconds: 300,
        endCallFunctionEnabled: false
      };

      await _vapiInstance.start(assistant);
      await new Promise(r => setTimeout(r, 1200)); // allow WebRTC negotiation to settle out
      
      // Ensure it is muted post-start as a failsafe
      if (typeof _vapiInstance.setMuted === 'function') {
        _vapiInstance.setMuted(true);
      }

      _currentLang = langCode;
      console.log('[VAPI] Ready for TTS. Language:', langCode);
    } catch (err) {
      console.error('[VAPI] Init failed:', err);
      _vapiInstance  = null;
      _isCallActive  = false;
      _currentLang   = null;
    } finally {
      _initPromise = null;
    }
  })();

  await _initPromise;
}

// ─── Public class used by Debate.tsx ──────────────────────────────────────────
export class VapiVoiceManager {
  isPlaying: boolean;
  onSpeechStart: (() => void) | null;
  onSpeechEnd: (() => void) | null;
  private _cleanup: (() => void) | null;

  constructor() {
    this.isPlaying     = false;
    this.onSpeechStart = null;
    this.onSpeechEnd   = null;
    this._cleanup      = null;
  }

  async initialize(language: string = 'English'): Promise<boolean> {
    await ensureVapiCall(language);
    return true;
  }

  async speak(text: string, voiceId: string, language: string = 'English'): Promise<void> {
    await ensureVapiCall(language);

    if (!_vapiInstance || !_isCallActive) {
      console.warn('[VAPI] Not connected. Cannot play audio.');
      if (this.onSpeechEnd) this.onSpeechEnd();
      return;
    }

    // Force voice override via message update if needed to prevent homogenous voices,
    // though prompt control via 'add-message' works best.

    if (this.onSpeechStart) this.onSpeechStart();
    this.isPlaying = true;

    // A flag to check if we already resolved to prevent double firing
    let resolved = false;

    const endCheck = () => {
      if (resolved) return;
      console.log('[VAPI] Voice playback sequence completed.');
      resolved = true;
      this.isPlaying = false;
      if (this.onSpeechEnd) {
         this.onSpeechEnd();
         this.onSpeechEnd = null; // Clear to prevent zombie calls
      }
      try {
        _vapiInstance?.removeListener('speech-end', endCheck);
        _vapiInstance?.removeListener('message', messageListener);
      } catch (e) {}
    };

    const messageListener = (msg: any) => {
      // Often assistant sends a speech update when it stops generating/playing TTS
      if (msg.type === 'assistant-speech-update' && msg.status === 'stopped') {
        console.log('[VAPI] Assistant speech explicitly stopped.');
        setTimeout(endCheck, 200); // slight buffer
      }
      if (msg.type === 'transcript' || msg.type === 'conversation-update') {
        console.log('[VAPI] Transcript log:', msg);
      }
    };
    
    // Listen to all possible stop events to prevent hanging, but also prevent premature skips
    _vapiInstance.on('speech-end', endCheck);
    _vapiInstance.on('message', messageListener);
    
    this._cleanup = endCheck;

    try {
      console.log(`[VAPI] Emitting TTS for: "${text.substring(0, 40)}..."`);
      
      _vapiInstance.send({
        type: "add-message",
        message: {
          role: "user",
          content: `REPEAT THE FOLLOWING TEXT VERBATIM. NO INTRODUCTIONS. NO ADDITIONS. START AND END WITH THE EXACT TEXT: "${text}"`
        }
      });
    } catch (err) {
      console.error('[VAPI] TTS attempt failed:', err);
      if (this._cleanup) this._cleanup();
      this.isPlaying = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
    }
  }

  stop(): void {
    if (this._cleanup) { this._cleanup(); this._cleanup = null; }
    this.isPlaying = false;
  }

  dispose(): void {
    this.stop();
  }
}
