import { createClient } from '@supabase/supabase-js';
import { computeVelocityScore } from '@/lib/velocity';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const maxDuration = 30;

// Helper: map YouTube category ID / title keywords to niche
function mapYouTubeCategoryToNiche(categoryId: string, title: string): string {
  const titleLower = title.toLowerCase();
  if (/workout|fitness|gym|somatic|bodyweight|stretch/.test(titleLower)) return 'fitness';
  if (/food|recipe|cook|dinner|meal|coffee|bake|cake|gourmet|prep/.test(titleLower)) return 'food';
  if (/invest|money|fund|etf|stock|finance|budget|hustle|rich/.test(titleLower)) return 'finance';
  if (/fashion|outfit|style|luxury|wear|clothing|dress|fits/.test(titleLower)) return 'fashion';
  if (/skincare|makeup|grwm|beauty|routine|hair|glow/.test(titleLower)) return 'beauty';
  if (/tech|ai|software|code|programming|gadget|phone|keyboard/.test(titleLower)) return 'tech';
  if (/game|gaming|gamer|xbox|playstation|nintendo/.test(titleLower)) return 'gaming';
  if (/travel|trip|flight|explore|hotel|vacation|vlog/.test(titleLower)) return 'travel';
  if (/learn|study|tutorial|explain|guide|education/.test(titleLower)) return 'education';
  const categoryMap: Record<string, string> = {
    '17': 'sports', '10': 'music', '20': 'gaming',
    '26': 'education', '22': 'lifestyle', '19': 'travel'
  };
  return categoryMap[categoryId] || 'lifestyle';
}

// ─── Agent 2: Anomaly Detector ────────────────────────────
async function runAnomalyDetector(trendId: string, currentVelocity: number, currentMomentum: string, currentConfidence: number) {
  try {
    const { data: snapshots } = await supabase
      .from('trend_snapshots')
      .select('velocity_score')
      .eq('trend_id', trendId)
      .order('snapped_at', { ascending: false })
      .limit(14);

    if (!snapshots || snapshots.length < 3) return;

    const scores = snapshots.map((s: any) => Number(s.velocity_score));
    const mean = scores.reduce((sum: number, val: number) => sum + val, 0) / scores.length;
    const variance = scores.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const zScore = stdDev > 0 ? (currentVelocity - mean) / stdDev : 0;

    let newConfidence = currentConfidence;
    let newMomentum = currentMomentum;

    if (zScore > 2.5) {
      newConfidence = parseFloat(Math.min(0.99, currentConfidence + 0.15).toFixed(2));
      if (newMomentum === 'RISING') newMomentum = 'EXPLODING';
    } else if (zScore < 0) {
      newConfidence = parseFloat(Math.max(0.50, currentConfidence - 0.05).toFixed(2));
    }

    if (newConfidence !== currentConfidence || newMomentum !== currentMomentum) {
      await supabase
        .from('trends')
        .update({ confidence_score: newConfidence, momentum_status: newMomentum })
        .eq('id', trendId);
    }
  } catch (err) {
    console.warn('Anomaly detector skipped:', err);
  }
}

