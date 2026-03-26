# Senior Software Orchestration Engineer

> **Purpose**
> Senior Engineers no longer write all the code themselves — they design, operate, and continuously improve the socio-technical reliability systems that turn non-deterministic AI agent output into correct, safe, auditable, and maintainable production software.

---

## 1. Overview

This role defines the next evolution of senior engineering: the shift from personal coding velocity to orchestrating reliable agentic software delivery. You will own the context layers, verification gates, workflow runtimes, cost governance, and safety mechanisms that allow teams to safely extract high leverage from frontier agentic tools while maintaining — or improving — quality, security, and compliance.

You treat AI agents as non-deterministic workers that must be constrained, measured, and governed exactly like any other production system.

The primary bottleneck in modern software delivery is no longer the ability to generate code. It is the capacity to verify it at scale, govern it safely, and ship it with confidence. This role exists to solve that bottleneck.

> 🧩 **Goal:** Build reusable orchestration primitives that any team can adopt, measure, and extend as agentic capabilities mature.

---

## 2. Core Responsibilities

### A. Context Engineering

Design and maintain the information environment that makes agents predictable and safe.

- Build structured context packs, retrieval pipelines, and Project Constitution artifacts (CLAUDE.md-style policy files) that give agents high-fidelity, minimal, provenance-tagged context.
- Define tool schemas, permission boundaries, and error contracts using least-privilege principles and standardized protocols (MCP or equivalent).
- Manage the trade-off between context window saturation and retrieval accuracy — optimize for token efficiency without sacrificing signal quality.
- **Deliverables:** context schema standards, tool contract libraries, retrieval provenance tagging, permissioned tool wrappers, agent-readable architecture docs.

### B. Verification Engineering

Build the systems that prove correctness — the highest-leverage work in agentic delivery.

- Construct automated evaluation harnesses, regression suites, property-based tests, and adversarial red-team sets that catch "plausible-but-wrong" agent outputs before they merge.
- Integrate verification gates into CI/CD so no agent-generated change lands without measurable quality and safety signals.
- Author and maintain the failing tests that define desired behavior — the "gates" that agents must pass through iterative implementation cycles.
- Design layered eval strategies: deterministic tests, behavioral evals (golden tasks, property tests), adversarial tests (prompt injection, unsafe tool use), and human spot-check protocols for high-risk changes.
- **Deliverables:** eval suites with structured scoring, risk-weighted eval dashboards, CI-integrated regression gates, golden-task benchmarks, canary eval pipelines, versioned baselines with drift detection.

### C. Agent Workflow Design & Orchestration

Architect the control plane that coordinates specialized agents while preventing distributed-monolith failures.

- Decompose work into scoped subtasks with clear completion signals and route tasks across specialized agents based on risk and context.
- Design durable, observable multi-agent workflows (planner–worker, supervisor–specialist patterns) with retries, timeouts, resumability, idempotency, human approval gates, and rollback strategies.
- Implement long-running execution using stateful orchestration runtimes (Temporal-class durability patterns).
- Add mandatory human checkpoints when dangerous operations or high-risk diffs are present.
- **Deliverables:** workflow graphs with explicit checkpoints, multi-agent coordination wrappers, cost/latency bounds per workflow, observability instrumentation (OpenTelemetry-style traces with correlation IDs).

### D. Token Economics & Cost Governance

Own the cost-performance envelope of the agent fleet.

- Select models and execution strategies that maximize value-per-dollar: frontier models for planning, lighter models for execution, local models for iteration.
- Bound agent loops and tool calls to prevent runaway costs and denial-of-service conditions.
- Instrument and report on token spend, latency, and throughput per workflow — make cost visible at the team level.
- **Deliverables:** model selection guidelines, per-workflow cost dashboards, context pruning playbook, budget alerting and circuit breakers.

### E. Safety, Governance & Failure Analysis

Treat agentic failure modes as a distinct engineering discipline.

- Threat-model agent-specific risks — indirect prompt injection, tool hijacking, silent corruption, unsafe actions, reasoning drift, context overflow, goal ambiguity — and implement mitigations aligned to OWASP LLM Top 10 and NIST AI RMF.
- Build audit logging, trace correlation, and post-mortem processes that turn every agent incident into new evals, guardrails, or policy updates.
- Enforce environment separation (dev/staging/prod) and code-freeze discipline for agentic tool access.
- **Deliverables:** threat models, red-team reports, permission models with blast-radius controls, continuous risk register, incident-to-eval conversion pipeline, audit log standards.

