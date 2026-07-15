export function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 66 ? '#22c55e' : value >= 33 ? '#eab308' : '#f87171';
  return (
    <span className="conf" title={`Confidence ${value}%`}>
      <span className="conf-bar" aria-hidden="true">
        <span className="conf-fill" style={{ width: `${value}%`, background: color }} />
      </span>
      <span className="conf-pct">~{value}% likely</span>
    </span>
  );
}
