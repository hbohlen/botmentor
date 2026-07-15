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

## ADR-007: Delegation split panel + action checklist are UI-only
**Decision.** The "Claude suggests / You do this" split panel and the tappable
student action checklist render **entirely in the React UI** from the existing
`plainSteps` + `verifyFirst` fields. No new backend route, no change to the
`DiagnoseResult` contract. Checklist state persists in `localStorage` (`botmentor:checklist`).
**Context.** ADR-006 closed the prod/health parity gap; this makes the 4D
*Delegation* competency tangible — the single most important fellowship signal.
Keeping it in the UI means the keyless eval (ADR-005/006) still covers the whole
contract, and the serverless function stays self-contained (ADR-001).
**Consequence.** A host-org lead can *see* the AI-vs-student boundary without
an engineer; student progress now survives reload. The mentoring loop is legible.

## ADR-008: Description quality meter is UI-only, client-computed
**Decision.** The intake `DescriptionMeter` scores the student's draft in the browser
from the field text alone (length + symptom vocabulary + the two optional fields).
No network, no backend, no `DiagnoseResult` change.
**Context.** The Skilljar AI Fluency framing names the "description↔discernment
loop" — good Description upstream is what makes Discernment downstream sound. Making
it a *live* coaching signal turns the static intake into real-time Description practice.
**Consequence.** Zero cost, works in `mock` mode (no key), and invisible to the
eval contract (which only inspects diagnose output). Keeps the function self-contained.

## ADR-009: Discernment — confidence bar + client-side "Challenge" panel
**Decision.** Each hypothesis shows a `ConfidenceBar` (visual % of `confidence`)
and a "🔍 Challenge the mentor" toggle that reveals a `CritiquePanel`: per-area
*confirm/disprove* tests, an alternate-cause nudge, and a ready-to-ask mentor
question. All derived in the browser from the existing `Hypothesis` fields.
**Context.** The Skilljar Discernment skill is "critically evaluate AI output" —
not passively accept it. A visual confidence ladder + structured self-critique
makes that a *repeatable practice*, and the mentor-question hands the loop back to
a human (ADR-002 human-in-the-loop).
**Consequence.** No extra API call, keyless, contract-safe (diagnose output unchanged).
The "Did this work?" feedback already persists; closing the adaptive loop is ADR-010.

## ADR-010: Diligence — visible "Your fixes" log + adaptive nudge (client-only)
**Decision.** A `FixesLog` (collapsible, per-area success bars over logged marks) and
an `AdaptiveNudge` (client-derived low-success-area tip shown at intake) make the
Diligence loop *legible*. Both read `localStorage` only — no backend, no
`DiagnoseResult` change.
**Context.** Diligence is "iterate responsibly, verify before swapping parts"
(fellowship Safety & Ethics). The "Did this work?" marks (ADR-007) were persisted
but unused. Exposing them turns invisible logging into a visible learning record and
re-engages the iterate-verify loop — exactly the expo-mentor behavior.
**Consequence.** Keyless, contract-safe (eval unaffected). Browser-scoped by design
(Q5); a host org could later back it with a shared store to compare cohorts.
All four 4D competencies now have a dedicated interactive component.

## ADR-012: "Why this ref" provenance — the citation is checkable
**Decision.** When a student opens a reference from a hypothesis chip, the `RefDrawer`
shows a "Why you're seeing this" block: which hypothesis cited it (rank + area + title)
and that hypothesis's `whyRanked` reasoning. `RefProvenance` is threaded HypothesisCard →
Results → RefDrawer; it is optional, so library-tab (browse) opens show the doc with no
provenance banner.
**Context.** A bare citation asks for trust. Showing *why* the AI cited a doc turns the
reference into an auditable claim — the student can judge whether the reason fits the
symptom before believing the doc. Discernment made auditable; ADR-011's tour gains a "why."
**Consequence.** Pure UI (no contract/eval change): provenance is derived client-side from
data already in `DiagnoseResult`. Optional prop keeps the browse path clean. Build +
typecheck + eval unchanged (20/20).

## ADR-011: Cited-References — AI tours the student to the robot's own docs
**Decision.** Hypotheses carry an optional `refs?: string[]` of reference IDs. The UI
renders 📚 chips per hypothesis (HypothesisCard → RefChip) and a "📚 References"
browse tab (RefLibrary) — both open a side `RefDrawer` with the doc body + code
snippet, client-side from `src/refs.ts` (the mock library). The mock engine attaches
area-matched `refIdsForArea(area)`; live providers get `REF_LIST` in-prompt to cite real IDs.
**Context.** The goal: the AI answer should *lead the student to the documentation/notes*
for their issue, so they learn and troubleshoot further — not stop at "do this." That is
Discernment as verification against an authority, and Diligence as studying the root cause.
**Consequence.** Self-contained fn preserved (ADR-001): `api/diagnose.ts` only holds a
tiny `REF_INDEX` of id/title/area; full bodies stay client-side. Keyless + contract-safe
(eval gained a refs assertion; mock still passes all 4D checks). A host org swaps
`src/refs.ts` for their team's real docs (per-team variant = V2).

## ADR-006: Production `/api/health` parity + keyless eval harness
**Decision.** A real `api/health.ts` serverless function mirrors the local proxy's
`/api/health` shape (provider, keyConfigured, domains, framework, dTags). A separate
`evals/run.ts` runs the `mock` engine against fixed fixtures and asserts the 4D contract.
**Context.** The local proxy had `/api/health` but production did not — a parity gap that
broke the operator health pill and gave a false "unknown" in prod. The eval closes the
"how do we keep mentoring quality honest as it changes" open question from `03-maintain`.
**Consequence.** A host-org operator can confirm liveness + live-vs-practice mode from the
UI with no terminal; CI can guard quality with no secrets and no network.

