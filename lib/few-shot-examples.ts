const fewShotExamples: Record<
  string,
  Array<{
    input: {
      trend_name: string
      niche: string
      platform: string
      velocity_score: number
      momentum_status: string
    }
    output: {
      hook: string
      angles: Array<{ title: string; description: string }>
      format: string
      hashtags: string[]
      best_post_time: string
      estimated_reach: string
      script_outline: string
    }
  }>
> = {
  travel: [
    {
      input: {
        trend_name: 'van life setup cost breakdown',
        niche: 'travel',
        platform: 'YOUTUBE',
        velocity_score: 289,
        momentum_status: 'RISING',
      },
      output: {
        hook: 'Van Life Costs Revealed',
        angles: [
          {
            title: 'BUDGET BREAKDOWN',
            description:
              'Detailed cost analysis of setting up a van for life on the road, including initial investment and ongoing expenses.',
          },
          {
            title: 'LUXURY VAN CONVERSION',
            description:
              'High-end features and upgrades like solar panels, advanced kitchenettes, and comfortable bedding for a premium experience.',
          },
          {
            title: 'MINIMALIST VAN SETUP',
            description:
              'Simple, sustainable, affordable approach emphasizing ease and flexibility over luxury.',
          },
        ],
        format: 'TUTORIAL',
        hashtags: [
          '#VanLife',
          '#TravelOnABudget',
          '#HomeOnWheels',
          '#VanConversion',
          '#AdventureTravel',
        ],
        best_post_time: '6–8 PM IST weekdays',
        estimated_reach: '100K–500K views',
        script_outline:
          'Act 1 (0-3s): Van life costs revealed. Act 2 (3-45s): Initial investment, ongoing expenses, cost-saving tips. Act 3 (45-60s): Ask viewers to share their experiences.',
      },
    },
  ],
  lifestyle: [
    {
      input: {
        trend_name: 'slow living principles',
        niche: 'lifestyle',
        platform: 'REDDIT',
        velocity_score: 288,
        momentum_status: 'RISING',
      },
      output: {
        hook: 'Slow Down Now',
        angles: [
          {
            title: 'MORNING ROUTINE',
            description:
              'Peaceful morning routine with meditation and journaling that sets the tone for a slow living day.',
          },
          {
            title: 'SUSTAINABLE LIVING',
            description:
              'Intersection of slow living and sustainability — minimalism, zero-waste, locally sourced food.',
          },
          {
            title: 'DIGITAL DETOX',
            description:
              'Disconnecting from technology to cultivate slower pace — reduce screen time, engage offline.',
          },
        ],
        format: 'TALKING_HEAD',
        hashtags: ['#SlowLiving', '#Minimalism', '#Sustainability', '#MindfulLiving', '#SelfCare'],
        best_post_time: '7–10 PM IST',
        estimated_reach: '100K–500K views',
        script_outline:
          'Act 1 (0-3s): Thought-provoking question about slow living. Act 2 (3-45s): Three personal anecdotes showing benefits. Act 3 (45-60s): Ask viewers to share their slow living tips.',
      },
    },
  ],
  fitness: [
    {
      input: {
        trend_name: 'somatic shaking exercise',
        niche: 'fitness',
        platform: 'INSTAGRAM',
        velocity_score: 268,
        momentum_status: 'RISING',
      },
      output: {
        hook: 'Your nervous system is lying to you',
        angles: [
          {
            title: 'THE 3-SECOND NERVOUS RESET',
            description:
              'Show the exact somatic shaking movement pattern in real time, explaining the physiological response.',
          },
          {
            title: "WHAT GYMS WON'T TELL YOU",
            description:
              'Contrast typical physical routines against somatic technique, highlighting efficiency benefits.',
          },
          {
            title: 'STOP DOING STANDARD WORKOUTS',
            description:
              'Science behind somatic grounding and why it yields faster recovery rates than traditional exercise.',
          },
        ],
        format: 'POV',
        hashtags: [
          '#SomaticHealing',
          '#NervousSystemReset',
          '#FitnessTok',
          '#Bodywork',
          '#TraumaHealing',
        ],
        best_post_time: '6–9 AM IST weekdays',
        estimated_reach: '80K–300K views',
        script_outline:
          'Act 1 (0-3s): Hook with nervous system claim. Act 2 (3-20s): Demonstrate shaking technique with explanation. Act 3 (20-30s): CTA to try it and comment results.',
      },
    },
  ],
  food: [
    {
      input: {
        trend_name: 'protein coffee hack',
        niche: 'food',
        platform: 'YOUTUBE',
        velocity_score: 306,
        momentum_status: 'EXPLODING',
      },
      output: {
        hook: 'Coffee just became a meal',
        angles: [
          {
            title: 'THE 30-SECOND PROTEIN COFFEE',
            description:
              'Show exact recipe — cold brew, protein powder, ice — made in under 30 seconds with macro breakdown.',
          },
          {
            title: 'REPLACING BREAKFAST WITH COFFEE',
            description:
              'Document a week of replacing breakfast with protein coffee and show energy, hunger, and performance results.',
          },
          {
            title: 'TASTE TEST VS STARBUCKS',
            description:
              'Side-by-side comparison of homemade protein coffee vs Starbucks equivalent — taste, cost, macros.',
          },
        ],
        format: 'TUTORIAL',
        hashtags: ['#ProteinCoffee', '#FitnessFuel', '#HighProtein', '#MorningRoutine', '#FoodTok'],
        best_post_time: '6–9 AM IST weekdays',
        estimated_reach: '150K–600K views',
        script_outline:
          'Act 1 (0-3s): Show the finished drink. Act 2 (3-30s): Make it step by step with macro callouts. Act 3 (30-45s): Taste reaction + CTA to try it.',
      },
    },
  ],
  finance: [
    {
      input: {
        trend_name: 'index fund vs ETF explained',
        niche: 'finance',
        platform: 'YOUTUBE',
        velocity_score: 200,
        momentum_status: 'RISING',
      },
      output: {
        hook: "You're investing wrong",
        angles: [
          {
            title: 'THE REAL DIFFERENCE',
            description:
              'Break down index funds vs ETFs in plain English — cost, flexibility, tax efficiency — with a clear verdict.',
          },
          {
            title: 'WHICH ONE MADE ME MORE MONEY',
            description:
              'Personal case study comparing returns from both over 3 years with actual numbers shown on screen.',
          },
          {
            title: "BEGINNER'S FIRST INVESTMENT",
            description:
              'Step-by-step guide for first-time investors choosing between the two, with specific Indian platform recommendations.',
          },
        ],
        format: 'TALKING_HEAD',
        hashtags: ['#IndexFunds', '#ETF', '#PersonalFinance', '#InvestingIndia', '#StockMarket'],
        best_post_time: '8–10 PM IST weekdays',
        estimated_reach: '50K–200K views',
        script_outline:
          "Act 1 (0-3s): Claim that most beginners choose wrong. Act 2 (3-40s): Side-by-side comparison with real numbers. Act 3 (40-60s): Verdict + CTA to comment which they'd pick.",
      },
    },
  ],
  fashion: [
    {
      input: {
        trend_name: 'quiet luxury gym fits',
        niche: 'fashion',
        platform: 'INSTAGRAM',
        velocity_score: 326,
        momentum_status: 'EXPLODING',
      },
      output: {
        hook: "Gym fits that don't scream gym",
        angles: [
          {
            title: 'THE QUIET LUXURY HAUL',
            description:
              'Show 5 outfit combinations that look expensive but are under ₹3000 — neutral tones, clean lines, minimal logos.',
          },
          {
            title: 'WHY LOUD BRANDS ARE OVER',
            description:
              "Cultural shift from logo-heavy sportswear to understated luxury — why it's happening and how to nail it.",
          },
          {
            title: 'OUTFIT OF THE DAY SERIES',
            description:
              '30-day quiet luxury gym fit challenge — one outfit per day, all budget-friendly, all aesthetic.',
          },
        ],
        format: 'TRANSITION',
        hashtags: ['#QuietLuxury', '#GymFits', '#GRWM', '#FashionTok', '#OOTDIndia'],
        best_post_time: '7–9 AM or 5–7 PM IST',
        estimated_reach: '200K–800K views',
        script_outline:
          'Act 1 (0-3s): Show the most stunning outfit first. Act 2 (3-25s): Walk through each look with styling tips. Act 3 (25-30s): CTA to save the video.',
      },
    },
  ],
  beauty: [
    {
      input: {
        trend_name: 'deinfluencing skincare',
        niche: 'beauty',
        platform: 'INSTAGRAM',
        velocity_score: 71,
        momentum_status: 'PEAKED',
      },
      output: {
        hook: 'Stop buying these products',
        angles: [
          {
            title: 'PRODUCTS I THREW AWAY',
            description:
              "Honest review of overhyped skincare products that didn't work — with before/after skin comparison.",
          },
          {
            title: 'THE ₹500 SKINCARE ROUTINE',
            description:
              'Complete effective skincare routine using only drugstore products under ₹500 total.',
          },
          {
            title: 'WHAT DERMATOLOGISTS ACTUALLY USE',
            description:
              'Interview-style breakdown of what skin doctors recommend vs what influencers promote.',
          },
        ],
        format: 'TALKING_HEAD',
        hashtags: [
          '#Deinfluencing',
          '#SkincareHonesty',
          '#SkincareRoutine',
          '#BeautyTok',
          '#SkincareTruth',
        ],
        best_post_time: '7–9 PM IST',
        estimated_reach: '50K–150K views',
        script_outline:
          'Act 1 (0-3s): Hold up a famous product and say stop. Act 2 (3-40s): Go through products one by one with honest verdict. Act 3 (40-60s): Recommend budget alternatives.',
      },
    },
  ],
  tech: [
    {
      input: {
        trend_name: 'AI side hustle $500/day',
        niche: 'tech',
        platform: 'YOUTUBE',
        velocity_score: 284,
        momentum_status: 'RISING',
      },
      output: {
        hook: 'AI made me ₹40,000 this week',
        angles: [
          {
            title: 'THE ACTUAL WORKFLOW',
            description:
              'Screen-record the exact AI tools and workflow used to generate income — no theory, just the real process.',
          },
          {
            title: 'BEGINNER TRIES AI HUSTLE FOR 7 DAYS',
            description:
              'Document a week-long experiment starting from zero with a daily earnings update.',
          },
          {
            title: 'WHICH AI TOOLS ACTUALLY PAY',
            description:
              'Ranked list of AI tools by actual earning potential with real examples and proof of payment.',
          },
        ],
        format: 'TUTORIAL',
        hashtags: ['#AISideHustle', '#MakeMoneyOnline', '#AITools', '#PassiveIncome', '#TechIndia'],
        best_post_time: '8–10 PM IST weekdays',
        estimated_reach: '100K–500K views',
        script_outline:
          'Act 1 (0-3s): Show earnings screenshot. Act 2 (3-40s): Walk through the exact tools and process step by step. Act 3 (40-60s): CTA to comment for the full guide.',
      },
    },
  ],
  gaming: [
    {
      input: {
        trend_name: 'cozy gaming setup tour',
        niche: 'gaming',
        platform: 'YOUTUBE',
        velocity_score: 146,
        momentum_status: 'RISING',
      },
      output: {
        hook: 'My setup cost less than you think',
        angles: [
          {
            title: 'BUDGET COZY SETUP TOUR',
            description:
              'Full room tour showing how to achieve aesthetic cozy gaming setup under ₹20,000 with specific product links.',
          },
          {
            title: 'BEFORE AND AFTER SETUP TRANSFORMATION',
            description:
              'Time-lapse of transforming a basic desk setup into a cozy aesthetic gaming zone in one weekend.',
          },
          {
            title: 'ESSENTIALS VS NICE TO HAVE',
            description:
              'Brutally honest breakdown of which cozy setup items actually improve your gaming experience vs pure aesthetics.',
          },
        ],
        format: 'POV',
        hashtags: ['#CosyGaming', '#GamingSetup', '#SetupTour', '#GamingIndia', '#BudgetSetup'],
        best_post_time: '7–10 PM IST weekends',
        estimated_reach: '50K–200K views',
        script_outline:
          'Act 1 (0-3s): Show the most aesthetic corner of the setup. Act 2 (3-40s): Walk through each item with price and where to buy. Act 3 (40-60s): CTA to share their own setup.',
      },
    },
  ],
  education: [
    {
      input: {
        trend_name: 'neuro-spicy productivity hacks',
        niche: 'education',
        platform: 'INSTAGRAM',
        velocity_score: 229,
        momentum_status: 'RISING',
      },
      output: {
        hook: "Your brain isn't broken, it's different",
        angles: [
          {
            title: 'THE 5-MINUTE FOCUS TRICK',
            description:
              'Show the exact technique for ADHD/neurodivergent brains to start tasks without overwhelm.',
          },
          {
            title: 'WHY NORMAL PRODUCTIVITY FAILS US',
            description:
              "Explain why standard productivity advice doesn't work for neurodivergent people and what does instead.",
          },
          {
            title: 'TOOLS THAT ACTUALLY HELP',
            description:
              'Ranked list of apps, physical tools, and environment hacks specifically tested by neurodivergent creators.',
          },
        ],
        format: 'TALKING_HEAD',
        hashtags: [
          '#NeurodivergentTok',
          '#ADHDProductivity',
          '#NeurospicyLife',
          '#FocusHacks',
          '#MentalHealthIndia',
        ],
        best_post_time: '7–9 PM IST',
        estimated_reach: '80K–300K views',
        script_outline:
          "Act 1 (0-3s): Reframe the narrative — brain isn't broken. Act 2 (3-30s): Show 3 specific techniques with demonstrations. Act 3 (30-45s): CTA to save and share with someone who needs it.",
      },
    },
  ],
}

export function getFewShotExamples(niche: string, count: number = 1) {
  const examples = fewShotExamples[niche.toLowerCase()] || fewShotExamples['lifestyle']
  return examples.slice(0, count)
}

export function formatFewShotPrompt(niche: string): string {
  const examples = getFewShotExamples(niche, 1)
  if (!examples.length) return ''

  const ex = examples[0]
  return `
Here is an example of a high-quality brief for the ${niche} niche:

INPUT:
Trend: ${ex.input.trend_name}
Platform: ${ex.input.platform}
Velocity: ${ex.input.velocity_score}
Momentum: ${ex.input.momentum_status}

OUTPUT:
${JSON.stringify(ex.output, null, 2)}

Now generate a brief with the same quality and specificity 
for the new trend below. Be just as specific and actionable.
Do not copy the example — create something original.
`
}
