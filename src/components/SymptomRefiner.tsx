import { useState } from 'react';
import { getCurrentQuestion } from '../lib/student-experience';
import { buildInvestigationContext, getSymptomFlow, type BuiltInvestigationContext, type RobotSystem } from '../lib/robot-workspace';
import { StudentProgress } from './StudentProgress';

export function SymptomRefiner({
  system,
  loading,
  onBack,
  onSubmit,
}: {
  system: RobotSystem;
  loading: boolean;
  onBack: () => void;
  onSubmit: (context: BuiltInvestigationContext) => void;
}) {
  const flow = getSymptomFlow(system);
  const [symptomId, setSymptomId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const isOther = symptomId === 'something-else';
  const currentQuestion = symptomId && !isOther ? getCurrentQuestion(flow, answers) : undefined;
  const ready = Boolean(symptomId && (isOther ? freeText.trim() : !currentQuestion));
  const answeredCount = Object.keys(answers).length;

  function chooseSymptom(nextSymptomId: string) {
    setSymptomId(nextSymptomId);
    setAnswers({});
    setFreeText('');
  }

  function submit() {
    if (!ready) return;
    onSubmit(buildInvestigationContext({ selectedSystem: system, symptomId, answers, freeText }));
  }

  return (
    <section className="guided-card" aria-labelledby="guided-question-title">
      <StudentProgress stage="describe-problem" />
      {!symptomId ? (
        <>
          <p className="eyebrow">Use your own observation</p>
          <h2 id="guided-question-title">What is your robot doing?</h2>
          <div className="answer-grid" role="group" aria-label="Choose what you noticed">
            {flow.symptoms.map((symptom) => (
              <button key={symptom.id} type="button" onClick={() => chooseSymptom(symptom.id)}>
                {symptom.label}
              </button>
            ))}
          </div>
          <button type="button" className="back-action" onClick={onBack}>← Back to robot areas</button>
        </>
      ) : isOther ? (
        <>
          <p className="eyebrow">Your words are welcome</p>
          <h2 id="guided-question-title">Tell us what you noticed</h2>
          <label className="result-label">
            What did you expect, and what happened instead?
            <textarea value={freeText} onChange={(event) => setFreeText(event.target.value)} autoFocus />
          </label>
          <div className="guided-actions">
            <button type="button" className="back-action" onClick={() => setSymptomId('')}>← Back</button>
            <button type="button" disabled={!ready || loading} onClick={submit}>
              {loading ? 'Thinking…' : 'Show me what to check'}
            </button>
          </div>
        </>
      ) : currentQuestion ? (
        <>
          <p className="question-count">Question {answeredCount + 1} of {flow.questions.length}</p>
          <h2 id="guided-question-title">{currentQuestion.prompt}</h2>
          <div className="answer-grid" role="group" aria-label={currentQuestion.prompt}>
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option.id }))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" className="back-action" onClick={() => {
            if (answeredCount === 0) setSymptomId('');
            else {
              const previousId = flow.questions[answeredCount - 1]?.id;
              setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== previousId)));
            }
          }}>← Back</button>
        </>
      ) : (
        <>
          <p className="eyebrow">Ready for a safe next step</p>
          <h2 id="guided-question-title">Thanks—that gives BotMentor a clearer picture.</h2>
          <p>You can change an answer or continue. Your answers are observations, not a confirmed diagnosis.</p>
          <div className="guided-actions">
            <button type="button" className="back-action" onClick={() => {
              const previousId = flow.questions[flow.questions.length - 1]?.id;
              setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== previousId)));
            }}>← Change last answer</button>
            <button type="button" disabled={loading} onClick={submit}>
              {loading ? 'Thinking…' : 'Show me what to check'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
