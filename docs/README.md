# BotMentor — Documentation

BotMentor is documented in **two tracks for two audiences** — a deliberate handoff design so
the organization can own and grow the project after the original author leaves (a core
Claude Corps requirement). Pick your track:

- **I don't write code (program lead, teacher, coordinator, stakeholder)** →
  [`non-technical/`](non-technical/README.md)
- **I build/maintain the code (developer volunteer)** → the files below.

## Technical track (for developers)
Read in this order:

1. **[00-domain-and-needs.md](00-domain-and-needs.md)** — *What problem are we solving?*
   The robotics mentoring domain, fault taxonomy, and how the AI Fluency 4D Framework maps to it.
2. **[01-spec.md](01-spec.md)** — *What did we build?* The implementation spec.
3. **[02-runbooks.md](02-runbooks.md)** — *How do I operate it without the author?* Copy-paste
   procedures: deploy, rotate keys, switch provider, run locally, troubleshoot, extend.
4. **[03-maintain-and-extend.md](03-maintain-and-extend.md)** — *How does the org keep it alive
   and grow it?* Onboarding for a new dev + bus-factor mitigation + expansion recipes.
4. **[04-architecture-decisions.md](04-architecture-decisions.md)** — *Why is it like this?* ADRs
   (esp. ADR-001: the function is intentionally a single self-contained file).
5. **[05-eval-harness.md](05-eval-harness.md)** — *How do we keep the mentoring quality
   honest as it changes?* The deterministic, keyless eval: run `npm run eval` in CI with
   no API key, no network.
6. **[06-visual-mentor-workspace-spec.md](06-visual-mentor-workspace-spec.md)** — *What is
   next?* The approved student-first visual robot map, guided evidence, learning workspace,
   Pit Log, safety escalation, and acceptance contract.
7. **[07-claude-corps-interview-evidence.md](07-claude-corps-interview-evidence.md)** — *How
   do we explain the work honestly?* The decision record, evidence index, demo narrative, and
   interview answer anchors.
8. **[08-visual-mentor-implementation-backlog.md](08-visual-mentor-implementation-backlog.md)**
   — *How should agents implement it?* Dependency-ordered, verifiable delivery slices.
9. **[09-session-handoff-2026-07-15.md](09-session-handoff-2026-07-15.md)** — *Where did
   this iteration stop?* Verified implementation state, remaining work, and agent continuation rules.

## Non-technical track (for everyone else)
[`non-technical/README.md`](non-technical/README.md) — plain-language guide, 2-minute
orientation, and a safety & ethics explainer mapped to the Claude Corps "effective, efficient,
ethical, safe" standard.

## Audience shortcuts
- "I just need to keep it running." → `02-runbooks.md` (tech) or `non-technical/00-plain-language-guide.md` (non-tech).
- "I'm taking this over as a developer." → `03-maintain-and-extend.md`, then `00` + `01`.
- "I'm changing the code." → `04-architecture-decisions.md` first (ADR-001), then `02` R4/R7.
- "I'm a stakeholder / teacher." → `non-technical/`.
