// Mock reference library for BotMentor — the robot's "own documentation" the AI cites
// into the conversation. Client-side only (no backend change, mock-mode safe). A host org
// would later swap this for their team's real build docs. See ADR-011.
export interface Ref {
  id: string;
  title: string;
  area: string;
  tags: string[];
  summary: string;
  body: string;
  snippet?: string;
}

export const REFS: Record<string, Ref> = {
  'ref-motor-datasheet': {
    id: 'ref-motor-datasheet',
    title: 'N20 Motor Datasheet',
    area: 'motor',
    tags: ['spec', 'rpm', 'torque'],
    summary: 'Rated voltage, no-load speed, and stall current for the common N20 gearmotor.',
    body: 'The N20 gearmotor typically runs at 3–6 V. No-load speed is ~300 rpm at 6 V; stall current can exceed 1 A. If your driver or battery cannot supply that, the motor stutters under load.\n\nCheck the motor label for its voltage range before swapping parts.',
    snippet: 'Rated:       3–6 V\nNo-load:      ~300 rpm @ 6 V\nStall current: ~1.2 A',
  },
  'ref-motor-driver': {
    id: 'ref-motor-driver',
    title: 'Motor Driver (L298N / TB6612) Wiring',
    area: 'motor',
    tags: ['driver', 'pwm', 'wiring'],
    summary: 'How the H-bridge driver connects the board, battery, and motors.',
    body: 'A motor driver sits between the controller and the motor. The battery feeds the driver’s VM pin; the controller’s PWM pins set speed and direction. If VM is undervolted, both motors weaken.\n\nSwap the left/right enable lines to test whether a driver channel is dead.',
    snippet: 'Controller PWM ──► IN1/IN2 (driver)\nBattery + ───────► VM (driver)\nDriver OUT ──────► Motor',
  },
  'ref-sensor-cal': {
    id: 'ref-sensor-cal',
    title: 'Calibrating a Distance Sensor',
    area: 'sensors',
    tags: ['calibration', 'ultrasonic', 'readings'],
    summary: 'Map raw sensor values to real units and reject bad readings.',
    body: 'Ultrasonic and IR sensors drift with temperature and surface color. Take a few readings at known distances and build a simple calibration, then ignore readings outside the sensor’s valid range.\n\nIf the value jumps when nothing moves, check for echoes off the floor.',
    snippet: 'distance_cm ≈ raw * 0.017;   // for HC-SR04 at 20 °C\nif (distance_cm < 2 || distance_cm > 400) skip();',
  },
  'ref-line-follower': {
    id: 'ref-line-follower',
    title: 'Line-Follower Tuning',
    area: 'sensors',
    tags: ['line', 'pid', 'threshold'],
    summary: 'Set the sensor threshold and steering gain so the bot tracks the line.',
    body: 'Read both line sensors and steer toward the brighter side. Start with a small steering correction and increase only until it tracks without oscillation.\n\nA reflective floor or a wrinkle in the tape will fake the sensor — rule that out first.',
    snippet: 'error = leftRead - rightRead;\nmotorLeft  = base + error * gain;\nmotorRight = base - error * gain;',
  },
  'ref-battery-spec': {
    id: 'ref-battery-spec',
    title: 'Battery Specs & Runtime',
    area: 'power',
    tags: ['battery', 'voltage', 'capacity'],
    summary: 'What the pack can actually deliver, and how to spot a weak cell.',
    body: 'A 2S LiPo is ~7.4 V nominal; NiMH packs are 1.2 V per cell. Capacity (mAh) sets runtime, not current. A pack that reads full but sags under load has a weak cell.\n\nMeasure pack voltage while the motors are spinning, not at rest.',
    snippet: '2S LiPo: 7.4 V nominal (8.4 V full)\nNiMH:   1.2 V/cell\nCheck voltage UNDER LOAD',
  },
  'ref-battery-sag': {
    id: 'ref-battery-sag',
    title: 'Voltage Sag Under Load',
    area: 'power',
    tags: ['sag', 'brownout', 'reset'],
    summary: 'Why a robot reboots or one side dies only when moving.',
    body: 'When motors draw a burst of current, pack voltage dips. If it dips below the controller’s brownout point, the board resets mid-match. This looks exactly like a "dead motor."\n\nAdd a capacitor across the controller’s power pins to ride through the sag.',
    snippet: 'Symptom: resets only while driving\nFix:     bigger pack OR 100–470 µF cap on VCC/GND',
  },
  'ref-power-switch': {
    id: 'ref-power-switch',
    title: 'Power Switch & Fuse Check',
    area: 'power',
    tags: ['switch', 'fuse', 'continuity'],
    summary: 'The cheap, safe first check when a side goes dead.',
    body: 'A flickering switch or blown polyfuse cuts power to one channel. Wiggle the switch and watch for the symptom; measure continuity through the fuse.\n\nThis is the verify-first check — no tools beyond a multimeter, and it rules out the expensive causes.',
    snippet: '1. Wiggle power switch — does it cut out?\n2. Continuity-test the fuse.\n3. Only then suspect the battery.',
  },
  'ref-wiring-diagram': {
    id: 'ref-wiring-diagram',
    title: 'Robot Wiring Diagram',
    area: 'wiring',
    tags: ['diagram', 'power', 'signal'],
    summary: 'One-page map of how power and signal route through the bot.',
    body: 'Keep a diagram of your bot: battery → switch → driver → motors, and controller → sensor → driver. Most "mystery" faults are a wire landed on the wrong pad.\n\nPhotograph the wiring before you change anything so you can put it back.',
    snippet: 'BAT → SW → DRIVER → MOTOR\nCTRL → SENSOR → DRIVER',
  },
  'ref-motor-connector': {
    id: 'ref-motor-connector',
    title: 'Reseating Motor Connectors',
    area: 'wiring',
    tags: ['connector', 'jst', 'intermittent'],
    summary: 'Why a loose plug mimics motor failure — and the 30-second test.',
    body: 'JST connectors work loose with vibration. A half-seated plug passes a wiggle test but drops out under load. Unplug, inspect for bent pins, and reseat firmly.\n\nGently tug the wire while powered: if the motor cuts, that plug is your problem.',
    snippet: '1. Unplug + reseat both ends.\n2. Tug wire while powered.\n3. Cuts out? → that connector.',
  },
  'ref-arduino-motor': {
    id: 'ref-arduino-motor',
    title: 'Arduino Motor Sketch',
    area: 'programming',
    tags: ['arduino', 'pwm', 'code'],
    summary: 'Minimal sketch to drive a motor and confirm direction.',
    body: 'Drive the motor from a known-good pin at low speed first. If it spins the wrong way, swap the IN1/IN2 logic (or flip the wire). Confirm direction before trusting the rest of the code.\n\nA direction-dependent stutter is often a sign error in one motor’s speed term.',
    snippet: 'void loop() {\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, LOW);\n  analogWrite(ENA, 120);  // low speed first\n}',
  },
  'ref-motor-sign-fix': {
    id: 'ref-motor-sign-fix',
    title: 'Fixing an Inverted Motor Direction',
    area: 'programming',
    tags: ['sign', 'bug', 'direction'],
    summary: 'The one-line fix when a motor turns the wrong way.',
    body: 'If "turn right" makes the left motor stutter, the left speed term likely has the wrong sign. Negate it and re-upload. Test on a block, not on the floor.\n\nKeep a comment noting which motor is which so the next person doesn’t re-break it.',
    snippet: '// was: motorLeft = -speed;\nmotorLeft = speed;   // flip sign',
  },
  'ref-pwm': {
    id: 'ref-pwm',
    title: 'PWM & Motor Speed',
    area: 'programming',
    tags: ['pwm', 'duty', 'frequency'],
    summary: 'Why the number you write controls speed, not direction.',
    body: 'analogWrite sets a duty cycle (0–255). Higher duty = faster. If your board uses a different PWM range, scale accordingly. A value that’s too low may not overcome motor friction.\n\nConfirm the PWM pin actually supports output on your board.',
    snippet: '0   = stopped\n128 = ~50% speed\n255 = full speed',
  },
  'ref-gearbox-debris': {
    id: 'ref-gearbox-debris',
    title: 'Gearbox & Debris Check',
    area: 'mechanical',
    tags: ['gearbox', 'binding', 'fod'],
    summary: 'Physical blockage that makes a wheel stutter or bind.',
    body: 'Hair, carpet, or a stripped gear inside the gearbox causes intermittent binding. Spin the wheel by hand — it should turn freely with no gritty spots.\n\nIf it binds only under power, the gear is likely stripped, not just dirty.',
    snippet: '1. Lift bot, spin wheel by hand.\n2. Gritty? → clear debris.\n3. Still binds → stripped gear.',
  },
  'ref-wheel-mount': {
    id: 'ref-wheel-mount',
    title: 'Wheel & Axle Mount',
    area: 'mechanical',
    tags: ['wheel', 'set-screw', 'alignment'],
    summary: 'Why a wheel slips on its hub or veers under load.',
    body: 'A wheel that isn’t tight on the axle slips under torque — the motor spins but the bot doesn’t move evenly. Tighten the set screw onto the flat of the shaft, and check both wheels are aligned.\n\nMisaligned wheels make the bot veer even with perfect code.',
    snippet: 'Set screw ──► flat on shaft\nBoth wheels parallel to frame',
  },
  'ref-radio-binding': {
    id: 'ref-radio-binding',
    title: 'Radio Binding & Interference',
    area: 'radio',
    tags: ['binding', 'channel', 'range'],
    summary: 'When the controller drops out only at distance or near other bots.',
    body: 'Two controllers on the same channel fight each other. Re-bind to a free channel and keep metal and other radios away from the antenna. Test range before the match.\n\nDropouts that happen only when you turn could be a loose antenna, not interference.',
    snippet: '1. Change channel.\n2. Re-bind TX + RX.\n3. Range-test before match.',
  },
};
