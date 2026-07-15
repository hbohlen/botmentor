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

## ADR-006: Production `/api/health` parity + keyless eval harness
**Decision.** A real `api/health.ts` serverless function mirrors the local proxy's
`/api/health` shape (provider, keyConfigured, domains, framework, dTags). A separate
`evals/run.ts` runs the `mock` engine against fixed fixtures and asserts the 4D contract.
**Context.** The local proxy had `/api/health` but production did not — a parity gap that
broke the operator health pill and gave a false "unknown" in prod. The eval closes the
"how do we keep mentoring quality honest as it changes" open question from `03-maintain`.
**Consequence.** A host-org operator can confirm liveness + live-vs-practice mode from the
UI with no terminal; CI can guard quality with no secrets and no network.

