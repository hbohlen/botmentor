import type { VercelRequest, VercelResponse } from '@vercel/node';
import { diagnose } from '../src/lib/engine';

// Vercel serverless function. Shares the exact same provider logic as the local
// Express proxy (src/server/index.ts) via the shared engine module, so local dev
// and the deployed demo never diverge. API keys stay server-side.
// Vercel maps this file to the route /api/diagnose automatically.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const input = String((req.body as { input?: unknown })?.input ?? '').trim();
  if (!input) {
    res.status(400).json({ error: 'Missing "input".' });
    return;
  }
  try {
    const result = await diagnose(input);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
