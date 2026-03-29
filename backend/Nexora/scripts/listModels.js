import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('Fetching models...');
    const models = await ai.models.list();
    console.log('Available Models:');
    models.forEach(m => console.log(`- ${m.name} (${m.version})` || `- ${JSON.stringify(m)}`));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
