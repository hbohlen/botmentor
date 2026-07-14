import 'dotenv/config';
import express from 'express';
import { diagnose } from '../../api/diagnose';

// Local dev proxy. In production this exact logic runs as a Vercel serverless function
// (api/diagnose.ts) — see vercel.json. Keys are read server-side only via the shared
// engine; the browser never receives them.
const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: (process.env.PROVIDER ?? 'mock').toLowerCase() });
});

app.post('/api/diagnose', async (req, res) => {
  const input = String((req.body as { input?: unknown })?.input ?? '').trim();
  if (!input) {
    res.status(400).json({ error: 'Missing "input".' });
    return;
  }
  try {
    const result = await diagnose(input);
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
