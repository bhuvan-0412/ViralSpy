import * as fs from 'fs'
import * as path from 'path'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const OUTPUT_FILE = 'training-data/viralspy-training.jsonl'
const EXAMPLES_PER_BATCH = 5
const TOTAL_EXAMPLES = 2000

// All niches and platforms
const NICHES = [
  'fitness',
  'food',
  'finance',
  'fashion',
  'beauty',
  'tech',
  'gaming',
  'travel',
  'lifestyle',
  'education',
]

const PLATFORMS = ['YOUTUBE', 'INSTAGRAM', 'REDDIT']

const MOMENTUM_STATES = ['EXPLODING', 'RISING']

// Real-sounding trend templates per niche
const TREND_TEMPLATES: Record<string, string[]> = {
  fitness: [
    '12-3-30 treadmill workout',
    'zone 2 cardio benefits',
    'protein before or after workout',
    'cold plunge morning routine',
    'walking pad desk setup',
    '75 hard challenge results',
    'cortisol face causes',
    'functional fitness over 30',
    'red light therapy for recovery',
    'nervous system regulation workout',
  ],
  food: [
    'cottage cheese ice cream hack',
    'air fryer salmon 10 minutes',
    'viral butter board recipe',
    'high protein breakfast under 300 calories',
    'cucumber salad tiktok recipe',
    'marry me chicken recipe',
    'smash burger technique',
    'overnight oats 5 ways',
    'gut health smoothie recipe',
    'protein mac and cheese hack',
  ],
  finance: [
    'index fund vs ETF difference',
    'house hacking for beginners',
    'credit card rewards stacking',
    'emergency fund in high yield savings',
    'Roth IRA contribution limits 2026',
    'debt avalanche vs snowball method',
    'side hustle tax deductions',
    'dividend investing for beginners',
    'real estate vs stock market',
    'budget paycheck to paycheck',
  ],
  fashion: [
    'quiet luxury wardrobe essentials',
    'capsule wardrobe 10 pieces',
    'old money aesthetic outfits',
    'thrift flip transformation',
    'clean girl aesthetic makeup',
    'coastal grandmother style',
    'dark academia outfits',
    'office siren trend',
    'pinterest girl aesthetic',
    'mob wife aesthetic fashion',
  ],
  beauty: [
    'glass skin routine steps',
    'deinfluencing skincare products',
    'slugging skincare overnight',
    'lip flip vs lip filler',
    'dermaplaning at home guide',
    'retinol beginner routine',
    'sunscreen for brown skin',
    'hair oiling routine benefits',
    'double cleansing method',
    'skin cycling routine',
  ],
  tech: [
    'AI tools replacing jobs 2026',
    'cursor AI coding assistant',
    'local LLM on laptop setup',
    'Claude vs ChatGPT comparison',
    'vibe coding explained',
    'no-code app builder review',
    'AI video generation tools',
    'prompt engineering tips',
    'open source AI models 2026',
    'build SaaS in 24 hours',
  ],
  gaming: [
    'Elden Ring DLC secrets',
    'cozy games recommendation 2026',
    'gaming setup under 500',
    'best games releasing this month',
    'retro gaming collection building',
    'gaming chair vs office chair',
    'streaming setup for beginners',
    'indie game hidden gems',
    'gaming with ADHD tips',
    'competitive gaming diet',
  ],
  travel: [
    'budget Europe trip 2026',
    'solo travel safety tips women',
    'travel hacking with points',
    'van life setup cost breakdown',
    'slow travel benefits',
    'digital nomad visa countries',
    'travel insurance worth it',
    'packing light one bag method',
    'best time to book flights',
    'hidden gem destinations 2026',
  ],
  lifestyle: [
    'morning routine 5am club',
    'dopamine menu for ADHD',
    'soft life aesthetic meaning',
    'body doubling for productivity',
    'digital minimalism benefits',
    'Sunday reset routine',
    'romanticise your life tips',
    'main character energy meaning',
    'slow living principles',
    'intentional living guide',
  ],
  education: [
    'learn Python in 30 days',
    'Obsidian note taking system',
    'Feynman technique explained',
    'spaced repetition Anki setup',
    'learn in public benefits',
    'building a second brain',
    'speed reading techniques',
    'active recall study method',
    'knowledge management system',
    'learn any skill faster',
  ],
}

