# Summary of User Prompts

## Prompt 1 (2026-06-12T03:57:37Z)

```
Where are all my api keys? IN which file?
```

## Prompt 2 (2026-06-12T03:58:58Z)

```
replace openai api with  GEMINI_API_KEY
```

## Prompt 3 (2026-06-12T04:02:50Z)

```
use .env.local
```

## Prompt 4 (2026-06-12T04:06:10Z)

```
Fix environment variable loading across the entire project.

PROBLEM:
The app is reading from .env.example instead of .env.local
in some places. Ensure all environment variables are loaded
exclusively from .env.local for local development and from
Vercel environment variables for production.

STEP 1 — Update next.config.mjs:
Make sure it does NOT reference .env.example anywhere.
The file should only have next-intl plugin and standard config:

import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export default withNextIntl(nextConfig)

STEP 2 — Update /lib/supabase.ts:
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

STEP 3 — Update /lib/supabase-server.ts:
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

STEP 4 — Update /lib/gemini.ts:
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ''
)

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
})

STEP 5 — Update /lib/ai-provider.ts:
In the generateBrief function, update the gemini default case:
} else {
  // Use server-side env key as default
  const key = config.geminiKey 
    || process.env.GEMINI_API_KEY 
    || ''
  if (!key) throw new Error('GEMINI_API_KEY not configured')
  rawText = await generateWithGemini(req, key, lang)
}

STEP 6 — Add environment variable validation:
Create /lib/env.ts:

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(
      `Missing environment variables: ${missing.join(', ')}\n` +
      'Add them to .env.local for local development\n' +
      'or to Vercel Environment Variables for production.'
    )
  }
  
  return missing.length === 0
}

STEP 7 — Call validateEnv in /app/api/brief/route.ts:
Import and call at the top of the POST handler:
import { validateEnv } from '@/lib/env'

export async function POST(request: Request) {
  validateEnv()
  // rest of existing code unchanged
}

STEP 8 — Update .env.example to match current keys:
Make sure .env.example has ALL required keys listed
(without values — just the key names as placeholders):

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
YOUTUBE_API_KEY=
RAPIDAPI_INSTAGRAM_KEY=
VERCEL_OIDC_TOKEN=

Remove OPENAI_API_KEY, REDDIT_CLIENT_ID, 
REDDIT_CLIENT_SECRET from .env.example
as these are no longer used.

STEP 9 — Add .env.local to .gitignore:
Make sure .gitignore contains:
.env.local
.env*.local

Never commit actual API keys to git.

Do not change any other files.
Do not modify any Supabase queries.
Follow all Safeguards from spdd/prompt/viralspy-reasons-canvas.md.
```

## Prompt 5 (2026-06-12T04:15:09Z)

```
Fix two issues with the brief generation flow.

ISSUE 1 — Same brief returned for all trends:
The brief API is returning cached/mock data regardless of 
which trend is clicked. Fix /app/api/brief/route.ts:

- Check cache by trend_id specifically:
  const { data: cached } = await supabase
    .from('briefs')
    .select('*')
    .eq('trend_id', trendId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (cached) return Response.json({ data: cached })

- Make sure the GPT prompt includes the ACTUAL trend name,
  niche, platform, velocity from the request body — not 
  hardcoded or default values.

- Log the incoming request body at the top of POST handler:
  console.log('Brief request:', { trendId, trendName, 
    niche, platform, velocityScore, momentumStatus })

- The mock fallback must also use the actual trendName:
  hook: `${trendName} is changing everything — here's why`
  Not a hardcoded string.

ISSUE 2 — Navigation flicker (loading → trends → brief):
The brief page is navigating to /trends briefly before 
loading the brief. Fix in the "Generate Brief" button 
onClick handler in TrendCard.tsx:

Replace the current navigation logic with:

