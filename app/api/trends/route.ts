import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

const MOCK_TRENDS = [
  {
    name: '5-4-3-2-1 grounding method',
    niche: 'fitness',
    platform: 'YOUTUBE',
    post_count: 142000,
    posts_per_hour: 4200,
    avg_posts_24h: 900,
    velocity_score: 466.67,
    momentum_status: 'EXPLODING',
    confidence_score: 0.91,
  },
  {
    name: 'girl dinner but make it gourmet',
    niche: 'food',
    platform: 'INSTAGRAM',
    post_count: 89000,
    posts_per_hour: 2800,
    avg_posts_24h: 600,
    velocity_score: 466.67,
    momentum_status: 'EXPLODING',
    confidence_score: 0.87,
  },
  {
    name: 'rent money investing thread',
    niche: 'finance',
    platform: 'REDDIT',
    post_count: 34000,
    posts_per_hour: 1100,
    avg_posts_24h: 280,
    velocity_score: 392.86,
    momentum_status: 'EXPLODING',
    confidence_score: 0.82,
  },
  {
    name: 'quiet luxury gym fits',
    niche: 'fashion',
    platform: 'INSTAGRAM',
    post_count: 210000,
    posts_per_hour: 3100,
    avg_posts_24h: 950,
    velocity_score: 326.32,
    momentum_status: 'EXPLODING',
    confidence_score: 0.79,
  },
  {
    name: 'protein coffee hack',
    niche: 'food',
    platform: 'YOUTUBE',
    post_count: 67000,
    posts_per_hour: 1900,
    avg_posts_24h: 620,
    velocity_score: 306.45,
    momentum_status: 'EXPLODING',
    confidence_score: 0.85,
  },
  {
    name: 'AI side hustle $500/day',
    niche: 'business',
    platform: 'YOUTUBE',
    post_count: 28000,
    posts_per_hour: 880,
    avg_posts_24h: 310,
    velocity_score: 283.87,
    momentum_status: 'RISING',
    confidence_score: 0.73,
  },
  {
    name: 'somatic shaking exercise',
    niche: 'fitness',
    platform: 'INSTAGRAM',
    post_count: 95000,
    posts_per_hour: 2200,
    avg_posts_24h: 820,
    velocity_score: 268.29,
    momentum_status: 'RISING',
    confidence_score: 0.76,
  },
  {
    name: 'hyper-realistic cake reveal',
    niche: 'food',
    platform: 'INSTAGRAM',
    post_count: 180000,
    posts_per_hour: 2600,
    avg_posts_24h: 1100,
    velocity_score: 236.36,
    momentum_status: 'RISING',
    confidence_score: 0.68,
  },
  {
    name: 'no-spend month challenge',
    niche: 'finance',
    platform: 'REDDIT',
    post_count: 52000,
    posts_per_hour: 1400,
    avg_posts_24h: 610,
    velocity_score: 229.51,
    momentum_status: 'RISING',
    confidence_score: 0.71,
  },
  {
    name: 'viral GRWM transition edit',
    niche: 'beauty',
    platform: 'INSTAGRAM',
    post_count: 310000,
    posts_per_hour: 3800,
    avg_posts_24h: 1700,
    velocity_score: 223.53,
    momentum_status: 'RISING',
    confidence_score: 0.65,
  },
  {
    name: 'barefoot running form breakdown',
    niche: 'fitness',
    platform: 'YOUTUBE',
    post_count: 19000,
    posts_per_hour: 620,
    avg_posts_24h: 290,
    velocity_score: 213.79,
    momentum_status: 'RISING',
    confidence_score: 0.69,
  },
  {
    name: 'budget meal prep $25/week',
    niche: 'food',
    platform: 'INSTAGRAM',
    post_count: 74000,
    posts_per_hour: 1700,
    avg_posts_24h: 820,
    velocity_score: 207.32,
    momentum_status: 'RISING',
    confidence_score: 0.72,
  },
  {
    name: 'index fund vs ETF explained',
    niche: 'finance',
    platform: 'YOUTUBE',
    post_count: 41000,
    posts_per_hour: 980,
    avg_posts_24h: 490,
    velocity_score: 200.0,
    momentum_status: 'RISING',
    confidence_score: 0.66,
  },
  {
    name: 'soft life aesthetic haul',
    niche: 'lifestyle',
    platform: 'INSTAGRAM',
    post_count: 128000,
    posts_per_hour: 2100,
    avg_posts_24h: 1100,
    velocity_score: 190.91,
    momentum_status: 'RISING',
    confidence_score: 0.61,
  },
  {
    name: 'cozy gaming setup tour',
    niche: 'gaming',
    platform: 'YOUTUBE',
    post_count: 56000,
    posts_per_hour: 890,
    avg_posts_24h: 610,
    velocity_score: 145.9,
    momentum_status: 'RISING',
    confidence_score: 0.58,
  },
  {
    name: 'neuro-spicy productivity hacks',
    niche: 'education',
    platform: 'REDDIT',
    post_count: 63000,
    posts_per_hour: 1600,
    avg_posts_24h: 700,
    velocity_score: 228.57,
    momentum_status: 'RISING',
    confidence_score: 0.74,
  },
  {
    name: 'travel hacking with points',
    niche: 'travel',
    platform: 'YOUTUBE',
    post_count: 31000,
    posts_per_hour: 740,
    avg_posts_24h: 330,
    velocity_score: 224.24,
    momentum_status: 'RISING',
    confidence_score: 0.7,
  },
  {
    name: 'borg drink recipe',
    niche: 'food',
    platform: 'REDDIT',
    post_count: 890000,
    posts_per_hour: 1200,
    avg_posts_24h: 3200,
    velocity_score: 37.5,
    momentum_status: 'PEAKED',
    confidence_score: 0.22,
  },
  {
    name: 'roman empire trend',
    niche: 'comedy',
    platform: 'REDDIT',
    post_count: 2100000,
    posts_per_hour: 800,
    avg_posts_24h: 4100,
    velocity_score: 19.51,
    momentum_status: 'PEAKED',
    confidence_score: 0.11,
  },
  {
    name: 'deinfluencing skincare',
    niche: 'beauty',
    platform: 'INSTAGRAM',
    post_count: 430000,
    posts_per_hour: 1500,
    avg_posts_24h: 2100,
    velocity_score: 71.43,
    momentum_status: 'PEAKED',
    confidence_score: 0.31,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trendId = searchParams.get('id')
  const supabase = createServerSupabaseClient()

  const getSimulatedTrends = () => {
    return MOCK_TRENDS.map((item, index) => {
      const baseVal = item.velocity_score
      return {
        id: `demo-trend-uuid-${index}`,
        name: item.name,
        niche: item.niche,
        platform: item.platform,
        post_count: item.post_count,
        posts_per_hour: item.posts_per_hour,
        avg_posts_24h: item.avg_posts_24h,
        velocity_score: item.velocity_score,
        momentum_status: item.momentum_status,
        confidence_score: item.confidence_score,
        detected_at: new Date(Date.now() - index * 3600000).toISOString(),
        raw_data: {
          sparkline: [
            parseFloat((baseVal * 0.4).toFixed(2)),
            parseFloat((baseVal * 0.6).toFixed(2)),
            parseFloat((baseVal * 0.8).toFixed(2)),
            baseVal,
          ],
        },
      }
    })
  }

  // If a single trend ID is requested
  if (trendId) {
    if (supabase && !trendId.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('trends')
          .select('*')
          .eq('id', trendId)
          .maybeSingle()

        if (data) {
          return NextResponse.json({ success: true, data })
        }
      } catch (err: any) {
        console.error('Error fetching trend from DB:', err.message)
      }
    }

    // Local simulation lookup
    const list = getSimulatedTrends()
    const match = trendId.match(/(\d+)$/)
    const index = match ? parseInt(match[1], 10) : 0
    const item = list[index] || list[0]
    item.id = trendId
    return NextResponse.json({ success: true, data: item })
  }

  // Fetch all trends
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .order('velocity_score', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Supabase trends error:', error.message, '| code:', error.code)
      }

      if (data && data.length > 0) {
        return NextResponse.json({ success: true, data })
      }
    } catch (err: any) {
      console.error('Error listing trends from DB:', err.message)
    }
  }

  // Local simulation fallback
  const fallbackList = getSimulatedTrends()
  fallbackList.sort((a, b) => b.velocity_score - a.velocity_score)
  return NextResponse.json({ success: true, data: fallbackList })
}