export async function GET() {
  const results = {
    youtube: 0,
    reddit: 0,
    instagram: 0,
    errors: [] as string[]
  };

  // ─── SOURCE 1: YouTube Shorts ───────────────────────────
  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`
    );
    const ytData = await ytRes.json();

    if (ytData.items) {
      for (const video of ytData.items) {
        const title = video.snippet.title as string;
        const viewCount = parseInt(video.statistics.viewCount || '0');
        const categoryId = video.snippet.categoryId as string;

        const niche = mapYouTubeCategoryToNiche(categoryId, title);
        const postsPerHour = Math.floor(viewCount / 24);
        const avg = Math.max(5, Math.floor(postsPerHour * 0.4));
        const { score, status } = computeVelocityScore(postsPerHour, avg);

        const { data: upserted, error } = await supabase
          .from('trends')
          .upsert({
            name: title.slice(0, 100),
            niche,
            platform: 'YOUTUBE',
            post_count: viewCount,
            posts_per_hour: postsPerHour,
            avg_posts_24h: avg,
            velocity_score: score,
            momentum_status: status,
            confidence_score: Math.min(0.95, score / 500),
            detected_at: new Date().toISOString()
          }, { onConflict: 'name,platform' })
          .select()
          .single();

        if (error) {
          results.errors.push(`YouTube upsert: ${error.message}`);
          continue;
        }

        if (upserted) {
          await supabase.from('trend_snapshots').insert({
            trend_id: upserted.id,
            post_count: viewCount,
            posts_per_hour: postsPerHour,
            velocity_score: score,
            snapped_at: new Date().toISOString()
          });
          await runAnomalyDetector(upserted.id, score, status, Math.min(0.95, score / 500));
        }

        results.youtube++;
      }
    }
  } catch (e: any) {
    results.errors.push(`YouTube: ${e.message}`);
  }

  // ─── SOURCE 2: Reddit Rising ─────────────────────────────
  const subreddits = [
    { sub: 'fitness', niche: 'fitness' },
    { sub: 'food', niche: 'food' },
    { sub: 'personalfinance', niche: 'finance' },
    { sub: 'femalefashionadvice', niche: 'fashion' },
    { sub: 'SkincareAddiction', niche: 'beauty' },
    { sub: 'technology', niche: 'tech' },
    { sub: 'gaming', niche: 'gaming' },
    { sub: 'travel', niche: 'travel' },
    { sub: 'selfimprovement', niche: 'lifestyle' },
    { sub: 'learnprogramming', niche: 'education' }
  ];

  for (const { sub, niche } of subreddits) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/rising.json?limit=5&raw_json=1`,
        {
          headers: {
            'User-Agent': 'ViralSpy:v1.0 (by /u/viralspy_app)',
            'Accept': 'application/json',
          },
          cache: 'no-store'
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.startsWith('<')) throw new Error('Reddit returned HTML - rate limited');
      const data = JSON.parse(text);
      const posts = data?.data?.children || [];

      for (const post of posts) {
        const { title, score, num_comments, ups } = post.data;
        const postsPerHour = Math.floor((score + num_comments) / 2);
        const avg = Math.max(5, Math.floor(postsPerHour * 0.35));
        const { score: vScore, status } = computeVelocityScore(postsPerHour, avg);

        const { data: upserted, error } = await supabase
          .from('trends')
          .upsert({
            name: (title as string).slice(0, 100),
            niche,
            platform: 'REDDIT',
            post_count: ups,
            posts_per_hour: postsPerHour,
            avg_posts_24h: avg,
            velocity_score: vScore,
            momentum_status: status,
            confidence_score: Math.min(0.90, vScore / 500),
            detected_at: new Date().toISOString()
          }, { onConflict: 'name,platform' })
          .select()
          .single();

        if (error) {
          results.errors.push(`Reddit/${sub} upsert: ${error.message}`);
          continue;
        }

        if (upserted) {
          await supabase.from('trend_snapshots').insert({
            trend_id: upserted.id,
            post_count: ups,
            posts_per_hour: postsPerHour,
            velocity_score: vScore,
            snapped_at: new Date().toISOString()
          });
          await runAnomalyDetector(upserted.id, vScore, status, Math.min(0.90, vScore / 500));
        }

        results.reddit++;
      }
    } catch (e: any) {
      results.errors.push(`Reddit/${sub}: ${e.message}`);
    }
  }

  // ─── SOURCE 3: Instagram via RapidAPI ────────────────────
  const niches = [
    { keyword: 'fitness', niche: 'fitness' },
    { keyword: 'foodie', niche: 'food' },
    { keyword: 'investing', niche: 'finance' },
    { keyword: 'ootd', niche: 'fashion' },
    { keyword: 'skincare', niche: 'beauty' },
    { keyword: 'travel', niche: 'travel' },
    { keyword: 'gaming', niche: 'gaming' }
  ];

  for (const { keyword, niche } of niches) {
    try {
      const res = await fetch(
        `https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${keyword}`,
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_INSTAGRAM_KEY!,
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
          }
        }
      );
      const data = await res.json();
      const mediaCount = data?.data?.media_count || 0;
      const postsPerHour = Math.max(10, Math.floor(mediaCount / 1000));
      const avg = Math.max(5, Math.floor(postsPerHour * 0.4));
      const { score, status } = computeVelocityScore(postsPerHour, avg);

      const { data: upserted, error } = await supabase
        .from('trends')
        .upsert({
          name: `#${keyword} trending`,
          niche,
          platform: 'INSTAGRAM',
          post_count: mediaCount,
          posts_per_hour: postsPerHour,
          avg_posts_24h: avg,
          velocity_score: score,
          momentum_status: status,
          confidence_score: Math.min(0.85, score / 500),
          detected_at: new Date().toISOString()
        }, { onConflict: 'name,platform' })
        .select()
        .single();

      if (error) {
        results.errors.push(`Instagram/${keyword} upsert: ${error.message}`);
        continue;
      }

      if (upserted) {
        await supabase.from('trend_snapshots').insert({
          trend_id: upserted.id,
          post_count: mediaCount,
          posts_per_hour: postsPerHour,
          velocity_score: score,
          snapped_at: new Date().toISOString()
        });
        await runAnomalyDetector(upserted.id, score, status, Math.min(0.85, score / 500));
      }

      results.instagram++;
    } catch (e: any) {
      results.errors.push(`Instagram/${keyword}: ${e.message}`);
    }
  }

  return Response.json({
    success: true,
    polled_at: new Date().toISOString(),
    results
  });
}
