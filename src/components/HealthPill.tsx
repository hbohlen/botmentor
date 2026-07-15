import { useEffect, useState } from 'react';

interface Health {
  ok: boolean;
  provider: string;
  keyConfigured: boolean;
  framework: string;
}

// Operator-facing health pill. Lets a non-technical host-org lead confirm the app
// is alive and whether live AI answers (vs. key-free practice mode) are configured —
// no terminal, no Vercel login required.
export function HealthPill() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => alive && setHealth(d as Health))
      .catch(() => alive && setHealth(null));
    return () => {
      alive = false;
    };
  }, []);

  if (!health) {
    return <span className="pill pill--unknown">status: unknown</span>;
  }
  const live = health.keyConfigured && health.provider !== 'mock';
  return (
    <span
      className={`pill ${health.ok ? 'pill--ok' : 'pill--bad'}`}
      title={`provider=${health.provider} · key configured=${health.keyConfigured}`}
    >
      {health.ok ? '●' : '○'} {live ? 'live AI' : 'practice mode'}
    </span>
  );
}
