# BotMentor — Domain Knowledge & Needs (Pre-Spec Validation)

> Status: DRAFT for validation. Nothing here is implementation. Purpose: lock domain
> knowledge + product/technical needs so the implementation spec can be handed to agents
> without them guessing the problem space.
> Repo: github.com/hbohlen/botmentor (private). MVP anchor: V1 (student troubleshooting
> co-pilot with 4D-tagged UI). Eval framework (Phoenix) DEFERRED past MVP.

## 1. Origin & Narrative (why this exists)
- Hayden volunteered at the **Nebraska Robotics Expo** (2017, 2018) as a UNO engineering
  student: ran the event, mentored middle/high-school robotics teams through on-the-spot
  troubleshooting/repairs, coached design improvements under time pressure.
- This is the concrete anchor for the Claude Corps **Essay 1** (community impact) and the
  resume "Volunteering & Community" section.
- BotMentor turns that lived mentoring loop into a *scalable, teachable* tool — the tightest
  possible narrative: past volunteer work → a tool that scales the volunteering.
- It also makes Hayden's **AI Fluency 4D certification** a built artifact (not just a badge).

## 2. Domain Knowledge (what agents must understand)
### 2.1 The Expo context
- Annual statewide expo; teams from across Nebraska bring robots, compete in challenges.
- College engineering students volunteer to run events + help teams fix/tune robots.
- Time-pressured, mixed-skill environment; students are minors (K-12), non-experts.

### 2.2 Robot fault taxonomy (what students actually hit)
The app's reasoning must map to these real categories (used for prompt grounding + later eval):
- **Motor / drive** — one side weak, stuttering, no movement, wrong direction.
- **Sensors / encoders** — false readings, drift, line-follow failures.
- **Power / battery** — brownouts under load, voltage sag, connector issues.
- **Wiring / connectivity** — loose plugs, reversed polarity, broken traces.
- **Programming / logic** — inverted condition, dead loop, uninitialized var, wrong port.
- **Mechanical / structural** — misaligned wheels, fragile mount, friction, balance.
- **Radio / control link** — dropout, pairing, latency, range.

### 2.3 The mentoring loop (the actual human process)
1. Student **describes** a symptom ("left motor stutters when turning right").
2. Mentor applies **discernment**: is it the motor, the encoder, the code, the battery?
3. Mentor gives a *ranked* set of hypotheses + plain steps, prioritizes safe/cheap checks.
4. Student tries it; reports back; loop closes; the fix is remembered.

### 2.4 The 4D Framework mapping (the differentiator — make it visible)
- **Delegation** — app decides *what Claude handles* (hypothesis generation) vs what the
  student must do (physical test). App does not pretend to fix the robot.
- **Description** — the input form coaches students to describe well (symptom, what changed,
  what they expected). This is taught, not assumed.
- **Discernment** — every answer carries a confidence + a "verify this first" flag; app
  surfaces *why* a hypothesis is ranked where it is; explicitly flags low-confidence calls.
- **Diligence** — the "did this work?" feedback loop; the app records outcomes; a runbook/
  handoff note explains how an organizer runs it without Hayden.

### 2.5 Learner model
- Non-expert, K-12. Plain language required. Goal is *learning*, not just a fix.
- Safety: never suggest destructive acts (soldering live cells, etc.) without a human present.

## 3. Product Needs (MVP = V1 BotMentor)
### 3.1 Core flow
Student enters (a) symptom, (b) what changed, (c) what they expected → Claude returns
ranked hypotheses, each with: plain-language fix steps, confidence, a Discernment "verify
first" flag → student marks what worked → outcome stored locally → (later) feeds a KB.

### 3.2 Functional requirements (MVP)
- F1 Symptom intake form with light structured prompts (coaches Description).
- F2 Hypothesis response: ranked list, plain steps, confidence, verify-first flag.
- F3 4D-tagged UI: each response visibly labeled with the D(s) it exercises (teaching layer).
- F4 "Did this work?" feedback capture + local persistence of outcome.
- F5 Provider switch: Anthropic (prod) / DeepSeek (cheap test) via one config.

### 3.3 Model-provider abstraction (DECIDED pattern)
- `ModelProvider` interface, normalized message/response.
- `AnthropicProvider` (prod) — `ANTHROPIC_API_KEY`, Claude model (id TBD).
- `OpenAICompatibleProvider` (test) — `DEEPSEEK_API_KEY`, base `https://api.deepseek.com`,
  DeepSeek model id TBD; same shape also supports local Ollama later.
- System prompt embodies the 4D loop + fault taxonomy; returns structured JSON the UI renders.

### 3.4 Key security (HARD NEED — drives architecture)
- API keys **must not** ship in the React client. A minimal **server-side proxy** is required
  to hold keys and call the provider. See Open Questions Q1.

### 3.5 Persistence (MVP)
- Local-only (browser storage) is sufficient for MVP demo. Shared/cloud KB is deferred (V4 RAG).

## 4. Out of Scope (MVP)
- Eval framework (Arize Phoenix) — explicitly deferred; spec will note the hook point only.
- RAG knowledge base / ingest (V4) — later.
- Mentor Copilot mode (V2), 4D Prompt Lab (V3), Workshop Kit (V5) — later/optional.
- Auth, multi-user accounts, hosting backend DB.

## 5. Open Questions — RESOLVED
- **Q1 Backend for key safety:** RESOLVED → **minimal Node/Express proxy** alongside Vite.
  Holds `ANTHROPIC_API_KEY` / `DEEPSEEK_API_KEY`; browser never sees them. Vite calls the
  proxy; proxy calls the provider.
- **Q2 Live demo for reviewers:** RESOLVED → **deploy a public demo** (Vercel or Netlify).
  Repo stays private; demo is the portfolio artifact reviewers touch.
- **Q3 4D UI visibility:** RECOMMENDED (default) → visible teaching chips. Treat as decided
  unless overridden.
- **Q4 Exact model ids:** RESOLVED (verified 2026-07-14 against vendor docs) →
  prod `ANTHROPIC_MODEL=claude-sonnet-5` (alt `claude-haiku-4-5` for cheaper);
  test `DEEPSEEK_MODEL=deepseek-v4-flash`. NOTE: `deepseek-chat`/`deepseek-reasoner`
  are deprecated 2026-07-24 — do NOT use them.
- **Q5 Persistence detail:** RECOMMENDED → localStorage for MVP; note SQLite/file as a
  later upgrade so the feedback loop survives browser clears.

## 6. Fixed Decisions (carried into the spec)
- MVP = V1 BotMentor, 4D-tagged UI, eval deferred.
- Stack: React + TypeScript + Vite (frontend); Node + Express (proxy); Anthropic SDK for
  prod, OpenAI-compatible provider for DeepSeek test.
- Single `ModelProvider` abstraction so prod/test is a one-line config flip.
- Public demo deployable to Vercel/Netlify; proxy runs as a serverless fn or paired service.
