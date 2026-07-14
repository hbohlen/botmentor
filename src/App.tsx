import { useState } from 'react';
import { Intake } from './components/Intake';
import { Results } from './components/Results';
import type { DiagnoseResult } from './server/providers/types';

export function App() {
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
        <h1>BotMentor</h1>
        <p>
          A mentoring co-pilot for student robotics teams — built on the AI Fluency 4D
          Framework. Origin: Nebraska Robotics Expo volunteering (2017–2018).
        </p>
      </header>
      <Intake onSubmit={diagnose} loading={loading} />
      {error && <p className="error">⚠ {error}</p>}
      {result && <Results result={result} />}
    </main>
  );
}
