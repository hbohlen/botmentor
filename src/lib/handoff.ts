export interface HandoffHypothesis {
  id: string;
  rank: number;
  area: string;
  title: string;
  verifyFirst: boolean;
  steps: string[];
  checked: boolean[];
}

export interface HandoffInput {
  intake: string;
  hypotheses: HandoffHypothesis[];
}

/**
 * Builds a portable case brief without identities, telemetry, or account data.
 * It lets a teacher, volunteer, or teammate continue the student's evidence trail.
 */
export function buildHandoffBrief({ intake, hypotheses }: HandoffInput): string {
  const cases = hypotheses.map((hypothesis) => {
    const complete = hypothesis.checked.filter(Boolean).length;
    const marker = hypothesis.verifyFirst ? ' · Verify first' : '';
    return [
      `${hypothesis.rank}. ${capitalize(hypothesis.area)} — ${hypothesis.title}${marker}`,
      `   Progress: ${complete}/${hypothesis.steps.length} student-led checks complete`,
      ...hypothesis.steps.map((step, index) =>
        `   ${hypothesis.checked[index] ? '[x]' : '[ ]'} ${step}`
      ),
    ].join('\n');
  });

  return [
    'BotMentor mentor handoff',
    '',
    'Student report',
    intake.trim() || 'No written report captured.',
    '',
    'What BotMentor suggested',
    cases.length > 0 ? cases.join('\n\n') : 'No hypotheses were generated.',
    '',
    'Safety: pause for heat, exposed wiring, or an unsure step; involve an adult/mentor.',
    'Privacy: No student identity or account data is included.',
    '',
    'Use this brief to ask what was observed, choose the next lowest-risk test, and let the student perform the hands-on work.',
  ].join('\n');
}

function capitalize(value: string): string {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
