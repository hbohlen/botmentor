# BotMentor — Visual Mentor Workspace Specification

> **Status:** Approved product direction for the next iteration after the shipped text-first MVP.
> **Audience:** Implementing agents, maintainers, and application reviewers.
> **Read first:** [00-domain-and-needs.md](00-domain-and-needs.md), [01-spec.md](01-spec.md), and [04-architecture-decisions.md](04-architecture-decisions.md).

## 1. Purpose and product thesis

BotMentor should begin where a student begins in a real robotics event: by pointing at the part of the robot that seems wrong. The **Visual Mentor Workspace** replaces the blank-first troubleshooting experience with a student-owned, evidence-based investigation.

**Product promise:**

> BotMentor helps robotics students turn “my robot is broken” into a safe, evidence-based troubleshooting path—using an interactive robot map, guided tests, contextual learning resources, and a useful human-mentor handoff.

The goal is not to diagnose physical hardware with false certainty. The goal is to improve a student’s description, help them form and test hypotheses, teach the reasoning behind a safe next step, and preserve the human mentor relationship.

## 2. Narrative and Claude Corps alignment

This feature is rooted in Hayden Bohlen’s 2017–2018 Nebraska Robotics Expo volunteering with UNO engineering students and K–12 teams. In that environment, a student often began by pointing to a robot component and reporting an incomplete symptom. A useful mentor did not take the robot and fix it silently. They:

1. started with the student’s observation;
2. translated it into a testable description;
3. proposed the safest, cheapest discriminating test;
4. had the student run or observe the test;
5. explained the result and next decision; and
6. escalated to a human volunteer when physical skill, safety, or uncertainty required it.

The feature must make this mentoring loop visible and repeatable.

| Claude Corps signal | Visible product evidence |
| --- | --- |
| Discover and scope | Guided subsystem selection and observation prompts reduce vague problem statements. |
| Build with Claude | Structured robot state is sent to the model; the model returns bounded hypotheses, tests, learning links, and safe escalation. |
| Enable non-technical people | Student language, contextual references, annotated code, and a mentor-ready Pit Report. |
| Hand off well | A human can see the selected area, observations, evidence, tests, outcomes, and unresolved question without replaying a chat. |
| Exercise judgment | Status is separated into reported symptom, hypothesis, evidence, and confirmed result; low confidence and unsafe tasks trigger escalation. |
| 4D AI Fluency | Delegation, Description, Discernment, and Diligence are each a concrete interaction, not decorative labels. |

## 3. Scope and non-goals

### In scope

- Clickable visual robot system map.
- Guided symptom refinement from a selected area.
- Evidence-backed hypothesis board with alternatives and test status.
- One safe, student-owned test at a time.
- Contextual learning cards, references, and optional annotated code.
- Student-controlled Pit Log and copyable Pit Report.
- Explicit safety and mentor escalation.
- Local-only persistence and a keyless mock path for the public demo.
- Deterministic tests and evals for the interaction contract.

### Explicitly out of scope for this iteration

- Claiming a physical diagnosis without student-provided evidence.
- Autonomous actuation, firmware flashing, code execution, or direct robot control.
- Uploading student data, photos, notes, or code by default.
- Accounts, authentication, a teacher surveillance dashboard, or cohort analytics.
- An exhaustive catalog for every robotics kit; the initial map is a generic teaching model.
- Replacing the existing text intake, reference workspace, handoff, or 4D components. The new workspace integrates and evolves them.

## 4. Users and jobs to be done

### Student (primary)

A K–12 robotics student may have limited vocabulary, incomplete documentation, and limited adult access. They need to identify a likely robot area, turn a symptom into observations, perform a safe test, learn why it matters, and ask a human mentor a better question.

### Volunteer mentor / coach (secondary)

A mentor needs a concise, trustworthy record of what the student noticed and tested. They need to see what remains unknown and what intervention is needed without assuming the AI is correct.

### Teacher / program lead (tertiary)

A non-technical owner needs a safe, explainable tool that can be demonstrated, maintained, and handed off. They should be able to understand boundaries and review a sample Pit Report without learning the implementation stack.

