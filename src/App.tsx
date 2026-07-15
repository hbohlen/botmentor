import { useEffect, useState } from 'react';
import { Intake } from './components/Intake';
import { SymptomRefiner } from './components/SymptomRefiner';
import { RobotSystemMap } from './components/RobotSystemMap';
import { StudentProgress } from './components/StudentProgress';
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
import { DTagLegend } from './components/DTagLegend';
import { RefLibrary } from './components/RefLibrary';
import { TeamSelector } from './components/TeamSelector';
import { ImpactPanel } from './components/ImpactPanel';
import type { DiagnoseResult } from './types';
import { projectBoundary } from './lib/project-boundaries';

type Tab = 'diagnose' | 'learn' | 'mentor';

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
    setShowTextIntake(false);
  }

  function selectLayer(layer: MapLayer) {
    setMapState((current) => ({ ...current, layer }));
  }

  function startOver() {
    setResult(null);
    setLastIntake('');
    setError(null);
    setShowTextIntake(false);
    setMapState((current) => ({ ...current, selectedSystem: undefined, layer: 'issue' }));
    setTab('diagnose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context ? {
          input: investigationInput,
          context: {
            selectedSystem: context.selectedSystem,
            symptomLabel: context.symptomLabel,
            observations: context.observations,
            freeText: context.freeText,
          },
        } : { input: investigationInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data as DiagnoseResult);
      setLastIntake(investigationInput);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="masthead">
        <div className="masthead-row">
          <div>
            <h1>BotMentor</h1>
            <p className="tagline">Robot troubleshooting, one safe step at a time.</p>
          </div>
          {(result || mapState.selectedSystem || showTextIntake) && (
            <button type="button" className="start-over" onClick={startOver}>Start over</button>
          )}
        </div>
        <nav className="tabs" aria-label="BotMentor sections">
          <button aria-current={tab === 'diagnose' ? 'page' : undefined} className={tab === 'diagnose' ? 'tab active' : 'tab'} onClick={() => setTab('diagnose')}>Fix a robot problem</button>
          <button aria-current={tab === 'learn' ? 'page' : undefined} className={tab === 'learn' ? 'tab active' : 'tab'} onClick={() => setTab('learn')}>Learn</button>
          <button aria-current={tab === 'mentor' ? 'page' : undefined} className={tab === 'mentor' ? 'tab active' : 'tab'} onClick={() => setTab('mentor')}>For mentors</button>
        </nav>
      </header>

      <aside className="prototype-note" aria-labelledby="prototype-title">
        <div>
          <p className="eyebrow">{projectBoundary.label}</p>
          <h2 id="prototype-title">A concept for stronger volunteer mentoring</h2>
          <p>{projectBoundary.summary}</p>
        </div>
        <details>
          <summary>What this demo does—and does not—claim</summary>
          <ul>
            {projectBoundary.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>
        </details>
      </aside>

      {tab === 'diagnose' ? (
        <>
          {result ? (
            <Results result={result} intake={lastIntake} />
          ) : mapState.selectedSystem ? (
            <SymptomRefiner
              key={mapState.selectedSystem}
              system={mapState.selectedSystem}
              loading={loading}
              onBack={() => setMapState((current) => ({ ...current, selectedSystem: undefined }))}
              onSubmit={diagnose}
            />
          ) : showTextIntake ? (
            <section className="guided-card" aria-labelledby="text-intake-title">
              <StudentProgress stage="describe-problem" />
              <p className="eyebrow">Use your own words</p>
              <h2 id="text-intake-title">What did you expect, and what happened instead?</h2>
              <Intake onSubmit={diagnose} loading={loading} />
              <button type="button" className="back-action" onClick={() => setShowTextIntake(false)}>← Back to robot areas</button>
            </section>
          ) : (
            <>
              <RobotSystemMap
                selectedSystem={mapState.selectedSystem}
                statuses={systemStatuses}
                layer={mapState.layer}
                onSelectSystem={selectSystem}
                onSelectLayer={selectLayer}
              />
              <button type="button" className="text-intake-toggle" onClick={() => setShowTextIntake(true)}>I’d rather describe it in my own words</button>
            </>
          )}
          {error && <p className="error" role="alert">We couldn’t get mentor ideas yet: {error}</p>}
        </>
      ) : tab === 'learn' ? (
        <RefLibrary />
      ) : (
        <section className="mentor-center">
          <p className="eyebrow">For coaches, volunteers, and reviewers</p>
          <h2>Mentor & project center</h2>
          <p>
            BotMentor helps students observe, test safely, and prepare a better question for a human mentor. It does not see, control, or repair a physical robot.
          </p>
          <TeamSelector />
          <ImpactPanel />
          <DTagLegend />
        </section>
      )}
    </main>
  );
}
