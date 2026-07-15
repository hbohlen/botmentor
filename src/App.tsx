import { useEffect, useState } from 'react';
import { Intake } from './components/Intake';
import { SymptomRefiner } from './components/SymptomRefiner';
import { RobotSystemMap } from './components/RobotSystemMap';
import {
  DEFAULT_MAP_STATE,
  deriveSystemStatuses,
  getRobotSystem,
  getStatusesForLayer,
  parseMapState,
  serializeMapState,
  type BuiltInvestigationContext,
  type MapLayer,
  type RobotSystem,
} from './lib/robot-workspace';
import { Results } from './components/Results';
import { HealthPill } from './components/HealthPill';
import { DTagLegend } from './components/DTagLegend';
import { RefLibrary } from './components/RefLibrary';
import { TeamSelector } from './components/TeamSelector';
import { ImpactPanel } from './components/ImpactPanel';
import type { DiagnoseResult } from './types';

type Tab = 'diagnose' | 'references' | 'impact';

export function App() {
  const [tab, setTab] = useState<Tab>('diagnose');
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [lastIntake, setLastIntake] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapState, setMapState] = useState(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_MAP_STATE };
    try {
      return parseMapState(window.localStorage.getItem('botmentor:map-status:v1'));
    } catch {
      return { ...DEFAULT_MAP_STATE };
    }
  });
  const [showTextIntake, setShowTextIntake] = useState(false);
  const baseStatuses = deriveSystemStatuses({ selectedSystem: mapState.selectedSystem });
  const systemStatuses = getStatusesForLayer(mapState.layer, baseStatuses, mapState.selectedSystem);

  useEffect(() => {
    try {
      window.localStorage.setItem('botmentor:map-status:v1', serializeMapState(mapState));
    } catch {
      // Browser privacy modes can block storage; the current session still works in memory.
    }
  }, [mapState]);

  function selectSystem(selectedSystem: RobotSystem) {
    setMapState((current) => ({ ...current, selectedSystem }));
    setShowTextIntake(true);
  }

  function selectLayer(layer: MapLayer) {
    setMapState((current) => ({ ...current, layer }));
  }

  async function diagnose(input: string | BuiltInvestigationContext) {
    const context = typeof input === 'string' ? undefined : input;
    const rawInput = typeof input === 'string' ? input : input.summary;
    const selected = context ? undefined : mapState.selectedSystem ? getRobotSystem(mapState.selectedSystem) : undefined;
    const investigationInput = selected
      ? `Selected robot system: ${selected.label}.\nStudent description: ${rawInput}`
      : rawInput;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context ? { input: investigationInput, context: { selectedSystem: context.selectedSystem, symptomLabel: context.symptomLabel, observations: context.observations, freeText: context.freeText } } : { input: investigationInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data as DiagnoseResult);
      setLastIntake(investigationInput);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="masthead">
        <div className="masthead-row">
          <h1>BotMentor</h1>
          <HealthPill />
        </div>
        <p>
          A mentoring co-pilot for student robotics teams — built on the AI Fluency 4D
          Framework. Rooted in the Nebraska Robotics Expo, where college engineering
          students coached K–12 teams through troubleshooting and robot-design improvement.
        </p>
        <nav className="tabs">
          <button
            className={tab === 'diagnose' ? 'tab active' : 'tab'}
            onClick={() => setTab('diagnose')}
          >
            Diagnose
          </button>
          <button
            className={tab === 'references' ? 'tab active' : 'tab'}
            onClick={() => setTab('references')}
          >
            📚 References
          </button>
          <button className={tab === 'impact' ? 'tab active' : 'tab'} onClick={() => setTab('impact')}>
            📈 Impact
          </button>
        </nav>
        <TeamSelector />
      </header>

      {tab === 'diagnose' ? (
        <>
          <RobotSystemMap
            selectedSystem={mapState.selectedSystem}
            statuses={systemStatuses}
            layer={mapState.layer}
            onSelectSystem={selectSystem}
            onSelectLayer={selectLayer}
          />
          {showTextIntake ? (
            <section className="map-intake" aria-labelledby="map-intake-title">
              <h2 id="map-intake-title">
                {mapState.selectedSystem ? 'Tell me what you noticed' : 'Describe the problem'}
              </h2>
              {mapState.selectedSystem ? (
                <SymptomRefiner system={mapState.selectedSystem} loading={loading} onSubmit={diagnose} />
              ) : (
                <Intake onSubmit={diagnose} loading={loading} />
              )}
            </section>
          ) : (
            <button type="button" className="text-intake-toggle" onClick={() => setShowTextIntake(true)}>
              Describe it another way
            </button>
          )}
          {error && <p className="error">⚠ {error}</p>}
          {result && <Results result={result} intake={lastIntake} />}
        </>
      ) : tab === 'references' ? (
        <RefLibrary />
      ) : (
        <ImpactPanel />
      )}

      <DTagLegend />
    </main>
  );
}
