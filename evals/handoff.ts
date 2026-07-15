// Deterministic, keyless UI-support eval for the nonprofit handoff artifact.
// A mentor or teacher should receive a concise, privacy-preserving case brief
// without needing access to a student's browser or account.
import { buildHandoffBrief } from '../src/lib/handoff';

const brief = buildHandoffBrief({
  intake: 'Symptom: left motor stutters\nWhat changed: after a match',
  hypotheses: [
    {
      id: 'wiring-1',
      rank: 1,
      area: 'wiring',
      title: 'Swap motor cables at the driver',
      verifyFirst: true,
      steps: ['Power off the robot.', 'Swap the left and right motor cables.'],
      checked: [true, false],
    },
  ],
});

const required = [
  'BotMentor mentor handoff',
  'Symptom: left motor stutters',
  '1. Wiring — Swap motor cables at the driver',
  'Progress: 1/2 student-led checks complete',
  'Safety: pause for heat, exposed wiring, or an unsure step; involve an adult/mentor.',
  'No student identity or account data is included.',
];

const missing = required.filter((text) => !brief.includes(text));
if (missing.length > 0) {
  console.error('Handoff brief missing:', missing.join(' | '));
  process.exit(1);
}

console.log('✓ handoff brief contains diagnosis, student progress, safety escalation, and privacy boundary');
