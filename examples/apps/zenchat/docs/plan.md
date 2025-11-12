## Phase 0 – Environment & Quality Gates

- **Goals**: Establish Next.js App Router baseline, TypeScript strictness, testing harness, linting, formatting, CI hooks.
- **Stack Alignment**: Configure Next.js 15.4.6, React 19.1, Tailwind CSS 4, ESLint 9, Prettier, Jest + React Testing Library, Playwright smoke scaffold.
- **TDD Cycle**:
  1. _Red_: Author Jest smoke test asserting the root layout renders `Zen Chat` header.
  2. _Green_: Scaffold `app/layout.tsx`, `app/page.tsx` minimal content, Tailwind setup, dark/light theme toggle placeholder (`next-themes`).
  3. _Refactor_: Extract layout constants, enforce ESLint + Prettier, ensure CI scripts run locally.
- **Prerequisites**: Node tooling installed, OpenAI API key placeholder, Husky-like pre-commit optional.
- **Deliverables**: Passing unit test suite, lint-staged scripts, Tailwind config aligned with design spacing/typography, GitHub Actions (optional).

## Phase 1 – Core Layout & Theming

- **Goals**: Implement responsive shell, header, conversation canvas per `design.html`, light/dark theming via CSS variables.
- **Stack Alignment**: Use App Router server components where possible, Tailwind utility tokens with design spacing, Radix primitives for layout semantics.
- **TDD Cycle**:
  1. _Red_: Write RTL test verifying header renders, main chat container flex layout, theme toggle accessible.
  2. _Green_: Build `app/page.tsx` server component returning layout shell, create `components/ui/theme-toggle.tsx` client component using `next-themes`.
  3. _Refactor_: Extract layout tokens to `lib/theme.ts`, ensure responsive breakpoints (<768, 768-1024, >1024) with Tailwind.
- **Integration Tests**: Playwright viewports for mobile/desktop verifying theming toggle persists preference.
- **Deliverables**: Static responsive layout matching design wireframe, accessible theme switch, baseline snapshot tests.

## Phase 2 – Message Timeline & Rendering

- **Goals**: Create chat transcript UI with streaming-ready message cards, author metadata, reasoning/sources accordions.
- **Stack Alignment**: React Server Components for message list, incrementally adopt client components for interactions (collapse panels) using Radix Accordion.
- **TDD Cycle**:
  1. _Red_: Component test ensuring user/AI messages render with correct alignments/colors.
  2. _Green_: Implement `components/ai-elements/message.tsx`, `message-list.tsx`, apply Tailwind styles to mirror `design.html` chat cards.
  3. _Refactor_: Introduce type-safe `Message` interface, move shared tokens (spacing, palette) to constants, ensure ARIA roles.
- **Additional Tests**: Markdown renderer unit tests stub verifying code blocks, math, GFM via `react-markdown` + `harden-react-markdown`.
- **Deliverables**: Message list with placeholder data, collapsible reasoning/sources blocks, markdown rendering pipeline secured.

## Phase 3 – Input Composer & Model Selector

- **Goals**: Build user input area with textarea autosize, model dropdown, send controls, loading indicators.
- **Stack Alignment**: Client component with `react-hook-form` + Zod schema, Radix Select for models, Tailwind for styling, maintain accessibility (44px targets).
- **TDD Cycle**:
  1. _Red_: Form validation test ensuring empty submissions blocked, model defaults to GPT-4o.
  2. _Green_: Develop `components/ai-elements/input-composer.tsx` using `react-hook-form`, integrate Zod schema, create `ModelSelector` subcomponent.
  3. _Refactor_: Extract form schema definitions to `lib/validation.ts`, share types with server.
- **Integration Tests**: Playwright test enters text, selects model, submits (mocked API).
- **Deliverables**: Input composer component, validation error states, loading spinner states aligning with design.

## Phase 4 – Streaming Chat API (Server Actions)

- **Goals**: Implement `/api/chat` streaming route and server action leveraging AI SDK 5.0.8 with OpenAI provider.
- **Stack Alignment**: Server Action `sendMessageAction` using AI SDK streaming helpers, TypeScript types from shared schema.
- **TDD Cycle**:
  1. _Red_: API route test (Vitest/Jest with `@ai-sdk/testing` or mocked fetch) expecting SSE stream for valid payload, 400 on invalid schema.
  2. _Green_: Implement server logic: validate payload with Zod, resolve model, call `streamText`, forward chunks, add guard clauses.
  3. _Refactor_: Extract provider config to `lib/ai/clients.ts`, centralize model metadata.
