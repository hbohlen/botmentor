# Maintain & Extend — for the next owner

This is the application's core ask: can the organization keep BotMentor alive and grow it
after the original author leaves? This document is written for **two readers** — a
non-technical program lead, and a new volunteer developer.

## For the non-technical program lead
**What it is.** A web tool where a student types what's wrong with their robot and gets
back a ranked list of likely causes plus safe steps to try — coached in the AI Fluency
4D Framework (Delegation, Description, Discernment, Diligence). It does not fix the robot;
it helps the student think like a mentor.

**What's shipped (as of 2026-07-15).** All four 4D competencies have a dedicated,
visually-interactive component — each UI-only and keyless so it works in `mock` mode and
the quality gate (`npm run eval`, 15/15) stays intact:
- **Delegation** — split panel ("🤖 Claude works out the causes" vs "✋ You run the tests")
  + tappable student action checklist with a hands-on progress bar (ADR-007).
- **Description** — live quality meter + coaching tips as the student types (ADR-008).
- **Discernment** — confidence bar + "🔍 Challenge the mentor" self-critique panel
  (confirm/disprove/alt-cause + a question to take to a human mentor) (ADR-009).
- **Diligence** — visible "Your fixes" log (per-area success bars over logged marks)
  + an adaptive nudge at intake (ADR-010).

**What it costs.** Hosting is free on Vercel's hobby tier. If the demo uses real AI answers
(`PROVIDER=deepseek`), each conversation costs a fraction of a cent; budget ~$5–10/month.
If it uses the built-in `mock` mode, it costs nothing.

**What to watch (so it doesn't silently break):**
- **API key expiry.** DeepSeek/Anthropic keys can expire or be revoked. If answers suddenly
  stop, a volunteer should run Runbook R2 to refresh the key.
- **Model deprecation.** Models get retired — e.g. `deepseek-chat` was deprecated
  2026-07-24; we use `deepseek-v4-flash`. If a provider errors, switch `PROVIDER` to `mock`
  as a stopgap (R3) and revisit later.
- **One person shouldn't hold the only login.** Keep Vercel access in a shared org account,
  not a personal one.

**Who to ask.** Any volunteer comfortable with `git` + a terminal can run the runbooks.
No deep AI expertise required for day-to-day operation.

## For a new volunteer developer
**Mental model.** The app is two parts: a static React UI (the chat) and one serverless
function `api/diagnose.ts` (the brain). The function holds the API key and calls the model,
so keys never reach the browser. Everything the mentor "knows" lives in `SYSTEM_PROMPT`
inside that one file.

**Onboarding.** Run Runbook R4. Read `docs/00-domain-and-needs.md` (the problem domain) and
`docs/01-spec.md` (the design) first.

**Golden rule for the function.** `api/diagnose.ts` must stay **self-contained** — no
relative imports. Vercel's bundler drops them (Runbook R5). If you need shared code, inline it.

## Expansion recipes (how to grow it without the original author)
1. **New mentoring mode** (e.g. "Mentor Copilot" that drafts a coaching reply to a student's
   message, or a "4D Prompt Lab" that shows each framework dimension). Add a second route
   `api/<mode>.ts` copying the structure of `api/diagnose.ts`; add a tab in the UI.
2. **A knowledge base** (RAG) of past Expo fixes. Store Q&A as markdown/JSON, embed at request
   time, inject into `SYSTEM_PROMPT`. No vector DB required to start — a static JSON file works.
   **Shipped (2026-07-15, ADR-011):** the mock reference library `src/refs.ts` (15 entries
   across all fault areas: wiring diagrams, datasheets, code snippets) + 📚 chips, a doc
   drawer, and a "📚 References" browse tab. Hypotheses cite refs by ID; the AI tours
   the student to the robot's own docs instead of ending at the answer. Swap `src/refs.ts`
   for a team's real build docs to make it per-team.
3. **An eval harness** — now shipped as `evals/run.ts` (`npm run eval`). It runs the
   `mock` engine against fixed robotics fixtures and asserts the 4D mentoring contract
   (valid JSON, in-taxonomy hypotheses, `verifyFirst` present, 4D tags present) with
   **no API key and no network**, so a volunteer can guard quality in CI. Details in
   `docs/05-eval-harness.md`. If you later add a live-provider regression set, keep it
   separate (it costs money) and gate it behind a flag.
4. **4D interactive components** — the four coaching competencies each have a UI-only
   panel/component (see ADR-007/008/009/010). To extend one, edit the matching
   `src/components/*` file; to add a new one, follow the same pattern: client-derived,
   no backend change, no `DiagnoseResult` contract change, mock-mode safe.
5. **Multi-language UI** for non-English robotics clubs. The UI strings are in `src/components/*`.

## Bus-factor mitigation (this is the point)
- Runbooks (R1–R7) mean operations don't depend on one person's memory.
- ADRs (`docs/04-architecture-decisions.md`) explain *why*, so changes don't undo deliberate design.
- A shared org login + documented key rotation means access survives turnover.
- The mental model above lets a newcomer be productive in an afternoon.
