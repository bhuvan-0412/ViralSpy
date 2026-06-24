import * as fs from 'fs'

const INPUT_FILE = 'training-data/viralspy-training.jsonl'
const OUTPUT_ALPACA = 'training-data/alpaca-format.jsonl'
const OUTPUT_CHATML = 'training-data/chatml-format.jsonl'

// Alpaca format (used by most fine-tuning frameworks)
function toAlpacaFormat(example: any): object {
  const input = example.input
  const output = example.output

  return {
    instruction: `You are ViralSpy AI, a viral content 
strategist trained on thousands of high-performing 
social media posts. Generate a complete content brief 
for the given trending topic. Return ONLY valid JSON.`,
    input: `Trend: ${input.trend_name}
Niche: ${input.niche}
Platform: ${input.platform}
Velocity Score: ${input.velocity_score}
Momentum: ${input.momentum_status}`,
    output: JSON.stringify(output, null, 2),
  }
}

// ChatML format (used by Ollama Modelfile)
function toChatMLFormat(example: any): object {
  const input = example.input
  const output = example.output

  return {
    messages: [
      {
        role: 'system',
        content: `You are ViralSpy AI, a viral content 
strategist specialized in detecting and capitalizing 
on social media trends. You generate highly specific, 
actionable content briefs that help creators go viral. 
Always respond with valid JSON only.`,
      },
      {
        role: 'user',
        content: `Generate a content brief for:
Trend: ${input.trend_name}
Niche: ${input.niche}  
Platform: ${input.platform}
Velocity: ${input.velocity_score}
Momentum: ${input.momentum_status}`,
      },
      {
        role: 'assistant',
        content: JSON.stringify(output),
      },
    ],
  }
}

async function main() {
  console.log('📦 Preparing fine-tuning data...')

  const lines = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n').filter(Boolean)

  console.log(`Found ${lines.length} training examples`)

  // Write Alpaca format
  const alpacaStream = fs.createWriteStream(OUTPUT_ALPACA)
  // Write ChatML format
  const chatmlStream = fs.createWriteStream(OUTPUT_CHATML)

  lines.forEach((line) => {
    const example = JSON.parse(line)
    alpacaStream.write(JSON.stringify(toAlpacaFormat(example)) + '\n')
    chatmlStream.write(JSON.stringify(toChatMLFormat(example)) + '\n')
  })

  alpacaStream.end()
  chatmlStream.end()

  console.log(`✅ Alpaca format: ${OUTPUT_ALPACA}`)
  console.log(`✅ ChatML format: ${OUTPUT_CHATML}`)
  console.log('\nNext step: Upload alpaca-format.jsonl')
  console.log('to Google Colab for fine-tuning with Unsloth')
}

main().catch(console.error)
