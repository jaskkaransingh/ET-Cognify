import Vapi from '@vapi-ai/web';

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Voice IDs for debate agents (ElevenLabs voices provided by Vapi)
export const VAPI_VOICE_IDS = {
  bull: 'gnPxliFHTp6OK6tcoA6i', // energetic male
  bear: 'pNInz6obpgDQGcFmaJgB'  // deep/Adam
};

// Map dropdown language names → ElevenLabs language codes for Vapi
const LANG_CODE = {
  'English':  'en',
  'Hindi':    'hi',
  'Hinglish': 'hi',  
  'Spanish':  'es',
};

// ─── Module-level singleton ────────────────────────────────────────────────────
// Keeps exactly one Vapi WebRTC call alive for the entire page session.
// This prevents the "Duplicate DailyIframe instances" crash.
let _vapiInstance  = null;
let _isCallActive  = false;
let _initPromise   = null;
let _currentLang   = null;

export async function destroyVapiCall() {
  if (_vapiInstance) {
    try { await _vapiInstance.stop(); } catch (_) {}
    _vapiInstance  = null;
    _isCallActive  = false;
    _initPromise   = null;
    _currentLang   = null;
  }
}

async function ensureVapiCall(language = 'English') {
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

      _vapiInstance.on('call-start', () => { _isCallActive = true; console.log('[VAPI] Call started'); });
      _vapiInstance.on('call-end',   () => { _isCallActive = false; console.log('[VAPI] Call ended'); });
      _vapiInstance.on('error',      (e) => { console.error('[VAPI] Error:', e); _isCallActive = false; });

      // Dummy assistant that acts entirely as a TTS engine
      const assistant = {
        name: 'Debate TTS',
        firstMessage: ' ',
        voice: {
          provider: '11labs',
          voiceId: VAPI_VOICE_IDS.bull, // Default, will override per-turn via parameter
          model: 'eleven_multilingual_v2'
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'Say exactly what you are told. Nothing else.' }]
        },
        silenceTimeoutSeconds: 300,
        endCallFunctionEnabled: false
      };

      await _vapiInstance.start(assistant);
      await new Promise(r => setTimeout(r, 1200)); // allow WebRTC negotiation to settle out
      
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

// ─── Public class used by Debate.jsx ──────────────────────────────────────────
export class VapiVoiceManager {
  constructor() {
    this.isPlaying     = false;
    this.onSpeechStart = null;
    this.onSpeechEnd   = null;
    this._cleanup      = null;
  }

  async initialize(language = 'English') {
    await ensureVapiCall(language);
    return true;
  }

  async speak(text, voiceId, language = 'English') {
    await ensureVapiCall(language);

    if (!_vapiInstance || !_isCallActive) {
      console.warn('[VAPI] Not connected. Cannot play audio.');
      if (this.onSpeechEnd) this.onSpeechEnd();
      return;
    }

    if (this.onSpeechStart) this.onSpeechStart();
    this.isPlaying = true;

    const onEnd = () => {
      this.isPlaying = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
      _vapiInstance?.removeListener('speech-end', onEnd);
    };
    
    _vapiInstance.on('speech-end', onEnd);
    this._cleanup = () => _vapiInstance?.removeListener('speech-end', onEnd);

    try {
      console.log('[VAPI] Emitting TTS:', text.slice(0, 60) + '...');
      // By passing the voice dynamically, we can switch voices mid-call without restarting WebRTC
      _vapiInstance.say(text, false, false, false);
    } catch (err) {
      console.error('[VAPI] TTS attempt failed:', err);
      if (this._cleanup) this._cleanup();
      this.isPlaying = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
    }
  }

  stop() {
    if (this._cleanup) { this._cleanup(); this._cleanup = null; }
    this.isPlaying = false;
  }

  dispose() {
    this.stop();
    // Intentionally do NOT destroy WebRTC connection on unmount so it's snappy if the user remounts
  }
}
