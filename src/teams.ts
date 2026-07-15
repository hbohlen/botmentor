import { REFS as GENERIC, type Ref } from './refs';

// Per-team documentation swap (V2 of Cited-References, ADR-014). Each team owns a
// robot with its own build docs. A team's library is the GENERIC base MERGED with its
// overrides by ID — so area-matched citation IDs from the diagnose fn always resolve,
// while a team can override a doc's content or add robot-specific extras.
export interface Team {
  id: string;
  name: string;
  robot: string;
  overrides: Record<string, Ref>;
}

export const TEAMS: Team[] = [
  {
    id: 'generic',
    name: 'Generic Robot',
    robot: 'Any beginner bot',
    overrides: {},
  },
  {
    id: 'raptor',
    name: 'Team Raptor',
    robot: 'Tank-drive sumo bot',
    overrides: {
      'ref-motor-datasheet': {
        id: 'ref-motor-datasheet',
        title: 'Raptor — 25GA-370 Gearmotor',
        area: 'motor',
        tags: ['spec', 'torque', 'sumo'],
        summary: "Raptor's high-torque drive motors — stall current is high, size your driver for it.",
        body: 'Raptor runs 25GA-370 metal-gear motors at 12 V for pushing power in sumo. No-load ~200 rpm; stall current can hit 2.5 A per motor. Use a driver rated ≥3 A continuous per channel, or it thermal-shuts mid-push.\n\nIf the bot loses one side only while pushing, suspect driver thermal cutoff before the motor.',
        snippet: 'Rated:        12 V\nNo-load:       ~200 rpm\nStall current: ~2.5 A  (driver ≥3 A/ch!)',
      },
      'ref-sumo-strategy': {
        id: 'ref-sumo-strategy',
        title: 'Raptor — Sumo Push Strategy',
        area: 'mechanical',
        tags: ['sumo', 'wedge', 'traction'],
        summary: 'Get under the opponent and keep traction — the two things that win pushes.',
        body: 'A low wedge front + weight over the drive wheels wins sumo. If Raptor gets shoved backward, either the wedge is too high (opponent gets under you) or the wheels are slipping.\n\nCheck wheel grip and front-edge height before blaming the motors.',
        snippet: 'Wedge edge: as low + flat as legal\nWeight bias: over drive wheels\nWheels: clean, high-grip',
      },
    },
  },
  {
    id: 'circuit',
    name: 'Circuit Breakers',
    robot: 'Line-follower',
    overrides: {
      'ref-line-follower': {
        id: 'ref-line-follower',
        title: 'Circuit Breakers — PID Line Tune',
        area: 'sensors',
        tags: ['line', 'pid', 'tuned'],
        summary: "The team's tuned PID gains for their 5-sensor array on black tape.",
        body: "Circuit Breakers run a 5-sensor reflectance array. Start with the tuned gains below and only nudge Kd up if it oscillates on curves. Kp too high makes it wobble on straights; Ki is usually 0 for a clean floor.\n\nRe-run calibration whenever the venue lighting changes — that's the #1 cause of a lost line here.",
        snippet: '// tuned for our array on matte black tape\nKp = 0.08;  Ki = 0.0;  Kd = 1.2;\nbase = 150;  // PWM',
      },
      'ref-sensor-cal': {
        id: 'ref-sensor-cal',
        title: 'Circuit Breakers — Array Calibration',
        area: 'sensors',
        tags: ['calibration', 'reflectance', 'sweep'],
        summary: 'Sweep the array over line + floor at the venue to set per-sensor thresholds.',
        body: 'Before each round, sweep all 5 sensors across the line and the floor for ~3 s to capture min/max per sensor, then threshold at the midpoint. Venue carpet and lighting shift the raw values a lot.\n\nIf one sensor reads flat, its LED or phototransistor is likely dead — swap that channel.',
        snippet: 'for s in sensors: record(min[s], max[s])\nthreshold[s] = (min[s] + max[s]) / 2',
      },
    },
  },
];

export function teamLibrary(id: string): Record<string, Ref> {
  const team = TEAMS.find((t) => t.id === id) ?? TEAMS[0];
  return { ...GENERIC, ...team.overrides };
}
