import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

/**
 * ElevenLabs Voice Manager with TTS and STT for Composer
 */
export class ElevenLabsVoiceManager {
  constructor() {
    this.client = new ElevenLabsClient({ apiKey: API_KEY });
    this.audioContext = null;
    this.analyser = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentSource = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onUserTranscript = null; // Callback for user's speech transcription

    // Voice ID - using a fun energetic voice for the composer
    this.voiceId = 'gnPxliFHTp6OK6tcoA6i'; // Custom voice from library

    // Recording state
    this.mediaRecorder = null;
    this.mediaStream = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.isMicMuted = true;
  }

  /**
   * Initialize audio context for playback and visualization
   */
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.isMuted ? 0.0 : 1.0;

      // Connect: analyser -> gainNode -> speakers
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      console.log('[ElevenLabs] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[ElevenLabs] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Speak text using ElevenLabs TTS with streaming
   * @param {string} text - The text to speak
   * @param {string|null} customVoiceId - Optional overriding voice ID for different agents
   */
  async speak(text, customVoiceId = null) {
    if (!this.audioContext) {
      await this.initialize();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      console.log('[ElevenLabs] Speaking:', text);

      if (this.onSpeechStart) {
        this.onSpeechStart();
      }

      this.isPlaying = true;

      const targetVoiceId = customVoiceId || this.voiceId;

      // Use the convert endpoint to get full audio
      console.log(`[ElevenLabs] Requesting TTS conversion with voice ${targetVoiceId}...`);
      const response = await this.client.textToSpeech.convert(targetVoiceId, {
        text: text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      });

      console.log('[ElevenLabs] TTS response received:', response);

      // Convert response to array buffer
      let audioData;
      if (response == null) {
        throw new Error('Response is null or undefined');
      } else if (response instanceof ReadableStream) {
        const reader = response.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        audioData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
        }
      } else if (Symbol.asyncIterator in Object(response)) {
        const chunks = [];
        for await (const chunk of response) {
          chunks.push(chunk);
        }
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        audioData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
        }
      } else if (response instanceof ArrayBuffer) {
        audioData = new Uint8Array(response);
      } else if (response instanceof Uint8Array) {
        audioData = response;
      } else {
        throw new Error('Unexpected response type: ' + typeof response);
      }

      console.log('[ElevenLabs] Audio data size:', audioData.length);

      // Decode MP3 audio
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
      console.log('[ElevenLabs] Audio decoded, duration:', audioBuffer.duration);

      // Create buffer source and connect to analyser
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.analyser);

      // Handle playback end
      this.currentSource.onended = () => {
        this.isPlaying = false;
        if (this.onSpeechEnd) {
          this.onSpeechEnd();
        }
        console.log('[ElevenLabs] Finished speaking');
      };

      // Play audio
      this.currentSource.start();
      console.log('[ElevenLabs] Audio playback started');

    } catch (error) {
      console.error('[ElevenLabs] Failed to speak via API, falling back to browser TTS:', error);
      
      // FALLBACK TO BROWSER TTS
      if ('speechSynthesis' in window) {
        // Ensure any existing speech is cancelled
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Attempt to select distinct voices for Bull and Bear based on customVoiceId
        const voices = window.speechSynthesis.getVoices();
        
        if (customVoiceId === 'pNInz6obpgDQGcFmaJgB' && voices.length > 0) {
          // Bear Baba: Deeper, slower
          utterance.voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || voices[0];
          utterance.pitch = 0.5;
          utterance.rate = 0.9;
        } else if (voices.length > 0) {
          // Bull Bhai: Energetic, faster
          utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English')) || voices[Math.min(1, voices.length - 1)];
          utterance.pitch = 1.2;
          utterance.rate = 1.1;
        }

        utterance.onend = () => {
          this.isPlaying = false;
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
          console.log('[Browser TTS] Finished speaking');
        };

        utterance.onerror = (e) => {
          console.error('[Browser TTS] Error:', e);
          this.isPlaying = false;
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
        };

        window.speechSynthesis.speak(utterance);
        console.log('[Browser TTS] Audio playback started fallback');
      } else {
        // No TTS available
        this.isPlaying = false;
        if (this.onSpeechEnd) {
          this.onSpeechEnd();
        }
      }
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentSource && this.isPlaying) {
      try {
        this.currentSource.stop();
        this.currentSource = null;
        this.isPlaying = false;
        console.log('[ElevenLabs] Stopped speaking');
      } catch (error) {
        console.error('[ElevenLabs] Failed to stop:', error);
      }
    }
    this.isPlaying = false;
  }

  /**
   * Set muted state
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0.0 : 1.0;
      console.log(`[ElevenLabs] Voice ${muted ? 'muted' : 'unmuted'}`);
    }
  }

  /**
   * Get analyser for audio visualization
   */
  getAnalyser() {
    return this.analyser;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.isPlaying;
  }

  /**
   * Start recording microphone for STT using MediaRecorder
   */
  async startRecording() {
    if (this.isRecording) return;

    try {
      console.log('[ElevenLabs] Requesting microphone access...');

      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Create MediaRecorder to capture audio
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('[ElevenLabs] Audio chunk received:', event.data.size);
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log('[ElevenLabs] Recording stopped, transcribing...');
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.transcribeAudio(audioBlob);
        this.audioChunks = [];
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.isMicMuted = false;
      console.log('[ElevenLabs] Recording started');
    } catch (error) {
      console.error('[ElevenLabs] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;

    try {
      this.mediaRecorder.stop();
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      this.isMicMuted = true;
      console.log('[ElevenLabs] Recording stopped');
    } catch (error) {
      console.error('[ElevenLabs] Failed to stop recording:', error);
    }
  }

  /**
   * Transcribe audio using ElevenLabs STT API (direct fetch)
   */
  async transcribeAudio(audioBlob) {
    try {
      console.log('[ElevenLabs] Transcribing audio blob of size:', audioBlob.size);

      // Use direct fetch since SDK is buggy
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model_id', 'scribe_v1');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`STT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[ElevenLabs] Transcription response:', result);

      // Extract text from response
      const transcript = result.text;

      if (transcript && this.onUserTranscript) {
        console.log('[ElevenLabs] Transcript:', transcript);
        this.onUserTranscript(transcript);
      } else {
        console.log('[ElevenLabs] No transcript received');
      }
    } catch (error) {
      console.error('[ElevenLabs] Failed to transcribe:', error);
      console.error('[ElevenLabs] Error details:', error.message);
    }
  }

  /**
   * Toggle microphone recording
   */
  async setMicMuted(muted) {
    if (muted && this.isRecording) {
      this.stopRecording();
    } else if (!muted && !this.isRecording) {
      await this.startRecording();
    }
    console.log(`[ElevenLabs] Microphone ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stop();
    if (this.isRecording) {
      this.stopRecording();
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