### F. Engineering Effectiveness, Knowledge Codification & Mentorship

Multiply team capability through systems, not heroics.

- Identify repetitive workflows and codify best practices into reusable prompt libraries, templates, linter rules, and internal playbooks.
- Measure and improve adoption of orchestration assets across teams.
- Mentor engineers on verification-first practices and agentic collaboration techniques.
- Translate tacit team wisdom into durable, agent-readable artifacts.
- **Deliverables:** internal orchestration playbook, shared prompt/context libraries, annotated failure post-mortems, team AI-fluency metrics, onboarding context packs for new engineers.

---

## 3. Evaluation Criteria

Performance is measured by **system-level impact and reproducibility**, not lines of code or personal velocity.

| Category | Example Indicators |
|---|---|
| **Effectiveness** | Improved DORA metrics (lead time, deployment frequency, MTTR, change failure rate); reduction in verification overhead; higher agent task success rate |
| **Quality** | Fewer regressions or "plausible-but-wrong" defects; higher eval coverage and pass-rate stability; reduction in post-merge agent-induced incidents |
| **Adoption** | Reusable context packs, tool contracts, eval harnesses, and workflows adopted by ≥2 teams; measured increase in team orchestration fluency |
| **Safety & Compliance** | Zero high-severity agent-induced incidents; complete auditability of agent actions; NIST AI RMF / OWASP LLM-aligned controls in place and exercised |
| **Cost Governance** | Token spend per workflow tracked and trending within budget; model selection optimized for value; no runaway agent-loop incidents |
| **Mentorship** | Demonstrated coaching impact through improved team orchestration fluency; shared playbooks, post-mortems, and training materials in active use |

---

## 4. Competencies

| Domain | Expected Proficiency |
|---|---|
| **Software Engineering** | Strong foundation in system design, testing, CI/CD, distributed systems, and operational reliability |
| **Context & Tool Engineering** | Mastery of context packaging, retrieval design, tool schemas, and permission models (MCP or equivalent) |
| **Verification Engineering** | Expert at building evals, property testing, adversarial testing, and CI gates for non-deterministic systems |
| **Agent Workflow Design** | Ability to build durable multi-agent orchestration with human-in-the-loop checkpoints, observability, and cost controls |
| **Safety & Failure Analysis** | Threat modeling across prompts/tools/context/environment; root-cause analysis; OWASP LLM & NIST AI RMF alignment |
| **Token Economics** | Cost-aware model selection, context pruning, loop bounding, and spend instrumentation |
| **Documentation & Mentorship** | Codifies tacit knowledge into durable, agent-readable systems; coaches teams on verification-first practices |

---

## 5. Career Path

| Level | Role Focus | Promotion Criteria | Typical Evaluation Artifacts |
|---|---|---|---|
| **Engineer (AI-Enabled)** | Uses agentic tools safely for individual tasks | Consistently ships changes with good tests and review quality | PRs showing correct agent use; small evals; basic safety hygiene |
| **Senior Software Orchestration Engineer** | Designs and operates team-level orchestration systems and standards | Demonstrates durable improvements to cycle time, defect reduction, and reproducibility | Team prompt/context libraries; standardized tool wrappers; CI-integrated eval suites |
| **Staff Engineer (Orchestration Architect)** | Defines org-wide platforms, governance, and shared infrastructure | Creates shared infra adopted by multiple teams; measurably reduces agent failures and cost | Orchestration runtime; permission model; org-wide eval dashboards; incident playbooks |
| **Principal / Distinguished (Agentic Systems)** | Sets enterprise agent operating model and risk posture | Sets technical strategy, safety posture, and measurement; leads critical incidents and major architecture decisions | Reference architectures; risk framework alignment; standardized connectors and audit mechanisms |

The key structural change in this ladder: "influence" extends beyond humans to systems. You are designing the decision surface for agents, and the promotion bar explicitly measures how well you constrain non-deterministic behavior into predictable business outcomes.

---

## 6. Qualifications

**Required**

