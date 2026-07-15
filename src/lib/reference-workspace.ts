import type { Ref } from '../refs';

export function editableSnippet(ref: Ref): string {
  return ref.snippet ?? '';
}

export function referenceMarkdown(ref: Ref): string {
  const tags = ref.tags.map((tag) => `- ${tag}`).join('\n');
  const code = ref.snippet
    ? `\n\n## Code snippet\n\n\`\`\`text\n${ref.snippet}\n\`\`\``
    : '';

  return `# ${ref.title}\n\n> ${ref.summary}\n\n## Guide\n\n${ref.body}\n\n## Tags\n\n${tags}${code}\n`;
}
