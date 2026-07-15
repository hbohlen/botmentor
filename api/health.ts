import type { VercelRequest, VercelResponse } from '@vercel/node';

// Production health endpoint (parity with the local Express proxy's /api/health).
// Mirrors the self-contained-file rule of ADR-001: no relative imports.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const provider = (process.env.PROVIDER ?? 'mock').toLowerCase();
  const hasKey =
    (provider === 'anthropic' && !!process.env.ANTHROPIC_API_KEY) ||
    (provider === 'deepseek' && !!process.env.DEEPSEEK_API_KEY) ||
    provider === 'mock';
  res.status(200).json({
    ok: true,
    provider,
    keyConfigured: hasKey,
    // The family of mentoring this function supports (kept in sync with diagnose.ts).
    domains: ['robotics'],
    framework: 'AI Fluency 4D',
    dTags: ['Delegation', 'Description', 'Discernment', 'Diligence'],
  });
}
