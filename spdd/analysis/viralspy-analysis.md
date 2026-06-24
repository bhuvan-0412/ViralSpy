# ViralSpy — Strategic Analysis

## Project Overview

AI-powered trend detection SaaS. Detects trends 48h early across
YouTube Shorts, Instagram Reels, Reddit. Generates GPT-4o content
briefs (hook, angles, hashtags, script) for content creators.

## Business Goals

- Primary: Give creators competitive edge via early trend detection
- Secondary: Reduce brief creation from hours to 5 seconds
- Monetization: $29/month creator, $99/month agency

## Core Problems Solved

1. Trend-chasing is guesswork — creators post 2 days too late
2. Content briefs take hours — AI does it in 5 seconds
3. Cross-platform monitoring is manual — ViralSpy automates it

## Key Risks & Mitigations

| Risk                   | Mitigation                   |
| ---------------------- | ---------------------------- |
| API rate limits        | Seed data fallback           |
| GPT-4o latency         | Brief caching in Supabase    |
| Trend accuracy         | Confidence scoring           |
| TikTok banned in India | YouTube + Instagram + Reddit |

## Technical Decisions

| Decision  | Chosen     | Rejected          | Reason                      |
| --------- | ---------- | ----------------- | --------------------------- |
| Database  | Supabase   | Firebase          | SQL + RLS + Realtime        |
| AI        | GPT-4o     | Gemini            | Best structured JSON output |
| Framework | Next.js 14 | Remix             | App Router + Vercel         |
| Styling   | Tailwind   | styled-components | Speed + consistency         |

## Feature Priority

| Feature          | Priority | Status      |
| ---------------- | -------- | ----------- |
| Trend dashboard  | P0       | ✓ Done      |
| Brief generator  | P0       | In Progress |
| Niche filtering  | P0       | ✓ Done      |
| Realtime updates | P1       | Pending     |
| Live API polling | P1       | Pending     |
| Auth + profiles  | P1       | Pending     |
| Saved trends     | P2       | Not started |
| Alerts           | P2       | Not started |

## Current Status

- [x] Next.js 14 + Supabase + Tailwind scaffolded
- [x] Database schema (6 tables + RLS + seed data)
- [x] Dashboard (stat cards + trend cards + niche filter)
- [x] Logo (lightning bolt + ViralSpy wordmark)
- [x] GPT-4o API key validated (200 OK)
- [x] Brief page fully rendering GPT-4o output
- [x] Stat cards using real Supabase counts
- [x] Warning banner removed
- [x] Platform seed data fixed (no TikTok)
- [x] Supabase Realtime wired
- [x] YouTube + Reddit APIs in /api/poll
