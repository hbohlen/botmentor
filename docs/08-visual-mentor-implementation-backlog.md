# Visual Mentor Workspace — Agent Implementation Backlog

> **Authority:** This backlog implements [06-visual-mentor-workspace-spec.md](06-visual-mentor-workspace-spec.md). It is ordered by dependency and uses small, independently verifiable slices. Do not skip acceptance checks. Do not commit or deploy unless explicitly authorized.

## Operating constraints

- Read `docs/04-architecture-decisions.md` before changing deployment logic. `api/diagnose.ts` must remain self-contained because the Vercel deployment cannot safely resolve relative imports from `api/`.
- Preserve the mock provider and keyless `npm run eval` path.
- Browser code must never receive provider credentials.
- Existing text-first intake remains a fallback during the transition.
- Keep all student data local by default. No new telemetry, account, or upload feature is implied by this backlog.
- Before declaring a slice done: run the slice tests plus `npm run build` and `npm run eval`. Before declaring a user-visible feature complete: verify the live Vercel app with `/api/health`, `/api/diagnose`, and a browser walkthrough.

## Definition of done for every task

- [ ] Behavior satisfies the linked requirement(s).
- [ ] Narrow unit/contract test added or updated.
- [ ] Keyboard and non-color status behavior considered for changed UI.
- [ ] Existing mock-mode behavior remains functional.
- [ ] `npm run build` passes.
- [ ] `npm run eval` passes.
- [ ] Documentation/ADR updated when the decision changes a durable boundary.

---

## Phase 1 — Map foundation

### WM-01: Add canonical workspace types

**Requirements:** FR-01, FR-02, FR-04.

Create shared client-side types for `RobotSystem`, `EvidenceStatus`, `Observation`, `TestRecord`, `InvestigationContext`, hypothesis evidence states, and resource-card metadata. Keep old `FaultArea` types available during migration; add an explicit mapping rather than changing model contract everywhere in one patch.

**Acceptance checks**

- A stable ID exists for every map hotspot.
- `EvidenceStatus` includes all six states in the spec.
- A conversion maps existing server `FaultArea` values into one or more `RobotSystem` values without silently dropping data.
- Type tests / compile check cover an unmapped area path.

### WM-02: Build accessible static RobotSystemMap

**Requirements:** FR-01, FR-02, FR-13.

Implement a semantic SVG or equivalent `RobotSystemMap` with six labelled, keyboard-focusable hotspots. Add a visible textual selected-system summary and non-color icon/text status indicator.

**Acceptance checks**

- Tab and Enter/Space reach and activate all six hotspots.
- Every hotspot has an accessible name and description.
- Default state has no selected system and no misleading fault state.
- Mobile layout preserves labels and does not require hover.

### WM-03: Add map layers and local map state

**Requirements:** FR-02, FR-11.

Add Issue/Evidence/System/Mentor layer controls. Persist valid state under `botmentor:map-status:v1`; ignore corrupt stored data. Initially derive the system layer from static configuration and the other layers from local sample/investigation state.

**Acceptance checks**

- Layer changes alter status presentation but never erase student observations.
- Status is still understandable in grayscale and to a screen reader.
- A reload restores valid selection/status data.

### WM-04: Integrate map with Diagnose entry point

**Requirements:** FR-01, FR-03.

Place the map before the old text-first form. Add a clear fallback action such as “Describe it another way” that opens existing `Intake`. Do not remove legacy intake until structured diagnosis and migration are complete.

**Acceptance checks**

- First visit explains the map’s purpose in student language.
- A student can enter the existing flow without selecting a hotspot.
- Selected system flows to the next refinement step.

---

## Phase 2 — Guided description and diagnosis contract

### WM-05: Define area-specific symptom and question configuration

**Requirements:** FR-03, FR-13.

Create deterministic configuration for each of the six systems: symptom chips, up to three follow-up prompts, answer choices, “I’m not sure,” and free-text fallback. Keep language non-technical and review each prompt for unsafe implied actions.

**Acceptance checks**

