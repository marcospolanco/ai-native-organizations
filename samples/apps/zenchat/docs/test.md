## Phase 0 – Environment & Quality Gates

- **Objective**: Confirm baseline tooling, linting, formatting, and test harness function consistently.
- **Test Protocols**:
  - Run `pnpm lint` and `pnpm test` to ensure ESLint/Jest pass without warnings.
  - Verify Tailwind builds by running `pnpm dev` and inspecting generated classes in browser devtools.
  - Confirm CI script executes locally via `pnpm exec turbo run lint test`.
- **Human-Verifiable Output**:
  - Screenshot or terminal log showing successful lint/test runs.
  - Checklist signed off confirming Tailwind configuration matches spacing/typography tokens.

## Phase 1 – Core Layout & Theming

- **Objective**: Validate responsive shell, header, and theme toggle behavior.
- **Test Protocols**:
  - RTL snapshot/assertion confirming `Zen Chat` header, main chat container, and accessible theme toggle.
  - Manual responsive check across 375px, 768px, 1280px viewports ensuring layout matches `design.html`.
  - Playwright script toggling dark/light mode and verifying persisted preference (via localStorage or cookie).
- **Human-Verifiable Output**:
  - Recorded GIF or screenshots at each breakpoint in both themes.
  - Test report summarizing RTL and Playwright results.

## Phase 2 – Message Timeline & Rendering

- **Objective**: Ensure message list renders user/AI cards with markdown, reasoning, and sources panels.
- **Test Protocols**:
  - RTL tests asserting alignment, avatar placeholders, and ARIA roles for message cards.
  - Unit tests for markdown pipeline covering code blocks, math (`rehype-katex`), and GFM tables.
  - Manual collapse/expand verification of reasoning and sources panels.
- **Human-Verifiable Output**:
  - Screenshot series showing sample conversation with panels expanded/collapsed.
  - Test coverage report snippet highlighting markdown renderer tests.

## Phase 3 – Input Composer & Model Selector

- **Objective**: Confirm form validation, model selection, and submit controls behave per specification.
- **Test Protocols**:
  - RTL form test blocking empty submissions and defaulting to GPT-4o.
  - Zod schema unit tests validating payload shapes.
  - Playwright interaction entering text, switching models, and observing loading indicator.
- **Human-Verifiable Output**:
  - Screen recording of Playwright run (or manual reproduction) showing validation and submission states.
  - Validation checklist documenting schema fields and error messaging.

## Phase 4 – Streaming Chat API (Server Actions)

- **Objective**: Validate streaming API returns SSE chunks and handles invalid payloads gracefully.
- **Test Protocols**:
  - Jest/Vitest tests mocking AI SDK to assert SSE stream structure and 400 responses on validation failure.
  - Manual curl or `curl -N` request verifying real-time streamed tokens.
  - Log inspection confirming guard clauses and error responses.
- **Human-Verifiable Output**:
  - Terminal capture of curl stream showing incremental tokens.
  - Test report detailing success/error case assertions.

## Phase 5 – Client Streaming Integration

- **Objective**: Ensure client hook renders streaming updates, handles loading/error states, and syncs with UI.
- **Test Protocols**:
  - Hook unit tests verifying state transitions (`isLoading`, `messages`, `error`).
  - Playwright E2E simulating conversation to confirm incremental message updates and spinner visibility.
  - Manual regression ensuring message list scroll anchoring behaves during stream.
- **Human-Verifiable Output**:
  - E2E video or HAR file illustrating streaming conversation.
  - Annotated QA notes confirming scroll and state behavior.

## Phase 6 – Model Management & Switching

- **Objective**: Confirm conversations persist across model switches without losing context.
- **Test Protocols**:
  - Zustand store tests asserting state mutations and selectors.
  - Playwright scenario switching models mid-response and after completion.
  - Manual verification that selected model persists after page reload (if designed).
- **Human-Verifiable Output**:
  - Screenshot/log of state inspector (Redux DevTools/Zustand middleware) showing model switch events.
  - Playwright run summary documenting continuity of messages.

## Phase 7 – Observability & Analytics

- **Objective**: Ensure Sentry and Posthog instrumentation fires correctly and respects environment flags.
- **Test Protocols**:
  - Unit tests mocking transport layers to assert event payloads on success/error flows.
  - Manual test triggering benign error to confirm Sentry capture (using staging DSN).
  - Verify Posthog events in development console or network logs.
- **Human-Verifiable Output**:
  - Screenshot of Sentry dashboard event and Posthog timeline entry.
  - Checklist confirming analytics disabled when env flags unset.

## Phase 8 – Internationalization & SEO

- **Objective**: Validate localized strings and SEO metadata render per locale.
- **Test Protocols**:
  - RTL snapshots for default and alternate locale ensuring translated copy.
  - Unit test asserting `next-seo` metadata values per locale configuration.
  - Manual browser test switching locale (query param/path) and inspecting head tags.
- **Human-Verifiable Output**:
  - Screenshots of UI in at least two locales plus devtools head tag capture.
  - Test matrix documenting covered locales and SEO assertions.

## Phase 9 – Accessibility, Performance, and Polish

- **Objective**: Confirm WCAG AA compliance, smooth interactions, and performance targets.
- **Test Protocols**:
  - Playwright axe or `@axe-core/playwright` audit ensuring no critical violations.
  - Keyboard navigation walkthrough verifying focus outlines and shortcuts.
  - Lighthouse performance run focusing on interaction latency and CLS.
- **Human-Verifiable Output**:
  - Accessibility report export, annotated with remediation status.
  - Lighthouse report PDF or screenshot meeting agreed thresholds.

## Phase 10 – Documentation & Release Readiness

- **Objective**: Ensure documentation reflects implementation and release artifacts are complete.
- **Test Protocols**:
  - Remark-lint (or equivalent) pass over docs.
  - Manual doc review verifying sections (`Getting Started`, `Testing`, `Architecture`, traceability matrix).
  - Dry-run deployment script or staging deploy confirmation.
- **Human-Verifiable Output**:
  - Published or shared documentation link along with reviewer sign-off.
  - Deployment log or staging URL screenshot showing successful build.
