import { useEffect, useState } from 'react';
import { getRef, useActiveTeam } from '../lib/refs';
import { editableSnippet, referenceMarkdown } from '../lib/reference-workspace';

// Why-this-ref provenance: which hypothesis cited the doc, and its ranking reason.
// Present when opened from a hypothesis chip; absent when browsed from the library.
export interface RefProvenance {
  rank: number;
  area: string;
  title: string;
  whyRanked: string;
}

type WorkspaceView = 'reader' | 'markdown' | 'code';

// Doc drawer: opens the cited reference so the student reads the robot's own
// documentation for the cause. The AI "tours" them to the source — Discernment
// as verification against an authority, not just accepting the answer. When opened
// from a hypothesis, it also shows WHY it was cited, so the citation is checkable
// (Discernment made auditable). See ADR-011 / ADR-012.
export function RefDrawer({
  refId,
  provenance,
  onClose,
}: {
  refId: string | null;
  provenance?: RefProvenance | null;
  onClose: () => void;
}) {
  const activeTeam = useActiveTeam();
  const ref = refId ? getRef(refId) : undefined;
  const [view, setView] = useState<WorkspaceView>('reader');
  const [draftCode, setDraftCode] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (!ref) return;
    setView('reader');
    setDraftCode(editableSnippet(ref));
    setCopyStatus('');
  }, [activeTeam, ref?.id]);

  if (!refId || !ref) return null;

  const hasCode = Boolean(ref.snippet);
  const resetCode = () => {
    setDraftCode(editableSnippet(ref));
    setCopyStatus('Restored the reference example.');
  };
  const copyCode = async () => {
    if (!draftCode) return;
    try {
      await navigator.clipboard.writeText(draftCode);
      setCopyStatus('Copied to your clipboard.');
    } catch {
      setCopyStatus('Select the code and use your browser copy command.');
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Reference: ${ref.title}`}
        aria-modal="true"
        role="dialog"
      >
        <header className="drawer-head">
          <span className="drawer-area">{ref.area}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <h3 className="drawer-title">{ref.title}</h3>
        {provenance && (
          <div className="drawer-prov">
            <span className="drawer-prov-tag">Why you're seeing this</span>
            <p>
              Cited by hypothesis <strong>#{provenance.rank}</strong> ({provenance.area}):{' '}
              <em>{provenance.title}</em>. {provenance.whyRanked}
            </p>
          </div>
        )}

        <div className="workspace-tabs" aria-label="Reference view">
          <button
            type="button"
            className={view === 'reader' ? 'workspace-tab active' : 'workspace-tab'}
            aria-pressed={view === 'reader'}
            onClick={() => setView('reader')}
          >
            Read
          </button>
          <button
            type="button"
            className={view === 'markdown' ? 'workspace-tab active' : 'workspace-tab'}
            aria-pressed={view === 'markdown'}
            onClick={() => setView('markdown')}
          >
            Markdown
          </button>
          <button
            type="button"
            className={view === 'code' ? 'workspace-tab active' : 'workspace-tab'}
            aria-pressed={view === 'code'}
            onClick={() => setView('code')}
          >
            Code lab
          </button>
        </div>

        {view === 'reader' ? (
          <>
            <p className="drawer-summary">{ref.summary}</p>
            <div className="drawer-body">{ref.body}</div>
            {ref.snippet && <pre className="drawer-snippet">{ref.snippet}</pre>}
            <div className="drawer-tags">
              {ref.tags.map((tag) => (
                <span key={tag} className="rtag">
                  {tag}
                </span>
              ))}
            </div>
          </>
        ) : view === 'markdown' ? (
          <>
            <p className="workspace-hint">
              This is the same reference in portable Markdown, ready to read, copy, or add to a team
              notebook.
            </p>
            <pre className="drawer-markdown">{referenceMarkdown(ref)}</pre>
          </>
        ) : (
          <section className="code-lab" aria-label="Editable code lab">
            <p className="workspace-hint">
              {hasCode
                ? 'Try a change in this local scratchpad. Your reference document stays unchanged.'
                : 'This reference is prose-only, so there is no code example to edit yet.'}
            </p>
            <label htmlFor="reference-code-editor">Your editable copy</label>
            <textarea
              id="reference-code-editor"
              className="code-editor"
              value={draftCode}
              onChange={(event) => setDraftCode(event.target.value)}
              disabled={!hasCode}
              spellCheck={false}
              aria-describedby="code-lab-boundary"
            />
            <p id="code-lab-boundary" className="code-lab-boundary">
              Scratchpad only — BotMentor does not run, upload, or save this code.
            </p>
            <div className="code-lab-actions">
              <button type="button" onClick={resetCode} disabled={!hasCode} className="code-reset">
                Reset example
              </button>
              <button type="button" onClick={copyCode} disabled={!draftCode} className="code-copy">
                Copy code
              </button>
              <span className="code-status" role="status">
                {copyStatus}
              </span>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
