# ViralSpy — AI Agents

## Agent 1 — Trend Detector

Type: Scheduled ingestion agent
Endpoint: POST /api/poll
Trigger: Every 15 minutes (manual for demo)
Sources:

- YouTube Shorts: GET /youtube/v3/videos?chart=mostPopular
- Instagram Reels: RapidAPI hashtag velocity per niche
- Reddit Rising: GET /r/{subreddit}/rising.json (no auth)
  Logic:
- Poll all 3 sources across 15 niches
- Compute posts_per_hour delta between cycles
- Velocity = (posts_per_hour / avg_posts_24h) \* 100
- EXPLODING ≥300 | RISING 150–299 | PEAKED 50–149 | DEAD <50
- Upsert trends + insert trend_snapshots per cycle
  Output: Updated Supabase trends table, realtime dashboard refresh

## Agent 2 — Anomaly Detector

Type: Statistical analysis agent
Trigger: Inline during each poll cycle
Logic:

- Z-score per trend vs 7-day rolling average
- Z-score > 2.5 = early breakout flag
- Updates confidence_score based on pattern accuracy
- Promotes RISING → EXPLODING on acceleration threshold
  Output: confidence_score + momentum_status updates

## Agent 3 — Brief Generator

Type: On-demand GPT-4o agent
Endpoint: POST /api/brief
Trigger: User clicks "Generate Brief"
Cache: Query briefs table first — return if exists
System prompt:
"You are a viral content strategist who helped 500+ creators
hit 1M+ views. Respond ONLY in valid JSON no markdown:
{ hook, angles:[{title,description}x3], format,
hashtags:[x5], best_post_time, estimated_reach,
script_outline }"
User message: trend name + niche + platform + velocity + momentum
Output: Structured brief in Supabase, rendered on /brief/[id]

## Agent 4 — Niche Personaliser

Type: Client-side ranking agent
Trigger: Niche filter selection or page load
Logic:

- Read user_profiles.niches from Supabase
- Rank: user niches first, then velocity_score desc
- Weight: EXPLODING > RISING > PEAKED per niche
  Output: Personalised trend feed per creator

## Data Flow

Platform APIs → Trend Detector → Anomaly Detector → Supabase
↓
Supabase Realtime
↓
Creator dashboard ← live subscription ← trends table
↓
Generate Brief → cache check → hit: return | miss: GPT-4o
↓
Store briefs table → render /brief/[id]