## 5. Experience requirements

### FR-01: Visual robot system map

The Diagnose tab SHALL open with the prompt **“What part of your robot needs attention?”** and a keyboard-accessible robot illustration. It SHALL provide six selectable areas:

| System ID | Student label | Examples |
| --- | --- | --- |
| `power` | Power | battery, switch, controller power |
| `drivetrain` | Drive base | wheels, drive motors, gears |
| `mechanism` | Arms and mechanisms | lift, claw, intake, servo |
| `sensors` | Sensors | distance, line, color, gyro |
| `wiring` | Wiring | connectors, ports, loose cables |
| `code-control` | Code and controller | program logic, mapping, connection |

The map SHALL not rely on color alone: each region needs a label, focus state, tooltip or accessible description, and a visible selected-state indicator.

### FR-02: Map status and evidence layers

Each system region SHALL have a status independent of color:

- `uninvestigated` — no selection or evidence;
- `selected` — student says this is the starting area;
- `suspected` — plausible related component or hypothesis;
- `checked` — student completed a relevant test and the evidence does not currently implicate it;
- `observed-problem` — a student-observed symptom is associated with the area;
- `mentor-review` — requires a human mentor because of safety, uncertainty, or repeated inconclusive tests.

The UI SHALL offer a layer selector:

1. **Issue map** — what the student selected or observed;
2. **Evidence map** — what has been checked and the associated results;
3. **System map** — components related to the selected issue;
4. **Mentor map** — components or actions requiring adult/mentor help.

The initial implementation may render a simple semantic SVG; it must preserve stable hotspot IDs so future illustrations do not invalidate saved sessions.

### FR-03: Guided symptom refinement

After choosing an area, the student SHALL choose a symptom from area-specific options before free-text is requested. Example for `drivetrain`:

- robot does not move;
- only one side moves;
- it turns instead of driving straight;
- a wheel or motor makes a strange sound;
- it moves weakly or stops;
- something else.

The system SHALL then ask at most three short, observation-oriented follow-ups. Questions must avoid assuming technical knowledge. Answers include clear options plus “I’m not sure.” Example:

- “Does the other side move normally?”
- “Does the stopped motor make a sound?”
- “Did this work earlier today?”
- “What changed: battery, wiring, code, physical bump, or not sure?”

Existing free-text fields remain available as optional context. The app MUST not force a student to use correct technical terminology.

### FR-04: Structured diagnosis context

The client SHALL convert selections into a structured `InvestigationContext` and send it with a human-readable summary to `/api/diagnose`. The model prompt MUST clearly distinguish student observation from model inference.

```ts
export type RobotSystem =
  | 'power'
  | 'drivetrain'
  | 'mechanism'
  | 'sensors'
  | 'wiring'
  | 'code-control';

export type EvidenceStatus =
  | 'uninvestigated'
  | 'selected'
  | 'suspected'
  | 'checked'
  | 'observed-problem'
  | 'mentor-review';

export interface Observation {
  questionId: string;
  prompt: string;
  answer: string;
  source: 'student';
}

export interface TestRecord {
  id: string;
  title: string;
  safetyLevel: 'safe' | 'adult-present' | 'mentor-required';
  predictedResult?: string;
  actualResult?: string;
  status: 'suggested' | 'completed' | 'inconclusive' | 'not-safe-to-attempt';
  studentNote?: string;
}

export interface InvestigationContext {
  selectedSystem: RobotSystem;
  symptomId: string;
  symptomLabel: string;
  observations: Observation[];
  freeText?: string;
  tests: TestRecord[];
}
```

The deployed `api/diagnose.ts` remains self-contained per ADR-001. The local and production request contracts MUST stay in sync.

### FR-05: Hypothesis board

Results SHALL be rendered as an inspectable board, not as unqualified AI instructions. Every hypothesis MUST show:

- plain-language title;
- linked system area(s);
- status: `untested`, `supported`, `ruled-out`, or `mentor-review`;
- confidence as a supporting cue, never as a claim of fact;
- an evidence sentence explaining the rank;
- an alternate plausible cause when uncertainty is meaningful;
- exactly one recommended next discriminating test when safe;
- reference IDs and, when applicable, one code-learning link;
- relevant 4D chips.

