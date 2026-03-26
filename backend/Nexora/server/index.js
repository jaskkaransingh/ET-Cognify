import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { AccessToken } from 'livekit-server-sdk';

const app = express();
app.use(cors());
app.use(express.json());

// Sui client setup
const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });

// Contract IDs
const PACKAGE_ID = '0x302f582a43a8d22bc2a030ab76e3253f79618217a7a6576ad8a91b6075a85ae8';
const REGISTRY_ID = '0x44e13769132e791fca5067ddb0d13d3f50ea1488d4c5a89453227fe7b11b15b9';

// Load keypair from mnemonic (stored in .env file)
const MNEMONIC = process.env.SPONSOR_MNEMONIC;

if (!MNEMONIC) {
  console.error('ERROR: SPONSOR_MNEMONIC environment variable not set!');
  console.error('Please create a .env file with your mnemonic');
  process.exit(1);
}

// Derive keypair from mnemonic
let keypair = null;
try {
  keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
  console.log('Sponsor address:', keypair.getPublicKey().toSuiAddress());
} catch (error) {
  console.warn('⚠️ WARNING: SPONSOR_MNEMONIC is invalid or not a recovery phrase.');
  console.warn('On-chain voting features will be disabled. Other features like LiveKit will still work.');
}

// API endpoint to sponsor a vote
app.post('/api/vote', async (req, res) => {
  try {
    const { agentId } = req.body;

    // Validate agentId
    if (agentId === undefined || agentId < 0 || agentId > 3) {
      return res.status(400).json({ error: 'Invalid agentId. Must be 0-3.' });
    }

    console.log(`Sponsoring vote for agent ${agentId}...`);

    if (!keypair) {
      console.error('Vote failed: No valid sponsor keypair available.');
      return res.status(503).json({ 
        error: 'Voting service unavailable', 
        details: 'The server does not have a valid Sui wallet configured to pay for gas.' 
      });
    }

    // Create transaction
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::agent_votes::vote`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.u8(agentId)
      ]
    });

    // Sign and execute transaction (we pay the gas)
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
      }
    });

    console.log('Vote transaction successful:', result.digest);

    res.json({
      success: true,
      digest: result.digest,
      explorer: `https://devnet.suivision.xyz/txblock/${result.digest}`
    });

  } catch (error) {
    console.error('Vote failed:', error);
    res.status(500).json({
      error: 'Failed to submit vote',
      details: error.message
    });
  }
});

// LiveKit token generation endpoint
app.post('/api/livekit/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'roomName and participantName are required' });
    }

    const apiKey = process.env.VITE_LIVEKIT_API_KEY;
    const apiSecret = process.env.VITE_LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'LiveKit credentials not configured' });
    }

    // Create access token
    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '1h',
    });

    accessToken.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await accessToken.toJwt();

    console.log(`Generated LiveKit token for ${participantName} in room ${roomName}`);
    console.log(`Token type: ${typeof token}, Token preview: ${token.substring(0, 50)}...`);

    res.json({ token });
  } catch (error) {
    console.error('Failed to generate LiveKit token:', error);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});

// TTS Proxy — calls ElevenLabs server-side to avoid browser Free Tier blocks
app.post('/api/tts', async (req, res) => {
  const { text, voiceId, language } = req.body;
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'VITE_ELEVENLABS_API_KEY not configured' });
  }
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'text and voiceId are required' });
  }

  // Map language name to ElevenLabs language code
  const langMap = { English: 'en', Hindi: 'hi', Hinglish: 'hi', Spanish: 'es' };
  const langCode = langMap[language] || 'en';

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: langCode,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[TTS Proxy] ElevenLabs error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS Proxy] Sent ${audioBuffer.byteLength} bytes for voice=${voiceId} lang=${langCode}`);
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('[TTS Proxy] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sponsor server running on http://localhost:${PORT}`);
  if (keypair) {
    console.log(`Sponsor address: ${keypair.getPublicKey().toSuiAddress()}`);
  } else {
    console.log('Sponsor address: NOT CONFIGURED (Voting disabled)');
  }
});