- 7+ years software engineering experience with modern CI/CD, testing, and distributed systems.
- Demonstrated success building and operating production agentic workflows (multi-file edits, tool use, PR generation, long-running tasks).
- Hands-on experience designing evaluation harnesses or verification systems that caught non-obvious failures.
- Strong working knowledge of frontier agentic surfaces (Claude Code, Cursor, or equivalent) and at least one durable orchestration runtime.
- Deep commitment to responsible AI: familiarity with OWASP LLM Top 10, NIST AI RMF, and human-in-the-loop governance patterns.

**Preferred**

- Experience with context protocols (MCP), observability platforms (LangSmith, Langfuse, OpenTelemetry), or multi-agent frameworks (LangGraph, CrewAI, Temporal).
- Contributions to internal standards, open-source eval harnesses, or agent safety tooling.
- Exposure to formal methods, property-based testing, or SWE-bench-style evaluation design.
- Experience managing token economics at scale — model selection, context pruning, cost dashboards.

---

## 7. What We Explicitly Do NOT Optimize For

This section exists to signal clearly what this role is — and isn't.

- **Lines of code written.** The economic unit of this role is verified, shipped outcomes — not keystrokes.
- **Syntactic fluency under time pressure.** We do not run LeetCode-style interviews. AI can write syntax; only humans can define "correct."
- **Individual contribution volume.** We measure systematic leverage — the ability to amplify reach through governed agent loops — not personal throughput.
- **Tooling tribalism.** We are stack-agnostic. If the tool works, passes evals, and respects governance, it's in play.

---

---

# Part II: Hiring Framework

> The following sections are designed as a hiring-playbook template. They include interview tasks, take-home exercises, rubrics, portfolio signals, and mental models — optimized for identifying engineers who can operate in an agentic SDLC.

---

## 8. Hiring Philosophy

The research is unambiguous: traditional coding interviews provide low signal for orchestration roles. The marginal value of writing baseline code has dropped; the marginal value of (a) defining correct behavior and (b) verifying outputs has risen.

A practical interview loop should test:

1. Can the candidate turn ambiguous intent into testable acceptance criteria?
2. Can they build an eval harness that catches plausible-but-wrong outputs?
3. Can they design workflows with safe tool boundaries?
4. Can they debug failures across prompts, tools, and environment state?
5. Can they reason about non-determinism, drift, cost, and governance?

### Signal Rebalancing

| Traditional Signal | Orchestration Signal | Why |
|---|---|---|
| Syntactic fluency | Architectural intent | AI can write syntax; only humans can define "good." |
| Algorithm implementation | Verification gate design | Scaling code requires scaling trust, not just logic. |
| Manual bug fixing | Failure pattern recognition | Orchestrators solve classes of errors, not instances. |
| Individual contribution | Systematic leverage | Value is in managing parallel agent threads. |
| Green squares on GitHub | Orchestrated system artifacts | Documented traces, tool contracts, and ADRs outweigh commit volume. |

---

## 9. Interview Loop Blueprint

| Stage | Format | Duration | What It Tests |
|---|---|---|---|
| **Screen** | Resume + portfolio review, 30-min call | 30 min | Evidence of building or operating agentic systems; evidence of evaluation rigor |
| **Technical Work Sample** | Take-home exercise (see §11) | 2–4 hrs | Hands-on ability to build safe agent loops or eval harnesses |
| **Onsite 1: Workflow Design** | Whiteboard / system design | 60 min | Agent workflow architecture, decomposition, human checkpoints, cost bounding |
| **Onsite 2: Eval Harness Design** | Whiteboard + pseudocode | 60 min | Verification engineering, measurement mindset, regression strategy |
| **Onsite 3: Failure Analysis** | Live debugging exercise | 60 min | Diagnosing agent pipeline failures; safety posture; mitigation quality |
| **Cross-functional Round** | Conversation with PM/design partner | 45 min | Ability to translate product intent into evals, constraints, and rollout plans |
| **Reference Checks** | Focused on operational excellence | — | Did they improve systems? Did they mentor? Not "lines of code." |

---

## 10. Interview Exercises & Scoring Matrices

### Exercise 1: Debug a Broken Agent Pipeline (Live, 60 min)

**Setup**

Provide the candidate with:
- Execution logs from an agent that failed to fix a bug.
- The tool definitions it had access to.
- The diff it produced.
- The agent claims success because tests passed, but a downstream user reports incorrect behavior in production.

**Expected Outputs**

