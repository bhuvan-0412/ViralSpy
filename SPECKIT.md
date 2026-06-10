# ViralSpy // SpecKit
**Document Status:** Production Ready 
**Target:** Hackathon MVP Submission

---

## `/speckit.constitution`
**The Core Ground Rules**
*   **Tech Stack:** Next.js 14 (App Router), Supabase (Postgres + Auth), Tailwind CSS, OpenAI GPT-4o.
*   **Design Language:** Print magazine meets cinematic dark mode. Strict hex codes. No rounded corners, no neon SaaS gradients. We want a sharp, editorial feel. 
    *   Background: `#1A1A1A` 
    *   Text/Accents: `#F4F2ED`
*   **Vibe:** Minimalist, fast, and highly actionable.

---

## `/speckit.specify`
**The Problem:** Content creators usually jump on trends when they see them on their "For You" page. By then, the algorithm is saturated. If you film a video for a trend that has already peaked, your organic reach is practically zero. 

**The Solution:** ViralSpy is a trend prediction engine. We don't track total views; we track *velocity*. By comparing current posts-per-hour against a 24-hour baseline, we catch trends 48 hours before they hit peak saturation. Instead of just showing the data, we use GPT-4o to hand the creator a ready-to-film content brief (hook, angles, format) so they can hit record immediately.

---

## `/speckit.plan`

### 1. The Algorithm (Velocity Scoring)
Total views are a vanity metric. Velocity is what matters. To find breakouts, we calculate:

$$\text{Score} = \left( \frac{\text{Current Posts/Hour}}{\text{24h Avg Posts/Hour}} \right) \times 100$$

*   **> 300 (EXPLODING):** Getting 3x its normal volume. Absolute breakout.
*   **150 - 300 (RISING):** Healthy upward momentum.
*   **< 150 (PEAKED):** Trend is dying or already dead.

### 2. Architecture & Data Flow
Keep it lightweight. 
1.  A cron job pings our API every hour to fetch data (mocked for the hackathon, built for YouTube/TikTok APIs in production).
2.  The API runs the velocity algorithm and stores the current score in `trends`. 
3.  It also pushes a row to `trend_snapshots` so we can draw the sparkline charts on the frontend.
4.  When a user clicks "Generate Brief", we pass the trend data to GPT-4o, parse the JSON, save it to `briefs`, and render it on the client.

### 3. Database Schema (Supabase)

**Table: `trends`**
The core feed.
*   `id` (uuid, pk)
*   `name` (text) - e.g., "Girl dinner", "Roman Empire"
*   `niche` (text)
*   `velocity_score` (numeric)
*   `momentum_status` (text) - EXPLODING, RISING, or PEAKED

**Table: `trend_snapshots`**
Powers the visual sparklines.
*   `id` (uuid, pk)
*   `trend_id` (uuid, fk)
*   `velocity_score` (numeric)
*   `created_at` (timestamp)

**Table: `briefs`**
Caches the GPT-4o output so we don't pay for the same generation twice.
*   `id` (uuid, pk)
*   `trend_id` (uuid, fk)
*   `hook` (text)
*   `angles` (jsonb) - Array of 3 angles
*   `hashtags` (jsonb) - Array of 5 tags

### 4. UI/UX Design System
We are building these components manually to maintain strict control over the cinematic aesthetic. No component libraries.

*   **The Card:** Sharp edges, `1px solid rgba(244, 242, 237, 0.1)` border. On hover, the border opacity bumps to 25% and the card lifts slightly.
*   **The "Exploding" State:** If a trend is EXPLODING, the border pulses red (`#ef4444`) shifting between 20% and 70% opacity. It should look urgent.
*   **The Badge:** Monospaced font, tight padding (`px-2 py-0.5`).
*   **Skeletons:** When the AI is generating the brief, use flat blocks of `#1A1A1A` with a subtle 5% `#F4F2ED` overlay that pulses. No cheap sliding gradients.

---

## `/speckit.tasks`
**Execution Steps for the Build:**
1. Spin up Next.js App Router and clear out boilerplate.
2. Initialize Supabase project and execute schema SQL.
3. Seed database with 20 realistic trends (ensuring a mix of Exploding, Rising, and Peaked).
4. Build the `Card` and `Badge` UI components.
5. Wire up the `/dashboard` feed to fetch from Supabase.
6. Connect the GPT-4o API route with the strict JSON system prompt.
7. Deploy to Vercel.

---