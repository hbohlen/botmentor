import type { EvidenceStatus, MapLayer, RobotSystem } from '../lib/robot-workspace';
import { ROBOT_SYSTEMS } from '../lib/robot-workspace';
import { StudentProgress } from './StudentProgress';

const LAYERS: { id: MapLayer; label: string; hint: string }[] = [
  { id: 'issue', label: 'Where I started', hint: 'What you selected or noticed' },
  { id: 'evidence', label: 'What we checked', hint: 'What has been checked' },
  { id: 'system', label: 'Related parts', hint: 'Related robot systems' },
  { id: 'mentor', label: 'Needs a mentor', hint: 'Where a mentor may need to help' },
];

const STATUS_LABELS: Record<EvidenceStatus, string> = {
  uninvestigated: 'Not checked yet',
  selected: 'Your starting point',
  suspected: 'May be related',
  checked: 'Checked',
  'observed-problem': 'You noticed a problem here',
  'mentor-review': 'Ask a mentor',
};

const STUDENT_LABELS: Record<RobotSystem, { label: string; technical: string; icon: string }> = {
  power: { label: 'Won’t turn on', technical: 'Power', icon: '⚡' },
  drivetrain: { label: 'Wheels and movement', technical: 'Drive base', icon: '◉' },
  mechanism: { label: 'Arm, claw, or lift', technical: 'Mechanisms', icon: '↗' },
  sensors: { label: 'Sensors', technical: 'Sensors', icon: '◎' },
  wiring: { label: 'Wires and plugs', technical: 'Wiring', icon: '⌁' },
  'code-control': { label: 'Code or controller', technical: 'Code and control', icon: '{ }' },
};

export function RobotSystemMap({
  selectedSystem,
  statuses,
  layer,
  onSelectSystem,
  onSelectLayer,
}: {
  selectedSystem?: RobotSystem;
  statuses: Record<RobotSystem, EvidenceStatus>;
  layer: MapLayer;
  onSelectSystem: (system: RobotSystem) => void;
  onSelectLayer: (layer: MapLayer) => void;
}) {
  const selected = ROBOT_SYSTEMS.find((system) => system.id === selectedSystem);

  return (
    <section className="robot-map" aria-labelledby="robot-map-title">
      <StudentProgress stage="choose-area" />
      <div className="robot-map-head">
        <p className="eyebrow">Start with what you can see</p>
        <h2 id="robot-map-title">What is your robot having trouble with?</h2>
        <p>Point to the closest area. You do not need to know the technical name.</p>
      </div>

      <div className="robot-picker-layout">
        <div className="robot-illustration" aria-hidden="true">
          <div className="robot-antenna" />
          <div className="robot-body">
            <span className="robot-eye" />
            <span className="robot-eye second" />
            <div className="robot-panel">BOT</div>
          </div>
          <div className="robot-arm left" />
          <div className="robot-arm right" />
          <div className="robot-wheel left" />
          <div className="robot-wheel right" />
        </div>

        <ul className="robot-hotspots" aria-label="Robot problem areas">
          {ROBOT_SYSTEMS.map((system) => {
            const status = statuses[system.id];
            const active = selectedSystem === system.id;
            const student = STUDENT_LABELS[system.id];
            return (
              <li key={system.id}>
                <button
                  type="button"
                  className={`robot-hotspot status-${status}${active ? ' selected' : ''}`}
                  aria-pressed={active}
                  aria-label={`${student.label}, ${student.technical}: ${STATUS_LABELS[status]}. ${system.description}`}
                  onClick={() => onSelectSystem(system.id)}
                >
                  <span className="system-icon" aria-hidden="true">{student.icon}</span>
                  <span className="hotspot-label">{student.label}</span>
                  <span className="hotspot-technical">{student.technical}</span>
                  <span className="hotspot-status">{STATUS_LABELS[status]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="map-selection" role="status">
        {selected
          ? `Selected: ${STUDENT_LABELS[selected.id].label}. Next, tell us what you noticed.`
          : 'Choose the closest area, even if you are not completely sure.'}
      </p>

      <details className="investigation-views">
        <summary>See my investigation maps</summary>
        <fieldset className="map-layers">
          <legend>Choose a view</legend>
          <div className="map-layer-buttons">
            {LAYERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={layer === item.id ? 'map-layer active' : 'map-layer'}
                aria-pressed={layer === item.id}
                title={item.hint}
                onClick={() => onSelectLayer(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </details>
    </section>
  );
}