- A minimal reproduction plan that distinguishes tool failure vs. context failure vs. test weakness.
- A root-cause hypothesis with evidence from logs and diffs.
- A mitigation plan covering: improved tests/evals, guardrails or permission boundaries, observability (structured logging + trace correlation), rollback or staged rollout.

**Scoring Rubric (1–4)**

| Dimension | 1 — Weak | 2 — Partial | 3 — Strong | 4 — Exceptional |
|---|---|---|---|---|
| Reproduction discipline | Vague | Partial steps | Clear steps | Clear steps + isolation of variables |
| Root cause quality | Speculates | Some evidence | Evidence-led | Evidence-led + alternative hypotheses |
| Verification response | "Add more tests" | Some targeted tests | Targeted evals | Targeted evals + regression framework + gating |
| Safety posture | Ignores risk | Mentions risk | Concrete mitigations | Concrete mitigations aligned to OWASP/NIST |

---

### Exercise 2: Design an Evaluation Harness (Whiteboard, 60 min)

**Setup**

Design an evaluation harness for an agentic coding tool that "fixes issues" in a medium-sized repo. The harness must detect:
- Functional correctness regressions.
- Security regressions.
- Cases where the patch passes tests but is still wrong.
- Unsafe tool actions (destructive commands, data exfiltration).

**Expected Outputs**

- A layered eval strategy: deterministic tests (unit/integration), behavioral evals (golden tasks, property tests), adversarial tests (prompt injection, unsafe tool use), human spot-check protocol for high-risk changes.
- An operational plan: CI integration, versioned baselines, canary rollout, regression alerts.

**Scoring Rubric (1–4)**

| Dimension | 1 — Weak | 2 — Partial | 3 — Strong | 4 — Exceptional |
|---|---|---|---|---|
| Coverage | Narrow | Mixed | Broad | Broad and risk-weighted |
| Realism | Toy examples | Semi-real | Repo-real | Repo-real + production-symptom tests |
| Automation | Unclear plan | Partial automation | Mostly automated | Automated with reproducibility and cost bounds |
| Drift strategy | None | Ad hoc | Baselines | Baselines + monitoring + change control |

---

### Exercise 3: Multi-Agent Workflow Architecture (Whiteboard, 60 min)

**Setup**

A product team needs to automate a ticket-to-PR pipeline for a monorepo with 12 services. The pipeline must handle: planning, implementation across multiple files, test generation, security scanning, and human review gating. Design the system.

**Expected Outputs**

- Agent topology: which agents handle which subtasks, how they communicate, and where the human enters the loop.
- Failure and rollback strategy: what happens when a worker agent produces a bad diff, when tests are flaky, or when cost bounds are hit.
- Cost and latency model: how they bound token spend and wall-clock time.
- Observability plan: how they trace a single ticket through the full agent mesh to post-mortem any failure.

**Scoring Rubric (1–4)**

| Dimension | 1 — Weak | 2 — Partial | 3 — Strong | 4 — Exceptional |
|---|---|---|---|---|
| Decomposition | Monolithic | Basic split | Clear specialization | Specialization + dynamic routing |
| Fallback strategy | None | Retry only | Retry + rollback | Retry + rollback + graceful degradation |
| Human checkpoints | Absent | "Review the PR" | Risk-weighted gates | Risk-weighted gates + escalation policy |
| Cost awareness | Absent | Mentioned | Bounded | Bounded + instrumented + alerting |

---

### Exercise 4: Tool Contract & Permissions Design (Whiteboard, 30 min)

**Setup**

An agent needs access to: the file system, a database (read/write), a CI runner, and a Slack notification channel. Design the tool contracts, permission boundaries, and audit surface.

**Expected Outputs**

- Schemas for each tool with explicit input/output types and error contracts.
- Least-privilege permission model: what the agent can do vs. what requires human approval.
- Audit log format: every tool call logged with correlation ID, inputs, outputs, and wall-clock time.
- Prompt injection mitigation: how they prevent retrieved data from being interpreted as instructions.

**Scoring Rubric (1–4)**

| Dimension | 1 — Weak | 2 — Partial | 3 — Strong | 4 — Exceptional |
|---|---|---|---|---|
| Least privilege | Full access | Some scoping | Role-based | Role-based + environment-gated + time-boxed |
| Injection awareness | Absent | Mentioned | Input validation | Input validation + output sanitization + separation of data/instructions |
| Audit completeness | None | Partial logging | Full tool-call logs | Full logs + correlation IDs + tamper resistance |
| Rollback plan | Absent | Manual | Automated | Automated + blast-radius controls |

