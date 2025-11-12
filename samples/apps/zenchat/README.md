## Zen Chat · Phase 0 Baseline

This repository houses the Phase 0 foundation for Zen Chat, an AI-centric chat workspace. The goal of this phase is to establish reliable tooling, theming primitives, and quality gates so later phases can iterate on product features with confidence.

### Stack

- Next.js 15.4.6 with the App Router and React 19
- TypeScript (strict, `noImplicitOverride`, `exactOptionalPropertyTypes`)
- Tailwind CSS 4 tokens backed by CSS variables and `next-themes`
- ESLint 9 (flat config), Prettier 3, lint-staged, Husky 9
- Jest + React Testing Library for unit tests
- Playwright smoke suite scaffold

### Commands

```bash
npm run dev              # start development server
npm run lint             # run ESLint with zero-warning budget
npm run format           # verify formatting via Prettier
npm run test             # execute Jest test suite
npm run test:ci          # run Jest serially for CI pipelines
npm run playwright:test  # execute Playwright smoke specs
```

### Project Structure

- `app/` – App Router layouts, pages, and tests
- `components/` – UI primitives and providers (client components live here)
- `lib/` – shared utilities, design tokens, configuration
- `playwright/` – Playwright smoke tests and fixtures
- `docs/` – planning, stack decisions, and supporting documentation

### Tooling Notes

- Husky expects the repository to be initialized as a git project. Run `git init` before installing dependencies locally.
- lint-staged enforces formatting and linting for staged files during commits.
- Jest setup stubs `next/font` and adds a `matchMedia` polyfill for deterministic tests.

### Next Steps

Phase 1 focuses on the core UI shell, responsive layout, and accessible theme switching. Review `docs/plan.md` for the full roadmap.