Illustrative display:

```text
? Wrong controller-port mapping — Worth testing next
  Why: The opposite drive side works and the connection appears secure.
  Alternative: The left motor itself may be failing.
  Next safe test: With power off, swap the two motor ports and observe whether the issue follows the motor or the port.
```

A hypothesis SHALL never be marked confirmed solely because a model assigned high confidence.

### FR-06: Challenge-the-mentor interaction

Every hypothesis SHALL include an action labelled **“Challenge this suggestion”** or **“Show me why.”** It MUST reveal:

1. evidence the suggestion relied on;
2. what evidence would change the ranking;
3. a competing explanation;
4. the safest available test that distinguishes the explanations; and
5. an escalation path when a test is unsafe or inconclusive.

This interaction is the visible Discernment contract. It must work in mock mode with deterministic content.

### FR-07: Prediction → test → result learning loop

Before a student marks a recommended test complete, the UI SHOULD ask for a simple prediction when one is meaningful:

> “If this connection is loose, what do you expect to see after you reseat it?”

The student may answer with a choice, free text, or “I’m not sure.” After the test, the UI SHALL capture the actual result and invite a concise comparison. The resulting record must update the Pit Log and evidence map.

The student may skip prediction; an incomplete prediction must never block safety guidance or a mentor escalation.

### FR-08: One safe action at a time

The primary action panel SHALL focus on the next safe test rather than presenting a long to-do list. It MUST state:

- what to do;
- safety condition;
- why this test is first;
- expected observation, if applicable;
- buttons for completed, found an issue, need help, and not safe to attempt.

If a task has `adult-present` or `mentor-required` safety level, the UI SHALL not frame it as independent student work. It must instruct the student to pause and prepare a Pit Report.

### FR-09: Integrated learning tray

For the current recommended test, the app SHALL surface no more than three purposeful learning resources:

- **Quick check** — a short visual or procedural checklist;
- **Learn why** — plain-language explanation tied to the test;
- **Inspect code** — optional annotated snippet or Code Lab entry when code is relevant.

Each resource MUST say **why it is shown now**. Example: “You reported that one drive side works; this reference helps compare the two sides before changing code.”

The existing reference drawer stays the canonical reader, Markdown exporter, and local non-executing scratchpad. The Visual Mentor Workspace should open it in context rather than making students switch to a separate References tab.

### FR-10: Code learning rules

Code content SHALL be optional and must appear only when the evidence makes code a plausible next learning path. A code card MUST:

- identify what the snippet observes or changes;
- annotate each relevant line in student-friendly language;
- state an expected observation;
- distinguish inspecting code from proving that code is the cause;
- preserve existing Code Lab boundaries: no execution, upload, automatic save, or mutation of source references.

Code should be used as an instrument for observation, not a block to copy blindly.

### FR-11: Pit Log and Pit Report

The app SHALL maintain a student-editable **Pit Log** with:

- selected robot area;
- symptom in the student’s words;
- observations;
- student hypothesis and model alternatives;
- completed tests, predictions, and results;
- references consulted;
- lesson learned;
- current uncertainty and next action;
- mentor request if needed.

The copyable **Pit Report** SHALL be a privacy-preserving summary for a coach/volunteer. It MUST clearly separate:

- **Observed by student**;
- **Tested and result**;
- **Possible explanations, not confirmed**;
- **Question for mentor**.

No data may be copied or transmitted automatically. The existing handoff utility should be evolved rather than replaced.

### FR-12: Human mentor escalation

The app SHALL recommend mentor escalation when:

- a battery is hot, swollen, damaged, leaking, or otherwise unsafe;
- exposed wiring, tools, soldering, sharp components, or unfamiliar repair steps are involved;
- model confidence is low or competing hypotheses cannot be safely distinguished;
- two recommended safe tests are inconclusive;
- the student selects “I need help” or “not safe to attempt.”

Escalation is a successful outcome, not an error. The UI must acknowledge evidence already gathered and direct the student to share a Pit Report.

