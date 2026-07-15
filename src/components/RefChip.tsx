export function RefChip({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button className="ref-chip" onClick={onClick} title={`Open reference: ${title}`}>
      📚 {title}
    </button>
  );
}
