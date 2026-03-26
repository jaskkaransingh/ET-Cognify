import * as geminiService from './src/services/geminiService.js';
import 'dotenv/config';

async function run() {
  console.log('Testing geminiService...');
  
  try {
    const code = await geminiService.generateCodeWithAgent(
      'speedrunner', 
      'make a purple box', 
      [], 
      (chunk, fullText) => {}, 
      (fullText) => console.log('Complete text:', fullText)
    );
    console.log('Final code length:', code?.length);
    console.log('Final code:', code);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
