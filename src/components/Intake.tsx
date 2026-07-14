import { useState } from 'react';

interface IntakeProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

// Coaches Description (4D): structured prompts help the student describe the problem well.
export function Intake({ onSubmit, loading }: IntakeProps) {
  const [symptom, setSymptom] = useState('');
  const [changed, setChanged] = useState('');
  const [expected, setExpected] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const combined = [
      `Symptom: ${symptom}`,
      changed ? `What changed: ${changed}` : '',
      expected ? `What I expected: ${expected}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    if (symptom.trim()) onSubmit(combined);
  }

  return (
    <form className="intake" onSubmit={submit}>
      <label>
        What is your robot doing? (symptom)
        <textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="e.g. the left motor stutters when I turn right"
          required
        />
      </label>
      <label>
        What changed since it last worked? (optional — helps Description)
        <input value={changed} onChange={(e) => setChanged(e.target.value)} />
      </label>
      <label>
        What did you expect to happen? (optional)
        <input value={expected} onChange={(e) => setExpected(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Mentoring…' : 'Get mentor ideas'}
      </button>
    </form>
  );
}