### FR-13: Accessibility and tone

- Keyboard navigation and semantic labels are required for every map hotspot and layer control.
- Status cannot be color-only.
- Plain-language and technical vocabulary must coexist; use “Explain simply” and “Go deeper” rather than assuming one level.
- Copy must not shame students for incomplete input.
- The app must remain useful in mock/keyless mode.

## 6. 4D behavior matrix

| Framework dimension | Product interaction | Observable acceptance evidence |
| --- | --- | --- |
| Delegation | Model proposes; student conducts safe physical test; mentor handles unsafe work. | No instruction claims BotMentor performed a physical action. |
| Description | Map selection, symptom chips, and observation prompts create structured context. | A diagnosis includes selected system, symptom, and at least one student observation or “not sure.” |
| Discernment | Hypothesis board, confidence explanation, alternatives, challenge action, cited resources. | A student can see why a claim is ranked and what would change it. |
| Diligence | Prediction/result capture, Pit Log, evidence map, and follow-up learning. | Completed tests persist locally and update the next recommended action. |

## 7. Data, privacy, and safety boundaries

- Default persistence remains local browser storage. There is no account and no automatic upload.
- Do not collect names, student identifiers, location, school, photo, voice, or code unless a future user explicitly opts in through a separately specified feature.
- Impact data, if retained, remains de-identified and facilitative—not surveillance, grading, or a claim of program efficacy.
- The model must state uncertainty honestly. The model is not an authority on the physical state of the robot.
- Mock mode must model safe, transparent behavior rather than bypassing safety or evidence requirements.

## 8. API and component plan

### New or evolved frontend components

```text
src/components/
  RobotSystemMap.tsx          # semantic SVG, hotspots, status/layer views
  SymptomRefiner.tsx          # area-specific chips and observation prompts
  HypothesisBoard.tsx         # replaces or wraps list presentation
  NextSafeTest.tsx            # one-action panel and completion capture
  PredictionCapture.tsx       # optional prediction/result loop
  LearningTray.tsx            # contextual resource cards
  PitLog.tsx                  # editable evidence record
  PitReport.tsx               # evolve HandoffCard
  MentorEscalation.tsx        # explicit pause-and-handoff state
```

Existing components expected to be reused or evolved: `Intake`, `Results`, `HypothesisCard`, `CritiquePanel`, `RefDrawer`, `FixesLog`, `HandoffCard`, `SafetyBanner`, and 4D components.

### Suggested storage keys

```text
botmentor:investigation:v1
botmentor:pit-log:v1
botmentor:map-status:v1
botmentor:feedback             # existing; preserve/migrate
botmentor:checklist            # existing; preserve/migrate
```

Migration must be defensive: invalid or old browser data cannot break a session. Preserve existing checklists and feedback when possible.

## 9. Delivery sequence for agents

### Slice A — foundation and navigation

1. Define shared types and static system/symptom configuration.
2. Add `RobotSystemMap` with selection, keyboard access, non-color labels, and responsive layout.
3. Preserve the old free-text intake as “Describe it another way” fallback.
4. Add static mock-mode map status examples and unit tests.

**Done when:** A student can select a system and reach an area-specific refinement flow without typing a technical description.

### Slice B — structured refinement and diagnosis contract

1. Build `SymptomRefiner` and bounded observation prompts.
2. Add `InvestigationContext` to the frontend and `/api/diagnose` request/response contract.
3. Update production serverless and local proxy paths in lockstep.
4. Extend mock diagnosis fixtures for every system and at least one uncertain scenario.

**Done when:** The diagnosis API receives structured evidence and mock output visibly distinguishes observation from inference.

### Slice C — evidence and hypothesis board

1. Render hypothesis status, rationale, alternative, and next discriminating test.
2. Adapt existing Challenge panel to expose evidence/change conditions/alternative.
3. Update map status from hypotheses and completed tests.
4. Add evaluation coverage for unsupported confirmation and missing alternatives.

**Done when:** A student can challenge a suggestion and see a safe way to distinguish it from another plausible cause.

### Slice D — learning and code integration