const handleGenerateBrief = async () => {
  setIsGenerating(true)
  try {
    const response = await fetch('/api/brief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders(),
        'x-locale': locale
      },
      body: JSON.stringify({
        trendId: trend.id,
        trendName: trend.name,
        niche: trend.niche,
        platform: trend.platform,
        velocityScore: trend.velocity_score,
        momentumStatus: trend.momentum_status
      })
    })
    const result = await response.json()
    if (result.data?.id) {
      router.push(`/brief/${result.data.id}`)
    } else {
      throw new Error('No brief ID returned')
    }
  } catch (error) {
    console.error('Brief generation error:', error)
    alert('Could not generate brief. Please try again
<truncated 73 bytes>
ief first, THEN navigates directly 
to /brief/[id] — no flicker.

ISSUE 3 — Fix "Generate Brief" button UI:
Replace the current button in TrendCard.tsx with:

<button
  onClick={handleGenerateBrief}
  disabled={isGenerating}
  className={`
    flex items-center gap-2 px-4 py-2 rounded-full
    text-sm font-semibold transition-all duration-200
    ${isGenerating 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-[#FF6B4A] text-white hover:bg-[#e55a3a] hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-md'
    }
  `}
>
  {isGenerating ? (
    <>
      <svg className="animate-spin h-3.5 w-3.5" 
        viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" 
          r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span>Generating...</span>
    </>
  ) : (
    <>
      <span>Generate Brief</span>
      <span className="text-xs opacity-80">→</span>
    </>
  )}
</button>

ISSUE 4 — Fix brief page to not redirect on load:
In /app/[locale]/brief/[id]/page.tsx:
- On mount, fetch the brief by ID from Supabase directly:
  GET /api/brief?id={id}
- If brief not found show a "Brief not found" card with 
  a back button — do NOT redirect to /trends
- Remove any useEffect that redirects away from the page

Do not change colors, Logo, or Safeguards.
```

## Prompt 6 (2026-06-12T04:33:03Z)

```
In /lib/gemini.ts change model name:
from: 'gemini-1.5-flash'
to:   'gemini-2.0-flash'

In /lib/ai-provider.ts change model name in 
generateWithGemini function:
from: 'gemini-1.5-flash'  
to:   'gemini-2.0-flash'

Also update the API endpoint in generateWithGemini 
to use v1beta:
The GoogleGenerativeAI SDK handles this automatically,
just make sure the model string is 'gemini-2.0-flash'.

Do not change anything else.
```

## Prompt 7 (2026-06-12T04:39:30Z)

```
Remove Gemini as a server-side default provider.
Simplify the AI provider system to two options only:
1. Local AI (Ollama)
2. BYOK (Bring Your Own Key) — supports any OpenAI-compatible API

STEP 1 — Update /lib/ai-provider.ts:

Remove the server-side Gemini default entirely.
Replace the entire file with:

export type AIProvider = 'ollama' | 'byok'
export type BYOKProvider = 'gemini' | 'openai' | 'custom'

interface BriefRequest {
  trendName: string
  niche: string
  platform: string
  velocityScore: number
  momentumStatus: string
}

const BRIEF_PROMPT = (req: BriefRequest, lang: string) => `
You are a viral content strategist who helped 500+ creators 
hit 1M+ views. Generate a content brief for this trend.

Trend: ${req.trendName}
Niche: ${req.niche}
Platform: ${req.platform}
Velocity Score: ${req.velocityScore}
Momentum: ${req.momentumStatus}
${lang !== 'en' ? `Language: Generate hook, angles, and script 
in ${lang === 'hi' ? 'Hindi' : 'Telugu'}. Keep hashtags in English.` : ''}

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
      model: model || 'l
<truncated 7982 bytes>
status} Unauthorized`)
    return Response.json({ valid: true, 
      message: 'API key valid ✓' })
      
  } catch (e: any) {
    return Response.json({ valid: false, 
      message: e.message })
  }
}

STEP 6 — Update onboarding Step 1 provider cards:
Replace Gemini card with Groq card (free, fast):

Card 1 — Ollama (Local):
  Icon: 🦙 on green background
  Title: "Local AI"
  Badge: "100% Free & Private"
  Description: "Runs on your machine. No API costs."
  Default: true (pre-selected)

Card 2 — Groq (BYOK):
  Icon: ⚡ on purple background
  Title: "Groq (Fast & Free)"
  Badge: "Free Tier"
  Description: "Fastest AI inference. Free API key."
  On select: show API key input + link to groq console

Card 3 — Gemini (BYOK):
  Icon: G on blue background
  Title: "Gemini"
  Badge: "Free Tier"
  Description: "Google's AI. Free quota available."