async function generateBriefWithGroq(
  trendName: string,
  niche: string,
  platform: string,
  velocityScore: number,
  momentumStatus: string
): Promise<object | null> {
  const prompt = `You are a viral content strategist who has 
helped 500+ creators hit 1M+ views. Generate a content brief.

Trend: ${trendName}
Niche: ${niche}
Platform: ${platform}
Velocity Score: ${velocityScore}
Momentum: ${momentumStatus}

Rules:
- Hook must be under 8 words and create curiosity or urgency
- Each angle must be genuinely different (not variations of same idea)
- Hashtags must be real ones people actually search
- Script outline must have clear narrative arc

Respond ONLY in valid JSON, no markdown, no backticks:
{
  "hook": "under 8 words hook",
  "angles": [
    {"title": "Angle 1 name", "description": "2 sentence description of this specific approach"},
    {"title": "Angle 2 name", "description": "2 sentence description of this specific approach"},
    {"title": "Angle 3 name", "description": "2 sentence description of this specific approach"}
  ],
  "format": "TALKING_HEAD",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "best_post_time": "specific time range in IST",
  "estimated_reach": "realistic range like 50K-200K views",
  "script_outline": "Hook (0-3s): specific hook action. Build (3-45s): 3 specific points. CTA (45-60s): specific call to action.",
  "why_trending": "1 sentence explaining why this trend is growing now",
  "creator_tip": "1 specific tip for maximizing performance on ${platform}"
}
format must be one of: TALKING_HEAD, POV, DUET, TUTORIAL, STORYTIME, TRANSITION

CRITICAL: Your response must be pure JSON only.
No text before or after the JSON object.
No newlines inside string values.
Escape any quotes inside strings with backslash.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      const errMsg = data.error?.message || ''
      console.error('Groq error:', errMsg)
      throw new Error(errMsg)
    }

    const text = data.choices[0].message.content
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    return JSON.parse(jsonMatch[0])
  } catch (e: any) {
    const errMsg = e.message || String(e)
    if (errMsg.toLowerCase().includes('tokens per day')) {
      throw e
    }
    console.error('Error:', errMsg)
    return null
  }
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateVelocityScore(momentum: string): number {
  if (momentum === 'EXPLODING') {
    return Math.floor(Math.random() * 300) + 300
  }
  return Math.floor(Math.random() * 150) + 150
}

async function main() {
  console.log('🚀 ViralSpy Training Data Generator')
  console.log('=====================================')

  // Create output directory
  const dir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const PROGRESS_FILE = 'training-data/progress.json'

  // Check if file exists and count existing examples
  let existingCount = 0
  if (fs.existsSync(OUTPUT_FILE)) {
    const existing = fs.readFileSync(OUTPUT_FILE, 'utf-8').split('\n').filter(Boolean)
    existingCount = existing.length
    console.log(`Found ${existingCount} existing examples, \n    appending new ones...`)
  } else {
    fs.writeFileSync(OUTPUT_FILE, '')
  }

  let generated = 0
  let failed = 0

  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
      if (progress.last_index < TOTAL_EXAMPLES - 1) {
        console.log(`♻️ Resuming progress: starting from index ${existingCount}`)
      } else {
        console.log('Previous run was complete. Starting from scratch.')
        fs.writeFileSync(OUTPUT_FILE, '')
        existingCount = 0
      }
    } catch (e) {
      console.error('Error reading progress file:', e)
    }
  }

  const startTime = Date.now()

  console.log(`\n📊 Generating ${TOTAL_EXAMPLES} examples...\n`)

  for (let i = existingCount; i < TOTAL_EXAMPLES; i++) {
    const niche = getRandomItem(NICHES)
    const platform = getRandomItem(PLATFORMS)
    const momentum = getRandomItem(MOMENTUM_STATES)
    const trends = TREND_TEMPLATES[niche]
    const trendName = getRandomItem(trends)
    const velocityScore = generateVelocityScore(momentum)

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${TOTAL_EXAMPLES} (${existingCount} existing) ` +
        `(${generated} success, ${failed} failed)`
    )

    let brief = null
    let hasFailed = false
    try {
      brief = await generateBriefWithGroq(trendName, niche, platform, velocityScore, momentum)
    } catch (e: any) {
      const error = e.message || ''
      if (error.includes('tokens per day')) {
        console.log('\n\n⏰ Daily token limit reached!')
        console.log(`Generated ${generated} examples so far.`)
        console.log('Run again tomorrow to generate more.')
        break // exit the loop
      }
      hasFailed = true
      failed++
    }

    if (brief) {
      // Format as training example
      const trainingExample = {
        // Input (what we know about the trend)
        input: {
          trend_name: trendName,
          niche,
          platform,
          velocity_score: velocityScore,
          momentum_status: momentum,
        },
        // Output (what the model should generate)
        output: brief,
        // Metadata
        metadata: {
          generated_at: new Date().toISOString(),
          model: 'llama-3.3-70b-versatile',
          version: '1.0',
        },
      }

      // Append to JSONL file
      fs.appendFileSync(OUTPUT_FILE, JSON.stringify(trainingExample) + '\n')
      generated++
    } else if (!hasFailed) {
      failed++
    }

    // Save progress to progress.json
    fs.writeFileSync(
      PROGRESS_FILE,
      JSON.stringify({ completed: existingCount + generated, last_index: i })
    )

    // Rate limiting — Groq free tier allows
    // ~30 requests/minute
    await new Promise((r) => setTimeout(r, 3000))
  }

  // If completed successfully, delete the progress file
  if (existingCount + generated + failed >= TOTAL_EXAMPLES && fs.existsSync(PROGRESS_FILE)) {
    try {
      fs.unlinkSync(PROGRESS_FILE)
    } catch (e) {
      // Ignore
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  console.log('\n\n✅ Generation Complete!')
  console.log('======================')
  console.log(`✓ Generated: ${generated} examples`)
  console.log(`✗ Failed: ${failed} examples`)
  console.log(`⏱ Time: ${minutes}m ${seconds}s`)
  console.log(`📁 Saved to: ${OUTPUT_FILE}`)
  console.log(
    `📦 File size: ${
      fs.existsSync(OUTPUT_FILE) ? (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2) : '0.00'
    } MB`
  )

  // Generate stats
  console.log('\n📊 Dataset Stats:')
  const fileExists = fs.existsSync(OUTPUT_FILE)
  const lines = fileExists ? fs.readFileSync(OUTPUT_FILE, 'utf-8').split('\n').filter(Boolean) : []

  if (lines.length > 0) {
    const examples = lines.map((l) => JSON.parse(l))

    const nicheCount: Record<string, number> = {}
    const platformCount: Record<string, number> = {}
    const momentumCount: Record<string, number> = {}

    examples.forEach((ex) => {
      nicheCount[ex.input.niche] = (nicheCount[ex.input.niche] || 0) + 1
      platformCount[ex.input.platform] = (platformCount[ex.input.platform] || 0) + 1
      momentumCount[ex.input.momentum_status] = (momentumCount[ex.input.momentum_status] || 0) + 1
    })

    console.log('\nBy Niche:')
    Object.entries(nicheCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${k}: ${v}`))

    console.log('\nBy Platform:')
    Object.entries(platformCount).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

    console.log('\nBy Momentum:')
    Object.entries(momentumCount).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
  } else {
    console.log('No examples generated.')
  }
}

main().catch(console.error)