- Drive-base flow contains the exact one-side-moves scenario.
- Sensor flow asks environment/physical questions before code questions.
- Every system has an “something else” escape hatch.
- No prompt treats an unknown answer as invalid.

### WM-06: Implement SymptomRefiner and context builder

**Requirements:** FR-03, FR-04.

Build the guided refinement UI and create an `InvestigationContext` from student choices. Generate a concise human-readable summary for the existing model prompt. Preserve the source field as `student` for observations.

**Acceptance checks**

- No model call happens until system, symptom, and refinement state are valid or the student explicitly uses free-text fallback.
- “I’m not sure” is retained as a real answer.
- Generated summary does not describe an inference as a student observation.

### WM-07: Evolve `/api/diagnose` contract safely

**Requirements:** FR-04, FR-05.

Extend both local proxy and self-contained Vercel function to accept optional structured context plus old `input` text. Update system prompt and mock provider. The server must preserve compatibility for existing callers.

**Acceptance checks**

- Old `{ input }` requests still work.
- Structured requests cause model/mock output to reference selected system and observations.
- Server validates payload shape and returns an honest user-facing error for malformed content.
- Production serverless function remains self-contained.

### WM-08: Add fixtures for every system and uncertainty

**Requirements:** FR-04, FR-12.

Add deterministic mock fixtures for power, drivetrain, mechanism, sensors, wiring, and code-control; include at least one low-confidence and one unsafe-battery case.

**Acceptance checks**

- Every fixture has a safe default route.
- Unsafe-battery fixture requires mentor review and has no student repair step.
- Low-confidence fixture has an explicit unknown / escalation path.

---

## Phase 3 — Evidence and test loop

### WM-09: Implement HypothesisBoard data and rendering

**Requirements:** FR-05, FR-06.

Evolve `HypothesisCard` or introduce `HypothesisBoard`. Show hypothesis status, rationale, alternative cause, confidence cue, one next test, resources, and 4D tags. Do not render “confirmed” without a completed evidence record.

**Acceptance checks**

- UI distinguishes `untested`, `supported`, `ruled-out`, and `mentor-review`.
- All status text works without color.
- Each uncertain fixture contains an alternative cause.
- Existing `verifyFirst` behavior remains visible.

### WM-10: Extend Challenge-the-Mentor interaction

**Requirements:** FR-06.

Expand the existing Critique panel to render evidence used, evidence that would change the ranking, alternate explanation, safe differentiating test, and escalation condition.

**Acceptance checks**

- “Challenge this suggestion” provides all five required fields.
- Mock mode returns deterministic content.
- If no safe differentiating test exists, the panel says so and offers mentor escalation.

### WM-11: Implement NextSafeTest and PredictionCapture

**Requirements:** FR-07, FR-08.

Add the one-action panel, optional prediction prompt, completion recording, result capture, and safe/not-safe/help outcomes. Keep student controls clear and avoid long checklists in the primary path.

**Acceptance checks**

- Completing a test records a `TestRecord` with status and result.
- Student can skip prediction.
- `adult-present` and `mentor-required` levels do not display a “complete it yourself” path.
- Result updates the next action / board state without treating completion as confirmation.

### WM-12: Derive map evidence state from investigation

**Requirements:** FR-02, FR-05, FR-07.

Create a deterministic reducer that turns selected system, hypotheses, and test records into map layer status. Do not use model prose parsing to set the map state.

**Acceptance checks**

- Completed connector inspection can update wiring to checked without declaring drivetrain solved.
- Unsafe power conditions set power to mentor-review.
- Unit tests cover status precedence and repeated tests.

---

## Phase 4 — Integrated learning workspace

### WM-13: Build LearningTray from existing refs

**Requirements:** FR-09.

Implement a contextual tray under NextSafeTest using existing references and provenance. Cap visible resources at three. Each card must state why it is relevant to the current test and open the existing RefDrawer.

**Acceptance checks**

- Drive-base scenario shows a drivetrain/wiring check before a programming resource.
- Resource cards explain relevance in a single student-readable sentence.
- Browse References tab remains available but is not required for the guided flow.

### WM-14: Add annotated code-learning metadata

