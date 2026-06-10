import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { openai, isOpenAiConfigured } from '../../../lib/openai';
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

  let hook = `Your ${niche} routine is lying to you.`;
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
    hook = "Your nervous system is lying to you.";
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
    hook = "Stop making this viral recipe wrong.";
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
    const mockBrief = generateMockBrief("somatic shaking exercise", "fitness", "TIKTOK", 268.29, "RISING");
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

  if (!supabase) {
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
  const supabase = createServerSupabaseClient();
  
  try {
    const { trendId, userId, forceRegenerate } = await request.json();
    if (!trendId) {
      return NextResponse.json({ success: false, error: 'Missing trendId parameter.' }, { status: 400 });
    }

    if (supabase) {
      // Delete cached brief if forceRegenerate requested
      if (forceRegenerate) {
        await supabase
          .from('briefs')
          .delete()
          .eq('trend_id', trendId);
      } else {
        // Check if brief already exists
        const { data: existing, error: findError } = await supabase
          .from('briefs')
          .select('*')
          .eq('trend_id', trendId)
          .maybeSingle();

        if (!findError && existing) {
          const formatted = {
            ...existing,
            angles: typeof existing.angles === 'string' ? JSON.parse(existing.angles) : (existing.angles || []),
            hashtags: typeof existing.hashtags === 'string' ? JSON.parse(existing.hashtags) : (existing.hashtags || [])
          };
          return NextResponse.json({ success: true, data: formatted });
        }
      }
    }

    // Fetch the trend details
    let trendName = "somatic shaking exercise";
    let niche = "fitness";
    let platform = "TIKTOK";
    let velocityScore = 268.29;
    let momentumStatus = "RISING";
    let dbTrendId = trendId;

    if (supabase) {
      const { data: trendData } = await supabase
        .from('trends')
        .select('*')
        .eq('id', trendId)
        .maybeSingle();

      if (trendData) {
        trendName = trendData.name;
        niche = trendData.niche;
        platform = trendData.platform;
        velocityScore = Number(trendData.velocity_score);
        momentumStatus = trendData.momentum_status;
        dbTrendId = trendData.id;
      }
    }

    let strategistBrief = generateMockBrief(trendName, niche, platform, velocityScore, momentumStatus);

    if (isOpenAiConfigured() && openai) {
      try {
        const systemPrompt = `You are a viral content strategist who has helped 500+ creators hit 1M+ views.
Given a trending topic, generate a highly specific, actionable content brief.
Do NOT be generic. Every suggestion must be tailored to the exact trend.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "hook": "under-8-word killer opening line that stops the scroll",
  "angles": [
    { "title": "Angle name", "description": "2-sentence specific description of exactly what to film" },
    { "title": "Angle name", "description": "2-sentence specific description of exactly what to film" },
    { "title": "Angle name", "description": "2-sentence specific description of exactly what to film" }
  ],
  "format": "TALKING_HEAD or POV or DUET or TUTORIAL or STORYTIME or TRANSITION",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "best_post_time": "e.g. 6–8 PM weekdays, 11 AM–1 PM weekends",
  "estimated_reach": "e.g. 80K–300K views for a 10K-follower account",
  "script_outline": "Act 1 (0–3s): hook. Act 2 (3–20s): build. Act 3 (20–30s): payoff/CTA"
}`;

        const userPrompt = `Trend: ${trendName}
Niche: ${niche}
Platform: ${platform}
Current velocity: ${velocityScore} (posts/hour rate vs 24h average)
Momentum: ${momentumStatus}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        });

        const rawJson = response.choices[0].message.content || '';
        const parsed = JSON.parse(rawJson);
        if (parsed.hook && parsed.angles && parsed.format) {
          strategistBrief = parsed;
        }
      } catch (err: any) {
        console.warn('GPT-4o brief generation error, falling back to mock:', err.message);
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

    if (!supabase) {
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
        user_id: userId && userId !== 'demo-user-1234' ? userId : null, // Set null if guest
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
