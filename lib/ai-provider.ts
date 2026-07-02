import { formatFewShotPrompt } from './few-shot-examples'
import type { CompetitorPost } from './competitor-fetch'

export type AIProvider = 'ollama' | 'byok'
export type BYOKProvider = 'gemini' | 'openai' | 'custom'

interface BriefRequest {
  trendName: string
  niche: string
  platform: string
  velocityScore: number
  momentumStatus: string
}

const BRIEF_PROMPT = (req: BriefRequest, lang: string, competitors: CompetitorPost[] = []) => {
  const fewShotContext = formatFewShotPrompt(req.niche)
  return `You are a viral content strategist who helped 500+ creators hit 1M+ views. Generate a highly specific, actionable content brief tailored to the exact trend.
Do NOT be generic. Every suggestion must be specific to this exact trend and niche.
${fewShotContext}

Trend: ${req.trendName}
Niche: ${req.niche}
Platform: ${req.platform}
Velocity Score: ${req.velocityScore}
Momentum: ${req.momentumStatus}

${
  competitors.length > 0
    ? `
TOP PERFORMING CONTENT RIGHT NOW FOR THIS TREND:
${competitors.map((c, i) => `${i + 1}. "${c.title}" — ${c.views}`).join('\n')}

Study these. Your brief must help creators BEAT these posts.
Identify what hook pattern they use and suggest something fresher.
`
    : ''
}

${
  req.platform === 'YOUTUBE'
    ? `
YOUTUBE-SPECIFIC REQUIREMENTS:
- Hook must work as a video title AND first 3 seconds of speech
- Include thumbnail concept in script_outline
- Suggest chapter timestamps
- Focus on watch time retention
- best_post_time should be specific to YouTube algorithm
`
    : ''
}

${
  req.platform === 'INSTAGRAM'
    ? `
INSTAGRAM-SPECIFIC REQUIREMENTS:
- Hook must work in first 1 second of reel
- Include trending audio suggestion if relevant
- Focus on share-ability and save-ability
- Hashtag strategy: mix of 100K-500K range tags
- best_post_time should be specific to Instagram algorithm
`
    : ''
}

${lang !== 'en' ? `Language: Generate hook, angles, and script in ${lang === 'hi' ? 'Hindi' : 'Telugu'}. Keep hashtags in English.` : ''}

Respond ONLY in valid JSON, no markdown, no backticks:
{
  "hook": "killer hook under 8 words",
  "angles": [
    {"title": "name", "description": "2 sentences max"},
    {"title": "name", "description": "2 sentences max"},
    {"title": "name", "description": "2 sentences max"}
  ],
  "format": "TALKING_HEAD",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "best_post_time": "platform-specific optimal time",
  "estimated_reach": "realistic range based on velocity ${req.velocityScore}",
  "script_outline": "Hook (0-3s): ... Build (3-45s): ... CTA (45-60s): ..."
}
format must be one of: TALKING_HEAD, POV, DUET, TUTORIAL, STORYTIME, TRANSITION`
}

// ── Ollama (Local) ──────────────────────────────
async function generateWithOllama(
  req: BriefRequest,
  ollamaUrl: string,
  model: string,
  lang: string,
  competitors: CompetitorPost[]
): Promise<string> {
  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      prompt: BRIEF_PROMPT(req, lang, competitors),
      stream: false,
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}. Make sure ollama serve is running.`)
  const data = await res.json()
  return data.response
}

// ── BYOK — OpenAI compatible ────────────────────
async function generateWithOpenAI(
  req: BriefRequest,
  apiKey: string,
  baseUrl: string,
  model: string,
  lang: string,
  competitors: CompetitorPost[]
): Promise<string> {
  const url = `${baseUrl}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: BRIEF_PROMPT(req, lang, competitors) }],
      max_tokens: 1000,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `API error: ${res.status}`)
  return data.choices[0].message.content
}

// ── Gemini via REST (BYOK) ──────────────────────
async function generateWithGemini(
  req: BriefRequest,
  apiKey: string,
  model: string,
  lang: string,
  competitors: CompetitorPost[]
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: BRIEF_PROMPT(req, lang, competitors) }],
          },
        ],
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Gemini error: ${res.status}`)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── Main dispatcher ─────────────────────────────
export async function generateBrief(
  req: BriefRequest,
  provider: AIProvider,
  config: {
    byokProvider?: BYOKProvider
    byokKey?: string
    byokBaseUrl?: string
    byokModel?: string
    ollamaUrl?: string
    ollamaModel?: string
    lang?: string
    competitors?: CompetitorPost[]
  }
): Promise<object> {
  const lang = config.lang || 'en'
  const competitors = config.competitors || []
  let rawText = ''

  if (provider === 'ollama') {
    rawText = await generateWithOllama(
      req,
      config.ollamaUrl || 'http://localhost:11434',
      config.ollamaModel || 'llama3',
      lang,
      competitors
    )
  } else if (provider === 'byok') {
    if (!config.byokKey) throw new Error('No API key provided. Add your key in Settings.')

    if (config.byokProvider === 'gemini') {
      rawText = await generateWithGemini(
        req,
        config.byokKey,
        config.byokModel || 'gemini-2.0-flash',
        lang,
        competitors
      )
    } else {
      // OpenAI, custom, or any OpenAI-compatible API
      const baseUrl = config.byokBaseUrl || 'https://api.openai.com/v1'
      const model = config.byokModel || 'gpt-4o'
      rawText = await generateWithOpenAI(req, config.byokKey, baseUrl, model, lang, competitors)
    }
  } else {
    throw new Error('No AI provider configured.')
  }

  const clean = rawText.replace(/```json|```/g, '').trim()

  // Find JSON in the response even if there's extra text
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response format')

  return JSON.parse(jsonMatch[0])
}
