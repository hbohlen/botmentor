import assert from 'node:assert/strict';
import {
  ROBOT_SYSTEMS,
  SYMPTOM_FLOWS,
  buildInvestigationContext,
  deriveSystemStatuses,
  getSymptomFlow,
  getRobotSystem,
  getStatusesForLayer,
  isEvidenceStatus,
  mapFaultAreaToSystems,
  parseMapState,
  serializeMapState,
} from '../src/lib/robot-workspace';

function testStableSystemsAreDiscoverable() {
  assert.equal(ROBOT_SYSTEMS.length, 6, 'the generic map has six selectable systems');
  assert.equal(getRobotSystem('drivetrain')?.label, 'Drive base');
  assert.equal(getRobotSystem('code-control')?.label, 'Code and controller');
  assert.equal(getRobotSystem('missing-system'), undefined);
}

function testLegacyFaultAreasMapWithoutDroppingContext() {
  assert.deepEqual(mapFaultAreaToSystems('motor'), ['drivetrain', 'mechanism']);
  assert.deepEqual(mapFaultAreaToSystems('programming'), ['code-control']);
  assert.deepEqual(mapFaultAreaToSystems('radio'), ['code-control']);
}

function testEvidenceStatusesAreStrictAndNonColorSemantic() {
  assert.equal(isEvidenceStatus('checked'), true);
  assert.equal(isEvidenceStatus('mentor-review'), true);
  assert.equal(isEvidenceStatus('green'), false);
  assert.equal(isEvidenceStatus('confirmed'), false);
}

function testSelectedIssueAndMentorReviewTakePriority() {
  const statuses = deriveSystemStatuses({
    selectedSystem: 'drivetrain',
    hypotheses: [
      { systems: ['wiring'], state: 'suspected' },
      { systems: ['power'], state: 'mentor-review' },
      { systems: ['drivetrain'], state: 'checked' },
    ],
  });

  assert.equal(statuses.drivetrain, 'selected');
  assert.equal(statuses.wiring, 'suspected');
  assert.equal(statuses.power, 'mentor-review');
  assert.equal(statuses.sensors, 'uninvestigated');
}

function testEverySystemHasStudentSafeSymptomFlow() {
  assert.equal(Object.keys(SYMPTOM_FLOWS).length, ROBOT_SYSTEMS.length);
  for (const system of ROBOT_SYSTEMS) {
    const flow = getSymptomFlow(system.id);
    assert.ok(flow, `${system.id} needs a symptom flow`);
    assert.ok(flow.symptoms.some((symptom) => symptom.id === 'something-else'));
    assert.ok(flow.questions.length <= 3);
    assert.ok(flow.questions.every((question) => question.options.some((option) => option.id === 'not-sure')));
  }

  const drivetrain = getSymptomFlow('drivetrain')!;
  assert.ok(drivetrain.symptoms.some((symptom) => symptom.id === 'one-side-moves'));
  const sensors = getSymptomFlow('sensors')!;
  assert.match(sensors.questions[0].prompt, /sensor|surface|light|distance/i);
}

function testContextPreservesStudentAnswersAndUnknowns() {
  const context = buildInvestigationContext({
    selectedSystem: 'drivetrain',
    symptomId: 'one-side-moves',
    answers: { 'other-side': 'yes', sound: 'not-sure' },
  });
  assert.equal(context.symptomLabel, 'Only one side moves');
  assert.deepEqual(context.observations.map((observation) => observation.answer), ['Yes', "I'm not sure"]);
  assert.ok(context.summary.includes('Student observation: Does the other side'));
  assert.ok(!context.summary.includes('inference'));
}

function testLayerViewChangesTheHotspotPresentation() {
  const status = deriveSystemStatuses({ selectedSystem: 'drivetrain' });
  const systemLayer = getStatusesForLayer('system', status, 'drivetrain');
  const mentorLayer = getStatusesForLayer('mentor', status, 'drivetrain');

  assert.equal(systemLayer.drivetrain, 'selected');
  assert.equal(systemLayer.wiring, 'suspected');
  assert.equal(mentorLayer.drivetrain, 'uninvestigated');
}

function testUnknownLegacyFaultAreaDoesNotCreateAFalseSystem() {
  assert.deepEqual(mapFaultAreaToSystems('unknown-fault'), []);
}

function testMapStatePersistsOnlyValidSelectionAndLayer() {
  assert.deepEqual(parseMapState('{"selectedSystem":"sensors","layer":"evidence"}'), {
    selectedSystem: 'sensors',
    layer: 'evidence',
  });
  assert.deepEqual(parseMapState('{"selectedSystem":"unknown","layer":"purple"}'), {
    selectedSystem: undefined,
    layer: 'issue',
  });
  assert.equal(serializeMapState({ selectedSystem: 'power', layer: 'mentor' }), '{"selectedSystem":"power","layer":"mentor"}');
}

const tests = [
  testStableSystemsAreDiscoverable,
  testLegacyFaultAreasMapWithoutDroppingContext,
  testEvidenceStatusesAreStrictAndNonColorSemantic,
  testSelectedIssueAndMentorReviewTakePriority,
  testEverySystemHasStudentSafeSymptomFlow,
  testContextPreservesStudentAnswersAndUnknowns,
  testLayerViewChangesTheHotspotPresentation,
  testUnknownLegacyFaultAreaDoesNotCreateAFalseSystem,
  testMapStatePersistsOnlyValidSelectionAndLayer,
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
  console.error(`\nWorkspace foundation: ${failures}/${tests.length} failed.`);
  process.exit(1);
}

console.log(`\nWorkspace foundation: ${tests.length}/${tests.length} passed.`);