---

## 11. Take-Home Exercises

Take-homes should be short (2–4 hours), realistic, and test rigor over speed.

### Take-Home A: Build a Tool-Safe Mini Agent Loop

Build a minimal plan-implement-test loop that can only: read repo files, run tests, and propose diffs. It cannot execute destructive commands. It must produce an audit log of every tool call.

**Required Deliverables**
- Tool schemas and permission boundary definition.
- Audit log format and example logs.
- CI workflow that rejects runs without complete audit logs.
- Brief writeup: what risks remain, and what you would add next.

**Evaluation Criteria:** permission discipline, audit completeness, awareness of residual risk, code quality of the harness itself.

### Take-Home B: Construct a Benchmark-Grade Repo Task and Grading Harness

Define one realistic repo issue (bug or feature) and a grading harness that prevents trivial leakage (solution embedded in issue text) and resists "cheating."

**Required Deliverables**
- Issue description + acceptance criteria.
- Tests that fail before and pass after correct resolution.
- Analysis of leakage risks and mitigations.
- Brief writeup: how would you scale this to 50 tasks?

**Evaluation Criteria:** eval design rigor, awareness of SWE-bench-class pitfalls (contamination, weak tests, solution leakage), scalability thinking.

---

## 12. Portfolio Signals

Because orchestration is artifact-driven, portfolios can be more predictive than interview puzzles.

### Strong Signals

- **Documented orchestration traces.** LangSmith, Langfuse, or equivalent traces showing how the candidate managed agent trajectories, handled edge cases, and iterated on failures.
- **Custom tool contracts or MCP servers.** Evidence of building specialized context connectors that allow agents to interact with unique data environments.
- **Eval harnesses or verification pipelines.** Public or described-in-detail evaluation systems that caught real failures.
- **Architectural Decision Records (ADRs).** Candidates who prioritize design rationale capture over raw code — evidence that they understand context propagation as the primary enterprise bottleneck.
- **Failure-driven iteration.** Post-mortems that became new tests, guardrails, and runbooks. The loop from incident → eval → prevention is the strongest signal of orchestration maturity.
- **Case studies of agentic deployments.** Repo-level changes, CI automation, ticket-to-PR workflows, or multi-agent systems with documented outcomes.

### Weak Signals (Do Not Over-Index)

- GitHub commit volume or "green squares."
- Number of languages known.
- LeetCode competition rankings.
- Years of experience alone (without evidence of agentic workflow operation).

---

## 13. Behavioral / Mental Model Questions

Use these to test whether candidates think in "systems of constraints and measurements" rather than "raw generation."

1. **Plausible-but-wrong detection.** Your agent passes all tests but users report wrong behavior. What are your top three hypotheses, and how do you disprove each quickly?

2. **Threat modeling.** How do you threat-model an agent that can read arbitrary documents and then call tools? Walk me through your mitigations for indirect prompt injection.

3. **Autonomy calibration.** How do you decide which tasks should be fully autonomous vs. human-gated? (Look for risk-weighted thinking and staged rollout logic.)

4. **Good tooling.** What does "good tooling" mean for agents, and how do you measure it? (Look for schemas, error contracts, observability, and cost awareness — not "it works.")

5. **Cost reasoning.** For a given workflow, how do you decide between a frontier model for planning vs. a lighter model for execution? What metrics tell you you've made the right call?

6. **Eval philosophy.** When you build an eval suite for a new agentic workflow, what is your framework for deciding what to test and what to skip? How do you handle the non-determinism?

7. **Knowledge decay.** How do you keep context packs and Project Constitution files from going stale as the codebase evolves? What systems do you build to detect drift?

---

## 14. Proficiency Levels by Skill Domain

Use these tables for calibration during interviews and for ongoing performance conversations.

### Context Engineering

| Level | What They Can Do | Example Deliverables |
|---|---|---|
| Emerging | Build a usable context pack with clear scope and sources | Repo "agent README" and onboarding context pack; basic prompt templates |
| Proficient | Make context maintainable and auditable; enforce consistency | Standardized context schema; CLAUDE.md-style policy file; tool schemas and guardrail prompts |
| Advanced | Optimize for cost, safety, and determinism under variation | Context minimization playbook; retrieval provenance tagging; permissioned tool wrappers aligned to OWASP risk categories |
| Expert | Design org-wide context systems; reduce systemic risk | Cross-team context standards; connector architecture (MCP-based); audit log and provenance policy |

