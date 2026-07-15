import assert from 'node:assert/strict';
import { getSymptomFlow } from '../src/lib/robot-workspace';
import {
  getCurrentQuestion,
  getStudentProgress,
  selectNextSafeTest,
} from '../src/lib/student-experience';
import { filterTestRecords, scopedChecklistId } from '../src/lib/storage';

function testGuidedQuestionsAppearOneAtATime() {
  const flow = getSymptomFlow('drivetrain');
  assert.equal(getCurrentQuestion(flow, {}).id, flow.questions[0].id);
  assert.equal(
    getCurrentQuestion(flow, { [flow.questions[0].id]: 'not-sure' }).id,
    flow.questions[1].id,
  );
  assert.equal(
    getCurrentQuestion(
      flow,
      Object.fromEntries(flow.questions.map((question) => [question.id, 'not-sure'])),
    ),
    undefined,
  );
}

function testStudentProgressUsesFivePlainStages() {
  assert.deepEqual(getStudentProgress('choose-area'), { current: 1, total: 5, label: 'Find the problem area' });
  assert.deepEqual(getStudentProgress('check-result'), { current: 4, total: 5, label: 'Record what happened' });
  assert.deepEqual(getStudentProgress('next-step'), { current: 5, total: 5, label: 'Choose what happens next' });
}

function testOnlyOneSafeStudentActionIsForegrounded() {
  const next = selectNextSafeTest([
    { id: 'wiring-1', title: 'A plug may be loose', steps: ['Turn power off', 'Check the motor plug'], safetyLevel: 'safe' },
    { id: 'power-2', title: 'Battery may be weak', steps: ['Charge the battery'], safetyLevel: 'safe' },
  ]);

  assert.deepEqual(next, {
    hypothesisId: 'wiring-1',
    hypothesisTitle: 'A plug may be loose',
    action: 'Turn power off',
    safetyLevel: 'safe',
  });
}

function testLeadingUnsafeIdeaDoesNotSkipToALowerRankedCause() {
  const next = selectNextSafeTest([
    { id: 'power-1', title: 'Battery may be damaged', steps: ['Inspect the battery'], safetyLevel: 'mentor-required' },
    { id: 'wiring-2', title: 'A plug may be loose', steps: ['Turn power off'], safetyLevel: 'safe' },
  ]);
  assert.equal(next?.hypothesisId, 'power-1');
  assert.equal(next?.safetyLevel, 'mentor-required');
}

function testUnsafeLeadingIdeaRoutesToMentorWhenNoSafeActionExists() {
  const next = selectNextSafeTest([
    { id: 'power-1', title: 'Battery may be damaged', steps: ['Inspect the battery'], safetyLevel: 'mentor-required' },
  ]);
  assert.equal(next?.safetyLevel, 'mentor-required');
  assert.equal(next?.action, 'Pause and ask a mentor to help with this check.');
}

function testPitEvidenceIsScopedToOneInvestigation() {
  const records = [
    { investigationId: 'session-a', hypothesisId: 'power-1', step: 'Check A', outcome: 'completed' as const, ts: 1 },
    { investigationId: 'session-b', hypothesisId: 'power-1', step: 'Check B', outcome: 'completed' as const, ts: 2 },
  ];
  assert.deepEqual(filterTestRecords(records, 'session-b').map((record) => record.step), ['Check B']);
}

function testChecklistKeysAreScopedToOneInvestigation() {
  assert.notEqual(scopedChecklistId('session-a', 'power-1'), scopedChecklistId('session-b', 'power-1'));
  assert.equal(scopedChecklistId('session-a', 'power-1'), 'session-a:power-1');
}

const tests = [
  testGuidedQuestionsAppearOneAtATime,
  testStudentProgressUsesFivePlainStages,
  testOnlyOneSafeStudentActionIsForegrounded,
  testLeadingUnsafeIdeaDoesNotSkipToALowerRankedCause,
  testUnsafeLeadingIdeaRoutesToMentorWhenNoSafeActionExists,
  testPitEvidenceIsScopedToOneInvestigation,
  testChecklistKeysAreScopedToOneInvestigation,
];

let failures = 0;
for (const test of tests) {
  try {
    test();
    console.log(`✓ ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${test.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  console.error(`\nStudent experience: ${failures}/${tests.length} failed.`);
  process.exit(1);
}

console.log(`\nStudent experience: ${tests.length}/${tests.length} passed.`);