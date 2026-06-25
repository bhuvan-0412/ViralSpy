# Contributing to ViralSpy

We are thrilled that you want to help improve ViralSpy! As an open-source project dedicated to cinematic trend prediction, we welcome contributions of all kinds, from bug fixes and documentation to new features and statistical models.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](file:///d:/ViralSpy/CODE_OF_CONDUCT.md). Please report any unacceptable behavior to the project maintainers.

---

## 🐛 How to Contribute

### 1. Reporting Bugs & Suggesting Features

- Search the open GitHub Issues to make sure your bug or feature request hasn't already been reported.
- If it's a new issue, use one of our structured issue templates:
  - For bugs, fill out the [Bug Report Template](file:///.github/ISSUE_TEMPLATE/BUG_REPORT.md).
  - For feature ideas, fill out the [Feature Request Template](file:///.github/ISSUE_TEMPLATE/FEATURE_REQUEST.md).

### 2. Git Branching Strategy & Workflow

To keep the codebase clean, stable, and easy to review, we follow a strict branching model:

- Always branch off of the `main` branch.
- Use descriptive branch prefixes followed by a short hyphenated description:
  - `feature/` or `feat/` for new features (e.g., `feature/tiktok-scraper`)
  - `fix/` or `bug/` for bug fixes (e.g., `fix/divide-by-zero-seed`)
  - `docs/` for documentation updates (e.g., `docs/add-api-endpoints`)
  - `refactor/` for code restructuring (e.g., `refactor/speckit-primitives`)

### 3. Step-by-Step Pull Request Process

1. **Fork the Repository**: Create a personal copy of the project on GitHub.
2. **Clone the Fork**: Clone your fork locally.
   ```bash
   git clone https://github.com/your-username/ViralSpy.git
   cd ViralSpy
   ```
3. **Set Up Upstream Remote**: Keep your fork in sync with the main repository.
   ```bash
   git remote add upstream https://github.com/original-owner/ViralSpy.git
   ```
4. **Create a Branch**:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
5. **Develop & Test**: Write your code, adhering to the project's styling and TypeScript/ESLint config. Run linting and smoke tests (see [Local Development Setup](#local-development-setup)).
6. **Commit Changes**: Use Conventional Commits formatting.
   - Example: `feat(api): add tiktok ingestion endpoint`
   - Example: `fix(dashboard): resolve pulsing card alignment on mobile`
   - Example: `docs: update setup steps in contributing guide`
7. **Push to Your Fork**:
   ```bash
   git push origin feature/your-awesome-feature
   ```
8. **Open a Pull Request**: Submit the PR to our `main` branch. Ensure the [Pull Request Template](file:///.github/PULL_REQUEST_TEMPLATE.md) is fully filled out.

---

## 🛠️ Local Development Setup

### Installation

Ensure you have Node.js version 18+ and npm installed.

1. Install all dependencies (including dev dependencies):
   ```bash
   npm install
   ```
2. Setup Husky pre-commit hooks:
   ```bash
   npm run prepare
   ```

### Quality & Verification Checklist

Before submitting a pull request, you **must** run the verification suite locally:

```bash
# 1. Run typescript compiler checks (no-emit)
npm run check:types

# 2. Run ESLint rules
npm run lint

# 3. Check code formatting with Prettier
npm run format:check

# 4. Run dependency and deadcode analyses
npm run check:deadcode

# 5. Check for duplicate code blocks
npm run check:duplicate

# 6. Run local smoke tests
npm run test

# 7. Run all checks at once
npm run check:all
```

---

## 🎨 Design and Coding Style

- **SpecKit Enforcement:** Ensure all new components reuse primitives located under `@/components/SpecKit/` (`Card.js`, `Button.js`, `Badge.js`, `Skeleton.js`, `Sparkline.js`). Adhere strictly to the **zero-border-radius** standard (`rounded-none`).
- **No Placeholders:** Ensure any external API endpoints or calls have mock/fallback behaviors so the app remains usable offline or with missing keys.
