import 'dotenv/config';
import express from 'express';
import type { ModelProvider } from './providers/types';
import { MockProvider } from './providers/mock';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAICompatibleProvider } from './providers/openai-compatible';

// Build the provider from env. PROVIDER=mock (no key) | deepseek (cheap test) | anthropic (prod).
// Browser never receives a key — this proxy is the only place keys are read.
function getProvider(): ModelProvider {
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

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: (process.env.PROVIDER ?? 'mock').toLowerCase() });
});

app.post('/api/diagnose', async (req, res) => {
  const input = String(req.body?.input ?? '').trim();
  if (!input) {
    res.status(400).json({ error: 'Missing "input".' });
    return;
  }
  try {
    const provider = getProvider();
    const result = await provider.diagnose(input);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

const PORT = Number(process.env.PORT ?? 8788);
app.listen(PORT, () => {
  console.log(`[botmentor] proxy listening on :${PORT} (provider=${process.env.PROVIDER ?? 'mock'})`);
});
