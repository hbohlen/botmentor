import type { FaultArea } from '../types';

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

export type MapLayer = 'issue' | 'evidence' | 'system' | 'mentor';

export interface RobotSystemDefinition {
  id: RobotSystem;
  label: string;
  description: string;
  examples: string;
}

export interface SymptomOption {
  id: string;
  label: string;
}

export interface FollowUpQuestion {
  id: string;
  prompt: string;
  options: SymptomOption[];
}

export interface SymptomFlow {
  symptoms: SymptomOption[];
  questions: FollowUpQuestion[];
}

const unsure: SymptomOption = { id: 'not-sure', label: "I'm not sure" };
const choices = (...items: [string, string][]): SymptomOption[] => [
  ...items.map(([id, label]) => ({ id, label })),
  unsure,
];

export const SYMPTOM_FLOWS: Record<RobotSystem, SymptomFlow> = {
  power: {
    symptoms: [{ id: 'wont-turn-on', label: "It won't turn on" }, { id: 'turns-off', label: 'It turns off or resets' }, { id: 'weak-power', label: 'It seems weak or slow' }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'power-light', prompt: 'When it is safe to look, do any controller lights turn on?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'recent-charge', prompt: 'Was the battery charged before this?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
  drivetrain: {
    symptoms: [{ id: 'one-side-moves', label: 'Only one side moves' }, { id: 'turns-instead-of-straight', label: 'It turns instead of driving straight' }, { id: 'strange-sound', label: 'A wheel or motor makes a strange sound' }, { id: 'weak-or-stops', label: 'It moves weakly or stops' }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'other-side', prompt: 'Does the other side of the drive base move?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'sound', prompt: 'Do you hear humming, clicking, or a different sound?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'worked-before', prompt: 'Did this work earlier today?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
  mechanism: {
    symptoms: [{ id: 'wont-move', label: "The arm or mechanism won't move" }, { id: 'moves-wrong-way', label: 'It moves the wrong way' }, { id: 'gets-stuck', label: 'It gets stuck or jams' }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'blocked', prompt: 'Can you see anything safely blocking it?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'sound', prompt: 'Does it make a sound when you ask it to move?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
  sensors: {
    symptoms: [{ id: 'doesnt-detect', label: "It doesn't detect what I expect" }, { id: 'inconsistent', label: 'It gives different answers each time' }, { id: 'wrong-reading', label: 'It reads the wrong thing' }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'environment', prompt: 'Could the sensor, surface, light, or distance around it be different?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'visible', prompt: 'Is the sensor clean and not covered?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'recent-change', prompt: 'Did the robot move to a new place or lighting condition?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
  wiring: {
    symptoms: [{ id: 'loose-connection', label: 'A connection looks loose' }, { id: 'works-sometimes', label: 'It only works sometimes' }, { id: 'after-moving-wire', label: 'It changed after a wire moved' }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'visible-connection', prompt: 'With power off, does any connector look loose or out of place?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'recent-change', prompt: 'Did someone change a connection recently?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
  'code-control': {
    symptoms: [{ id: 'controls-dont-work', label: "The controls don't do what I expect" }, { id: 'wrong-action', label: 'The robot does the wrong action' }, { id: 'program-wont-run', label: "The program won't run" }, { id: 'something-else', label: 'Something else' }],
    questions: [{ id: 'program-saved', prompt: 'Was the program saved and selected before testing?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'controller-connected', prompt: 'Does the controller show that it is connected?', options: choices(['yes', 'Yes'], ['no', 'No']) }, { id: 'recent-code-change', prompt: 'Did the behavior change after a code or mapping edit?', options: choices(['yes', 'Yes'], ['no', 'No']) }],
  },
};

export function getSymptomFlow(system: RobotSystem): SymptomFlow {
  return SYMPTOM_FLOWS[system];
}

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

export interface ResourceCardMetadata {
  referenceId: string;
  purpose: 'quick-check' | 'learn-why' | 'inspect-code';
  whyNow: string;
}

export interface BuiltInvestigationContext extends InvestigationContext {
  summary: string;
}

export function buildInvestigationContext({
  selectedSystem,
  symptomId,
  answers,
  freeText,
}: {
  selectedSystem: RobotSystem;
  symptomId: string;
  answers: Record<string, string>;
  freeText?: string;
}): BuiltInvestigationContext {
  const flow = getSymptomFlow(selectedSystem);
  const symptom = flow.symptoms.find((candidate) => candidate.id === symptomId) ?? flow.symptoms.find((candidate) => candidate.id === 'something-else')!;
  const observations = flow.questions.flatMap((question) => {
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    return option ? [{ questionId: question.id, prompt: question.prompt, answer: option.label, source: 'student' as const }] : [];
  });
  const summary = [
    `Selected robot system: ${getRobotSystem(selectedSystem)?.label ?? selectedSystem}.`,
    `Student-selected symptom: ${symptom.label}.`,
    ...observations.map((observation) => `Student observation: ${observation.prompt} Answer: ${observation.answer}.`),
    freeText?.trim() ? `Student free-text: ${freeText.trim()}` : '',
  ].filter(Boolean).join('\n');
  return { selectedSystem, symptomId: symptom.id, symptomLabel: symptom.label, observations, freeText: freeText?.trim() || undefined, tests: [], summary };
}

export interface WorkspaceHypothesis {
  systems: RobotSystem[];
  state: Extract<EvidenceStatus, 'suspected' | 'checked' | 'mentor-review'>;
}

export interface InvestigationStatusInput {
  selectedSystem?: RobotSystem;
  observedSystems?: RobotSystem[];
  hypotheses?: WorkspaceHypothesis[];
}

export const ROBOT_SYSTEMS: readonly RobotSystemDefinition[] = [
  {
    id: 'power',
    label: 'Power',
    description: 'Battery, switch, and controller power.',
    examples: 'battery, switch, controller power',
  },
  {
    id: 'drivetrain',
    label: 'Drive base',
    description: 'Wheels, drive motors, and gears.',
    examples: 'wheels, drive motors, gears',
  },
  {
    id: 'mechanism',
    label: 'Arms and mechanisms',
    description: 'Lifts, claws, intakes, and servos.',
    examples: 'lift, claw, intake, servo',
  },
  {
    id: 'sensors',
    label: 'Sensors',
    description: 'Distance, line, color, and gyro sensors.',
    examples: 'distance, line, color, gyro',
  },
  {
    id: 'wiring',
    label: 'Wiring',
    description: 'Connectors, ports, and loose cables.',
    examples: 'connectors, ports, loose cables',
  },
  {
    id: 'code-control',
    label: 'Code and controller',
    description: 'Program logic, mapping, and controller connections.',
    examples: 'program logic, mapping, connection',
  },
] as const;

const systemIds = new Set<string>(ROBOT_SYSTEMS.map((system) => system.id));
const evidenceStatuses = new Set<EvidenceStatus>([
  'uninvestigated',
  'selected',
  'suspected',
  'checked',
  'observed-problem',
  'mentor-review',
]);

const LEGACY_FAULT_AREA_MAP: Record<FaultArea, RobotSystem[]> = {
  motor: ['drivetrain', 'mechanism'],
  sensors: ['sensors'],
  power: ['power'],
  wiring: ['wiring'],
  programming: ['code-control'],
  mechanical: ['drivetrain', 'mechanism'],
  radio: ['code-control'],
};

const statusPriority: Record<EvidenceStatus, number> = {
  uninvestigated: 0,
  checked: 1,
  suspected: 2,
  'observed-problem': 3,
  selected: 4,
  'mentor-review': 5,
};

export function isRobotSystem(value: string): value is RobotSystem {
  return systemIds.has(value);
}

export function isEvidenceStatus(value: string): value is EvidenceStatus {
  return evidenceStatuses.has(value as EvidenceStatus);
}

export function getRobotSystem(id: string): RobotSystemDefinition | undefined {
  return ROBOT_SYSTEMS.find((system) => system.id === id);
}

export function mapFaultAreaToSystems(area: FaultArea | string): RobotSystem[] {
  return area in LEGACY_FAULT_AREA_MAP
    ? [...LEGACY_FAULT_AREA_MAP[area as FaultArea]]
    : [];
}

const RELATED_SYSTEMS: Partial<Record<RobotSystem, RobotSystem[]>> = {
  power: ['wiring', 'code-control'],
  drivetrain: ['wiring', 'mechanism', 'code-control'],
  mechanism: ['drivetrain', 'wiring', 'code-control'],
  sensors: ['wiring', 'code-control'],
  wiring: ['power', 'drivetrain', 'mechanism', 'sensors', 'code-control'],
  'code-control': ['wiring', 'sensors', 'drivetrain', 'mechanism'],
};

export function getStatusesForLayer(
  layer: MapLayer,
  statuses: Record<RobotSystem, EvidenceStatus>,
  selectedSystem?: RobotSystem
): Record<RobotSystem, EvidenceStatus> {
  if (layer === 'evidence') return { ...statuses };
  const next = Object.fromEntries(
    ROBOT_SYSTEMS.map((system) => [system.id, 'uninvestigated' as EvidenceStatus])
  ) as Record<RobotSystem, EvidenceStatus>;
  if (layer === 'issue') {
    if (selectedSystem) next[selectedSystem] = 'selected';
    return next;
  }
  if (layer === 'system' && selectedSystem) {
    next[selectedSystem] = 'selected';
    (RELATED_SYSTEMS[selectedSystem] ?? []).forEach((system) => {
      next[system] = 'suspected';
    });
    return next;
  }
  for (const system of ROBOT_SYSTEMS) {
    if (statuses[system.id] === 'mentor-review') next[system.id] = 'mentor-review';
  }
  return next;
}

export interface MapState {
  selectedSystem?: RobotSystem;
  layer: MapLayer;
}

export const DEFAULT_MAP_STATE: MapState = { layer: 'issue' };

export function parseMapState(raw: string | null | undefined): MapState {
  if (!raw) return { ...DEFAULT_MAP_STATE };
  try {
    const candidate: unknown = JSON.parse(raw);
    if (!candidate || typeof candidate !== 'object') return { ...DEFAULT_MAP_STATE };
    const state = candidate as { selectedSystem?: unknown; layer?: unknown };
    return {
      selectedSystem:
        typeof state.selectedSystem === 'string' && isRobotSystem(state.selectedSystem)
          ? state.selectedSystem
          : undefined,
      layer:
        state.layer === 'issue' ||
        state.layer === 'evidence' ||
        state.layer === 'system' ||
        state.layer === 'mentor'
          ? state.layer
          : 'issue',
    };
  } catch {
    return { ...DEFAULT_MAP_STATE };
  }
}

export function serializeMapState(state: MapState): string {
  return JSON.stringify({ selectedSystem: state.selectedSystem, layer: state.layer });
}

function setStatus(
  statuses: Record<RobotSystem, EvidenceStatus>,
  system: RobotSystem,
  next: EvidenceStatus
) {
  if (statusPriority[next] > statusPriority[statuses[system]]) {
    statuses[system] = next;
  }
}

export function deriveSystemStatuses({
  selectedSystem,
  observedSystems = [],
  hypotheses = [],
}: InvestigationStatusInput): Record<RobotSystem, EvidenceStatus> {
  const statuses = Object.fromEntries(
    ROBOT_SYSTEMS.map((system) => [system.id, 'uninvestigated' as EvidenceStatus])
  ) as Record<RobotSystem, EvidenceStatus>;

  observedSystems.forEach((system) => setStatus(statuses, system, 'observed-problem'));
  hypotheses.forEach((hypothesis) => {
    hypothesis.systems.forEach((system) => setStatus(statuses, system, hypothesis.state));
  });
  if (selectedSystem) setStatus(statuses, selectedSystem, 'selected');

  return statuses;
}
