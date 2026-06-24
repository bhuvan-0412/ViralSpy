# ViralSpy — REASONS Canvas

## R — Requirements

Goal: Detect trends 48h early, generate AI content briefs
Users: Content creators (YouTube, Instagram, niches)
Scope: Dashboard, brief generator, niche filter, auth
Out of scope: Mobile app, video editing, scheduling, payments (v1)
Success:

- Brief generated under 10 seconds
- Dashboard loads under 2 seconds
- Trend detection 48h before mainstream peak

## E — Entities

trends: id, name, niche, platform, post_count, posts_per_hour,
avg_posts_24h, velocity_score, peak_velocity, momentum_status,
confidence_score, raw_data, detected_at, peaked_at, expires_at

trend_snapshots: id, trend_id, post_count, posts_per_hour,
velocity_score, snapped_at

briefs: id, trend_id, user_id, hook, angles(jsonb), format,
hashtags(jsonb), best_post_time, estimated_reach,
script_outline, model_used, prompt_version, rating

user_profiles: id, display_name, avatar_url, niches(array),
platforms(array), subscriber_count, onboarded

saved_trends: id, user_id, trend_id, saved_at
alerts: id, user_id, niche, keyword, min_velocity,
channel, webhook_url, is_active

## A — Approach

- Velocity scoring: (posts_per_hour / avg_posts_24h) \* 100
- Z-score anomaly detection for early breakout signals
- GPT-4o structured JSON for brief generation
- Supabase Realtime for live dashboard
- Seed data fallback for demo reliability
- Brief caching: check briefs table before GPT-4o

## S — Structure

/app/dashboard → trend feed, stat cards, niche filter
/app/brief/[id] → AI content brief rendering
/app/onboarding → niche + platform selection
/app/auth/callback → Supabase OAuth handler
/app/api/brief → GPT-4o generation + caching
/app/api/poll → platform data ingestion
/app/api/seed → mock data seeding
/app/api/trends → filtered trend fetch
/app/api/velocity → velocity recalculation

/components/TrendCard → velocity, sparkline, badge, CTA
/components/TrendFeed → grid + filter + realtime
/components/BriefCard → hook, angles, hashtags, script
/components/Sparkline → recharts mini chart
/components/NicheFilter → pill filter buttons
/components/MomentumBadge → EXPLODING/RISING/PEAKED
/components/LoadingSkeleton → brief loading state
/components/Logo → lightning bolt + wordmark

/lib/supabase.ts → client (anon key)
/lib/supabase-server.ts → server (service role)
/lib/openai.ts → GPT-4o client
/lib/velocity.ts → scoring functions

## O — Operations (execute in this exact order)

Operation 1 — Fix /api/seed platform values:
Replace all "TIKTOK" with correct platforms:
YOUTUBE: 5-4-3-2-1 grounding method, protein coffee hack,
barefoot running form breakdown, AI side hustle $500/day,
index fund vs ETF explained, travel hacking with points,
cozy gaming setup tour
INSTAGRAM: girl dinner but make it gourmet, quiet luxury gym fits,
somatic shaking exercise, hyper-realistic cake reveal,
viral GRWM transition edit, budget meal prep $25/week,
soft life aesthetic haul, deinfluencing skincare
REDDIT: rent money investing thread, no-spend month challenge,
borg drink recipe, roman empire trend,
neuro-spicy productivity hacks

Operation 2 — Fix dashboard stat cards (real Supabase counts):
Server-side fetch in dashboard page:

- Trends Today: SELECT count(\*) WHERE detected_at > now()-interval'24h'
- EXPLODING Now: SELECT count(\*) WHERE momentum_status='EXPLODING'
- Avg Velocity: SELECT avg(velocity_score) WHERE momentum_status
  IN ('RISING','EXPLODING')
- Briefs Generated: SELECT count(\*) FROM briefs

Operation 3 — Remove warning banner:
Delete yellow "Simulated Environment Active" banner from dashboard.
Remove all localStorage simulation code.

Operation 4 — Fix /brief/[id] page:

- Validate GPT-4o returns valid JSON with try/catch
- Render hook in large italic coral text with copy button
- Render 3 angles as numbered cards (1,2,3 in coral circles)
- Render format with icon + explanation
- Render 5 hashtags as coral pill buttons (click to copy)
- Render post time + estimated reach side by side
- Render script outline as 3-act timeline
- Cache check: query briefs table before calling GPT-4o
- If cached brief exists return it immediately

Operation 5 — Brief loading state:

- Full screen loading overlay while GPT-4o generates
- Animated progress bar 0→90% over 8 seconds
- Cycling messages every 2000ms via useEffect:
  ["⚡ Detecting trend signals...",
  "🧠 Analysing velocity patterns...",
  "✍️ Writing your hook...",
  "🎯 Building content angles..."]
- Small muted text: "Usually takes 5–8 seconds"
- Fade out loading, fade in brief over 300ms on load

Operation 6 — Supabase Realtime:

- Subscribe to trends table in TrendFeed component
- Animate velocity score with count-up on update
- Show green "● Live" dot in dashboard header

Operation 7 — Wire /api/poll:
YouTube Shorts:
GET https://www.googleapis.com/youtube/v3/videos
?part=snippet,statistics&chart=mostPopular&maxResults=20
&key=${YOUTUBE_API_KEY}
Reddit Rising (no key):
GET https://www.reddit.com/r/{subreddit}/rising.json?limit=10
Headers: { 'User-Agent': 'ViralSpy/1.0' }
Subreddits: fitness, food, personalfinance, femalefashionadvice,
SkincareAddiction, technology, gaming, travel,
selfimprovement, learnprogramming
After each poll: upsert trends + insert trend_snapshots row

## N — Norms

- TypeScript strict, no 'any' types anywhere
- All API routes return { data, error } always
- All Supabase errors caught and returned in error field
- Components max 150 lines, split if longer
- Server routes use SUPABASE_SERVICE_ROLE_KEY
- Client components use NEXT_PUBLIC_SUPABASE_ANON_KEY
- GPT-4o responses always parsed with try/catch JSON.parse
- All dates stored and compared as UTC

## S — Safeguards

- NEVER change Tailwind colors (#FF6B4A coral, #7F77DD purple,
  #F7F5F2 background, #1A1A1A text)
- NEVER modify Logo component
- NEVER touch tsconfig.json or next.config.mjs
- NEVER drop or alter any Supabase table or column
- NEVER hardcode API keys — always process.env
- NEVER call GPT-4o without checking briefs cache first
- NEVER show TikTok anywhere (banned in India)
- NEVER remove existing API route signatures
- NEVER use 'any' TypeScript type
