import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient, createServerClient } from '../../../lib/supabase-server'
import { validateEnv } from '../../../lib/env'
import { generateBrief } from '../../../lib/ai-provider'
import { formatFewShotPrompt } from '@/lib/few-shot-examples'
import { getOllamaUrl } from '../../../lib/wsl-detect'
import { fetchCompetitorPosts } from '../../../lib/competitor-fetch'
import { Brief, BriefFormatType, Angle } from '../../../types'

function generateMockBrief(
  trendName: string,
  niche: string,
  platform: string,
  velocity: number,
  status: string
) {
  const cleanName = trendName.trim()
  const hashtags = [
    `#${cleanName.replace(/[^a-zA-Z0-9]/g, '')}`,
    `#${niche}tips`,
    `#viral${platform.toLowerCase()}`,
    '#creatorshacks',
    '#contentstrategy',
  ]

  let hook = `${trendName} is changing everything — here's why`
  let angles: Angle[] = [
    {
      title: `Why most fail the ${cleanName}`,
      description: `Break down the main pitfall creators encounter when attempting the ${cleanName} trend and present a simple fix.`,
    },
    {
      title: `POV: rating this viral trend`,
      description: `Film yourself in first-person attempting the ${cleanName} trend. Give an honest rating out of 10.`,
    },
    {
      title: `3 secrets of ${cleanName}`,
      description: `Explain the psychological hook that makes the ${cleanName} trend so addictive on ${platform} and how to copy it.`,
    },
  ]
  let format: BriefFormatType = 'TALKING_HEAD'

  // Customize mock briefs slightly by niche/trend name
  if (
    niche === 'fitness' ||
    cleanName.toLowerCase().includes('grounding') ||
    cleanName.toLowerCase().includes('shaking')
  ) {
    hook = `${trendName} is changing everything — here's why`
    format = 'POV'
    angles = [
      {
        title: 'The 3-second nervous reset',
        description: `Show the exact movement pattern of ${cleanName} in real-time, explaining the somatic response.`,
      },
      {
        title: "What gyms won't tell you",
        description: `Contrast typical physical routines against the ${cleanName} technique, highlighting the efficiency benefit.`,
      },
      {
        title: 'Stop doing standard workouts',
        description: `Explain the science behind somatic grounding and why ${cleanName} yields faster recovery rates.`,
      },
    ]
  } else if (
    niche === 'food' ||
    cleanName.toLowerCase().includes('dinner') ||
    cleanName.toLowerCase().includes('coffee')
  ) {
    hook = `${trendName} is changing everything — here's why`
    format = 'TUTORIAL'
    angles = [
      {
        title: 'The gourmet upgrade hack',
        description: `Upgrade the standard ${cleanName} recipe by adding one secret gourmet ingredient, showing the visual reaction.`,
      },
      {
        title: 'I rated the viral recipe',
        description: `Prepare the ${cleanName} step-by-step and give an honest aesthetic review of the final dish.`,
      },
      {
        title: '10-minute prep challenge',
        description: `Time yourself preparing the ${cleanName} in under 10 minutes for less than $5 total cost.`,
      },
    ]
  }

  return {
    hook,
    angles,
    format,
    hashtags,
    best_post_time: '6–8 PM weekdays, 11 AM–1 PM weekends',
    estimated_reach: '150K–450K views',
    script_outline: 'Act 1 (0–3s): hook. Act 2 (3–20s): build. Act 3 (20–30s): payoff/CTA',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const briefId = searchParams.get('id')
  const supabase = createServerSupabaseClient()

  if (!briefId) {
    return NextResponse.json(
      { success: false, error: 'Missing brief id parameter.' },
      { status: 400 }
    )
  }

  const getSimulatedBrief = () => {
    const mockBrief = generateMockBrief(
      'somatic shaking exercise',
      'fitness',
      'INSTAGRAM',
      268.29,
      'RISING'
    )
    return {
      id: briefId,
      trend_id: 'demo-trend-uuid-6',
      user_id: 'demo-user-1234',
      hook: mockBrief.hook,
      angles: mockBrief.angles,
      format: mockBrief.format,
      hashtags: mockBrief.hashtags,
      best_post_time: mockBrief.best_post_time,
      estimated_reach: mockBrief.estimated_reach,
      script_outline: mockBrief.script_outline,
      created_at: new Date().toISOString(),
    }
  }

  if (!supabase || briefId.startsWith('demo-')) {
    return NextResponse.json({ success: true, data: getSimulatedBrief() })
  }

  try {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .maybeSingle()

    if (error) throw error

    if (data) {
      // Ensure hashtags and angles are parsed correctly
      const formatted = {
        ...data,
        angles: typeof data.angles === 'string' ? JSON.parse(data.angles) : data.angles || [],
        hashtags:
          typeof data.hashtags === 'string' ? JSON.parse(data.hashtags) : data.hashtags || [],
      }
      return NextResponse.json({ success: true, data: formatted })
    }
  } catch (e: any) {
    console.error('Brief error:', e)
    return Response.json(
      {
        error: e.message,
        stack: e.stack?.split('\n').slice(0, 3).join(' | '),
      },
      { status: 500 }
    )
  }

  // Fallback to local brief
  return NextResponse.json({ success: true, data: getSimulatedBrief() })
}

export async function POST(req: Request) {
  console.log('Brief API called:', {
    isVercel: process.env.VERCEL,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })

  const body = await req.json()
  req.json = async () => body
  const rawTrend = body.trend || body
  const trend = {
    name: rawTrend.name || rawTrend.trendName || '',
    niche: rawTrend.niche || '',
    platform: rawTrend.platform || '',
    velocity_score: rawTrend.velocity_score || rawTrend.velocityScore || 0,
    momentum_status: rawTrend.momentum_status || rawTrend.momentumStatus || '',
    id: rawTrend.id || rawTrend.trendId || '',
  }

  const isVercel = process.env.VERCEL === '1'

  if (isVercel) {
    // Try Groq first (free), fall back to OpenAI
    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    const apiKey = groqKey || openaiKey
    const baseUrl = groqKey ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1'
    const model = groqKey ? 'llama-3.3-70b-versatile' : 'gpt-4o'

    console.log('Vercel brief generation:', {
      usingGroq: !!groqKey,
      usingOpenAI: !!openaiKey,
      model,
    })

    if (!apiKey) {
      return Response.json(
        {
          error: 'No AI API key configured on Vercel.',
          details: 'Add GROQ_API_KEY or OPENAI_API_KEY to Vercel environment variables.',
        },
        { status: 500 }
      )
    }

    try {
      const body = await req.json()
      const trend = body.trend || body
      const fewShotContext = formatFewShotPrompt(trend.niche)

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          temperature: 0.8,
          messages: [
            {
              role: 'system',
              content: `You are a viral content strategist who helped 
500+ creators hit 1M+ views. Generate a highly specific, 
actionable content brief tailored to the exact trend.
Do NOT be generic. Every suggestion must be specific 
to this exact trend and niche.
${fewShotContext}
Respond ONLY with valid JSON, no markdown, no preamble:
{
  "hook": "under-8-word killer opening line that stops the scroll",
  "angles": [
    {"title": "ANGLE NAME IN CAPS", "description": "2-sentence specific description of exactly what to film"},
    {"title": "ANGLE NAME IN CAPS", "description": "2-sentence specific description of exactly what to film"},
    {"title": "ANGLE NAME IN CAPS", "description": "2-sentence specific description of exactly what to film"}
  ],
  "format": "TALKING_HEAD or POV or DUET or TUTORIAL or STORYTIME or TRANSITION",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "best_post_time": "e.g. 6-8 PM IST weekdays",
  "estimated_reach": "e.g. 80K-300K views for 10K followers",
  "script_outline": "Act 1 (0-3s): hook. Act 2 (3-20s): build. Act 3 (20-30s): CTA"
}`,
            },
            {
              role: 'user',
              content: `Trend: ${trend.name}
Niche: ${trend.niche}
Platform: ${trend.platform}
Velocity score: ${trend.velocity_score}
Momentum: ${trend.momentum_status}
Generate a specific content brief for this exact trend.`,
            },
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('AI API error:', data)
        return Response.json(
          {
            error: 'AI API error',
            details: data.error?.message || JSON.stringify(data),
          },
          { status: 500 }
        )
      }

      const content = data.choices[0]?.message?.content || ''
      console.log('AI response received, length:', content.length)

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return Response.json(
          {
            error: 'Invalid AI response',
            details: content.slice(0, 200),
          },
          { status: 500 }
        )
      }

      const brief = JSON.parse(jsonMatch[0])

      // Save to Supabase
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: savedBrief, error: saveError } = await supabase
        .from('briefs')
        .insert({
          trend_id: trend.id,
          hook: brief.hook,
          angles: brief.angles,
          format: brief.format,
          hashtags: brief.hashtags,
          best_post_time: brief.best_post_time,
          estimated_reach: brief.estimated_reach,
          script_outline: brief.script_outline,
          model_used: model,
          prompt_version: 1,
        })
        .select()
        .single()

      if (saveError) {
        console.error('Supabase save error:', saveError.message)
        return Response.json({
          data: { ...brief, id: 'temp-' + Date.now(), trend_id: trend.id },
          cached: false,
          warning: 'Brief generated but not saved: ' + saveError.message,
        })
      }

      console.log('Brief saved successfully:', savedBrief.id)

      return Response.json({
        data: { ...savedBrief, ...brief },
        cached: false,
      })
    } catch (error: any) {
      console.error('Brief generation exception:', error)
      return Response.json(
        {
          error: 'Brief generation failed',
          details: error.message,
        },
        { status: 500 }
      )
    }
  }

  // On Vercel, Ollama is unavailable — force OpenAI
  const provider = isVercel ? 'openai' : req.headers.get('x-ai-provider') || 'openai'

  const providerConfig = isVercel
    ? {
        provider: 'openai' as const,
        apiKey: process.env.OPENAI_API_KEY!,
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        ollamaUrl: '',
        ollamaModel: '',
      }
    : {
        provider,
        apiKey: req.headers.get('x-byok-key') || process.env.OPENAI_API_KEY!,
        baseUrl: req.headers.get('x-byok-base-url') || 'https://api.openai.com/v1',
        model: req.headers.get('x-byok-model') || 'gpt-4o',
        ollamaUrl: req.headers.get('x-ollama-url') || '',
        ollamaModel: req.headers.get('x-ollama-model') || '',
      }

  console.log('Brief generation config:', {
    provider: providerConfig.provider,
    isVercel,
    hasApiKey: !!providerConfig.apiKey,
  })

  validateEnv()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const serviceRoleKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const supabase =
    supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : null

  try {
    const body = await req.json()
    const { trendId, userId, forceRegenerate, preGenerated, briefData: preGeneratedBrief } = body
    let trendName = body.trendName
    console.log('Brief API called with:', { trendId, trendName })

    if (preGenerated && preGeneratedBrief && trendId) {
      // Brief already generated, just save to Supabase
      const supabase = createServerClient()

      // Verify trend exists
      const { data: trend } = await supabase.from('trends').select('id').eq('id', trendId).single()

      if (!trend) {
        return Response.json({ error: 'Trend not found' }, { status: 404 })
      }

      const { data: saved, error } = await supabase
        .from('briefs')
        .insert({
          trend_id: trendId,
          hook: preGeneratedBrief.hook,
          angles: preGeneratedBrief.angles,
          format: preGeneratedBrief.format || 'TALKING_HEAD',
          hashtags: preGeneratedBrief.hashtags,
          best_post_time: preGeneratedBrief.best_post_time,
          estimated_reach: preGeneratedBrief.estimated_reach,
          script_outline: preGeneratedBrief.script_outline,
          model_used: 'ollama/llama3',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Brief save error:', error)
        return Response.json({ error: error.message }, { status: 500 })
      }

      return Response.json({ data: saved })
    }
    let niche = body.niche
    let platform = body.platform
    let velocityScore = body.velocityScore
    let momentumStatus = body.momentumStatus

    // Log the incoming request body at the top of POST handler
    console.log('Brief request:', {
      trendId,
      trendName,
      niche,
      platform,
      velocityScore,
      momentumStatus,
      preGenerated: !!preGenerated,
    })

    if (!trendId) {
      return NextResponse.json(
        { success: false, error: 'Missing trendId parameter.' },
        { status: 400 }
      )
    }

    // Only use Supabase if trendId is a real UUID (not a demo placeholder)
    const isRealTrend = supabase && !trendId.startsWith('demo-')

    if (isRealTrend) {
      // Delete cached brief if forceRegenerate requested
      if (forceRegenerate) {
        await supabase!.from('briefs').delete().eq('trend_id', trendId)
      } else {
        // Check cache by trend_id specifically:
        const { data: cached } = await supabase!
          .from('briefs')
          .select('*')
          .eq('trend_id', trendId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (cached) {
          const formatted = {
            ...cached,
            angles:
              typeof cached.angles === 'string' ? JSON.parse(cached.angles) : cached.angles || [],
            hashtags:
              typeof cached.hashtags === 'string'
                ? JSON.parse(cached.hashtags)
                : cached.hashtags || [],
          }
          return Response.json({ success: true, data: formatted })
        }
      }
    }

    // Fetch the trend details
    let dbTrendId = trendId

    if (isRealTrend && !trendName) {
      const { data: trendData } = await supabase
        .from('trends')
        .select('*')
        .eq('id', trendId)
        .maybeSingle()

      // After fetching trend data, ensure it exists
      if (!trendData) {
        return NextResponse.json({ success: false, error: 'Trend not found' }, { status: 404 })
      }
      trendName = trendData.name
      niche = trendData.niche
      platform = trendData.platform
      velocityScore = Number(trendData.velocity_score)
      momentumStatus = trendData.momentum_status
      dbTrendId = trendData.id
    }

    let strategistBrief: any

    if (preGenerated && preGeneratedBrief) {
      // Browser already called Ollama — use the pre-generated result directly
      strategistBrief = preGeneratedBrief
    } else {
      try {
        const apiProvider = providerConfig.provider === 'ollama' ? 'ollama' : 'byok'
        const byokProvider = isVercel
          ? 'openai'
          : ((req.headers.get('x-byok-provider') || 'openai') as 'gemini' | 'openai' | 'custom')
        const ollamaUrl = getOllamaUrl(providerConfig.ollamaUrl || 'http://localhost:11434')
        const lang = req.headers.get('x-locale') || 'en'

        // Fetch real competitor posts to enrich the prompt
        const competitors = await fetchCompetitorPosts(trendName, platform)
        console.log(`Fetched ${competitors.length} competitor posts for ${trendName}`)

        const briefResult = await generateBrief(
          { trendName, niche, platform, velocityScore, momentumStatus },
          apiProvider,
          {
            byokProvider,
            byokKey: providerConfig.apiKey,
            byokBaseUrl: providerConfig.baseUrl,
            byokModel: providerConfig.model,
            ollamaUrl,
            ollamaModel: providerConfig.ollamaModel,
            lang,
            competitors,
          }
        )

        if (briefResult && typeof briefResult === 'object' && 'hook' in briefResult) {
          strategistBrief = briefResult as any
          // Stash metadata for Supabase insert
          ;(strategistBrief as any)._meta = {
            model: providerConfig.ollamaModel || providerConfig.model || 'default',
          }
        } else {
          throw new Error('Invalid AI response format')
        }
      } catch (e: any) {
        console.error('Brief error:', e)
        return Response.json(
          {
            error: e.message,
            stack: e.stack?.split('\n').slice(0, 3).join(' | '),
          },
          { status: 500 }
        )
      }
    }

    const briefData = {
      trend_id: dbTrendId,
      user_id: userId || '00000000-0000-0000-0000-000000000000',
      hook: strategistBrief.hook,
      angles: strategistBrief.angles,
      format: strategistBrief.format,
      hashtags: strategistBrief.hashtags,
      best_post_time: strategistBrief.best_post_time,
      estimated_reach: strategistBrief.estimated_reach,
      script_outline: strategistBrief.script_outline,
      created_at: new Date().toISOString(),
    }

    // Only use fallback (no DB save) if trendId is a demo placeholder
    if (!supabase || trendId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        data: {
          id: `demo-brief-uuid-${Date.now()}`,
          ...briefData,
        },
      })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('briefs')
      .insert({
        trend_id: briefData.trend_id,
        user_id: userId && !userId.startsWith('demo-') ? userId : null,
        hook: briefData.hook,
        angles: JSON.stringify(briefData.angles),
        format: briefData.format,
        hashtags: JSON.stringify(briefData.hashtags),
        best_post_time: briefData.best_post_time,
        estimated_reach: briefData.estimated_reach,
        script_outline: briefData.script_outline,
        model_used: strategistBrief._meta?.model || 'default',
        prompt_version: 2,
      })
      .select()
      .single()

    if (insertError) throw insertError

    if (inserted) {
      const formatted = {
        ...inserted,
        angles:
          typeof inserted.angles === 'string' ? JSON.parse(inserted.angles) : inserted.angles || [],
        hashtags:
          typeof inserted.hashtags === 'string'
            ? JSON.parse(inserted.hashtags)
            : inserted.hashtags || [],
      }
      return NextResponse.json({ success: true, data: formatted })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to return inserted brief.' },
      { status: 500 }
    )
  } catch (e: any) {
    console.error('Brief error:', e)
    return Response.json(
      {
        error: e.message,
        stack: e.stack?.split('\n').slice(0, 3).join(' | '),
      },
      { status: 500 }
    )
  }
}
