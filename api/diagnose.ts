import type { VercelRequest, VercelResponse } from '@vercel/node';
import { diagnose } from './engine';

// Vercel serverless function. Self-contained under api/ (Vercel's bundler only traces
// imports within api/). Shares the exact same engine as the local Express proxy
// (src/server/index.ts imports ../api/engine), so local dev and the deployed demo never
// diverge. API keys stay server-side. Vercel maps this file to /api/diagnose.
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
