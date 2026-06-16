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

const BRIEF_PROMPT = (req: BriefRequest): string =>
  `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
You are ViralSpy AI, a viral content strategist. Generate a content brief. Return ONLY valid JSON with no extra fields beyond: hook, angles, format, hashtags, best_post_time, estimated_reach, script_outline.

### Input:
Trend: ${req.trendName}
Niche: ${req.niche}
Platform: ${req.platform}
Velocity: ${req.velocityScore}
Momentum: ${req.momentumStatus}

### Response:
`

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
