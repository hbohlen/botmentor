# BotMentor — Claude Corps Interview Evidence and Decision Record

> **Purpose:** Preserve the reasoning behind BotMentor’s product decisions and turn the project into interview-ready evidence. This is not a script to memorize. It is a source of truthful examples, tradeoffs, and concise explanations.
> **Related:** [06-visual-mentor-workspace-spec.md](06-visual-mentor-workspace-spec.md), [04-architecture-decisions.md](04-architecture-decisions.md), [05-eval-harness.md](05-eval-harness.md).

## 1. One-minute project explanation

BotMentor is a mentoring co-pilot for K–12 robotics students. It came from my 2017–2018 Nebraska Robotics Expo volunteer experience, where the most valuable thing a mentor did was not fix a robot for a student—it was helping them turn “it doesn’t work” into an observation, a hypothesis, a safe test, and a next decision.

The first version used structured intake, ranked hypotheses, verify-first guidance, source references, a code workspace, local feedback, and a mentor handoff. The next design iteration makes that mentoring process more intuitive: a student begins by selecting the part of the robot they are concerned about on a visual system map. BotMentor then asks simple follow-up questions, shows what is known versus only suspected, gives one safe test at a time, connects the student to the relevant reference or code example, and creates a concise Pit Report if a human mentor needs to step in.

The important boundary is that BotMentor does not pretend it can see or repair a robot. It helps students and mentors build better evidence together.

## 2. Origin story: STAR evidence

### Situation

At the Nebraska Robotics Expo in 2017–2018, UNO engineering students volunteered with middle- and high-school robotics teams in a time-pressured competition environment. Students often arrived with incomplete symptom descriptions and needed practical, understandable help.

### Task

The mentoring task was not just to restore a robot quickly. It was to help students understand what was happening, choose a safe test, and retain confidence and ownership of the next step.

### Action

BotMentor models that process: it structures descriptions, ranks hypotheses rather than declaring a diagnosis, prioritizes safe/cheap checks, cites resources, makes model uncertainty inspectable, keeps physical actions with the student or adult mentor, and creates a handoff record.

### Result / evidence

The project is a live public deployment with deterministic keyless evals, provider boundaries, operator runbooks, non-technical documentation, and a privacy-preserving mentor handoff. Its value is visible both as a product and as an example of building something a non-technical organization could own after the builder leaves.

## 3. Design decisions and why they matter

| Decision | Reasoning | Tradeoff accepted | Claude Corps signal |
| --- | --- | --- | --- |
| Start with a visual robot map | Students can point at a part before they know technical vocabulary. This mirrors an Expo interaction. | A generic map cannot match every kit; it is a scaffold, not a digital twin. | Discover, scope, and translate for non-technical users. |
| Use guided observations before free text | Better description improves downstream reasoning and reduces prompting burden. | Guided choices can feel constraining, so “something else” and free text remain. | Description and accessible enablement. |
| Show hypothesis status, evidence, and alternatives | Confidence alone can look like false certainty. Students need to know what is observed, suspected, tested, or unresolved. | More UI complexity than a chat response. | Discernment and judgment. |
| One safe test at a time | A novice can act on one clear step; a long checklist is easy to skip or misuse. | It may take more turns than a generic answer list. | Delegation and safety. |
| Integrate resources with the current test | References are useful when a student knows why they matter now, not as a detached library. | Requires curated resource metadata and provenance. | Teaching and sustainable handoff. |
| Keep Code Lab local and non-executing | Code should support observation and learning without creating an unsafe or opaque automation path. | The lab is less powerful than a full simulator. | Diligence and appropriate scope. |
| Generate a Pit Report | Human volunteers need context quickly; students deserve credit for evidence they gathered. | It is a handoff aid, not a mentor-management system. | Enablement and hand off well. |
| Local-only data by default | K–12 learners and school contexts deserve a privacy-first baseline. | Cross-device history and organization analytics are deferred. | Ethical judgment. |
| Mock provider and deterministic evals | A reviewer and maintainer should be able to exercise the product without cost, secret keys, or trusting an LLM output blindly. | Mock content needs maintenance and does not represent real-world model quality. | Build reliably and exercise judgment. |

