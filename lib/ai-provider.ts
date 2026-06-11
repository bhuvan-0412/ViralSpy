export type AIProvider = 'gemini' | 'openai' | 'ollama' | 'byok'

interface BriefRequest {
  trendName: string
  niche: string
  platform: string
  velocityScore: number
  momentumStatus: string
  language?: string
}

const BRIEF_PROMPT = (req: BriefRequest, lang: string) => `
You are a viral content strategist who helped 500+ creators 
hit 1M+ views. Generate a content brief for this trend.

Trend: ${req.trendName}
Niche: ${req.niche}
Platform: ${req.platform}
Velocity Score: ${req.velocityScore}
Momentum: ${req.momentumStatus}
Language: ${lang === 'hi' ? 'Hindi' : lang === 'te' ? 'Telugu' : 'English'}

${lang !== 'en' ? `IMPORTANT: Generate the hook, angle descriptions, 
and script outline in ${lang === 'hi' ? 'Hindi' : 'Telugu'} language.
Keep hashtags in English.` : ''}

Respond ONLY in valid JSON, no markdown, no backticks:
{
  "hook": "killer hook under 8 words",
  "angles": [
    {"title": "name", "description": "2 sentences"},
    {"title": "name", "description": "2 sentences"},
    {"title": "name", "description": "2 sentences"}
  ],
  "format": "TALKING_HEAD",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "best_post_time": "7-9 PM IST",
  "estimated_reach": "50K-200K views in 48 hours",
  "script_outline": "Hook (0-3s): ... Build (3-45s): ... CTA (45-60s): ..."
}
format must be one of: TALKING_HEAD, POV, DUET, 
TUTORIAL, STORYTIME, TRANSITION`

// ── Gemini ──────────────────────────────────────
async function generateWithGemini(
  req: BriefRequest, 
  apiKey: string,
  lang: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(BRIEF_PROMPT(req, lang))
  return result.response.text()
}

// ── OpenAI ──────────────────────────────────────
async function generateWithOpenAI(
  req: BriefRequest,
  apiKey: string,
  lang: string
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: BRIEF_PROMPT(req, lang) }
      ],
      max_tokens: 1000
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error')
  return data.choices[0].message.content
}

// ── Ollama (Local) ──────────────────────────────
async function generateWithOllama(
  req: BriefRequest,
  ollamaUrl: string,
  model: string,
  lang: string
): Promise<string> {
  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      prompt: BRIEF_PROMPT(req, lang),
      stream: false
    })
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const data = await res.json()
  return data.response
}

// ── Main dispatcher ─────────────────────────────
export async function generateBrief(
  req: BriefRequest,
  provider: AIProvider,
  config: {
    geminiKey?: string
    openaiKey?: string
    byokKey?: string
    byokProvider?: 'gemini' | 'openai'
    ollamaUrl?: string
    ollamaModel?: string
    lang?: string
  }
): Promise<object> {
  const lang = config.lang || 'en'
  let rawText = ''

  try {
    if (provider === 'ollama') {
      rawText = await generateWithOllama(
        req,
        config.ollamaUrl || 'http://localhost:11434',
        config.ollamaModel || 'llama3',
        lang
      )
    } else if (provider === 'byok') {
      if (!config.byokKey) throw new Error('No BYOK key provided')
      if (config.byokProvider === 'openai') {
        rawText = await generateWithOpenAI(req, config.byokKey, lang)
      } else {
        rawText = await generateWithGemini(req, config.byokKey, lang)
      }
    } else if (provider === 'openai') {
      const key = config.openaiKey || process.env.OPENAI_API_KEY || ''
      rawText = await generateWithOpenAI(req, key, lang)
    } else {
      // default: gemini
      const key = config.geminiKey || process.env.GEMINI_API_KEY || ''
      rawText = await generateWithGemini(req, key, lang)
    }

    const clean = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    throw err
  }
}
