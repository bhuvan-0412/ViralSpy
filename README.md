# ViralSpy // SpecKit Predictor MVP

A full-stack trend prediction SaaS for content creators. ViralSpy detects YouTube Shorts, Instagram Reels, and Reddit trends 48 hours before they hit peak algorithmic saturation and generates immediate, ready-to-film content briefs.

---

## 📖 The Manifesto

> **Velocity over Vanity.**
> Total view counts are a trailing metric. ViralSpy tracks velocity to capture breakout topics before the algorithm becomes saturated.

This application is built using the **SpecKit Design System**—a minimalist, cinematic magazine-style interface. 

- **Background:** `#1A1A1A` (Strict Deep Charcoal-Black)
- **Text & Accents:** `#F4F2ED` (Warm Print-Style Off-White)
- **Borders & Rules:** Sharp edges, `1px solid rgba(244, 242, 237, 0.1)`. No rounded corners, no neon SaaS gradients.
- **Pulsing Breakouts:** Breakout trends (`EXPLODING` state) feature a custom red `#ef4444` pulsing shadow border.
- **Watermark:** The signature `— ViralSpy` watermark anchor on layout pages.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Styling:** Vanilla Tailwind CSS with custom global rules in [app/globals.css](file:///d:/ViralSpy/app/globals.css)
- **Database / Auth:** Supabase Client Wrapper in [lib/supabase.js](file:///d:/ViralSpy/lib/supabase.js) supporting:
  - Google OAuth
  - Auto LocalStorage-based Guest Demo Mode (runs seamlessly when Supabase credentials are placeholders)
- **AI Intelligence:** Google Gemini API for structured content brief generation (with automatic structured mock fallbacks when API keys are not supplied)
- **Visualization:** Custom SVG [components/Sparkline.js](file:///d:/ViralSpy/components/Sparkline.js) mapped to the SpecKit color palette.

---

## 📂 Project Structure

```bash
ViralSpy/
├── app/
│   ├── api/
│   │   ├── seed/             # Populates 20 realistic trends in Supabase
│   │   ├── trends/           # Serving trends (sorted by velocity) with local fallback
│   │   ├── generate-brief/   # OpenAI GPT-4o JSON strategist brief generation
│   │   └── brief/            # Strategy brief retrieval by ID
│   ├── brief/[id]/           # Strategy dossier presentation & clipboard copying
│   ├── dashboard/            # Signal intel feed, niche filters, pulsing cards
│   ├── onboarding/           # Niche multi-selector (1-3 categories)
│   ├── globals.css           # Custom fonts & keyframe border animations
│   ├── layout.js             # HTML head & SEO settings
│   └── page.js               # Landing page & entrance logic
├── components/
│   ├── ui/
│   │   ├── Card.js           # SpecKit editorial grid cards
│   │   ├── Button.js         # SpecKit monospaced action buttons
│   │   ├── Badge.js          # SpecKit momentum badges (RISING/EXPLODING/PEAKED)
│   │   └── Skeleton.js       # SpecKit low-contrast loader blocks
│   └── Sparkline.js          # SVG trend visualizer
├── lib/
│   └── supabase.js           # Database & Auth wrapper with local Guest Mode
├── supabase_schema.sql       # Postgres table schema
├── SPECKIT.md                # Specifications blueprint
└── README.md                 # Product documentation
```

---

## ⚙️ Setup & Execution

### 1. Configure Environment
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```
*Note: If these remain empty or placeholders, ViralSpy automatically runs in **Guest Demo Mode**, using local mock generators and local storage.*

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization
If using a live Supabase project, execute the SQL schema in [supabase_schema.sql](file:///d:/ViralSpy/supabase_schema.sql) in your Supabase SQL Editor.

### 4. Running Locally
Run the Next.js dev server:
```bash
npm run dev
```

### 5. Seeding Data
Once running, ping `/api/seed` (or click **"RE-SEED DEMO"** on the dashboard) to load the initial 20 trend profiles into the database.

---

💼 *ViralSpy*