## 4. How the project demonstrates the 4D Framework

### Delegation

**What BotMentor handles:** organizing observations, proposing hypotheses, finding relevant references, and explaining why a test is useful.

**What the student handles:** safe physical inspection, prediction, observation, and recording the result.

**What a human mentor handles:** unsafe repairs, ambiguous evidence, unfamiliar tools, and final judgment about physical hardware.

**Interview phrasing:** “I designed the AI to delegate the right work rather than absorb all of it. The student still owns the physical test, and the mentor remains central whenever judgment or safety is involved.”

### Description

**Product behavior:** system-map selection, symptom chips, plain-language follow-up questions, optional free text, and a live description-quality nudge.

**Interview phrasing:** “I treated a good description as a taught skill, not a prerequisite. A student should be able to say ‘this wheel is weird’ and receive help turning that into useful evidence.”

### Discernment

**Product behavior:** confidence cues, verify-first flags, evidence-backed hypothesis status, alternative causes, a Challenge-the-Mentor panel, cited references with provenance, and escalation when uncertainty remains.

**Interview phrasing:** “The model is not allowed to turn likelihood into certainty. The interface distinguishes what the student observed from what the system is hypothesizing and gives the student a way to challenge the suggestion.”

### Diligence

**Product behavior:** prediction/result loop, local Pit Log, progress checklist, learning follow-up after an outcome, evaluation harness, deployment health checks, and handoff runbooks.

**Interview phrasing:** “Diligence is both a student behavior and a builder behavior. Students record what happened; I also use keyless evals and live-deployment checks so the tool is not merely plausible in a demo.”

## 5. Likely interview questions and truthful answer anchors

### “Why this project?”

- It turns a real, personal volunteer experience into an educational tool rather than selecting a generic chatbot use case.
- The user group is concrete: K–12 students and event volunteers who have unequal access to technical mentorship.
- The project reflects a public-interest principle: AI should extend human support, not erase the relationship.

### “How did you decide what to build?”

- Started from the actual mentoring loop: description → hypothesis → cheap/safe test → student result → next decision or human escalation.
- Scoped the first version around the loop, not a broad robotics platform.
- Used the visual map because students can identify a robot area before they can articulate fault terminology.
- Explicitly deferred accounts, cloud data, autonomous robot control, and broad kit-specific coverage.

### “How do you know the model is safe or correct?”

- Do not claim the model is always correct.
- Enforce product boundaries: the model does not claim physical observation, uses verification-first guidance, surfaces uncertainty and alternatives, cites sources, and escalates unsafe or inconclusive cases.
- Use deterministic evals for the response contract and verify the real deployed application separately from local builds.
- Treat feedback as a learning signal, not proof of correctness.

### “How would you deploy this at a nonprofit or school?”

- Begin with discovery: observe volunteers, students, accessibility needs, robot platforms, and current troubleshooting documentation.
- Pilot in a narrow setting with one kit or team reference library.
- Train a few coaches/volunteers on using Pit Reports and changing resources.
- Measure whether handoffs become clearer and whether students complete safe investigation steps—not just model usage.
- Leave a runbook, non-technical guide, mock mode, eval suite, and ownership plan.

### “What would you do differently?”

- Validate assumptions with students and mentors before treating the visual map taxonomy as universal.
- Run a small observed usability pilot and refine language, hotspot labels, and accessibility before expanding features.
- Add carefully consented, privacy-preserving qualitative feedback rather than assuming local interaction metrics tell the full impact story.
- Avoid overbuilding a mentor dashboard until real operational needs justify it.

### “What did you learn from the production failures?”

- Local builds and production deployments make different claims.
- The Vercel serverless environment changed module-resolution constraints; the production function had to become self-contained.
- The new standard is to test build, runtime health, actual diagnose route, and live UI—not merely compile locally.
- This reinforced the same cheapest-first verification discipline BotMentor teaches students.

## 6. Metrics: what to claim and what not to claim

### Appropriate prototype measures

- completion of a structured observation before diagnosis;
- completion of a safe next test;
- student selection of “I’m not sure” when appropriate instead of fabricated detail;
- Pit Report completeness;
- mentor-reported usefulness of a handoff;
- resource opening tied to a test;
- safety escalations occurring when specified by a fixture;
- eval-contract pass rate and live deployment verification.