- **Additional Checks**: Ensure error handling returns structured JSON, logging stubs for Sentry/Posthog (later).
- **Deliverables**: Functional streaming endpoint, server action consumed by input composer, tests covering happy/error paths.

## Phase 5 – Client Streaming Integration

- **Goals**: Connect TanStack Query hooks with `@ai-sdk/react` streaming utilities for real-time updates in UI.
- **Stack Alignment**: Custom hook `useChatSession` handling optimistic updates, server action mutation, Zustand store for conversation state if necessary.
- **TDD Cycle**:
  1. _Red_: Hook test verifying state transitions (`isLoading`, `messages`, `error`).
  2. _Green_: Implement hook with TanStack Query mutation using server action, handle streaming updates into message list.
  3. _Refactor_: Introduce `ConversationProvider` context (client component) for timeline, co-locate selectors.
- **Integration Tests**: Playwright E2E streaming simulation verifying tokens append progressively.
- **Deliverables**: Live chat experience with streaming text, loading indicators, error banners, ability to switch models mid-session.

## Phase 6 – Model Management & Switching

- **Goals**: Persist conversation context while switching models, update server request payload accordingly.
- **Stack Alignment**: Zustand store to track conversation history, selected model, conversation metadata.
- **TDD Cycle**:
  1. _Red_: Store unit test asserting model switch maintains messages and updates selection.
  2. _Green_: Implement Zustand store with actions for `setModel`, `appendMessage`, `resetConversation`.
  3. _Refactor_: Integrate store with `useChatSession`, ensure server action respects selected model.
- **Integration Tests**: Playwright script toggling models mid-stream verifying continuity.
- **Deliverables**: Model switch control wired, conversation continuity preserved, consistent UI state.

## Phase 7 – Observability & Analytics

- **Goals**: Embed Sentry error boundaries, Posthog analytics events, logging for streaming lifecycle.
- **Stack Alignment**: Use Sentry Next.js SDK, Posthog React integration, ensure minimal bundle impact via dynamic imports.
- **TDD Cycle**:
  1. _Red_: Unit tests verifying event dispatcher called on message send success/failure.
  2. _Green_: Implement instrumentation wrappers, dynamic import analytics, guard by env flags.
  3. _Refactor_: Move instrumentation utilities to `lib/observability.ts`.
- **Deliverables**: Error boundaries, analytics hooks, privacy toggles.

## Phase 8 – Internationalization & SEO

- **Goals**: Apply `next-intl` for locale strings, integrate `next-seo` metadata aligned with product copy.
- **Stack Alignment**: Server components deliver localized strings, metadata handler per locale, accessible translations.
- **TDD Cycle**:
  1. _Red_: Snapshot/unit tests verifying locale strings render, metadata contains localized title/description.
  2. _Green_: Implement `MessagesProvider`, update components to use translation hooks, configure `next-seo.config.ts`.
  3. _Refactor_: Extract copy to JSON, ensure fallback locale.
- **Deliverables**: Multilingual UI skeleton, SEO metadata for main page.

## Phase 9 – Accessibility, Performance, and Polish

- **Goals**: Enforce WCAG AA, optimize image assets, finalize transitions, ensure 60fps interactions.
- **Stack Alignment**: Lighthouse audits, Next.js image optimization (if assets added), Tailwind focus rings.
- **TDD Cycle**:
  1. _Red_: Accessibility integration test verifying keyboard navigation, aria labels.
  2. _Green_: Add ARIA props, focus management, reduce layout shifts, throttle streaming updates if needed.
  3. _Refactor_: Audit bundle size (dynamic imports), prefetch logic, finalize responsive tweaks.
- **Deliverables**: Accessibility checklist passed, performance metrics documented, final regression test suite.

## Phase 10 – Documentation & Release Readiness

- **Goals**: Prepare developer onboarding docs, test matrix, release notes.
- **Stack Alignment**: Document server actions, state management, testing strategy referencing PRD scope.
- **TDD Cycle**:
  1. _Red_: Doc linting (remark-lint) or unit test verifying presence of metadata (optional).
  2. _Green_: Create README sections (`Getting Started`, `Testing`, `Architecture`), update PRD-to-implementation traceability.
  3. _Refactor_: Review TODOs, ensure CI/CD green, tag release candidate.
- **Deliverables**: Updated docs, task checklists, deployment instructions, backlog for future enhancements (e.g., voice input).