Card 4 — OpenAI (BYOK):
  Icon: OpenAI logo
  Title: "GPT-4o"  
  Badge: "Pay per use"
  Description: "Most capable. ~₹0.80 per brief."

Card 5 — Custom API:
  Icon: 🔧 on gray background
  Title: "Custom API"
  Badge: "Any provider"
  Description: "Any OpenAI-compatible API endpoint."
  On select: show base URL + model + key inputs

STEP 7 — Delete /lib/gemini.ts 
It's no longer needed as a server-side module.

STEP 8 — Update /lib/env.ts:
Remove GEMINI_API_KEY from required vars list.
Required vars are now only:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Do not change colors, Logo, cursor, or any 
Supabase logic.
Follow all Safeguards from 
spdd/prompt/viralspy-reasons-canvas.md.
```

## Prompt 8 (2026-06-12T04:44:06Z)

```

```

## Prompt 9 (2026-06-12T04:51:09Z)

```

```

## Prompt 10 (2026-06-12T05:02:51Z)

```
In /app/api/ollama-test/route.ts and /app/api/brief/route.ts
add WSL IP auto-detection as a fallback.

Create /lib/wsl-detect.ts:

export function getOllamaUrl(requestedUrl: string): string {
  // If user specified a non-localhost URL, use it directly
  if (requestedUrl && !requestedUrl.includes('localhost') 
    && !requestedUrl.includes('127.0.0.1')) {
    return requestedUrl
  }
  // Return as-is, let the client handle WSL IP
  return requestedUrl || 'http://localhost:11434'
}



In /hooks/useAIProvider.ts add WSL IP detection:

Add a function that tries to find the working Ollama URL:

export async function detectOllamaUrl(): Promise<string> {
  const urlsToTry = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
    'http://172.29.130.173:11434', // WSL common range
    'http://172.17.0.1:11434',
  ]
  
  for (const url of urlsToTry) {
    try {
      const res = await fetch(`/api/ollama-test?url=${url}`, {
        signal: AbortSignal.timeout(2000)
      })
      const data = await res.json()
      if (data.connected) return url
    } catch {}
  }
  return 'http://localhost:11434'
}
```

## Prompt 11 (2026-06-12T05:03:30Z)

```
In /app/api/ollama-test/route.ts and /app/api/brief/route.ts
add WSL IP auto-detection as a fallback.

Create /lib/wsl-detect.ts:

export function getOllamaUrl(requestedUrl: string): string {
  // If user specified a non-localhost URL, use it directly
  if (requestedUrl && !requestedUrl.includes('localhost') 
    && !requestedUrl.includes('127.0.0.1')) {
    return requestedUrl
  }
  // Return as-is, let the client handle WSL IP
  return requestedUrl || 'http://localhost:11434'
}





In /hooks/useAIProvider.ts add WSL IP detection:

Add a function that tries to find the working Ollama URL:

export async function detectOllamaUrl(): Promise<string> {
  const urlsToTry = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
    'http://172.29.130.173:11434', // WSL common range
    'http://172.17.0.1:11434',
  ]
  
  for (const url of urlsToTry) {
    try {
      const res = await fetch(`/api/ollama-test?url=${url}`, {
        signal: AbortSignal.timeout(2000)
      })
      const data = await res.json()
      if (data.connected) return url
    } catch {}
  }
  return 'http://localhost:11434'
}
Then in settings page, add an "Auto-detect" button next to the Ollama URL field:
In /app/[locale]/settings/page.tsx 
next to the Ollama URL input add:

