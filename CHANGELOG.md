# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **CI/CD Pipeline:** Added GitLab CI/CD configuration pipeline (`.gitlab-ci.yml`) with optimized stages and quality check parallelization.
- **Local AI Setup:** Completed local AI setup page updates and user experience styling.
- **Briefs Features:**
  - Added save brief functionality with improved loading UX and animations.
  - Integrated competitor data, platform prompts, and freshness banners (Prompt Version 2).
  - Added briefs list page.
- **Feedback & Integration:** Added capability to send feedback emails via Resend.
- **Tests & Scripts:** Created unit test suite for format helpers and configured testing/data validation scripts.

### Fixed

- **Build & Supabase:**
  - Resolved build-time Supabase initialization failure in feedback route.
  - Refactored `createClient` to singleton pattern to prevent multiple `GoTrueClient` instances.
  - Replaced `getUser` with `getSession` and configured `persistSession` in Supabase client.
  - Resolved redirect loop on briefs page by waiting for session.
- **AI/LLM Fallbacks:**
  - Fixed brief generation on Vercel using Gemini/OpenAI fallbacks.
  - Fixed Ollama usage via HTTPS proxy to bypass mixed content blocks, enabling direct calls from the browser.
- **Linting & Code Quality:**
  - Upgraded ESLint to v9, migrated to flat config (`eslint.config.mjs`).
  - Resolved onboarding page JSX comment error.
- **UI & Navigation:**
  - Fixed dashboard navbar duplicate buttons, briefs redirect loops, and dashboard links.
  - Fixed guest mode briefs saving logic.
  - Removed "Reseed Intel" button and "Quietly Rise" option from dashboard.
  - Fixed language switcher labels and text (ENG/HIN/TEL).
- **Environment & Configuration:**
  - Added environment validation (`validate-env.js`) and `.env.example` templates.
  - Tracked configuration variables dynamically.

### Changed

- Configured ESLint, Prettier, and husky git hooks.
- Disabled middleware checks completely for routing paths.
