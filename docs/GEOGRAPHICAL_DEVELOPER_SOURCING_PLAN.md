# Document 4: Contributor Growth Strategy – Geographical Developer Sourcing Plan

This document outlines the expansion plan to source global developer talent across different geographical hubs, enabling a 24/7 asynchronous collaboration loop for **ViralSpy** development.

---

## Regional Talent Sourcing Vectors

| Region                 | Primary Sourcing Vectors                                                                              | Asynchronous Collaboration Framework                                         | Timezone Coverage |
| :--------------------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :---------------- |
| **North America (NA)** | Major tech universities, open-source meetups, specialized local Slack/Discord groups.                 | GitHub Projects boards, detailed RFC documents, daily async standups.        | UTC-5 to UTC-8    |
| **Europe (EU)**        | European tech universities, localized open-source conferences (FOSDEM), European startup communities. | Code reviews, design system specifications, structured CI/CD automation.     | UTC+0 to UTC+3    |
| **APAC / India**       | Tech college placement cells, regional hackathons, local active developer forums.                     | Detailed issue descriptions, modular task splits, comprehensive test suites. | UTC+5 to UTC+9    |
| **LATAM**              | Emerging developer academies, regional open-source communities.                                       | Standardized API schemas, code style definitions, documentation guides.      | UTC-3 to UTC-5    |

---

## Regional Execution Strategies

### 1. North America (NA)

- **Talent Access Vectors:**
  - Target computer science departments at universities with strong open-source clubs (e.g., UC Berkeley, MIT, Stanford, Waterloo).
  - Participate in localized tech meetups and developer forums focused on Next.js, Supabase, and AI.
- **Async Collaboration:**
  - Maintain a master **GitHub Projects Board** detailing short-term and long-term features.
  - Enforce the write-up of Request for Comments (RFC) documents for any major architectural shifts (e.g., upgrading database schemas or altering API routes).

### 2. Europe (EU)

- **Talent Access Vectors:**
  - Promote the project at major European open-source conferences such as **FOSDEM** (Brussels) or **JSConf EU**.
  - Partner with European student groups who seek open-source contributions for academic credit or project experience.
- **Async Collaboration:**
  - Rely heavily on automated testing pipelines (GitHub Actions, GitLab CI) to ensure code quality regardless of timezone.
  - Establish code review rotations where developers in EU timezones review PRs submitted by APAC contributors during their morning, and pass their own code to NA developers for review during the EU evening.

### 3. APAC / India

- **Talent Access Vectors:**
  - Tap into placement networks at major technical institutions (e.g., IITs, NITs, BITS) and local bootcamps.
  - Sponsor or participate in regional hackathons (e.g., Smart India Hackathon, local community dev sprints).
- **Async Collaboration:**
  - Break down larger system implementations into small, modular tickets with clearly defined input/output boundaries.
  - Ensure robust local documentation exists so developers can debug setup, API, or database issues without waiting for real-time support from other timezones.

### 4. LATAM

- **Talent Access Vectors:**
  - Sponsor local developer bootcamps and open-source accelerators (e.g., Laboratoria, Platzi community).
  - Engage with active Spanish/Portuguese-speaking developer communities on Discord and Twitter/X.
- **Async Collaboration:**
  - Establish standard schemas and mock services so developers can build UI components or API handlers independently of backend changes.
  - Provide unified style guides and automated linters to prevent friction over code formatting.
