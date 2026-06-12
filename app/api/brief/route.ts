import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { validateEnv } from '../../../lib/env';
import { generateBrief } from '../../../lib/ai-provider';
import { getOllamaUrl } from '../../../lib/wsl-detect';
import { Brief, BriefFormatType, Angle } from '../../../types';

function generateMockBrief(
  trendName: string,
  niche: string,
  platform: string,
  velocity: number,
  status: string
) {
  const cleanName = trendName.trim();
  const hashtags = [
    `#${cleanName.replace(/[^a-zA-Z0-9]/g, '')}`,
    `#${niche}tips`,
    `#viral${platform.toLowerCase()}`,
    '#creatorshacks',
    '#contentstrategy'
  ];

  let hook = `${trendName} is changing everything — here's why`;
  let angles: Angle[] = [
    {
      title: `Why most fail the ${cleanName}`,
      description: `Break down the main pitfall creators encounter when attempting the ${cleanName} trend and present a simple fix.`
    },
    {
      title: `POV: rating this viral trend`,
      description: `Film yourself in first-person attempting the ${cleanName} trend. Give an honest rating out of 10.`
    },
    {
      title: `3 secrets of ${cleanName}`,
      description: `Explain the psychological hook that makes the ${cleanName} trend so addictive on ${platform} and how to copy it.`
    }
  ];
  let format: BriefFormatType = 'TALKING_HEAD';

  // Customize mock briefs slightly by niche/trend name
  if (niche === 'fitness' || cleanName.toLowerCase().includes('grounding') || cleanName.toLowerCase().includes('shaking')) {
    hook = `${trendName} is changing everything — here's why`;
    format = 'POV';
    angles = [
      {
        title: "The 3-second nervous reset",
        description: `Show the exact movement pattern of ${cleanName} in real-time, explaining the somatic response.`
      },
      {
        title: "What gyms won't tell you",
        description: `Contrast typical physical routines against the ${cleanName} technique, highlighting the efficiency benefit.`
      },
      {
        title: "Stop doing standard workouts",
        description: `Explain the science behind somatic grounding and why ${cleanName} yields faster recovery rates.`
      }
    ];
  } else if (niche === 'food' || cleanName.toLowerCase().includes('dinner') || cleanName.toLowerCase().includes('coffee')) {
    hook = `${trendName} is changing everything — here's why`;
    format = 'TUTORIAL';
    angles = [
      {
        title: "The gourmet upgrade hack",
        description: `Upgrade the standard ${cleanName} recipe by adding one secret gourmet ingredient, showing the visual reaction.`
      },
      {
        title: "I rated the viral recipe",
        description: `Prepare the ${cleanName} step-by-step and give an honest aesthetic review of the final dish.`
      },
      {
        title: "10-minute prep challenge",
        description: `Time yourself preparing the ${cleanName} in under 10 minutes for less than $5 total cost.`
      }
    ];
  }

  return {
    hook,
    angles,
    format,
    hashtags,
    best_post_time: '6–8 PM weekdays, 11 AM–1 PM weekends',
    estimated_reach: '150K–450K views',
    script_outline: 'Act 1 (0–3s): hook. Act 2 (3–20s): build. Act 3 (20–30s): payoff/CTA'
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const briefId = searchParams.get('id');
  const supabase = createServerSupabaseClient();

  if (!briefId) {
    return NextResponse.json({ success: false, error: 'Missing brief id parameter.' }, { status: 400 });
  }

  const getSimulatedBrief = () => {
    const mockBrief = generateMockBrief("somatic shaking exercise", "fitness", "INSTAGRAM", 268.29, "RISING");
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
      created_at: new Date().toISOString()
    };
  };

  if (!supabase || briefId.startsWith('demo-')) {
    return NextResponse.json({ success: true, data: getSimulatedBrief() });
  }

  try {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      // Ensure hashtags and angles are parsed correctly
      const formatted = {
        ...data,
        angles: typeof data.angles === 'string' ? JSON.parse(data.angles) : (data.angles || []),
        hashtags: typeof data.hashtags === 'string' ? JSON.parse(data.hashtags) : (data.hashtags || [])
      };
      return NextResponse.json({ success: true, data: formatted });
    }
  } catch (err: any) {
    console.error('Error fetching brief from DB:', err.message);
  }

  // Fallback to local brief
  return NextResponse.json({ success: true, data: getSimulatedBrief() });
}

