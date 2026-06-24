# ViralSpy // SpecKit Predictor Blueprint

---

## `/speckit.constitution`

**The Core Environment & Design Rules**

1. **Aesthetic Identity:** Strict dark editorial magazine theme. Background MUST be `#1A1A1A`. Typography, accents, and borders MUST be `#F4F2ED` (warm print off-white). No neon gradients.
2. **Zero Border Radii:** Absolute enforcement of `rounded-none` globally. No rounded corners are allowed on any component, card, button, or badge.
3. **Resilient Architecture:** Every feature must support a local fallback (Guest Demo Mode via safe `localStorage` wrappers, local mock AI generator) if environment variables or API keys are missing, ensuring 100% uptime during judging.
4. **Design System Monopoly:** All UI layouts must exclusively consume our custom, manually written primitives from `@/components/SpecKit/` (`Card.js`, `Button.js`, `Badge.js`, `Skeleton.js`, `Sparkline.js`). No generic HTML buttons/divs or external UI libraries.

---

## `/speckit.specify`

**Core Feature Requirements**

- **Landing Page (`app/page.js`):** Contains a standard Google OAuth entrance alongside a prominent, custom-styled "Explore Guest Terminal" button that instantly seeds 20 trends data into local storage, pre-seeds default niches, and seamlessly forwards the user to the `/dashboard` feed bypassing onboarding.
- **Signal Feed Dashboard (`app/dashboard/page.js`):** Displays the top 10 trends inside SpecKit `Card` components, utilizing `Sparkline` vector curves for trend velocity visualization, and automatically applying the `.exploding-card-pulse` border glow and `EXPLODING` status `Badge` to the #1 ranked trend (the first card) or any trend with a velocity score exceeding 300%.
- **AI Strategy Dossier (`app/brief/[id]/page.js`):** Displays copy-ready hooks, 3 creative video angles, and target posting metrics using monospaced SpecKit `Button` variants, including a "Copy Hook" button and an "Export to Workspace" button that compiles a fully-formatted Markdown strategy dossier directly to the user's clipboard.

---

## `/speckit.plan`

**Technical Routing & Security Plan**

- **Client Pages:**
  - `app/page.js`: Implements the interactive Guest Terminal gateway logic.
  - `app/dashboard/page.js`: Implements the filtered top 10 grids and exploding card states.
  - `app/brief/[id]/page.js`: Implements the clipboard copy and Markdown brief exporter.
- **Backend Mathematical Safety:**
  - Protect `app/api/seed/route.js` and `app/api/trends/route.js` against divide-by-zero errors. If historical average volume is 0 or null, fall back to `1` so the velocity score is calculated safely.
- **Next.js SSR/Hydration Safety:**
  - Wrap all client-side `localStorage` checks in safety blocks checking `typeof window !== 'undefined'` to prevent static pre-rendering compilation failures.

---

## `/speckit.tasks`

**Micro-Task Implementation Checklist**

- [x] Create components directory `@/components/SpecKit/`
- [x] Migrate `Card.js`, `Button.js`, `Badge.js`, `Skeleton.js`, and `Sparkline.js` to `@/components/SpecKit/`
- [x] Enforce `rounded-none` border-radius globally on all SpecKit UI primitives
- [x] Delete legacy directories (`components/ui/`) and files (`components/Sparkline.js`)
- [x] Refactor import paths in pages:
  - [x] `app/page.js`
  - [x] `app/onboarding/page.js`
  - [x] `app/dashboard/page.js`
  - [x] `app/brief/[id]/page.js`
- [x] Confirm divide-by-zero protections in API seed and trend routes
- [x] Confirm SSR localstorage safeguards in supabase library
- [x] Verify production compilation output with `npm run build`
