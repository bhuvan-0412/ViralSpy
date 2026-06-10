import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const openaiApiKey = process.env.OPENAI_API_KEY || '';

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

export async function POST(request) {
  try {
    const { trendId } = await request.json();
    if (!trendId) {
      return NextResponse.json({ error: "Missing trendId" }, { status: 400 });
    }

    const isSupabasePlaceholder = 
      !supabaseUrl || 
      !supabaseAnonKey || 
      supabaseUrl.includes('placeholder') || 
      supabaseUrl.includes('your-supabase-project');

    let supabase = null;
    let trend = null;
    let existingBrief = null;

    if (!isSupabasePlaceholder) {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: briefData } = await supabase
        .from('briefs')
        .select('*')
        .eq('trend_id', trendId)
        .maybeSingle();

      existingBrief = briefData;

      const { data: trendData } = await supabase
        .from('trends')
        .select('*')
        .eq('id', trendId)
        .maybeSingle();
      
      trend = trendData;
    }

    if (existingBrief) {
      return NextResponse.json({ success: true, fromCache: true, data: existingBrief });
    }

    const trendName = trend ? trend.name : "Viral Content Strategy";
    const trendNiche = trend ? trend.niche : "general";

    const isOpenAiPlaceholder = 
      !openaiApiKey || 
      openaiApiKey.includes('placeholder') || 
      openaiApiKey.includes('your-openai-api-key');

    let briefContent = null;

    if (!isOpenAiPlaceholder) {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        const systemPrompt = "You are a viral content strategist. Given a trending topic, generate a content brief with: 1 killer hook (under 8 words), 3 unique video angles, best format, 5 hashtags, best post time. Be specific, not generic. Output JSON.";
        const userPrompt = `Generate a viral content brief for this trending topic: "${trendName}" in the niche: "${trendNiche}". Use the requested JSON output structure:
        {
          "hook": "string under 8 words",
          "angles": ["angle 1", "angle 2", "angle 3"],
          "format": "string format recommendation",
          "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
          "optimal_post_time": "time range e.g. 5:00 PM - 7:00 PM",
          "estimated_reach": "estimated view count range e.g. 100K - 300K"
        }`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" }
        });

        const rawJson = response.choices[0].message.content;
        briefContent = JSON.parse(rawJson);
      } catch (openAiError) {
        console.warn('OpenAI GPT-4o generation failed, falling back to mock generator:', openAiError.message);
        briefContent = generateMockBrief(trendName, trendNiche);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      briefContent = generateMockBrief(trendName, trendNiche);
    }

    const newBrief = {
      trend_id: trendId,
      hook: briefContent.hook || `How to dominate ${trendName}`,
      angles: briefContent.angles || [`Unique perspective on ${trendName}`, `Quick tutorial on ${trendName}`, `Reaction to ${trendName}`],
      format: briefContent.format || "talking head",
      hashtags: briefContent.hashtags || ["#trending", `#${trendName.replace(/\s+/g, '')}`],
    };

    let savedBrief = { ...newBrief, id: 'demo-brief-uuid-' + Date.now() };

    if (supabase && !isSupabasePlaceholder) {
      try {
        const dbRecord = {
          trend_id: newBrief.trend_id,
          hook: newBrief.hook,
          angles: {
            list: newBrief.angles,
            optimal_post_time: briefContent.optimal_post_time,
            estimated_reach: briefContent.estimated_reach
          },
          format: newBrief.format,
          hashtags: newBrief.hashtags
        };

        const { data, error } = await supabase
          .from('briefs')
          .insert(dbRecord)
          .select()
          .single();

        if (error) {
          console.error('Failed to save brief to Supabase:', error.message);
        } else {
          savedBrief = data;
        }
      } catch (dbError) {
        console.error('Failed to insert brief:', dbError.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedBrief.id,
        trend_id: savedBrief.trend_id,
        hook: savedBrief.hook,
        angles: Array.isArray(savedBrief.angles) ? savedBrief.angles : (savedBrief.angles.list || []),
        optimal_post_time: savedBrief.angles?.optimal_post_time || briefContent.optimal_post_time || "6:00 PM - 8:00 PM",
        estimated_reach: savedBrief.angles?.estimated_reach || briefContent.estimated_reach || "100K - 300K",
        format: savedBrief.format,
        hashtags: savedBrief.hashtags
      }
    });
  } catch (err) {
    console.error('Brief generation api error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
