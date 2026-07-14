import 'dotenv/config';
import type { ModelProvider, DiagnoseResult } from '../server/providers/types';
import { MockProvider } from '../server/providers/mock';
import { AnthropicProvider } from '../server/providers/anthropic';
import { OpenAICompatibleProvider } from '../server/providers/openai-compatible';

// Shared between the local Express proxy (src/server/index.ts) and the Vercel
// serverless function (api/diagnose.ts). Builds the provider from env. The browser
// never receives a key — this is the only place keys are read.
// Provider: mock (no key, for demo/dev) | deepseek (cheap test) | anthropic (prod).
export function getProvider(): ModelProvider {
  const provider = (process.env.PROVIDER ?? 'mock').toLowerCase();
  if (provider === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not set');
    return new AnthropicProvider(key, process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5');
  }
  if (provider === 'deepseek' || provider === 'openai-compatible') {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DEEPSEEK_API_KEY not set');
    return new OpenAICompatibleProvider(
      key,
      process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
      process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash'
    );
  }
  return new MockProvider();
}

export async function diagnose(input: string): Promise<DiagnoseResult> {
  const provider = getProvider();
  return provider.diagnose(input);
}
