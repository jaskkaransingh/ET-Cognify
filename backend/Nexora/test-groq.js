import Groq from 'groq-sdk';
import 'dotenv/config'; // Make sure to have dotenv if running from node

const API_KEY = process.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: API_KEY });

async function testGroq() {
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an AI that ONLY outputs React JSX code. Do not output anything else.' },
      { role: 'user', content: 'Generate a standalone React component for a red square. CODE ONLY.' }
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 500,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const chunkText = chunk.choices[0]?.delta?.content || '';
    fullText += chunkText;
    process.stdout.write(chunkText);
  }
  
  console.log('\n\n--- FULL TEXT ---');
  console.log(fullText);
  
  console.log('\n\n--- STRIPPED TEXT ---');
  let stripped = fullText.replace(/^```[a-zA-Z]*\n/gm, '');
  stripped = stripped.replace(/```$/gm, '');
  console.log(stripped.trim());
}

testGroq().catch(console.error);
