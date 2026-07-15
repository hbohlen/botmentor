import 'dotenv/config';
import express from 'express';
import { diagnose, normalizeDiagnoseRequest } from '../../api/diagnose';

// Local dev proxy. In production this exact logic runs as a Vercel serverless function
// (api/diagnose.ts) — see vercel.json. Keys are read server-side only via the shared
// engine; the browser never receives them.
const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const provider = (process.env.PROVIDER ?? 'mock').toLowerCase();
  const hasKey =
    (provider === 'anthropic' && !!process.env.ANTHROPIC_API_KEY) ||
    (provider === 'deepseek' && !!process.env.DEEPSEEK_API_KEY) ||
    provider === 'mock';
  res.json({
    ok: true,
    provider,
    keyConfigured: hasKey,
    domains: ['robotics'],
    framework: 'AI Fluency 4D',
    dTags: ['Delegation', 'Description', 'Discernment', 'Diligence'],
  });
});

app.post('/api/diagnose', async (req, res) => {
  const normalized = normalizeDiagnoseRequest(req.body);
  if ('error' in normalized) {
    res.status(400).json({ error: normalized.error });
    return;
  }
  try {
    const result = await diagnose(normalized.input);
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
