import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

const MOCK_TRENDS = [
  { name: "30-Day Wall Sit Challenge", niche: "fitness", platform: "tiktok", post_count: 14200, sparkline: [12, 15, 18, 30, 45, 60, 85, 125] },
  { name: "Air Fryer Crispy Rice Sushi", niche: "food", platform: "tiktok", post_count: 32500, sparkline: [10, 12, 14, 18, 25, 45, 95, 210] },
  { name: "High-Yield Savings Hacks", niche: "finance", platform: "instagram", post_count: 8900, sparkline: [40, 42, 45, 48, 52, 55, 58, 62] },
  { name: "Local LLM Running on Mac", niche: "tech", platform: "youtube", post_count: 5600, sparkline: [4, 8, 12, 20, 32, 48, 72, 115] },
  { name: "Coastal Grandma Summer Look", niche: "fashion", platform: "tiktok", post_count: 19800, sparkline: [15, 20, 28, 42, 65, 110, 180, 310] },
  { name: "Cold Girl Makeup Tutorial", niche: "beauty", platform: "tiktok", post_count: 43000, sparkline: [80, 85, 90, 95, 100, 110, 115, 120] },
  { name: "Glute Activation Band Routine", niche: "fitness", platform: "instagram", post_count: 11200, sparkline: [8, 12, 16, 24, 38, 56, 82, 128] },
  { name: "Pistachio Butter Toast Trend", niche: "food", platform: "instagram", post_count: 15400, sparkline: [5, 8, 15, 28, 48, 85, 160, 320] },
  { name: "Side Hustle Tax Loophole", niche: "finance", platform: "tiktok", post_count: 22100, sparkline: [18, 22, 26, 38, 52, 75, 110, 185] },
  { name: "OpenAI GPT-4o Agent Setup", niche: "tech", platform: "youtube", post_count: 17400, sparkline: [10, 15, 22, 38, 62, 105, 190, 410] },
  { name: "Thrift Store Flip Challenge", niche: "fashion", platform: "youtube", post_count: 27900, sparkline: [70, 72, 75, 78, 82, 85, 88, 92] },
  { name: "Heatless Curls Wrap Hack", niche: "beauty", platform: "instagram", post_count: 36800, sparkline: [25, 30, 42, 60, 95, 145, 220, 390] },
  { name: "Barefoot Running Shoe Review", niche: "fitness", platform: "youtube", post_count: 6700, sparkline: [6, 9, 12, 15, 20, 28, 42, 70] },
  { name: "Deconstructed Sushi Bowl", niche: "food", platform: "tiktok", post_count: 28400, sparkline: [90, 95, 102, 108, 115, 120, 125, 130] },
  { name: "Index Fund Visualizer App", niche: "finance", platform: "youtube", post_count: 9100, sparkline: [5, 8, 12, 22, 38, 68, 115, 215] },
  { name: "Next.js 14 App Router Pitfalls", niche: "tech", platform: "tiktok", post_count: 11500, sparkline: [12, 14, 18, 25, 36, 52, 78, 120] },
  { name: "Capsule Wardrobe Fall 2026", niche: "fashion", platform: "instagram", post_count: 18700, sparkline: [20, 24, 30, 42, 60, 85, 120, 195] },
  { name: "Snail Mucin Skin Glowing Hack", niche: "beauty", platform: "tiktok", post_count: 49500, sparkline: [30, 42, 65, 110, 185, 310, 520, 950] },
  { name: "Weighted Jump Rope Progress", niche: "fitness", platform: "tiktok", post_count: 8400, sparkline: [22, 24, 26, 28, 32, 34, 38, 42] },
  { name: "One-Pot Lemon Garlic Pasta", niche: "food", platform: "youtube", post_count: 31200, sparkline: [15, 20, 30, 45, 68, 105, 160, 245] }
];

export async function GET() {
  const isPlaceholder = 
    !supabaseUrl || 
    !supabaseServiceKey || 
    supabaseUrl.includes('placeholder') || 
    supabaseUrl.includes('your-supabase-project');

  const trendsToInsert = MOCK_TRENDS.map((item, index) => {
    const sparkline = item.sparkline;
    const current = sparkline[sparkline.length - 1];
    const rawAvg = sparkline.reduce((a, b) => a + b, 0) / sparkline.length;
    const avg = rawAvg === 0 || !rawAvg ? 1 : rawAvg;
    const velocity_score = Math.round((current / avg) * 100);
    
    let momentum_status = 'PEAKED';
    if (velocity_score > 300) {
      momentum_status = 'EXPLODING';
    } else if (velocity_score >= 150) {
      momentum_status = 'RISING';
    }

    return {
      name: item.name,
      niche: item.niche,
      platform: item.platform,
      post_count: item.post_count,
      velocity_score,
      momentum_status,
      detected_at: new Date(Date.now() - index * 3600000).toISOString(),
      raw_data: { sparkline }
    };
  });

  if (isPlaceholder) {
    return NextResponse.json({
      success: true,
      message: "Supabase connection is not configured. Returning trends locally for guest demo.",
      data: trendsToInsert
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('trends')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    const { data, error } = await supabase
      .from('trends')
      .insert(trendsToInsert)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data.length} trends in the Supabase database.`,
      data: data
    });
  } catch (err) {
    console.error('Database seeding error:', err);
    return NextResponse.json({
      success: false,
      message: `Seeding database failed: ${err.message}. Returning trends as local fallback.`,
      data: trendsToInsert
    }, { status: 500 });
  }
}