**Requirements:** FR-10.

Add optional annotations, expected observation, and caution text to code-bearing reference entries. Render it only when code is a plausible learning path.

**Acceptance checks**

- Sensor scenario demonstrates logging/observation rather than code replacement.
- Code card states that it does not prove code caused the issue.
- Existing scratchpad stays non-executing, local-only, and resettable.

### WM-15: Preserve and test reference provenance

**Requirements:** FR-09, FR-10.

Ensure a resource opened from LearningTray retains the existing “Why you’re seeing this” provenance, including hypothesis/test context. Add eval coverage for contextual reference linkage.

**Acceptance checks**

- A student can trace a resource to a current hypothesis or test.
- No detached recommendation is presented as an authority without a reason.

---

## Phase 5 — Pit Log, Pit Report, and human escalation

### WM-16: Implement student-editable PitLog

**Requirements:** FR-11.

Build the local evidence record. It should initialize from context and test data but permit student correction. Clearly label student words, model suggestions, and unknowns.

**Acceptance checks**

- Log contains selected area, symptom, observations, tests/results, hypotheses, references, and next action.
- Edits persist locally and malformed storage is safely ignored.
- Model suggestions cannot overwrite student wording silently.

### WM-17: Evolve HandoffCard into PitReport

**Requirements:** FR-11.

Update `buildHandoffBrief` and the display to use sections: Observed by student, Tested and result, Possible explanations—not confirmed, Question for mentor. Preserve copy-only, no-upload behavior.

**Acceptance checks**

- Generated report has all required sections.
- Report never labels untested model suggestions as facts.
- Copy action preserves privacy message and existing handoff metric semantics.

### WM-18: Implement MentorEscalation triggers

**Requirements:** FR-12.

Create central escalation logic for unsafe battery conditions, unsafe repair scope, low-confidence ambiguity, two inconclusive safe tests, and explicit student help request.

**Acceptance checks**

- All listed triggers route to the escalation card.
- Escalation treats evidence gathered as useful progress.
- No unsafe path is exposed after escalation.

---

## Phase 6 — evaluation, docs, and release

### WM-19: Expand deterministic evaluation suite

**Requirements:** all FRs and success criteria.

Add focused eval files or extend existing scripts for map accessibility metadata, guided refinement, model contract, unsafe escalation, hypothesis state, learning provenance, code boundary, Pit Report privacy, and storage migration.

**Acceptance checks**

- `npm run eval` is keyless and passes in a fresh install with mock provider.
- Eval includes all four acceptance scenarios from the spec.
- A failing unsafe or unsupported-confirmation case produces a useful error.

### WM-20: Update technical and non-technical handoff docs

**Requirements:** delivery and ownership.

Update `docs/README.md`, domain needs, implementation spec, runbooks, architecture decisions, and non-technical guides. Add a concise map-use orientation for teachers and volunteers.

**Acceptance checks**

- A new developer can locate the feature spec, contract, and test commands.
- A non-technical volunteer can explain what the app does, what it cannot do, and how to use a Pit Report.
- Durable design choices are recorded as ADRs.

### WM-21: Live verification and portfolio demo pass

**Requirements:** success criteria.

Run build/evals; start local mock mode and smoke `/api/health` plus structured `/api/diagnose`; deploy only with authorization; verify live health, diagnosis, and browser path. Record actual commands/results in release notes or appropriate ADR/runbook update.

**Acceptance checks**

- Local and live endpoints return valid expected shapes.
- The drive-base demo can be completed end-to-end in mock mode.
- No browser request or bundle contains a provider credential.
- A known production verification checklist has been completed against the live Vercel app.

## Suggested agent dispatch order

1. WM-01 through WM-04
2. WM-05 through WM-08
3. WM-09 through WM-12
4. WM-13 through WM-15
5. WM-16 through WM-18
6. WM-19 through WM-21

Do not parallelize tasks that edit the shared type contract, `App.tsx`, `api/diagnose.ts`, or global CSS without coordinating the integration order. Independent test/documentation research may run in parallel, but the final integration must be sequential and verified.
