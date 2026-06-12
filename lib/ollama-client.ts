'use client'

interface BriefRequest {
  trendId: string
  trendName: string
  niche: string
  platform: string
  velocityScore: number
  momentumStatus: string
  locale?: string
}

const BRIEF_PROMPT = (req: BriefRequest): string => `
You are a viral content strategist. Generate a brief.
Trend: ${req.trendName}
Niche: ${req.niche}
Platform: ${req.platform}
Velocity: ${req.velocityScore}
Momentum: ${req.momentumStatus}

Respond ONLY in valid JSON no markdown:
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
format must be: TALKING_HEAD, POV, DUET, TUTORIAL, 
STORYTIME, or TRANSITION`

export async function generateBriefWithOllama(
  req: BriefRequest,
  ollamaUrl: string,
  model: string
): Promise<object> {
  // Clean URL
  const baseUrl = ollamaUrl.replace(/\/$/, '')
  
  // Call Ollama DIRECTLY from browser
  // This works because browser is on Windows 
  // which can reach WSL IP directly
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      prompt: BRIEF_PROMPT(req),
      stream: false
    })
  })

  if (!res.ok) {
    throw new Error(
      `Ollama error: ${res.status}. ` +
      `Make sure ollama serve is running at ${baseUrl}`
    )
  }

  const data = await res.json()
  const rawText = data.response || ''
  
  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Ollama returned invalid response format')
  }
  
  return JSON.parse(jsonMatch[0])
}
