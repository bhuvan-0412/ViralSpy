# Document 3: Contributor Growth Strategy – Week-Wise Outreach & Setup Optimization Plan

This document details an aggressive 4-week roadmap aimed at sourcing, onboarding, and retaining software engineers, technical writers, and open-source maintainers to build out the **ViralSpy** platform.

---

## 4-Week Contributor Pipeline

| Week       | Target Sourcing Channels                                | Contribution Flywheel Focus                                                | Retention & KPI Tracking                                                 |
| :--------- | :------------------------------------------------------ | :------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Week 1** | GitHub Explore, DEV.to, Hashnode.                       | Fast local setup, `Good First Issues` mapping, contribution guide updates. | Track Local Init time ($<5$ mins target), document build blockers.       |
| **Week 2** | Reddit (r/opensource, r/reactjs), Hacker News.          | Automated CI feedback, lint checks, issue template guidelines.             | Track PR Time-to-First-Review ($<24$ hours target).                      |
| **Week 3** | Open-source Discord servers, local university CS clubs. | Modular codebase tasks, feature branch setup guides.                       | Track Merge Rate, create "First PR Merged" shoutouts on social channels. |
| **Week 4** | Tech newsletter sponsorships, virtual hackathons.       | Core architecture documentation, API extension guides.                     | Appoint "Core Maintainers", assign code owner paths.                     |

---

## Operational Details

### Week 1: Sourcing Foundations & Setup Optimization

- **Target Channels:**
  - Publish technical write-ups on DEV.to and Hashnode detailing "How we built a real-time anomaly detector for TikTok & YouTube trends."
  - Highlight the open-source nature of the project.
- **Contribution Flywheel:**
  - Standardize local environment setup: Provide pre-configured Docker Compose files, a detailed `.env.example`, and a fast local onboarding path.
  - Tag at least 15 issues with the `good first issue` and `help wanted` labels, focusing on UI refinements, additional chart widgets, and localization translations.
- **Retention & Tracking:**
  - Monitor the friction of the developer onboarding experience. If setup takes longer than 5 minutes, refine the setup scripts.

### Week 2: CI/CD & Contribution Standards

- **Target Channels:**
  - Share the project on Hacker News ("Show HN: ViralSpy - Open Source real-time trend detector for creators").
  - Submit the project to open-source lists like _Awesome React_ or _Awesome Next.js_.
- **Contribution Flywheel:**
  - Integrate strict but fast linting and formatting workflows (ESLint flat config, Prettier, husky pre-commit hooks) so contributors receive immediate, automated feedback.
  - Implement issue templates for Bug Reports, Feature Requests, Documentation, and Setup Queries to streamline community submissions.
- **Retention & Tracking:**
  - Track **Time-to-First-Review (TTFR)**. Ensure a maintainer reviews every new PR within 24 hours to keep external developers engaged.

### Week 3: Community Seeding & Modular Tasks

- **Target Channels:**
  - Promote within specialized Discord servers (e.g., Supabase, Next.js, Next-Intl, Tailwind CSS communities) looking for real-world projects to contribute to.
- **Contribution Flywheel:**
  - Break down larger features (like integrating a new platform API or adding a new chart) into modular, independent issues that do not require deep understanding of the entire codebase.
- **Retention & Tracking:**
  - Establish appreciation loops: Send automated thank-you notes, feature contributor avatars in the `README.md`, and tweet about merged contributions.

### Week 4: Elevating Contributors to Maintainers

- **Target Channels:**
  - Sponsor virtual hackathons or open-source sprints.
- **Contribution Flywheel:**
  - Provide advanced developer guides explaining the database schema (`supabase_schema.sql`), custom scheduler tasks, and the LLM brief prompt engine.
- **Retention & Tracking:**
  - Define clear criteria for becoming a Core Maintainer (e.g., 3 merged non-trivial PRs, active issue triage).
  - Assign Git `CODEOWNERS` paths to active contributors, giving them ownership and autonomy over specific parts of the codebase.
