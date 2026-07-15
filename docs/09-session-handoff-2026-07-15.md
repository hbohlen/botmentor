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

WM-11 is now implemented locally as part of the middle-school student-flow redesign. The student-facing path foregrounds one safe action, optional prediction, result capture, and mentor escalation; it does not infer confirmation from completion.

## Middle-school student-flow redesign

Implemented locally on 2026-07-15:

- Reframed the primary persona as a middle-school robotics student working pit-side under time pressure.
- Reorganized the main experience into five visible stages: find the problem area, tell what happened, choose a safe check, record the result, and choose the next step.
- Replaced simultaneous follow-up fieldsets with one observation question at a time, preserving “I’m not sure” and free-text paths.
- Added a student-friendly visual robot picker with plain-language labels plus supporting technical vocabulary.
- Moved investigation layers, full hypothesis reasoning, confidence, 4D framing, impact, team selection, and project context behind progressive disclosure or the mentor area.
- Added `NextSafeTest` with optional prediction, result capture, local `TestRecordEntry` persistence, and successful mentor escalation for unsafe/help outcomes.
- Shifted the visual language from a dense developer dashboard to a responsive educational workspace with larger touch targets, visible focus states, lighter contrast, and mobile-first controls.
- Added deterministic `evals/student-experience.ts` coverage for one-question progression, five-stage progress, safe-action selection, and unsafe escalation.

Verification after this redesign:

```text
npm run typecheck  # passed
npm run eval       # 44/44 core + 9/9 workspace + 4/4 student experience
npm run build      # passed
git diff --check   # passed
local Vite HTML/App module smoke on 127.0.0.1:5173 # passed
```

No commit or deployment was made. The unrelated untracked resume files in `docs/` were left untouched.

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
