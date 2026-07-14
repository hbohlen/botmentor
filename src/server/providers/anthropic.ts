import Anthropic from '@anthropic-ai/sdk';
import type { DiagnoseResult, ModelProvider } from './types';
import { buildMessages } from '../prompt';
import { parseDiagnose } from './parse';

// Production provider. Returns structured JSON; we defensively parse the first {...} block
// because the model may wrap JSON in prose. On parse failure we surface a safe, honest message
// rather than crashing (Diligence: catch your own wrong answers).
export class AnthropicProvider implements ModelProvider {
  name = 'anthropic' as const;
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async diagnose(userInput: string): Promise<DiagnoseResult> {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: buildMessages(userInput).find((m) => m.role === 'system')!.content,
      messages: [{ role: 'user', content: userInput }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return parseDiagnose(text);
  }
}
