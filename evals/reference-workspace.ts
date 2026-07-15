import { REFS } from '../src/refs';
import { editableSnippet, referenceMarkdown } from '../src/lib/reference-workspace';

let failures = 0;

function expect(condition: boolean, detail: string) {
  if (condition) {
    console.log(`✓ ${detail}`);
  } else {
    failures++;
    console.error(`✗ ${detail}`);
  }
}

const withCode = REFS['ref-arduino-motor'];
const markdown = referenceMarkdown(withCode);
expect(markdown.startsWith(`# ${withCode.title}`), 'markdown view starts with the document title');
expect(markdown.includes('## Guide'), 'markdown view retains the readable guide section');
expect(markdown.includes('## Code snippet'), 'markdown view exposes the source snippet as code');
expect(markdown.includes(withCode.snippet!), 'markdown view preserves the reference snippet verbatim');
expect(editableSnippet(withCode) === withCode.snippet, 'code lab starts from the cited code snippet');

const proseOnly = { ...withCode, snippet: undefined };
expect(editableSnippet(proseOnly) === '', 'code lab is empty for a prose-only reference');

if (failures) process.exit(1);