<button
  onClick={async () => {
    setDetecting(true)
    const url = await detectOllamaUrl()
    setOllamaUrl(url)
    setDetecting(false)
  }}
  className="px-3 py-2 text-sm border border-gray-200 
    rounded-lg hover:border-[#FF6B4A] hover:text-[#FF6B4A]
    transition-colors"
>
  {detecting ? 'Detecting...' : '🔍 Auto-detect'}
</button>
Do not change anything else.

This way next time the WSL IP changes, user just clicks **Auto-detect** and it finds the right URL automatically.

Now commit and push everything:

```cmd
git add .
git commit -m "feat: Ollama local AI, BYOK multi-provider, WSL auto-detect"
git push github development
vercel --prod
```

Share the Vercel deployment output.
```

## Prompt 12 (2026-06-12T05:11:38Z)

```
Create a beautiful, friendly setup guide page for Local AI 
that anyone can follow — even a 10 year old.

STEP 1 — Create /app/[locale]/setup/page.tsx:

A dedicated setup guide page accessible from Settings.
Clean, friendly, step-by-step with big visuals.

PAGE DESIGN:
- White background, coral accents
- Large emoji icons for each step
- Progress indicator at top showing steps
- Code blocks with one-click copy buttons
- "Did this work?" confirmation buttons after each step
- Friendly encouraging language throughout

CONTENT:

Header:
  Title: "Set up Local AI in 5 minutes 🦙"
  Subtitle: "Run AI on your own computer — completely free, 
  completely private. Follow these steps one by one!"
  
  Friendly note card (green background):
  "✅ Why Local AI is awesome:
   • Completely FREE — no API bills ever
   • Private — your ideas never leave your computer  
   • Works offline — no internet needed
   • Fast — uses your own GPU"

─── SECTION 1: Download Ollama ───────────────────────

Big step card with:
  Step number: big coral circle with "1"
  Title: "Download Ollama"
  Emoji: 🖥️
  Description: "Ollama is a free app that runs AI on 
  your computer. Click the button for your computer type:"

  Three big download buttons:
  
  [🪟 I use Windows]
    href: https://ollama.com/download/OllamaSetup.exe
    Color: blue
    Sub-text: "Works on Windows 10 and 11"
    
  [🍎 I use Mac]  
    href: https://ollama.com/download/Ollama-darwin.zip
    Color: gray
    Sub-text: "Works on Mac with Apple Silicon or Intel"
    
  [🐧 I use Linux]
    href: #linux-install
    Color: orange
    Sub-text: "One command install"
    On click: show code block:
      curl -fsSL https://ollama.com/install.sh | sh

  After buttons:
  "Not sure which one? 
   Windows users: pick 🪟  
   MacBook users: pick 🍎"

  Confirmation button: 
  "✅ I downloaded and installed Ollama!" 
  On click: scroll to step 2, show green checkmark on step 
<truncated 7492 bytes>
inners →
</a>

STEP 3 — Add link to setup guide in onboarding:

In /app/[locale]/onboarding/page.tsx
When user selects Ollama card, show below the card:


  href="/setup"
  target="_blank"
  className="flex items-center gap-2 text-[#FF6B4A]
    hover:underline text-sm mt-3"
>
  🆕 First time? Follow our easy setup guide →
</a>

STEP 4 — Add to navbar help menu:

In the navbar add a small "?" help button that links 
to /setup when Ollama is selected as provider.

CODE BLOCK COMPONENT:
Create /components/CopyCodeBlock.tsx:

'use client'
import { useState } from 'react'

export default function CopyCodeBlock({ 
  code 
}: { code: string }) {
  const [copied, setCopied] = useState(false)
  
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="flex items-center gap-2 bg-gray-900 
      rounded-xl px-4 py-3 my-2">
      <code className="text-green-400 font-mono text-sm 
        flex-1">
        {code}
      </code>
      <button
        onClick={copy}
        className="text-gray-400 hover:text-white 
          transition-colors text-xs px-2 py-1 
          rounded-md hover:bg-gray-700 shrink-0"
      >
        {copied ? '✅ Copied!' : '📋 Copy'}
      </button>
    </div>
  )
}

Use CopyCodeBlock for ALL terminal commands 
throughout the setup page.

Do not change colors, Logo, cursor, or any 
existing Supabase logic.
Follow all Safeguards from 
spdd/prompt/viralspy-reasons-canvas.md.
```

## Prompt 13 (2026-06-12T05:12:03Z)

```

```

## Prompt 14 (2026-06-12T05:17:24Z)

```
Provide the local address and verify model name details:
```

## Prompt 15 (2026-06-12T05:20:08Z)

```
In /app/[locale]/setup/page.tsx fix Step 4 (Configure ViralSpy):

1. Add a "Detect my URL" button that calls /api/ollama-test
   for each possible URL and shows the working one:

