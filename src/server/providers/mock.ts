import type { DiagnoseResult, ModelProvider } from './types';

// Key-free provider so the public demo works with NO API key. Returns a realistic,
// clearly-labeled mock so reviewers can click through the full 4D UI without spend.
// It deliberately demonstrates the Discernment flag and 4D tags the real providers produce.
export class MockProvider implements ModelProvider {
  name = 'mock' as const;

  async diagnose(_userInput: string): Promise<DiagnoseResult> {
    return {
      hypotheses: [
        {
          id: 'h1',
          area: 'power',
          title: 'Battery sags under load',
          plainSteps: [
            'Fully charge the battery, then try again.',
            'If it works when fresh but fails after a minute, the battery is weak.',
          ],
          confidence: 0.65,
          verifyFirst: false,
          whyRanked:
            'Weak batteries cause intermittent "one side dies" and stuttering — the most common expo issue.',
        },
        {
          id: 'h2',
          area: 'wiring',
          title: 'Loose motor connector',
          plainSteps: [
            'Unplug and reseat the motor connector on the motor and the board.',
            'Gently tug the wire while powered — if it cuts out, that is the bad connection.',
          ],
          confidence: 0.55,
          verifyFirst: true,
          whyRanked:
            'Loose plugs mimic motor failure; check it before swapping parts (cheap, safe, first).',
        },
        {
          id: 'h3',
          area: 'programming',
          title: 'Motor direction inverted in code',
          plainSteps: [
            'Find the line that sets the left motor speed.',
            'If it only stutters turning right, try flipping the sign and re-upload.',
          ],
          confidence: 0.4,
          verifyFirst: false,
          whyRanked:
            'A sign error produces direction-dependent stutter; worth a quick code check.',
        },
      ],
      dTags: ['Delegation', 'Description', 'Discernment', 'Diligence'],
      note:
        'Mock response (no API key). Set PROVIDER=deepseek or anthropic with a key for live mentoring. Have an adult present for any battery work.',
    };
  }
}