1. Build `LearningTray` from existing reference metadata and provenance.
2. Add concise “why this resource” statements.
3. Add annotated-code metadata to appropriate reference entries.
4. Route all full-document and code interactions through the existing RefDrawer.

**Done when:** Every next test can surface relevant resources without navigating to a disconnected references workflow.

### Slice E — Pit Log, report, and escalation

1. Create editable local Pit Log from investigation state.
2. Evolve handoff builder into Pit Report sections.
3. Add safety/low-confidence/repeated-inconclusive escalation triggers.
4. Add copy behavior and privacy tests.

**Done when:** A mentor can receive a concise report containing observations, test results, unresolved possibilities, and an explicit question.

### Slice F — quality, accessibility, and live-demo proof

1. Add keyboard, screen-reader, and responsive verification.
2. Expand deterministic evals for map, guided refinement, evidence, safety, learning, and handoff contracts.
3. Run build, eval, local health/diagnose smoke, Vercel deployment, and live endpoint/UI verification.
4. Update runbooks and non-technical guide.

**Done when:** The live public app demonstrates the full path in mock mode and every contract check passes without secrets.

## 10. Acceptance scenarios

### Scenario 1: One drive side does not move

1. Student selects **Drive base**.
2. Student chooses **Only one side moves** and notes that the other side moves normally.
3. The map marks drivetrain as observed problem and related wiring/control areas as suspected.
4. The hypothesis board explains why battery failure is less likely, without ruling it out as fact.
5. The student receives one power-off connector comparison test and a relevant drivetrain reference.
6. The student records a result; Pit Log and evidence map update.
7. If still inconclusive, the next test or mentor escalation is explicit.

### Scenario 2: Sensor always reads the same value

1. Student selects **Sensors** and chooses a repeated/unchanging reading symptom.
2. The system asks physical-environment questions before code questions.
3. Learning Tray shows a sensor-check guide and an annotated logging snippet.
4. The UI explains that logging a value observes behavior; it does not prove the code is at fault.

### Scenario 3: Unsafe battery issue

1. Student selects **Power** and identifies heat, swelling, damage, or a leak.
2. The app does not recommend further student testing.
3. It marks mentor review, explains why the situation requires an adult, and generates a Pit Report.

### Scenario 4: Student cannot describe the issue

1. Student chooses a system but repeatedly selects “I’m not sure.”
2. The app offers plain-language options, a mentor escalation, and an editable report with honest unknowns.
3. The app never invents observations or presents a confident diagnosis.

## 11. Measurable success criteria

- A first-time student can select a robot area and start refinement in **under 30 seconds** without using technical vocabulary.
- In a scripted drive-base scenario, the UI presents a safe first test and one relevant learning resource before suggesting a code change.
- In all unsafe-battery test fixtures, the system offers mentor escalation and no independent repair instruction.
- In all fixture responses, every hypothesis is visibly labelled as untested/supported/ruled-out/mentor-review; none is called confirmed without a student test result.
- A copied Pit Report contains the selected system, at least one observation or explicit unknown, completed tests, unresolved possibilities, and the question for the mentor.
- Keyboard-only users can select every hotspot, choose a layer, refine a symptom, open a resource, complete a test, and copy a Pit Report.
- `npm run build`, `npm run eval`, live `/api/health`, live `/api/diagnose`, and a live browser demo path are verified before an implementation is declared complete.

## 12. Interview-ready rationale

**Problem:** Students often describe a robot issue by pointing at a component or saying “it’s broken,” while mentors need observations and safe tests to help effectively.

**Decision:** Move the interface from a blank text box to a visual system map plus guided refinement, but preserve free text so students are never blocked.

**Why:** The design operationalizes the human mentoring loop from the Nebraska Robotics Expo: start with the student’s observation, coach a testable description, test safely, explain evidence, and preserve human escalation.

**Judgment boundary:** The map grounds the conversation; it does not make the model omniscient. BotMentor separates observed facts, hypotheses, evidence, and mentor-required work.

**Impact hypothesis:** Better structured reports and contextual learning can help students learn a transferable troubleshooting process and help volunteers spend less time reconstructing context.