const urlsToTry = [
  'http://localhost:11434',
  'http://127.0.0.1:11434', 
  'http://172.29.130.173:11434',
  'http://172.17.0.1:11434',
]

Show a button: "🔍 Auto-detect my Ollama URL"
On click: try each URL via /api/ollama-test
Show loading spinner while detecting
When found: highlight the working URL in green
             show "✅ Found at [url]!"
When not found: show "❌ Ollama not detected. 
  Make sure it's running (Step 2)"

2. Replace the static URL display with 
   a dynamic detected URL.

3. Add this WSL warning card specifically 
   for Windows users above the URL inputs:

<div className="bg-amber-50 border border-amber-200 
  rounded-xl p-4 mb-4">
  <p className="font-semibold text-amber-800 mb-2">
    🪟 Windows Users — Important!
  </p>
  <p className="text-amber-700 text-sm mb-3">
    If Ollama is running inside WSL (Linux), 
    localhost won't work. You need your WSL IP.
  </p>
  <p className="text-amber-700 text-sm mb-2">
    Run this in your Linux terminal to find your IP:
  </p>
  <CopyCodeBlock code="hostname -I" />
  <p className="text-amber-700 text-sm mt-2">
    Use the first number shown (looks like 172.x.x.x)
    and replace localhost with it.
  </p>
  <p className="text-amber-700 text-sm mt-2 font-medium">
    Then start Ollama with:
  </p>
  <CopyCodeBlock code="OLLAMA_HOST=0.0.0.0:11434 ollama serve" />
</div>

4. Add a "Save to ViralSpy Settings" button at the bottom 
   of Step 4 that saves the detected/entered URL to 
   localStorage key 'viralspy_ai_config':

const saveToSettings = () => {
  const current = JSON.parse(
    localStorage.getItem('viralspy_ai_config') || '{}'
  )
  localStorage.setItem('viralspy_ai_config', 
    JSON.stringify({
      ...current,
      provider: 'ollama',
      ollamaUrl: detectedUrl || ollamaUrl,
      ollamaModel: modelName
    })
  )
  // Show success toast
  setShowSaved(true)
  setTimeout(() => setShowSaved(false), 3000)
}

Button: "💾 Save these settings to ViralSpy"
On success: show "✅ Saved! You can now generate briefs."

Do not change anything else.
```

## Prompt 16 (2026-06-12T05:28:43Z)

```
Fix /components/ProviderSetupGuide.tsx

PROBLEM: The component is navigating to /setup 
instead of rendering as a modal overlay.

Replace the entire component with a proper modal:

'use client'
import { useRouter } from 'next/navigation'

interface Props {
  provider: 'ollama' | 'byok'
  isOpen: boolean
  onClose: () => void
  onComplete: (config: object) => void
  initialConfig?: object
}

