import { TEAMS } from '../teams';
import { useActiveTeam, setActiveTeam } from '../lib/refs';

// Team selector (ADR-014): pick which robot's reference library is loaded. Switching
// swaps the docs the AI cites and the Browse tab shows, live. Persisted per browser.
export function TeamSelector() {
  const active = useActiveTeam();
  const team = TEAMS.find((t) => t.id === active) ?? TEAMS[0];
  return (
    <div className="team-select">
      <label htmlFor="team">📁 Team docs:</label>
      <select id="team" value={active} onChange={(e) => setActiveTeam(e.target.value)}>
        {TEAMS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} — {t.robot}
          </option>
        ))}
      </select>
      <span className="team-hint">Citations pull from {team.name}'s docs</span>
    </div>
  );
}
