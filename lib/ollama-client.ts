/**
 * Ollama brief generation — runs through /api/ollama-proxy.
 *
 * Flow: Browser → HTTPS /api/ollama-proxy (Vercel) → HTTP WSL:11434
 * This avoids:
 *  1. Mixed Content errors (browser never contacts HTTP Ollama directly)
 *  2. Vercel → WSL unreachability (the proxy runs in the same Vercel edge context,
 *     but the user's browser is the one triggering the request, so the WSL IP
 *     is resolved relative to the caller's network — works in local dev;
 *     for prod, users run Ollama locally and expose it via their own network)
 */

const BRIEF_PROMPT = (
  trendName: string,
  niche: string,
  platform: string,
  velocityScore: number,
  momentumStatus: string,
  lang: string
) => `You are a viral content strategist who helped 500+ creators hit 1M+ views.
Respond ONLY in valid JSON, no markdown, no extra text.
Language: ${lang === 'hi' ? 'Hindi' : lang === 'te' ? 'Telugu' : 'English'}

{"hook":"...","angles":[{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}],"format":"TALKING_HEAD","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"],"best_post_time":"...","estimated_reach":"...","script_outline":"..."}

Trend: ${trendName}
Niche: ${niche}
Platform: ${platform}
Velocity score: ${velocityScore}
Momentum: ${momentumStatus}`;

export async function generateBriefWithOllama(
  trendName: string,
  niche: string,
  platform: string,
  velocityScore: number,
  momentumStatus: string,
  ollamaUrl: string,
  ollamaModel: string,
  lang: string = 'en'
): Promise<object> {
  const prompt = BRIEF_PROMPT(trendName, niche, platform, velocityScore, momentumStatus, lang);

  const res = await fetch('/api/ollama-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ollamaUrl, ollamaModel, prompt })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Ollama proxy failed with status ${res.status}`);
  }

  const data = await res.json();
  const rawText: string = data.response || '';

  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Ollama returned no valid JSON block');

  return JSON.parse(match[0]);
}
