import type { EvidenceStatus, MapLayer, RobotSystem } from '../lib/robot-workspace';
import { ROBOT_SYSTEMS } from '../lib/robot-workspace';

const LAYERS: { id: MapLayer; label: string; hint: string }[] = [
  { id: 'issue', label: 'Issue map', hint: 'What you selected or noticed' },
  { id: 'evidence', label: 'Evidence map', hint: 'What has been checked' },
  { id: 'system', label: 'System map', hint: 'Related robot systems' },
  { id: 'mentor', label: 'Mentor map', hint: 'Where a mentor may need to help' },
];

const STATUS_LABELS: Record<EvidenceStatus, string> = {
  uninvestigated: 'Not investigated',
  selected: 'Selected starting point',
  suspected: 'Related area to check',
  checked: 'Checked',
  'observed-problem': 'Observed problem',
  'mentor-review': 'Mentor review needed',
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
      <div className="robot-map-head">
        <p className="eyebrow">Start with what you can see</p>
        <h2 id="robot-map-title">What part of your robot needs attention?</h2>
        <p>
          Pick the area that seems involved. You do not need the technical name—we will refine
          it together.
        </p>
      </div>

      <fieldset className="map-layers">
        <legend>Map view</legend>
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

      <ul className="robot-hotspots" aria-label="Robot systems">
        {ROBOT_SYSTEMS.map((system) => {
          const status = statuses[system.id];
          const active = selectedSystem === system.id;
          return (
            <li key={system.id}>
              <button
                type="button"
                className={`robot-hotspot status-${status}${active ? ' selected' : ''}`}
                aria-pressed={active}
                aria-label={`${system.label}: ${STATUS_LABELS[status]}. ${system.description}`}
                onClick={() => onSelectSystem(system.id)}
              >
                <span className="hotspot-dot" aria-hidden="true" />
                <span className="hotspot-label">{system.label}</span>
                <span className="hotspot-status">{STATUS_LABELS[status]}</span>
                <span className="hotspot-examples">{system.examples}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="map-selection" role="status">
        {selected
          ? `Selected: ${selected.label}. Next, describe what you noticed.`
          : 'No area selected yet. You can also describe the problem in your own words.'}
      </p>
    </section>
  );
}