export async function POST(request: Request) {
  validateEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const serviceRoleKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;
  
  try {
    const body = await request.json();
    const { trendId, userId, forceRegenerate, preGenerated, briefData: preGeneratedBrief } = body;
    let trendName = body.trendName;
    let niche = body.niche;
    let platform = body.platform;
    let velocityScore = body.velocityScore;
    let momentumStatus = body.momentumStatus;

    // Log the incoming request body at the top of POST handler
    console.log('Brief request:', { 
      trendId, 
      trendName, 
      niche, 
      platform, 
      velocityScore, 
      momentumStatus,
      preGenerated: !!preGenerated
    });

    if (!trendId) {
      return NextResponse.json({ success: false, error: 'Missing trendId parameter.' }, { status: 400 });
    }

    // Only use Supabase if trendId is a real UUID (not a demo placeholder)
    const isRealTrend = supabase && !trendId.startsWith('demo-');

    if (isRealTrend) {
      // Delete cached brief if forceRegenerate requested
      if (forceRegenerate) {
        await supabase!
          .from('briefs')
          .delete()
          .eq('trend_id', trendId);
      } else {
        // Check cache by trend_id specifically:
        const { data: cached } = await supabase!
          .from('briefs')
          .select('*')
          .eq('trend_id', trendId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (cached) {
          const formatted = {
            ...cached,
            angles: typeof cached.angles === 'string' ? JSON.parse(cached.angles) : (cached.angles || []),
            hashtags: typeof cached.hashtags === 'string' ? JSON.parse(cached.hashtags) : (cached.hashtags || [])
          };
          return Response.json({ success: true, data: formatted });
        }
      }
    }

    // Fetch the trend details
    let dbTrendId = trendId;

    if (isRealTrend && !trendName) {
      const { data: trendData } = await supabase
        .from('trends')
        .select('*')
        .eq('id', trendId)
        .maybeSingle();

      // After fetching trend data, ensure it exists
      if (!trendData) {
        return NextResponse.json({ success: false, error: 'Trend not found' }, { status: 404 });
      }
      trendName = trendData.name;
      niche = trendData.niche;
      platform = trendData.platform;
      velocityScore = Number(trendData.velocity_score);
      momentumStatus = trendData.momentum_status;
      dbTrendId = trendData.id;
    }

    let strategistBrief: any;

    if (preGenerated && preGeneratedBrief) {
      // Browser already called Ollama — use the pre-generated result directly
      strategistBrief = preGeneratedBrief;
    } else {
      try {
        const provider = (request.headers.get('x-ai-provider') 
          || 'ollama') as 'ollama' | 'byok'
        const byokProvider = (request.headers.get('x-byok-provider') 
          || 'openai') as 'gemini' | 'openai' | 'custom'
        const byokKey = request.headers.get('x-byok-key') || ''
        const byokBaseUrl = request.headers.get('x-byok-base-url') 
          || 'https://api.openai.com/v1'
        const byokModel = request.headers.get('x-byok-model') || ''
        const requestedOllamaUrl = request.headers.get('x-ollama-url') 
          || 'http://localhost:11434'
        const ollamaUrl = getOllamaUrl(requestedOllamaUrl)
        const ollamaModel = request.headers.get('x-ollama-model') 
          || 'llama3'
        const lang = request.headers.get('x-locale') || 'en'

        const briefResult = await generateBrief(
          { trendName, niche, platform, velocityScore, momentumStatus },
          provider,
          { byokProvider, byokKey, byokBaseUrl, byokModel, ollamaUrl, ollamaModel, lang }
        );
        
        if (briefResult && typeof briefResult === 'object' && 'hook' in briefResult) {
          strategistBrief = briefResult as any;
        } else {
          throw new Error('Invalid AI response format');
        }
      } catch (error: any) {
        return Response.json({ 
          error: error.message 
        }, { status: 500 })
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
      created_at: new Date().toISOString()
    };

    // Only use fallback (no DB save) if trendId is a demo placeholder
    if (!supabase || trendId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        data: {
          id: `demo-brief-uuid-${Date.now()}`,
          ...briefData
        }
      });
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
        script_outline: briefData.script_outline
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (inserted) {
      const formatted = {
        ...inserted,
        angles: typeof inserted.angles === 'string' ? JSON.parse(inserted.angles) : (inserted.angles || []),
        hashtags: typeof inserted.hashtags === 'string' ? JSON.parse(inserted.hashtags) : (inserted.hashtags || [])
      };
      return NextResponse.json({ success: true, data: formatted });
    }

    return NextResponse.json({ success: false, error: 'Failed to return inserted brief.' }, { status: 500 });

  } catch (err: any) {
    console.error('Error in POST briefs API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
