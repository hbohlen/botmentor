# BotMentor — Implementation Spec (MVP = V1)

> Hand-off spec for implementing agents. Read `docs/00-domain-and-needs.md` first — it is the
> source of truth for domain knowledge and the resolved decisions summarized here.
> Guiding principle: every feature must visibly exercise one or more of the AI Fluency 4Ds
> (Delegation, Description, Discernment, Diligence). This is the differentiator; do not drop it.

## A. Goal
A small web app where a student robotics competitor describes a robot problem and gets
ranked, plain-language fix hypotheses with a built-in "verify this first" (Discernment) flag
and a teaching overlay showing which 4D skill each part of the response uses. Cheap to test
(DeepSeek), cheap-ish to run (Claude), safe (keys server-side), demoable (public deploy).
Built to strengthen a Claude Corps Fellow application by turning real volunteer mentoring
into a 4D-grounded artifact.

## B. Architecture
```
Browser (React/TS/Vite)
  └─ POST /api/diagnose  ──►  Node/Express proxy (holds keys, never sent to client)
                                 ├─ AnthropicProvider  (prod, ANTHROPIC_API_KEY)
                                 └─ OpenAICompatibleProvider (test, DEEPSEEK_API_KEY)
  └─ GET/POST /api/feedback ──► local persistence (localStorage in MVP)
```
- Frontend and proxy are separate processes in dev (`vite` + `node server/index.ts`).
- For the **public demo**, deploy the proxy as a serverless function (Vercel/Netlify) so no
  long-running server is needed; frontend static-hosted. Keep the same `ModelProvider` code
  path so local dev and deploy share logic.

## C. Model Provider Abstraction (critical — do not hardcode a vendor)
`src/server/providers/types.ts`:
```ts
export interface ModelMessage { role: 'system'|'user'|'assistant'; content: string }
export interface Hypothesis {
  id: string; area: FaultArea; title: string; plainSteps: string[];
  confidence: number;        // 0..1
  verifyFirst: boolean;      // Discernment flag
  whyRanked: string;         // teaches Discernment
}
export interface DiagnoseResult { hypotheses: Hypothesis[]; dTags: DTag[] }
export interface ModelProvider {
  name: 'anthropic'|'openai-compatible';
  diagnose(messages: ModelMessage[]): Promise<DiagnoseResult>;
}
```
- `AnthropicProvider` uses `@anthropic-ai/sdk`, calls Claude with a system prompt that returns
  **structured JSON** matching `DiagnoseResult`. Parse defensively (the model may wrap JSON in
  prose) — strip and `JSON.parse` the first `{...}` block; on parse failure, return a
  user-visible "I wasn't confident enough to answer safely — rephrase" rather than crashing.
- `OpenAICompatibleProvider` targets `DEEPSEEK_API_KEY` at `https://api.deepseek.com` with the
  same request/response shape; same parsing. (Same code supports Ollama later via base URL.)
- Provider chosen at runtime from `PROVIDER` env (`anthropic` | `deepseek`) or header.
- **FaultArea** enum: motor, sensors, power, wiring, programming, mechanical, radio (§2.2).

## D. System Prompt (embodies the 4Ds + taxonomy)
The proxy builds the system prompt from `src/server/prompt.ts`. It must instruct the model to:
- Act as a **mentor, not a fixer** (Delegation: the student does the physical test).
- Use the **fault taxonomy** to cover the likely areas; prefer cheap/safe checks first.
- For each hypothesis: `plainSteps` in K-12 language, a `confidence`, and set `verifyFirst`
  true when the symptom could be a dangerous or costly check (Discernment).
- Always include `whyRanked` so the student learns *why* (Discernment teaching).
- Never recommend destructive acts without "have an adult present" (Diligence/safety).
- Return ONLY the JSON schema in §C.

## E. Frontend (React + TS + Vite)
Routes/screens (single-page is fine):
- **Intake** (`/`): structured form — Symptom (free text), "What changed?", "What did you
  expect?"; light prompts coach good Description. Submit → `/api/diagnose`.
- **Results** (`/results`): render ranked `Hypothesis[]`. Each card shows:
  - area badge, confidence (e.g. "Likely 70%"), plain steps,
  - a **Discernment chip** "⚠ Verify this first" when `verifyFirst`,
  - a collapsible "Why this is ranked here" (`whyRanked`),
  - **4D chips** on the response panel naming which D(s) this answer demonstrates
    (Delegation/Description/Discernment/Diligence) — the teaching overlay (Q3 resolved: visible).
- **Feedback**: per hypothesis, "Did this work? yes / no / partially" → stored locally
  (localStorage, Q5). Feeds a small "your past fixes" list (Diligence loop, local only MVP).

## F. Persistence (MVP)
- `localStorage` key `botmentor:feedback` → array of `{ hypothesisId, area, worked, ts }`.
- No server DB. (Upgrade path noted: SQLite/file later so it survives clears.)

## G. Config / Env
`.env.example`:
```
PROVIDER=deepseek            # deepseek (test) | anthropic (prod)
DEEPSEEK_API_KEY=sk-...      # for test
ANTHROPIC_API_KEY=sk-...     # for prod
DEEPSEEK_MODEL=deepseek-v4-flash   # cheap test; deepseek-chat deprecated 2026-07-24
ANTHROPIC_MODEL=claude-sonnet-5    # prod default; claude-haiku-4-5 = cheaper alt
PORT=8788
```
- Never commit `.env`. Proxy reads server-side only.

## H. Repo Layout
```
botmentor/
  docs/00-domain-and-needs.md   (this spec's source)
  docs/01-spec.md               (this file)
  index.html
  package.json                  (vite, react, typescript)
  vite.config.ts
  src/
    main.tsx, App.tsx
    components/Intake.tsx, Results.tsx, HypothesisCard.tsx, DTagChips.tsx
    lib/storage.ts
    server/
      index.ts                  (express proxy)
      prompt.ts
      providers/{types.ts,anthropic.ts,openai-compatible.ts}
  vercel.json / netlify.toml    (serverless fn wrapper for demo)
  README.md                     (run locally + demo link)
```

## I. Acceptance Criteria (MVP done when)
1. `npm run dev` starts Vite + proxy; form submits; a diagnosis renders ranked hypotheses.
2. Switching `PROVIDER` to `deepseek` works end-to-end with only the DeepSeek key.
3. Every rendered response shows the 4D chips and the verify-first Discernment flag.
4. "Did this work?" persists across reload via localStorage.
5. No API key appears in browser network requests or client bundles (verify in devtools).
6. Public demo deployed; README links it; demo loads without a key from the visitor.
7. README states the 4D framing + the Nebraska Robotics Expo origin (the narrative).

## J. Explicitly Deferred (not in MVP)
- Arize Phoenix eval harness (hook point: add an `/api/eval` later that scores
  `DiagnoseResult` against a fixed fault set).
- RAG KB / ingest (V4); Mentor Copilot (V2); 4D Prompt Lab (V3); Workshop Kit (V5).
- Multi-user, auth, cloud DB.

## K. Notes for Implementing Agents
- Do NOT invent lesson quotes from the AI Fluency course; cite the 4D structure only.
- Keep the `ModelProvider` boundary clean so DeepSeek/Claude/Ollama are swap-in.
- Favor small, readable components; this is a portfolio piece — clarity reads as competence.
- Commit in small, narrow commits (per repo convention). Do not push without authorization.
