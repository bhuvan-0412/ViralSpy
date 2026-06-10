import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { computeVelocityScore } from '../../../lib/velocity';

const MOCK_POLL_TOPICS = [
  { name: "asmr mechanical keyboard builds", niche: "tech", platform: "YOUTUBE", posts_per_hour: 450, avg_posts_24h: 120, post_count: 8900 },
  { name: "10-minute cold brew hack", niche: "food", platform: "TIKTOK", posts_per_hour: 1400, avg_posts_24h: 300, post_count: 42000 },
  { name: "high-ticket sales funnel tutorial", niche: "business", platform: "YOUTUBE", posts_per_hour: 220, avg_posts_24h: 80, post_count: 5100 },
  { name: "somatic stretches for back pain", niche: "fitness", platform: "TIKTOK", posts_per_hour: 850, avg_posts_24h: 210, post_count: 19500 },
  { name: "cozy lofi gaming background", niche: "gaming", platform: "YOUTUBE", posts_per_hour: 380, avg_posts_24h: 190, post_count: 11200 }
];

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const apiKey = process.env.YOUTUBE_API_KEY || '';
  const isMockMode = !apiKey || apiKey.includes('placeholder') || apiKey.includes('your_youtube_api_key');

  let trendName = "viral content trend";
  let niche = "other";
  let platform = "YOUTUBE";
  let postsPerHour = 300;
  let avgPosts24h = 100;
  let postCount = 5000;

  if (!isMockMode) {
    try {
      const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=10&key=${apiKey}`;
      const ytRes = await fetch(ytUrl);
      const ytData = await ytRes.json();

      if (ytData.items && ytData.items.length > 0) {
        const item = ytData.items[Math.floor(Math.random() * ytData.items.length)];
        const tags = item.snippet.tags || [];
        
        trendName = tags[0] || item.snippet.title.substring(0, 30);
        postCount = parseInt(item.statistics.viewCount || '15000', 10);
        postsPerHour = Math.round(parseInt(item.statistics.likeCount || '1200', 10) / 24);
        avgPosts24h = Math.round(postsPerHour * 0.4); // Simulate 24h average
        
        // Calibrate niche based on tags or category
        const categoryId = item.snippet.categoryId;
        if (categoryId === '20') niche = 'gaming';
        else if (categoryId === '28') niche = 'tech';
        else if (categoryId === '26') niche = 'beauty';
        else niche = 'lifestyle';
      }
    } catch (err: any) {
      console.warn('YouTube API call failed, falling back to mock: ', err.message);
    }
  } else {
    // Select a random mock topic
    const topic = MOCK_POLL_TOPICS[Math.floor(Math.random() * MOCK_POLL_TOPICS.length)];
    trendName = topic.name;
    niche = topic.niche;
    platform = topic.platform;
    postsPerHour = topic.posts_per_hour;
    avgPosts24h = topic.avg_posts_24h;
    postCount = topic.post_count;
  }

  // Calculate velocity and status
  const velocityResult = computeVelocityScore(postsPerHour, avgPosts24h);

  const trendData = {
    name: trendName,
    niche,
    platform,
    post_count: postCount,
    posts_per_hour: postsPerHour,
    avg_posts_24h: avgPosts24h,
    velocity_score: velocityResult.score,
    momentum_status: velocityResult.status,
    confidence_score: 0.85,
    detected_at: new Date().toISOString()
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      message: "Database unconfigured. Polled local simulation results.",
      data: trendData
    });
  }

  try {
    // Upsert into trends table
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

    if (upsertError) throw upsertError;

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

      return NextResponse.json({ success: true, data: upserted });
    }

    return NextResponse.json({ success: false, error: 'Upsert did not return a row.' });

  } catch (err: any) {
    console.error('Polling error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
