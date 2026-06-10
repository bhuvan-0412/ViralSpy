import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { computeVelocityScore } from '../../../lib/velocity';

// Helper to parse ISO 8601 duration format into seconds
function parseISO8601DurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper to map title/tags keywords to niche type
function matchNicheByKeyword(title: string, tags: string[]): string {
  const combined = `${title} ${tags.join(' ')}`.toLowerCase();
  
  if (/\b(fitness|gym|workout|exercise|run|somatic|lift|bodyweight|stretch|stretches)\b/.test(combined)) return 'fitness';
  if (/\b(recipe|coffee|dinner|meal|food|cook|kitchen|bake|cake|gourmet|prep)\b/.test(combined)) return 'food';
  if (/\b(money|invest|fund|etf|stock|cash|crypto|rich|save|budget|finance|hustle)\b/.test(combined)) return 'finance';
  if (/\b(outfit|fit|style|luxury|wear|clothing|dress|fashion|fits)\b/.test(combined)) return 'fashion';
  if (/\b(skincare|makeup|grwm|beauty|routine|hair|glow)\b/.test(combined)) return 'beauty';
  if (/\b(technology|gadget|ai|phone|keyboard|software|code|programming|tech)\b/.test(combined)) return 'tech';
  if (/\b(gaming|setup|gamer|xbox|playstation|nintendo|game|games)\b/.test(combined)) return 'gaming';
  if (/\b(travel|solotravel|trip|flight|explore|hotel|points|vacation)\b/.test(combined)) return 'travel';
  if (/\b(learn|study|tutorial|explain|guide|howto|hack|education)\b/.test(combined)) return 'education';
  if (/\b(selfimprovement|minimalism|routine|life|aesthetic|vlog|grounding|comedy|funny|joke|skit)\b/.test(combined)) {
    if (combined.includes('grounding') || combined.includes('minimalism')) return 'lifestyle';
    return 'comedy';
  }
  
  return 'lifestyle';
}

// 1. YouTube Shorts Poller
async function pollYouTubeShorts(apiKey: string, supabaseClient: any) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    // Filter for Shorts (< 60s)
    const shorts = data.items.filter((item: any) => {
      const duration = item.contentDetails?.duration || '';
      const seconds = parseISO8601DurationToSeconds(duration);
      return seconds > 0 && seconds < 60;
    });

    if (shorts.length === 0) return null;
    const item = shorts[Math.floor(Math.random() * shorts.length)];
    const title = item.snippet.title;
    const tags = item.snippet.tags || [];
    const viewCount = parseInt(item.statistics.viewCount || '10000', 10);

    const niche = matchNicheByKeyword(title, tags);

    // Get existing trend to calculate delta
    let previousCount = 0;
    if (supabaseClient) {
      const { data: existing } = await supabaseClient
        .from('trends')
        .select('post_count')
        .eq('name', title)
        .maybeSingle();
      if (existing) previousCount = existing.post_count;
    }

    const postsPerHour = previousCount > 0 ? Math.max(10, viewCount - previousCount) : Math.round(viewCount * 0.05);
    const cappedPph = Math.min(5000, Math.max(10, postsPerHour));
    const avgPosts24h = Math.max(5, Math.round(cappedPph * (0.35 + Math.random() * 0.15)));

    return {
      name: title.substring(0, 100),
      niche,
      platform: 'YOUTUBE' as const,
      post_count: viewCount,
      posts_per_hour: cappedPph,
      avg_posts_24h: avgPosts24h,
      confidence_score: 0.90,
      detected_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('YouTube poll failed:', err);
    return null;
  }
}

