import { getStudentProgress, type StudentStage } from '../lib/student-experience';

export function StudentProgress({ stage }: { stage: StudentStage }) {
  const progress = getStudentProgress(stage);
  return (
    <div className="student-progress" aria-label={`Step ${progress.current} of ${progress.total}: ${progress.label}`}>
      <div className="student-progress-copy">
        <span>Step {progress.current} of {progress.total}</span>
        <strong>{progress.label}</strong>
      </div>
      <div className="student-progress-track" aria-hidden="true">
        <span style={{ width: `${(progress.current / progress.total) * 100}%` }} />
      </div>
    </div>
  );
}
