import { useState } from 'react';
import { Intake } from './components/Intake';
import { Results } from './components/Results';
import { HealthPill } from './components/HealthPill';
import { DTagLegend } from './components/DTagLegend';
import { RefLibrary } from './components/RefLibrary';
import { TeamSelector } from './components/TeamSelector';
import type { DiagnoseResult } from './types';

type Tab = 'diagnose' | 'references';

export function App() {
  const [tab, setTab] = useState<Tab>('diagnose');
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function diagnose(input: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data as DiagnoseResult);
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
        </nav>
        <TeamSelector />
      </header>

      {tab === 'diagnose' ? (
        <>
          <Intake onSubmit={diagnose} loading={loading} />
          {error && <p className="error">⚠ {error}</p>}
          {result && <Results result={result} />}
        </>
      ) : (
        <RefLibrary />
      )}

      <DTagLegend />
    </main>
  );
}
