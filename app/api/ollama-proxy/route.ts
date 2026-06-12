import { NextResponse } from 'next/server';

/**
 * POST /api/ollama-proxy
 *
 * Forwards a generation request to a local Ollama instance.
 * The browser calls this HTTPS endpoint — no Mixed Content block.
 * Vercel's edge (in local dev) or the user's own machine (in prod self-host)
 * can reach the WSL IP on the same LAN.
 *
 * Body: { ollamaUrl: string, ollamaModel: string, prompt: string }
 */
export async function POST(request: Request) {
  let body: { ollamaUrl?: string; ollamaModel?: string; prompt?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ollamaUrl, ollamaModel, prompt } = body;

  if (!ollamaUrl || !prompt) {
    return NextResponse.json(
      { error: 'Missing required fields: ollamaUrl, prompt' },
      { status: 400 }
    );
  }

  const cleanUrl = ollamaUrl.replace(/\/$/, '');

  try {
    const res = await fetch(`${cleanUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel || 'llama3',
        prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(120_000) // 2-minute timeout
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama error: HTTP ${res.status}${text ? ` — ${text}` : ''}`);
    }

    const data = await res.json();
    return NextResponse.json({ response: data.response });
  } catch (e: any) {
    console.error('[ollama-proxy] error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
