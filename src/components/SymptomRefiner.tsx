import { useState } from 'react';
import { buildInvestigationContext, getSymptomFlow, type BuiltInvestigationContext, type RobotSystem } from '../lib/robot-workspace';

export function SymptomRefiner({ system, loading, onSubmit }: { system: RobotSystem; loading: boolean; onSubmit: (context: BuiltInvestigationContext) => void }) {
  const flow = getSymptomFlow(system);
  const [symptomId, setSymptomId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const isOther = symptomId === 'something-else';
  const ready = symptomId && (isOther ? freeText.trim() : flow.questions.every((question) => answers[question.id]));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    onSubmit(buildInvestigationContext({ selectedSystem: system, symptomId, answers, freeText }));
  }
  return <form className="intake" onSubmit={submit}>
    <p className="eyebrow">Describe → Inspect</p><h2>What did you notice?</h2>
    <div className="symptom-chips" role="group" aria-label="Choose a symptom">
      {flow.symptoms.map((symptom) => <button key={symptom.id} type="button" className={symptomId === symptom.id ? 'active' : ''} aria-pressed={symptomId === symptom.id} onClick={() => setSymptomId(symptom.id)}>{symptom.label}</button>)}
    </div>
    {isOther && <label>Tell us what you observed<textarea value={freeText} onChange={(event) => setFreeText(event.target.value)} required /></label>}
    {symptomId && !isOther && flow.questions.map((question) => <fieldset key={question.id}><legend>{question.prompt}</legend>{question.options.map((option) => <label key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /> {option.label}</label>)}</fieldset>)}
    <button type="submit" disabled={!ready || loading}>{loading ? 'Mentoring…' : 'Continue to mentor ideas'}</button>
  </form>;
}
