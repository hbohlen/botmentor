# BotMentor — Visual Mentor Workspace Handoff (2026-07-15)

> **Purpose:** durable, agent-ready continuation record for the active Visual Mentor Workspace iteration. Read this before changing `App.tsx`, `api/diagnose.ts`, the map, or the evaluation harness.
>
> **Canonical memory:** gbrain pages `botmentor-project`, `botmentor-visual-mentor-workspace`, `botmentor-visual-mentor-backlog`, `botmentor-interview-evidence`, and `botmentor-session-handoff-2026-07-15`.

## Product boundary

BotMentor is a student-first robotics mentoring co-pilot inspired by Hayden Bohlen's 2017–2018 Nebraska Robotics Expo volunteering. It helps a learner form observations, run safe tests, learn from evidence, and hand off to a human mentor. It must **not** claim to see, repair, or confirm physical hardware.

## Completed in this session

### Phase 1 — map foundation (WM-01–WM-04)

- Added canonical workspace types in `src/lib/robot-workspace.ts`: robot systems, evidence statuses, observations, tests, resource metadata, and investigation context.
- Added accessible `RobotSystemMap` with six stable systems: Power, Drive base, Arms/mechanisms, Sensors, Wiring, and Code/controller.
- Added Issue, Evidence, System, and Mentor layers, visible text semantics, keyboard controls, safe validated local persistence, and safe legacy fault mapping.
- Made map selection map-first while retaining legacy free-text intake as a fallback.

### Phase 2 — guided description and contract (WM-05–WM-08)

- Added deterministic, student-safe symptom flows and at-most-three follow-up prompts per system; every flow permits `I’m not sure` and `Something else`.
- Added `SymptomRefiner`, structured `InvestigationContext`, and explicit student-observation labeling.
- Extended both `api/diagnose.ts` and the local proxy to accept legacy `{ input }` and structured `{ input, context }` requests.
- Added keyless mock fixtures for all six systems, low-confidence uncertainty, and unsafe battery escalation.
- Mock behavior now escalates hot/swollen/damaged/leaking battery reports and uncertainty instead of returning speculative self-repair guidance.

### Phase 3 — evidence/Discernment foundation (WM-09–WM-10)

- Hypothesis cards show explicit text statuses: untested, supported, ruled out, partly supported, and low-confidence mentor review.
- `Challenge the mentor` now reveals evidence used, what would change the ranking, an alternative explanation, a safe differentiating test, and an escalation condition.
- Began WM-11 persistence foundation: `recordTest` / `getTestRecords` provide local-only `TestRecordEntry` storage. The student-facing Next Safe Test panel is **not yet implemented**.

## Current verification

The latest complete local quality run passed after the test-record storage fix:

```bash
npm run typecheck
npm run eval
npm run build
git diff --check
```

Evidence:

- deterministic eval: **44 passed, 0 failed across 11 fixtures**;
- workspace-foundation: **9/9 passed**;
- TypeScript, production build, and whitespace check passed.

No commit or deployment was made during this iteration. Do not claim live Vercel verification for these uncommitted workspace changes.

## Current modified files

- `api/diagnose.ts` — normalized structured request support; mock safety/uncertainty paths.
- `src/server/index.ts` — local proxy uses the same request normalizer.
- `src/App.tsx` — map selection, local state, structured-context submission.
- `src/lib/robot-workspace.ts` — workspace contract, symptom flows, context builder, layer status helpers.
- `src/lib/storage.ts` — local-only test-record persistence foundation.
- `src/components/RobotSystemMap.tsx`, `SymptomRefiner.tsx`, `HypothesisCard.tsx`, `CritiquePanel.tsx` — guided workflow and discernment surfaces.
- `evals/workspace-foundation.ts`, `evals/fixtures.ts`, `package.json` — deterministic contracts and eval runner.

## Next implementation step — WM-11

Build and integrate a focused `NextSafeTest` / prediction-capture panel.

1. Select **one** safe next action from the leading hypothesis rather than foregrounding a long checklist.
2. Let the learner optionally state a prediction.
3. Record `completed`, `not-safe`, or `need-help`, plus an optional result, through `recordTest`.
4. Treat `not-safe` and `need-help` as mentor escalation; do not expose an independent-completion action for adult-present or mentor-required tests.
5. Do not infer a confirmed diagnosis merely because a test was completed.
6. Add a RED contract test before production logic, then run the complete quality gate.

## Follow-on sequence

- **WM-12:** deterministic map evidence reducer from context, hypotheses, and test records; never parse model prose.
- **WM-13–15:** contextual Learning Tray, code-learning metadata, and provenance.
- **WM-16–18:** editable Pit Log, Pit Report, centralized escalation.
- **WM-19–21:** broadened evals/docs, local mock smoke, live Vercel health/diagnose/browser verification only after user authorizes a deploy.

## Agent operating rules

1. Read `docs/06-visual-mentor-workspace-spec.md`, `docs/08-visual-mentor-implementation-backlog.md`, and this handoff before implementation.
2. In Hermes, load the `botmentor-visual-workspace` continuation skill before implementation.
3. Use TDD: add a failing narrow contract test, observe failure, implement minimally, then rerun the full gate.
4. Before editing a function, inspect blast radius with gbrain code graph tools when available.
5. Preserve: legacy text fallback, local-only default persistence, keyless mock provider, no automatic upload, and self-contained `api/diagnose.ts` serverless compatibility.
6. Do not commit or deploy without Hayden's explicit authorization.
7. Before calling a user-facing step complete, run typecheck, eval, build, and `git diff --check`; before claiming production readiness, also verify live `/api/health`, `/api/diagnose`, and browser behavior.

## Fellowship evidence update

This iteration strengthens the Claude Corps story with concrete examples of AI judgment and safe enablement:

- The system converts vague student language into structured, student-owned evidence rather than pretending model certainty.
- Safety escalation is a deliberate success state for unsafe batteries and uncertain physical troubleshooting.
- The Challenge-the-Mentor surface makes reasoning, alternatives, tests, and escalation inspectable.
- Deterministic, keyless fixtures make safety behavior reproducible and handoff-friendly for a host organization.

Use precise language: these are **implemented prototype behaviors and deterministic quality checks**, not measured student learning, diagnostic accuracy, or safety outcomes in the field.
