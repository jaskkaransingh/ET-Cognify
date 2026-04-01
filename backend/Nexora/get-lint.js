import { execSync } from 'child_process';
import fs from 'fs';

try {
  const output = execSync('npx eslint src/services/geminiService.js src/services/commentatorGeminiService.js src/services/geminiAudioService.js --format json', { encoding: 'utf-8' });
} catch (e) {
  const data = JSON.parse(e.stdout);
  const errors = data.filter(d => d.errorCount > 0).map(d => ({
    file: d.filePath,
    messages: d.messages.map(m => `Line ${m.line}: ${m.message}`)
  }));
  fs.writeFileSync('lint-errors-parsed.json', JSON.stringify(errors, null, 2), 'utf-8');
}