### Verification Engineering

| Level | What They Can Do | Example Deliverables |
|---|---|---|
| Emerging | Build basic evals for deterministic behaviors | Unit tests for tool wrappers; small golden-set evals |
| Proficient | Build automated evaluation pipelines for agent behaviors | Eval suite with structured scoring; CI gates for agent PRs |
| Advanced | Design robust evals for long-horizon tasks and safety properties | End-to-end repo tasks; adversarial test sets for prompt injection and unsafe actions |
| Expert | Make evals the "operating system" of engineering velocity | Org-wide evaluation dashboards; risk-weighted release gates aligned to NIST AI RMF profiles |

### Agent Workflow Design

| Level | What They Can Do | Example Deliverables |
|---|---|---|
| Emerging | Build a single-agent plan-implement-test loop | Agent script that patches a repo and runs tests; basic retry logic |
| Proficient | Build multi-step workflows with explicit human approvals | Workflow graph; approval points before destructive actions; PR generation pipeline |
| Advanced | Build multi-agent coordination and fallbacks | Manager + specialist agents; rollback strategies; dynamic verification loops |
| Expert | Operate workflows at org scale | Durable workflow runtime (Temporal-class patterns); multi-team governance; full observability |

### Failure Analysis

| Level | What They Can Do | Example Deliverables |
|---|---|---|
| Emerging | Diagnose obvious prompt or tool errors | Debug report; minimal reproduction |
| Proficient | Build systematic prevention via tests and guardrails | Failure taxonomy; red-team prompts; regression suite for known failures |
| Advanced | Reduce blast radius and improve recovery | Permission model; environment isolation; rollback + audit logs tied to tool calls |
| Expert | Operate continuous risk management and compliance posture | NIST AI RMF-aligned risk register; continuous red teaming; governance and review gates |

---

## 15. Team Composition Context

The agent-orchestrated team is smaller, tighter, and more cross-functional than the traditional squad.

### The High-Leverage Pod

A practical team composition for agentic delivery:

- **Orchestration Engineer(s):** Own workflows, context layers, and integration.
- **Verification Engineer(s):** Own eval harnesses, regression suites, and safety gates.
- **Product & Design Partners:** Shift toward writing testable requirements and acceptance criteria — specs become structured prompts with explicit constraints.
- **Security Partner:** Focuses on prompt injection, tool access, auditability, and red teaming.

### Structural Shifts

- **From sprints to flow.** Agents deliver continuously. Teams trade sprint commitments for strict WIP limits, optimizing for the change they can *validate* rather than the change they can *generate*.
- **From velocity to verification bandwidth.** The constraint is not "how fast can we build" but "how fast can we prove it's correct and safe."
- **From managing people to managing outcomes.** The orchestrator's "direct reports" include agent workflows, eval systems, and tool contracts — not just humans.

---

## 16. Compensation Philosophy

Hard payroll benchmarks for "orchestration engineer" remain sparse, but the role should be compensated like a high-scope platform and reliability leader because the output affects the entire organization's velocity and risk posture.

### Signals of Leverage (for comp calibration)

| Leverage Type | What It Means | How to Measure |
|---|---|---|
| **Reliability leverage** | Reduces incident rates or mitigates high-severity failure modes | Incident counts, severity trends, eval coverage |
| **Throughput leverage** | Improves DORA metrics without degrading quality | Lead time, deployment frequency, recovery time, failure rate |
| **Reuse leverage** | Creates orchestration assets adopted by multiple teams | Adoption counts, time-to-onboard for new teams |
| **Risk leverage** | Materially reduces exposure to LLM-specific security risks | Red-team findings remediated, prompt injection test pass rates |
| **Cost leverage** | Reduces token spend per unit of shipped value | $/PR, $/verified-change, cost trend per workflow |

---

> This document is intentionally stack-agnostic and immediately actionable. Teams are encouraged to fork it and adapt tools, metrics, and governance frameworks to their environment.
>
> The JD, interview loop, scoring matrices, and proficiency tables are designed to work as an integrated system. Used together, they make "orchestrating agents" a measurable engineering discipline rather than a vague job title.
