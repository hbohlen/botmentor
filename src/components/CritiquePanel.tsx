import type { Hypothesis } from '../types';

// Keyless Discernment coach. When a student "challenges" a mentor idea, we don't
// just hand back an answer — we make them practice critical evaluation (the Skilljar
// Discernment skill): what would confirm it, what would disprove it, and a crisp
// question to take to a human mentor. Derived client-side from the hypothesis so it
// works in mock mode with no key. See ADR-009.
const CONFIRM_BY_AREA: Record<string, string> = {
  power: 'Measure battery voltage under load — does it sag below the motor’s rated minimum?',
  mechanical: 'Wiggle the joint by hand — is there play, a stripped gear, or a loose set screw?',
  software: 'Add a serial print at the top of the routine — does execution reach the line that drives this?',
  sensors: 'Read the live sensor value in your code — is it within the range you expect for this state?',
  connectivity: 'Check the link indicator while commanding it — does the signal drop when you move the cable?',
  structure: 'Look for a crack or flex at the joint under load — does the frame twist where it shouldn’t?',
  drivetrain: 'Lift the robot and spin each wheel by hand — do they turn freely and at matching speed?',
  control: 'Plot the commanded vs. actual value — is there steady error or oscillation?',
};

export function CritiquePanel({ hypothesis }: { hypothesis: Hypothesis }) {
  const confirm =
    CONFIRM_BY_AREA[hypothesis.area] ??
    'Run the cheapest test that would change this ranking — what single reading would confirm it?';
  const firstStep = hypothesis.plainSteps[0] ?? 'the first test step';
  const mentorQ = `Ask a mentor: “For “${hypothesis.title},” I’m testing ${firstStep}. What should I watch for?”`;

  return (
    <div className="critique">
      <p>
        <strong>✅ Confirm:</strong> {confirm}
      </p>
      <p>
        <strong>❌ Disprove:</strong> What single observation would rule this out? If you saw it, would
        you trust the test over this guess?
      </p>
      <p>
        <strong>🔁 Same symptom, different cause:</strong> Could a <em>{alternateArea(hypothesis.area)}</em>{' '}
        fault look identical? List one before you swap parts.
      </p>
      <p className="mentor-q">👤 {mentorQ}</p>
    </div>
  );
}

// A plausible different area to nudge the student to consider alternative causes.
function alternateArea(area: string): string {
  const others = [
    'power',
    'mechanical',
    'software',
    'sensors',
    'connectivity',
    'structure',
    'drivetrain',
    'control',
  ].filter((a) => a !== area);
  return others[Math.abs(hash(area)) % others.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
