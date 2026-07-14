# BotMentor

A mentoring co-pilot for student robotics teams, built on the **AI Fluency 4D Framework**
(Delegation, Description, Discernment, Diligence). Origin: Nebraska Robotics Expo
volunteering (2017–2018), where college engineering students mentored middle/high-school
robotics teams through troubleshooting and design coaching.

This is a Claude Corps Fellow portfolio project. The point isn't to "fix the robot for you" —
it's to coach a student through the *same* mentoring loop a human volunteer would: propose
ranked hypotheses, flag what to verify first, explain *why*, and hand the physical testing
back to the student (Delegation).

## How it maps to the 4Ds
- **Delegation** — the model proposes; the *student* does the physical test.
- **Description** — the intake form coaches a clear problem description.
- **Discernment** — each hypothesis carries a confidence, a "verify first" flag, and a
  "why this is ranked here" explanation.
- **Diligence** — safety notes ("have an adult present"), honest handling of low-confidence
  cases, and a "did this work?" loop that persists locally.

## Stack
- Frontend: React + TypeScript + Vite (static, hosted on Vercel)
- Backend: one Vercel serverless function `api/diagnose.ts` (holds API keys; the browser
  never sees them). It is intentionally **self-contained** — zero relative imports, because
  Vercel's bundler externalizes them (see `docs/04-architecture-decisions.md`, ADR-001).
- Local dev proxy: `src/server/index.ts` (Express) reuses the same `diagnose` logic.
- Providers (selected by the `PROVIDER` env var): Anthropic (`claude-sonnet-5`, prod) /
  DeepSeek OpenAI-compatible (`deepseek-v4-flash`, cheap test) / Mock (key-free demo).

## Run locally
```bash
export PATH="$HOME/.local/share/mise/installs/node/22.23.1/bin:$PATH"
npm install --include=dev        # NOTE: this env omits dev deps by default
cp .env.example .env             # add keys if you want live providers
PROVIDER=mock PORT=8788 npx tsx src/server/index.ts   # Express proxy on :8788
npm run dev                      # Vite UI on :5173, proxies /api -> :8788
```

## Switch providers (one env var)
```bash
PROVIDER=mock      npm run dev     # no key — public-demo safe
PROVIDER=deepseek  npm run dev     # cheap testing (DEEPSEEK_API_KEY)
PROVIDER=anthropic npm run dev     # production (ANTHROPIC_API_KEY), claude-sonnet-5
```
`deepseek-chat` is deprecated 2026-07-24 — use `deepseek-v4-flash`.

## Deploy (public demo)
Push to `main`; Vercel auto-builds and redeploys. The repo ships `vercel.json`
(`vite build` → `dist`, plus the `api/` serverless function). Set env vars with the Vercel
CLI (never commit keys): see `docs/02-runbooks.md` R2/R3. Live demo: https://botmentor.vercel.app

## Documentation
Operate / maintain / extend procedures live in [`docs/`](docs/README.md) — runbooks,
architecture decisions, and a non-technical handover guide. This is the sustainability layer
for the organization after the original author moves on.

## Status
MVP live and verified: `POST /api/diagnose` returns 4D-tagged mentoring JSON via DeepSeek.
Eval harness (Arize Phoenix), RAG knowledge base, and Mentor Copilot / 4D Prompt Lab modes
are explicitly deferred (see `docs/03-maintain-and-extend.md`).