// 2. Instagram Reels (RapidAPI Scraper) Poller
async function pollInstagramReels(rapidApiKey: string, supabaseClient: any) {
  try {
    const keywords = ['fitness', 'food', 'finance', 'fashion', 'beauty', 'tech', 'gaming', 'travel', 'education', 'lifestyle'];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const url = `https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${keyword}`;
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    });
    const result = await res.json();
    if (!result.data || !result.data.media_count) return null;

    const mediaCount = result.data.media_count;
    const name = `${keyword} trend reel`;

    let previousCount = 0;
    if (supabaseClient) {
      const { data: existing } = await supabaseClient
        .from('trends')
        .select('post_count')
        .eq('name', name)
        .maybeSingle();
      if (existing) previousCount = existing.post_count;
    }

    const postsPerHour = previousCount > 0 ? Math.max(5, mediaCount - previousCount) : Math.round(500 + Math.random() * 1000);
    const cappedPph = Math.min(5000, Math.max(10, postsPerHour));
    const avgPosts24h = Math.max(5, Math.round(cappedPph * (0.35 + Math.random() * 0.15)));

    return {
      name,
      niche: keyword,
      platform: 'INSTAGRAM' as const,
      post_count: mediaCount,
      posts_per_hour: cappedPph,
      avg_posts_24h: avgPosts24h,
      confidence_score: 0.85,
      detected_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('Instagram poll failed:', err);
    return null;
  }
}

