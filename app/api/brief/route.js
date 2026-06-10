import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function generateMockBrief(trendName, niche) {
  const cleanName = trendName.trim();
  
  if (cleanName.toLowerCase().includes('wall sit') || cleanName.toLowerCase().includes('jump rope') || niche === 'fitness') {
    return {
      hook: "This 10-second habit doubled my results.",
      angles: [
        `Why most people fail the "${cleanName}" in the first 3 days`,
        `Real-time follow along: How I do my "${cleanName}" routine`,
        `3 crucial form mistakes ruining your "${cleanName}" progress`
      ],
      format: "talking head + overlay",
      hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#fitnesstips", "#workoutmotivation", "#healthylifestyle", "#fitgoals"],
      optimal_post_time: "5:00 PM - 8:00 PM",
      estimated_reach: "120K - 340K"
    };
  }
  
  if (cleanName.toLowerCase().includes('rice') || cleanName.toLowerCase().includes('sushi') || cleanName.toLowerCase().includes('butter') || cleanName.toLowerCase().includes('pasta') || niche === 'food') {
    return {
      hook: "Stop cooking your pasta wrong. Try this.",
      angles: [
        `Making the viral "${cleanName}" but with a secret ingredient`,
        `Rating the "${cleanName}" out of 10 (honest review)`,
        `How to make "${cleanName}" in under 10 minutes for less than $5`
      ],
      format: "POV / cooking aesthetic",
      hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#easyrecipes", "#foodtiktok", "#cookinghacks", "#viralrecipe"],
      optimal_post_time: "11:00 AM - 1:00 PM",
      estimated_reach: "250K - 600K"
    };
  }

  if (cleanName.toLowerCase().includes('saving') || cleanName.toLowerCase().includes('tax') || cleanName.toLowerCase().includes('fund') || niche === 'finance') {
    return {
      hook: "The bank doesn't want you knowing this.",
      angles: [
        `How to set up the "${cleanName}" in under 5 minutes`,
        `I compared the "${cleanName}" to standard accounts, here's the math`,
        `The hidden trap inside the "${cleanName}" trend`
      ],
      format: "talking head + green screen",
      hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#personalfinance", "#moneytips", "#wealthbuilding", "#financialfreedom"],
      optimal_post_time: "7:00 AM - 9:00 AM",
      estimated_reach: "95K - 280K"
    };
  }

  if (cleanName.toLowerCase().includes('llm') || cleanName.toLowerCase().includes('gpt') || cleanName.toLowerCase().includes('next.js') || niche === 'tech') {
    return {
      hook: "Stop scrolling: This tool does the work.",
      angles: [
        `Step-by-step setup guide for "${cleanName}" (no code)`,
        `3 features of "${cleanName}" that feel illegal to know`,
        `Why I threw away my old setup for "${cleanName}"`
      ],
      format: "POV screen recording + voiceover",
      hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#coding", "#chatgpt", "#developer", "#techtrends"],
      optimal_post_time: "9:00 AM - 12:00 PM",
      estimated_reach: "150K - 400K"
    };
  }

  if (cleanName.toLowerCase().includes('thrift') || cleanName.toLowerCase().includes('wardrobe') || niche === 'fashion') {
    return {
      hook: "This outfit styling rule is a cheatcode.",
      angles: [
        `Styling the "${cleanName}" for 3 different occasions`,
        `How I found the perfect "${cleanName}" on a budget`,
        `Is the "${cleanName}" aesthetic actually wearable?`
      ],
      format: "OOTD transitions",
      hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#outfitinspiration", "#thriftfinds", "#fashionhacks", "#grwm"],
      optimal_post_time: "3:00 PM - 6:00 PM",
      estimated_reach: "180K - 450K"
    };
  }

  return {
    hook: `This is why ${cleanName} is blowing up.`,
    angles: [
      `The truth behind the viral "${cleanName}" trend`,
      `How you can jump on "${cleanName}" before it peaks`,
      `I tried "${cleanName}" so you don't have to`
    ],
    format: "talking head",
    hashtags: [`#${cleanName.replace(/\s+/g, '')}`, "#trending", "#contentcreator", "#viralhacks", "#foryou"],
    optimal_post_time: "6:00 PM - 9:00 PM",
    estimated_reach: "100K - 300K"
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const briefId = searchParams.get('id');

  if (!briefId) {
    return NextResponse.json({ error: "Missing briefId" }, { status: 400 });
  }

  const isPlaceholder = 
    !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl.includes('placeholder') || 
    supabaseUrl.includes('your-supabase-project');

  if (!isPlaceholder) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: brief, error: briefError } = await supabase
        .from('briefs')
        .select('*, trends(*)')
        .eq('id', briefId)
        .maybeSingle();

      if (briefError) throw briefError;

      if (brief) {
        return NextResponse.json({
          success: true,
          data: {
            id: brief.id,
            trend_id: brief.trend_id,
            trend_name: brief.trends?.name || "Viral Topic",
            trend_niche: brief.trends?.niche || "general",
            hook: brief.hook,
            angles: Array.isArray(brief.angles) ? brief.angles : (brief.angles.list || []),
            optimal_post_time: brief.angles?.optimal_post_time || "6:00 PM - 8:00 PM",
            estimated_reach: brief.angles?.estimated_reach || "100K - 300K",
            format: brief.format,
            hashtags: brief.hashtags
          }
        });
      }
    } catch (err) {
      console.error('Failed to get brief from DB:', err.message);
    }
  }

  const mockTrendName = "Air Fryer Crispy Rice Sushi";
  const mockNiche = "food";
  const mockBrief = generateMockBrief(mockTrendName, mockNiche);

  return NextResponse.json({
    success: true,
    data: {
      id: briefId,
      trend_id: "demo-trend-uuid-1",
      trend_name: mockTrendName,
      trend_niche: mockNiche,
      hook: mockBrief.hook,
      angles: mockBrief.angles,
      optimal_post_time: mockBrief.optimal_post_time,
      estimated_reach: mockBrief.estimated_reach,
      format: mockBrief.format,
      hashtags: mockBrief.hashtags
    }
  });
}