export default function ProviderSetupGuide({ 
  isOpen, 
  onClose,
  provider
}: Props) {
  const router = useRouter()
  
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9990]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9991] flex items-center 
        justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl 
          max-w-md w-full p-6 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {provider === 'ollama' 
                ? '🦙 Set up Local AI' 
                : '🔑 Set up API Key'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 
                text-xl font-bold w-8 h-8 flex items-center 
                justify-center rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {provider === 'ollama' ? (
            <div className="space-y-3 text-sm text-gray-600">
              <p>Follow these steps to set up Ollama:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Download Ollama from{' '}
                  <a href="https://ollama.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] underline">
                    ollama.com
           
<truncated 2464 bytes>
ps://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between 
                    p-3 border border-gray-200 rounded-xl 
                    hover:border-[#FF6B4A] transition-colors">
                  <span className="font-semibold">OpenAI</span>
                  <span className="text-xs bg-blue-100 
                    text-blue-700 px-2 py-0.5 rounded-full 
                    font-bold">PAID</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 
                rounded-xl text-sm font-semibold text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                router.push('/setup')
              }}
              className="flex-1 px-4 py-2.5 bg-[#FF6B4A] 
                text-white rounded-xl text-sm font-semibold
                hover:bg-[#e55a3a] transition-colors"
            >
              Full Guide →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

Do not change settings/page.tsx or any other file.
Only replace ProviderSetupGuide.tsx.
```

## Prompt 17 (2026-06-12T05:40:25Z)

```
Fix /app/api/ollama-test/route.ts to handle 
trailing slashes and connection issues:

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let url = searchParams.get('url') || 'http://localhost:11434'
  const model = searchParams.get('model') || 'llama3'
  
  // Remove trailing slash
  url = url.replace(/\/$/, '')
  
  try {
    const res = await fetch(`${url}/api/tags`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    const data = await res.json()
    const models = data.models?.map((m: any) => m.name) || []
    const hasModel = models.some((m: string) => 
      m.startsWith(model.split(':')[0]))
    
    return Response.json({
      connected: true,
      models,
      hasModel,
      message: hasModel 
        ? `Connected — ${model} ready` 
        : `Connected but ${model} not found. Run: ollama pull ${model}`
    })
  } catch (e: any) {
    return Response.json({
      connected: false,
      message: `Ollama not running. Start with: ollama serve`,
      error: e.message
    })
  }
}
Also the real issue might be that the Next.js API route on the server can't reach 172.29.130.173 because it's a WSL-internal IP. The server-side fetch goes through Node.js on Windows which may not route to WSL.
Fix this by making the test call client-side instead. Paste this additional fix:
In /app/[locale]/settings/page.tsx 
replace the handleTestOllama function with 
a client-side direct fetch instead of going 
through the API route:

const handleTestOllama = async () => {
  setTestingOllama(true)
  setOllamaStatus(null)
  
  // Clean URL
  const cleanUrl = ollamaUrl.replace(/\/$/, '')
  
  try {
    // Try direct fetch from browser (client-side)
    // This works because the browser is on Windows 
    // which can reach WSL IP directly
    const res = await fetch(`${cleanUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    })
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    const data = await res.json()
    const models = data.models?.map((m: any) => m.name) || []
    const hasModel = models.some((m: string) => 
      m.startsWith(ollamaModel.split(':')[0]))
    
    setOllamaStatus({
      tested: true,
      connected: true,
      message: hasModel 
        ? `Connected — ${ollamaModel} ready ✓`
        : `Connected but ${ollamaModel} not pulled yet`
    })
  } catch (e: any) {
    setOllamaStatus({
      tested: true,
      connected: false,
      message: 'Cannot reach Ollama. Check URL and make sure ollama serve is running.'
    })
  } finally {
    setTestingOllama(false)
  }
}

Do not change anything else.
```

## Prompt 18 (2026-06-12T05:49:58Z)

```
Create a feedback page for ViralSpy.

═══════════════════════════════════════════════
DATABASE — Run this in Supabase SQL Editor first:
═══════════════════════════════════════════════

CREATE TABLE feedback (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email            text,
  user_name             text,
  overall_experience    text,
  ease_of_finding       text,
  design_rating         text,
  visually_appealing    text,
  navigation_ease       text,
  menu_clarity          text,
  loading_speed         text,
  technical_issues      text,
  trend_data_usefulness text,
  brief_quality         text,
  mobile_experience     text,
  device_used           text,
  recommend_likelihood  text,
  visit_again           text,
  overall_satisfaction  text,
  improvement_area      text,
  suggestions           text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_submit_feedback"
  ON feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "service_role_read_feedback"
  ON feedback FOR SELECT USING (true);

═══════════════════════════════════════════════
API ROUTE — Create /app/api/feedback/route.ts:
═══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('feedba
<truncated 5019 bytes>
"
- Subtext: "Your response helps us build ViralSpy
  better for every creator."
- Button: "Back to Dashboard →" → navigates to /dashboard

ERROR STATE:
If API returns error show a red toast at top:
"Something went wrong. Please try again."

SUBMIT LOGIC:
const handleSubmit = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()
  
  const payload = {
    ...formData,
    user_id: user?.id || null,
    user_email: user?.email || null,
    user_name: user?.user_metadata?.full_name || null,
  }
  
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const result = await res.json()
  if (result.success) setSubmitted(true)
  else setError('Something went wrong. Please try again.')
  setLoading(false)
}

NAVBAR:
Add "Feedback" link in navbar between 
"Saved Briefs" and "Settings".
Use MessageSquare icon from lucide-react.

PROGRESS INDICATOR:
At the top of the form show a progress bar
that fills as user answers more questions.
16 questions total.
"X of 16 questions answered" in muted text.
Bar fills coral as questions are answered.

SAFEGUARDS:
- Do NOT change any existing design tokens
- Do NOT modify any existing components
- Do NOT touch tsconfig.json or next.config.mjs
- Use SUPABASE_SERVICE_ROLE_KEY in API route
- Use supabase.auth.getUser() client-side for user details
- All existing routes unchanged
```

## Prompt 19 (2026-06-12T05:51:28Z)

```

```

## Prompt 20 (2026-06-12T05:57:05Z)

```
Fix authentication flow in ViralSpy.
Currently users are redirected to dashboard without logging in.
Force Google login only — no guest access.

═══════════════════════════════════════════════
STEP 1 — Fix /app/auth/callback/route.ts
═══════════════════════════════════════════════

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user_profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      // Create profile if doesn't exist
      if (!profile) {
        await supabase.from('user_profiles').insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          onboarded: false
        })
        return NextResponse.redirect(
          new URL('/onboarding', requestUrl.origin)
        )
      }

      // Redirect based on onboarding status
      if (!profile.onboarded) {
        return NextResponse.redirect(
          new URL('/onboarding', requestUrl.origin)
        )
      }

      return NextResponse.redirect(
        new URL('/dashboard', requestUrl.origin)
      )
    }
  }

  // If no code or user, go back to landing
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

═══════════════
<truncated 2899 bytes>
.nextUrl.pathname.startsWith('/auth')
  )

  // If not logged in and trying to access protected route
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If logged in and on landing page — go to dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ]
}

═══════════════════════════════════════════════
STEP 5 — Fix dashboard sign out button
═══════════════════════════════════════════════

In the dashboard navbar, the sign out button should:
await supabase.auth.signOut()
router.replace('/')

═══════════════════════════════════════════════
SAFEGUARDS:
═══════════════════════════════════════════════
- Do NOT change any UI design or colors
- Do NOT remove the Logo component
- Do NOT touch tsconfig.json or next.config.mjs
- Do NOT modify any API routes
- Keep all existing page content exactly as is
- Only change: auth flow + middleware + remove guest button
```

## Prompt 21 (2026-06-12T06:04:28Z)

```

```

## Prompt 22 (2026-06-12T06:18:58Z)

```
Fix the "Continue with Google" button on the landing page.
The button is not responding to clicks.

In /app/page.tsx (or wherever the landing page is),
replace the Google login button onClick with this exact code:

const handleGoogleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    if (error) {
      console.error('OAuth error:', error.message)
      alert(`Login error: ${error.message}`)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

Make sure:
1. The button has onClick={handleGoogleLogin} — not a form submit
2. The button is NOT inside an HTML <form> tag
3. The supabase client is imported from '@/lib/supabase'
   (client-side, not server-side)
4. The component has 'use client' at the top
5. Remove any e.preventDefault() that might be blocking it

Also add a console.log('Google login clicked') as the 
first line inside handleGoogleLogin so we can confirm
the click is registering.

Do not change anything else on the page.
```

## Prompt 23 (2026-06-12T06:27:13Z)

```
The auth callback is returning 404 on Vercel.
The app uses next-intl locale routing so routes are 
under /[locale]/.

Fix the auth callback:

1. Keep /app/auth/callback/route.ts exactly where it is
   (NOT under /[locale]/)

2. Make sure vercel.json has no rewrites that break this path

3. In Supabase → Authentication → URL Configuration:
   Site URL: https://viral-spy-eight.vercel.app
   Redirect URLs — add exactly:
   https://viral-spy-eight.vercel.app/auth/callback

4. In the auth callback route.ts, after successful login
   redirect to /en/dashboard (with locale prefix)
   not /dashboard:

   return NextResponse.redirect(
     new URL('/en/dashboard', requestUrl.origin)
   )
   
   And for onboarding:
   return NextResponse.redirect(
     new URL('/en/onboarding', requestUrl.origin)
   )

5. The Google OAuth redirectTo should be:
   redirectTo: `${window.location.origin}/auth/callback`
   (no locale prefix on the callback itself)

Do not change anything else.
```

## Prompt 24 (2026-06-12T06:33:55Z)

```
The auth callback is returning 404 on Vercel in production.
The app uses next-intl so all pages are under /[locale]/.

Do the following:

1. Check if /app/auth/callback/route.ts exists.
   If it does NOT exist, create it.
   If it exists under /app/[locale]/auth/callback/, 
   move it to /app/auth/callback/route.ts

2. The file content should be exactly:

import { createRouteHandlerClient } from 
  '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      if (!profile || !profile.onboarded) {
        return NextResponse.redirect(
          new URL('/en/onboarding', requestUrl.origin)
        )
      }

      return NextResponse.redirect(
        new URL('/en/dashboard', requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  )
}

3. Make sure next.config.mjs does NOT have any 
   middleware or rewrite that intercepts /auth/callback

4. In middleware.ts, add /auth to the list of 
   public routes that are never redirected:
   
   const publicRoutes = ['/', '/auth', '/auth/callback']
   const isPublic = publicRoutes.some(route =>
     req.nextUrl.pathname.startsWith(route)
   )
```

## Prompt 25 (2026-06-12T06:41:21Z)

```
In middleware.ts, update the matcher and public routes
to completely exclude /auth/callback from middleware.

Replace the entire middleware.ts with this:

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Completely skip middleware for auth routes
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes — always accessible
  const isPublic =
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname.startsWith('/auth') ||
    req.nextUrl.pathname.startsWith('/api')

  // Not logged in + protected route → back to landing
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Logged in + on landing page → go to dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(
      new URL('/en/dashboard', req.url)
    )
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|auth).*)',
  ]
}
```

## Prompt 26 (2026-06-12T06:46:11Z)

```
Replace middleware.ts completely with this minimal version:

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const pathname = req.nextUrl.pathname

  // Skip middleware entirely for these paths
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon')
  ) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Landing page — if logged in redirect to dashboard
  if (pathname === '/' || pathname === '') {
    if (session) {
      return NextResponse.redirect(
        new URL('/en/dashboard', req.url)
      )
    }
    return res
  }

  // Protected routes — if not logged in redirect to landing
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

## Prompt 27 (2026-06-12T06:51:56Z)

```
URGENT — disable middleware completely.

Replace the entire contents of middleware.ts with just this:

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}

That's it. No auth checks. No redirects. Nothing.
Just pass everything through.

Do not change any other file.
```

## Prompt 28 (2026-06-12T06:55:23Z)

```
URGENT — fix routing for Next.js 16 with next-intl.

The app uses Next.js 16.2.9 where middleware is deprecated.
Routes show as /[locale]/* but /en/* returns 404 on Vercel.

STEP 1 — Replace middleware.ts with proxy.ts:
Delete middleware.ts completely.
Create a new file called proxy.ts in the project root
with this content:

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'hi', 'te'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip for auth and api routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|auth).*)'
  ]
}

STEP 2 — Update next.config.mjs:
Make sure next-intl is configured correctly.
The localePrefix should be 'as-needed' so that
/dashboard works the same as /en/dashboard.

Check next.config.mjs and make sure it has:
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()
export default withNextIntl({
  // existing config
})

STEP 3 — Update i18n.ts routing config:
Make sure localePrefix is 'as-needed':

import { defineRouting } from 'next-intl/routing'
export const routing = defineRouting({
  locales: ['en', 'hi', 'te'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

With 'as-needed', the default locale (en) has NO prefix.
So /dashboard works directly instead of /en/dashboard.
/hi/dashboard works for Hindi.
/te/dashboard works for Telugu.

STEP 4 — Update auth callback redirects:
In /app/auth/callback/route.ts change redirects
from /en/dashboard to /dashboard
and from /en/onboarding to /onboarding:

return NextResponse.redirect(
  new URL('/dashboard', requestUrl.origin)
)

return NextResponse.redirect(
  new URL('/onboarding', requestUrl.origin)
)

STEP 5 — Update landing page redirect:
In /app/page.tsx or /app/[locale]/page.tsx,
any router.push('/en/dashboard') should become
router.push('/dashboard')

Do all 5 steps. Push to GitHub after.
```

## Prompt 29 (2026-06-12T08:06:34Z)

```
Make a doc with all the input prompts i gave and corresponding results achieved
```

