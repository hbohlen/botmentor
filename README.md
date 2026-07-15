# BotMentor

> A mentoring co-pilot for student robotics teams — **[Try it live →](https://botmentor.vercel.app)**

BotMentor helps K–12 robotics students turn "my robot is broken" into a safe, evidence-based
troubleshooting path. It does **not** claim to see or fix physical hardware. Instead, it coaches
a student through the same loop a human mentor would: **observe → hypothesize → test safely →
learn and share**.

Built on Anthropic's **AI Fluency 4D Framework** (Delegation, Description, Discernment, Diligence),
with those principles surfaced directly in the interface so the coaching method is legible — not
hidden inside a black box.

**Origin:** Nebraska Robotics Expo volunteering (2017–2018), where University of Nebraska–Omaha
engineering students mentored middle- and high-school teams through troubleshooting under
competition-day pressure.

## What a student sees

1. **Pick a robot system** from a visual, accessible six-area map (Power, Drive base, Mechanisms,
   Sensors, Wiring, Code/controller)
2. **Describe what's wrong** using guided symptom chips and plain-language observation prompts
3. **Inspect ranked hypotheses** — each with confidence, alternatives, cited references, and a
   "Challenge the Mentor" panel showing what evidence would change the answer
4. **Take one safe test at a time** — with explicit safety conditions and escalation when a human
   is needed
5. **Hand off to a mentor** with a privacy-preserving Pit Report — nothing is uploaded or shared

## Responsible-AI design decisions

The 4D Framework is not a badge added after the build. It shapes the product:

- **Delegation** — The model proposes; the *student* performs the physical test. Unsafe work
  belongs with an adult or mentor.
- **Description** — A visual robot map and guided prompts turn "it is broken" into structured
  evidence without forcing students to pretend they know more than they do.
- **Discernment** — Each hypothesis carries confidence, alternate explanations, cited references,
  and a "verify first" flag. No untested model claim is shown as confirmed.
- **Diligence** — Local-only investigation records, deterministic evaluation checks, and
  privacy-preserving mentor handoffs make the work reviewable without surveilling students.

## Quality and evaluation

- **44 passing deterministic checks** across **11 mentoring and safety scenarios** (keyless — no
  API keys required to run)
- Covers mentoring quality, safety escalation, reference provenance, privacy, and evidence isolation
- Run it: `npm run eval`

## Documentation

Operate, maintain, and extend procedures live in [`docs/`](docs/README.md):

- Technical and plain-language **runbooks** for nonprofit handoff
- **Architecture decision records** (including two real production-failure lessons)
- **Non-technical handover guide** for program leads and teachers

The documentation is the sustainability layer — the bus-factor mitigation that lets an
organization own the system after the original builder moves on.

---

## For developers

### Stack

- **Frontend:** React + TypeScript + Vite (static, hosted on Vercel)
- **Backend:** One Vercel serverless function (`api/diagnose.ts`) holding API keys server-side.
  Intentionally self-contained — zero relative imports — because Vercel's bundler externalizes
  them (see `docs/04-architecture-decisions.md`, ADR-001).
- **Local dev proxy:** `src/server/index.ts` (Express) reuses the same diagnose logic.
- **Providers** (selected by `PROVIDER` env var): Anthropic (`claude-sonnet-5`, prod) /
  DeepSeek OpenAI-compatible (`deepseek-v4-flash`, cheap test) / Mock (key-free demo).

### Run locally

```bash
export PATH="$HOME/.local/share/mise/installs/node/22.23.1/bin:$PATH"
npm install --include=dev        # NOTE: this env omits dev deps by default
cp .env.example .env             # add keys if you want live providers
PROVIDER=mock PORT=8788 npx tsx src/server/index.ts   # Express proxy on :8788
npm run dev                      # Vite UI on :5173, proxies /api -> :8788
```

### Switch providers (one env var)

```bash
PROVIDER=mock      npm run dev     # no key — public-demo safe
PROVIDER=deepseek  npm run dev     # cheap testing (DEEPSEEK_API_KEY)
PROVIDER=anthropic npm run dev     # production (ANTHROPIC_API_KEY), claude-sonnet-5
```

### Deploy

Push to `main`; Vercel auto-builds and redeploys. The repo ships `vercel.json`
(`vite build` → `dist`, plus the `api/` serverless function). Set env vars with the Vercel CLI
(never commit keys): see `docs/02-runbooks.md` R2/R3.

Live demo: **https://botmentor.vercel.app**
