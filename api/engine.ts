import 'dotenv/config';
import type { ModelProvider, DiagnoseResult } from './providers/types';
import { MockProvider } from './providers/mock';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAICompatibleProvider } from './providers/openai-compatible';

// Serverless-safe engine: everything it imports lives under ./ (api/), so Vercel's
// @vercel/node bundler traces it correctly. The local Express proxy (src/server/index.ts)
// imports this same module, so there is a single source of truth. Keys are read here only.
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
