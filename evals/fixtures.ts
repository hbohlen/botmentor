// Deterministic, keyless eval fixtures for BotMentor.
//
// These are NOT live-model calls. They exercise the `mock` engine path of
// `api/diagnose.ts` (PROVIDER=mock) — the same code path the public demo uses
// when no key is set — so the eval runs in CI with zero network and zero cost.
//
// Each fixture asserts the contract the mentor must always satisfy:
//   1. response is valid DiagnoseResult JSON (never crashes on thin input)
//   2. every hypothesis is in the robotics fault taxonomy
//   3. at least one hypothesis carries verifyFirst (Discernment is exercised)
//   4. the 4D tags are present (the framework is visible)

export interface EvalFixture {
  name: string;
  input: string;
  expectVerifyFirst: boolean;
  allowedAreas: ReadonlyArray<string>;
}

export const FIXTURES: EvalFixture[] = [
  {
    name: 'drive symptom, thin report',
    input: 'left motor stutters when I turn right',
    expectVerifyFirst: true,
    allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'],
  },
  {
    name: 'no movement, some context',
    input: 'Symptom: the robot does not move at all\nWhat changed: we swapped the battery\nWhat I expected: it to drive like before',
    expectVerifyFirst: true,
    allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'],
  },
  {
    name: 'empty-ish report (must not crash)',
    input: 'it broke',
    expectVerifyFirst: false, // mock may or may not flag; we only assert it parses
    allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'],
  },
  {
    name: 'sensor / line-follow complaint',
    input: 'the line follower goes off the tape on right turns',
    expectVerifyFirst: true,
    allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'],
  },
  {
    name: 'design-coaching prompt (design improvement)',
    input: 'our claw keeps falling off when we pick up blocks, how should we make it sturdier',
    expectVerifyFirst: false,
    allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'],
  },
  { name: 'power context', input: 'Selected robot system: Power. Student-selected symptom: It turns off or resets.', expectVerifyFirst: true, allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'] },
  { name: 'mechanism context', input: 'Selected robot system: Arms and mechanisms. Student-selected symptom: It gets stuck or jams.', expectVerifyFirst: true, allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'] },
  { name: 'wiring context', input: 'Selected robot system: Wiring. Student-selected symptom: It only works sometimes.', expectVerifyFirst: true, allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'] },
  { name: 'code-control context', input: 'Selected robot system: Code and controller. Student-selected symptom: The program will not run.', expectVerifyFirst: true, allowedAreas: ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'] },
  { name: 'low-confidence escalation', input: 'something else happened and I am not sure what changed', expectVerifyFirst: true, allowedAreas: ['mechanical'] },
  { name: 'unsafe battery escalation', input: 'battery is hot and swollen after the match', expectVerifyFirst: true, allowedAreas: ['power'] },
];
