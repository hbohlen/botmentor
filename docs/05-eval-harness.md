# Eval Harness — BotMentor

A **deterministic, keyless** quality gate for the mentor's output. It exists so a
non-profit host org can guard mentoring quality in CI **without API keys and without
network** — directly supporting the "enable the org / leave it running after you're
gone" fellowship signal.

## What it checks
`evals/run.ts` runs the `mock` engine path of `api/diagnose.ts` (`PROVIDER=mock`)
against fixed robotics fixtures in `evals/fixtures.ts`. For each fixture it asserts the
4D mentoring **contract**:

1. The response always parses into a valid `DiagnoseResult` (the defensive parse never
   500s, even on a thin/empty report).
2. Every hypothesis stays inside the robotics fault taxonomy (`motor | sensors | power |
   wiring | programming | mechanical | radio`).
3. When expected, at least one hypothesis carries `verifyFirst` — the **Discernment**
   flag is exercised (cheap/safe check first).
4. The four `dTags` (Delegation, Description, Discernment, Diligence) are present — the
   framework is visible, not hidden.

## Run it
```bash
export PATH="$HOME/.local/share/mise/installs/node/22.23.1/bin:$PATH"
npm install --include=dev
npm run eval                 # 15 checks across 5 fixtures; exit 0 = pass
npm run eval -- --verbose   # also prints each hypothesis area + verifyFirst
```

## Why keyless (the design choice)
The live providers (DeepSeek/Anthropic) are non-deterministic and cost money per call,
so they are the wrong thing to assert on in CI. The `mock` path is the *same defensive
parse + contract* the live providers rely on — if the contract breaks, the mock catches
it first, with zero secrets and zero spend. This is ADR-005 (defensive parse) made
continuous.

## Extending it
- Add a fixture to `evals/fixtures.ts` for a new symptom class (e.g. radio dropout,
  programming logic error). The `allowedAreas` guard will fail the build if a hypothesis
  ever escapes the taxonomy.
- When you change `SYSTEM_PROMPT`, run `npm run eval -- --verbose` and confirm the
  rankings still satisfy the contract before deploying (Runbook R1).
