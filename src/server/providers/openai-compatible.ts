import type { DiagnoseResult, ModelProvider } from './types';
import { parseDiagnose } from './parse';
import { buildMessages } from '../prompt';

// Cheap testing provider. DeepSeek exposes an OpenAI-compatible /v1/chat/completions endpoint,
// so we call it directly with fetch (no SDK dependency). Same JSON shape as Anthropic.
// Model default: deepseek-v4-flash (deepseek-chat is deprecated 2026-07-24).
export class OpenAICompatibleProvider implements ModelProvider {
  name = 'openai-compatible' as const;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
  }

  async diagnose(userInput: string): Promise<DiagnoseResult> {
    const messages = buildMessages(userInput).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.3 }),
    });
    if (!res.ok) {
      throw new Error(`Provider error ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return parseDiagnose(data.choices[0].message.content);
  }
}
