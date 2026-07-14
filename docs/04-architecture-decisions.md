# Architecture Decision Records — BotMentor

Why-things-are-the-way-they-are, so future maintainers don't "fix" a deliberate choice and
reintroduce a bug.

## ADR-001: Serverless function is a single self-contained file
**Decision.** `api/diagnose.ts` contains the engine, providers, prompt, and parse logic in
one file with **zero relative imports**.
**Context.** Vercel's `@vercel/node` bundler externalizes relative imports inside `api/`,
leaving them as bare specifiers (`/var/task/api/engine`) that fail at runtime with
`ERR_MODULE_NOT_FOUND` → `FUNCTION_INVOCATION_FAILED`. We lost a deploy to this.
**Consequence.** Some duplication between the function and the local `src/server/index.ts`
proxy. Accepted: the proxy is dev-only; the function must be robust.

## ADR-002: `mock` is the default provider
**Decision.** With no `PROVIDER` env var, the function returns a clearly-labeled canned
response needing no API key.
**Context.** The public demo must work with zero cost and must not expose a paid key to
every visitor. `mock` also means the app degrades gracefully if a key expires.
**Consequence.** Reviewers see placeholder answers unless someone sets `PROVIDER=deepseek`.
Documented in Runbook R3.

## ADR-003: The 4D Framework is the differentiator, embedded in the system prompt
**Decision.** The mentor's behavior is defined entirely by `SYSTEM_PROMPT` (Delegation,
Description, Discernment, Diligence). The UI surfaces `dTags` + a `verifyFirst` flag per
hypothesis so the framework is visible, not hidden.
**Context.** The Claude Corps application rewards teaching/community framing; 4D gives the
project a coherent, explainable identity rooted in the Nebraska Robotics Expo lineage.

## ADR-004: Local Express proxy is separate from the deployed function
**Decision.** `src/server/index.ts` (Express) is for local dev only; `api/diagnose.ts` is the
production path. They share behavior by the local proxy importing `diagnose` from the function
file (fine under `tsx`; the function itself has no relative imports).
**Context.** Vercel does not run a long-lived Express server; the proxy exists solely so
`npm run dev` works offline.

## ADR-005: Defensive JSON parse, never trust raw model output
**Decision.** `parseDiagnose` extracts the first `{`…`}` and returns a safe fallback on failure.
**Context.** Models wrap JSON in prose or fences; a crash here would 500 the endpoint. The
fallback keeps the UI renderable.