// 3. Reddit Rising (Free API) Poller
async function pollRedditRising() {
  try {
    const subredditsMap: Record<string, string[]> = {
      fitness: ['fitness', 'bodyweightfitness'],
      food: ['food', 'recipes'],
      finance: ['personalfinance', 'investing'],
      fashion: ['femalefashionadvice', 'malefashionadvice'],
      beauty: ['SkincareAddiction', 'makeupaddiction'],
      tech: ['technology', 'gadgets'],
      gaming: ['gaming', 'Games'],
      travel: ['travel', 'solotravel'],
      education: ['learnprogramming', 'GetStudying'],
      lifestyle: ['selfimprovement', 'minimalism']
    };

    const niches = Object.keys(subredditsMap);
    const niche = niches[Math.floor(Math.random() * niches.length)];
    const subs = subredditsMap[niche];
    const sub = subs[Math.floor(Math.random() * subs.length)];

    const url = `https://www.reddit.com/r/${sub}/rising.json?limit=10`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ViralSpy/1.0' }
    });
    const result = await res.json();
    if (!result.data || !result.data.children || result.data.children.length === 0) return null;

    const post = result.data.children[Math.floor(Math.random() * Math.min(5, result.data.children.length))].data;
    const title = post.title;
    const score = post.score || 0;
    const numComments = post.num_comments || 0;

    const postsPerHour = score + numComments;
    const cappedPph = Math.min(3000, Math.max(10, postsPerHour));
    const avgPosts24h = Math.max(5, Math.round(cappedPph * (0.35 + Math.random() * 0.15)));

    return {
      name: title.substring(0, 100),
      niche,
      platform: 'REDDIT' as const,
      post_count: score,
      posts_per_hour: cappedPph,
      avg_posts_24h: avgPosts24h,
      confidence_score: 0.88,
      detected_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('Reddit poll failed:', err);
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  
  const ytApiKey = process.env.YOUTUBE_API_KEY || '';
  const igApiKey = process.env.RAPIDAPI_INSTAGRAM_KEY || '';
  
  const ytApiKeyActive = ytApiKey && !ytApiKey.includes('placeholder') && !ytApiKey.includes('your_youtube_api_key');
  const igApiKeyActive = igApiKey && !igApiKey.includes('placeholder') && !igApiKey.includes('your_instagram_key');

  const polledTrends = [];

  // Source 1: YouTube Shorts
  if (ytApiKeyActive) {
    const ytTrend = await pollYouTubeShorts(ytApiKey, supabase);
    if (ytTrend) polledTrends.push(ytTrend);
  } else {
    // YouTube Shorts Mock
    polledTrends.push({
      name: "barefoot running form breakdown",
      niche: "fitness",
      platform: "YOUTUBE" as const,
      post_count: 22000,
      posts_per_hour: 450,
      avg_posts_24h: 120,
      confidence_score: 0.90,
      detected_at: new Date().toISOString()
    });
  }

  // Source 2: Instagram Reels
  if (igApiKeyActive) {
    const igTrend = await pollInstagramReels(igApiKey, supabase);
    if (igTrend) polledTrends.push(igTrend);
  } else {
    // Instagram Reels Mock
    polledTrends.push({
      name: "girl dinner but make it gourmet",
      niche: "food",
      platform: "INSTAGRAM" as const,
      post_count: 91000,
      posts_per_hour: 2900,
      avg_posts_24h: 620,
      confidence_score: 0.87,
      detected_at: new Date().toISOString()
    });
  }

  // Source 3: Reddit Rising
  const redditTrend = await pollRedditRising();
  if (redditTrend) {
    polledTrends.push(redditTrend);
  } else {
    // Reddit Rising Mock
    polledTrends.push({
      name: "rent money investing thread",
      niche: "finance",
      platform: "REDDIT" as const,
      post_count: 35000,
      posts_per_hour: 1200,
      avg_posts_24h: 300,
      confidence_score: 0.82,
      detected_at: new Date().toISOString()
    });
  }

  const upsertedList = [];

  for (const trend of polledTrends) {
    const velocityResult = computeVelocityScore(trend.posts_per_hour, trend.avg_posts_24h);
    const trendData = {
      ...trend,
      velocity_score: velocityResult.score,
      momentum_status: velocityResult.status
    };

    if (!supabase) {
      upsertedList.push({
        id: `demo-trend-polled-${Math.random().toString(36).substring(2, 9)}`,
        ...trendData
      });
      continue;
    }

    try {
      const { data: upserted, error: upsertError } = await supabase
        .from('trends')
        .upsert(
          {
            name: trendData.name,
            niche: trendData.niche,
            platform: trendData.platform,
            post_count: trendData.post_count,
            posts_per_hour: trendData.posts_per_hour,
            avg_posts_24h: trendData.avg_posts_24h,
            velocity_score: trendData.velocity_score,
            momentum_status: trendData.momentum_status,
            confidence_score: trendData.confidence_score,
            detected_at: trendData.detected_at,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'name' }
        )
        .select()
        .single();

      if (upsertError) {
        console.error('Failed to upsert trend:', upsertError.message);
        continue;
      }

      if (upserted) {
        // Insert snapshot row
        const { error: snapError } = await supabase
          .from('trend_snapshots')
          .insert({
            trend_id: upserted.id,
            post_count: upserted.post_count,
            posts_per_hour: upserted.posts_per_hour,
            velocity_score: upserted.velocity_score,
            snapped_at: new Date().toISOString()
          });

        if (snapError) {
          console.error('Failed to insert snapshot:', snapError.message);
        }

        // Call database RPC compute_velocity_score(trend_id)
        try {
          await supabase.rpc('compute_velocity_score', { trend_id: upserted.id });
        } catch (rpcErr: any) {
          console.warn('Supabase compute_velocity_score RPC not defined/failed:', rpcErr.message);
        }

        upsertedList.push(upserted);
      }
    } catch (err) {
      console.error('Upsert loop error:', err);
    }
  }
  
  if (supabase && upsertedList.length === 0 && polledTrends.length > 0) {
    const fallbackList = polledTrends.map((trend, i) => {
      const velocityResult = computeVelocityScore(trend.posts_per_hour, trend.avg_posts_24h);
      return {
        id: `demo-trend-polled-${i}-${Math.random().toString(36).substring(2, 9)}`,
        ...trend,
        velocity_score: velocityResult.score,
        momentum_status: velocityResult.status
      };
    });
    return NextResponse.json({ success: true, data: fallbackList });
  }

  return NextResponse.json({ success: true, data: upsertedList });
}