### Do not claim without real study evidence

- improvement in learning outcomes;
- reduction in mentor workload;
- diagnosis accuracy in a real student population;
- safety effectiveness;
- broad accessibility or equity outcomes;
- model reliability beyond the evaluated scenarios.

**Useful phrasing:** “My impact hypothesis is…” and “I would validate that with…” are stronger and more honest than claiming results the prototype has not measured.

## 7. Demo run-through for reviewers or interviews

Use one coherent scenario: **the left side of a drive base does not move.**

1. Open BotMentor and say: “A student starts by pointing to the robot, not by being expected to write an expert bug report.”
2. Select **Drive base** on the map.
3. Choose **Only one side moves** and answer the simple observation prompts.
4. Point out that the map now separates selected/observed and suspected areas.
5. Open the hypothesis board. Say: “The system has not declared a fault. It tells the student what evidence led to a ranking and what alternative remains plausible.”
6. Open **Challenge this suggestion**.
7. Show the one safe power-off comparison test and its linked reference.
8. Open the Learning Tray / code explanation only if it becomes relevant. Say: “Documentation and code are attached to a decision, not placed in a separate drawer students must remember to search.”
9. Record a test result and show the Pit Log.
10. Trigger or explain the mentor escalation and copy the Pit Report.
11. Close with: “The output is a better student and mentor conversation, not an AI claim that the hardware is fixed.”

## 8. Short answer bank

### Why Claude Corps?

“I’m drawn to Claude Corps because it treats practical AI work as more than building a model feature. The role asks fellows to understand a real organization, ship something useful, teach people to use it, and leave behind work they can own. BotMentor came from a mentoring experience where the goal was always student agency, and I want to apply that same approach to mission-driven organizations.”

### What makes you a utility player?

“I enjoy the full loop: defining an ambiguous problem, building a small useful tool, explaining it to people who did not ask for a technical system, and writing the runbook that makes it survivable. BotMentor includes the product, evals, operator guides, non-technical documentation, and a human handoff because I do not think ‘shipped’ means ‘someone else can own it’ by default.”

### How do you handle ambiguity?

“I start with the lowest-risk way to create evidence. In BotMentor that means asking students about observable behavior and testing safe, cheap causes before recommending more invasive steps. In engineering work, it means verifying the deployed artifact instead of assuming a green local build proves production works.”

## 9. Evidence index

| Claim | Supporting artifact |
| --- | --- |
| Real community motivation | `README.md`, `docs/00-domain-and-needs.md`, community-impact essay, Nebraska Robotics Expo narrative. |
| End-to-end technical delivery | Live app, `/api/health`, `/api/diagnose`, provider abstraction, Vercel function. |
| Responsible model use | `api/diagnose.ts`, 4D tags, verify-first contract, Challenge panel, safety banner. |
| Evaluation practice | `evals/`, `docs/05-eval-harness.md`, `npm run eval`. |
| Enablement / handoff | `docs/non-technical/`, `docs/02-runbooks.md`, Pit Report / HandoffCard. |
| Judgment and learning from failure | `docs/04-architecture-decisions.md`, failure-and-learning essay, live verification discipline. |
| Next design direction | `docs/06-visual-mentor-workspace-spec.md`. |
| Current implementation evidence | `docs/09-session-handoff-2026-07-15.md`, `evals/workspace-foundation.ts`, deterministic structured-context fixtures. |

## 10. Current implementation evidence — 2026-07-15

The active Visual Mentor Workspace iteration now provides an accessible six-system map, system-specific guided observation flow, structured context transport, explicit hypothesis-status language, and a Challenge-the-Mentor panel that shows evidence used, ranking-change evidence, an alternate explanation, a safe differentiating test, and an escalation condition. Deterministic mock paths explicitly escalate unsafe battery reports and low-confidence uncertainty.

The keyless contract suite passed **44 checks across 11 fixtures**, plus **9 workspace-foundation checks**, TypeScript, and production build verification. Use this as implementation evidence—not impact evidence. Do not claim student outcomes, diagnostic accuracy, or field safety efficacy without a study.
