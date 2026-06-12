const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\thota\\.gemini\\antigravity-ide\\brain\\6b6cecf9-1a9c-4d5b-aa72-234429aa8e43\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(logPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let prompts = [];

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.source === 'USER_EXPLICIT') {
      const match = data.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
      const promptText = match ? match[1].trim() : data.content.trim();
      prompts.push({
        step: data.step_index,
        timestamp: data.created_at,
        prompt: promptText
      });
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
});

rl.on('close', () => {
  let md = '# Summary of User Prompts\n\n';
  prompts.forEach((p, idx) => {
    md += `## Prompt ${idx + 1} (${p.timestamp})\n\n\`\`\`\n${p.prompt}\n\`\`\`\n\n`;
  });
  fs.writeFileSync('d:\\ViralSpy\\extracted_prompts.md', md);
  console.log(`Successfully extracted ${prompts.length} prompts to extracted_prompts.md`);
});
