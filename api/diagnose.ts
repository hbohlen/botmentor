import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// BotMentor serverless function — single self-contained file (Vercel's
// @vercel/node bundler externalizes relative imports, so everything lives here).
// Shares logic with the local Express proxy (src/server/index.ts) by copying the
// engine; keys stay server-side. Maps to route /api/diagnose.
// ============================================================================

type FaultArea =
  | 'motor' | 'sensors' | 'power' | 'wiring' | 'programming' | 'mechanical' | 'radio';
type DTag = 'Delegation' | 'Description' | 'Discernment' | 'Diligence';

interface Hypothesis {
  area: FaultArea;
  title: string;
  plainSteps: string[];
  confidence: number;
  verifyFirst: boolean;
  whyRanked: string;
}
interface DiagnoseResult {
  hypotheses: Hypothesis[];
  dTags: DTag[];
  note?: string;
}

const SYSTEM_PROMPT = `You are BotMentor, a mentor for student robotics teams (middle/high school), in the spirit of the Nebraska Robotics Expo, where University of Nebraska–Omaha engineering students volunteered to coach K–12 teams through on-the-spot troubleshooting, repairs, and robot-design improvement under competition-day time pressure. You coach — you do NOT just fix. Your job is to help a nervous 13-year-old get a working robot before their next match, while teaching them to think like a mentor.

Picture the expo floor: a student runs up with a robot that "won't turn right." You have minutes. You do not touch their robot — you help THEM diagnose it, test the cheapest cause first, and learn why, so they can fix the next problem without you.

Follow the AI Fluency 4D Framework:
- Delegation: propose the test in plain language; the STUDENT runs it with their own hands. Never claim you ran a physical test or touched the robot. If the fix needs tools or risk (soldering, batteries, sharp parts), say "have an adult or mentor help with this step."
- Description: reason only from what the student reports. If the report is too thin to diagnose safely, ask ONE sharp clarifying question instead of guessing.
- Discernment: rank likely causes cheap-first and safe-first. Mark the single cheapest/safest check as verifyFirst. Explain in "whyRanked" why each hypothesis sits where it does, so the student learns the reasoning — not just the answer. Be explicit and honest when confidence is low.
- Diligence: include safety notes (batteries, soldering, sharp parts); coach design too — if the root cause is a fragile mount or a bad connection, name the sturdier design. Be honest about low confidence rather than confident-but-wrong.

Coach for the result AND the lesson. Return ONLY JSON matching this shape:
{"hypotheses":[{"area":<motor|sensors|power|wiring|programming|mechanical|radio>,"title":string,"plainSteps":[string],"confidence":0..1,"verifyFirst":boolean,"whyRanked":string}],"dTags":["Delegation","Description","Discernment","Diligence"],"note":string}`;

function parseDiagnose(raw: string): DiagnoseResult {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw new Error('no JSON');
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<DiagnoseResult>;
    return {
      hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses : [],
      dTags: Array.isArray(parsed.dTags)
        ? (parsed.dTags as DTag[])
        : ['Delegation', 'Description', 'Discernment', 'Diligence'],
      note: parsed.note,
    };
  } catch {
    return {
      hypotheses: [],
      dTags: ['Delegation', 'Description', 'Discernment', 'Diligence'],
      note: 'The mentor could not parse a structured answer. Try restating the symptom, what changed, and what you expected.',
    };
  }
}

export async function diagnose(input: string): Promise<DiagnoseResult> {
  const provider = (process.env.PROVIDER ?? 'mock').toLowerCase();

  if (provider === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not set');
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    return parseDiagnose(text);
  }

  if (provider === 'deepseek' || provider === 'openai-compatible') {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DEEPSEEK_API_KEY not set');
    const res = await fetch(`${process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error(`Provider error ${res.status}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return parseDiagnose(data.choices[0].message.content);
  }

  // Mock — key-free, clearly labeled.
  return parseDiagnose(
    JSON.stringify({
      hypotheses: [
        {
          area: 'power',
          title: 'Battery sags under load',
          plainSteps: ['Fully charge the battery, then try again.', 'If it works fresh but fails after a minute, the battery is weak.'],
          confidence: 0.65,
          verifyFirst: false,
          whyRanked: 'Weak batteries cause intermittent "one side dies" and stuttering — the most common expo issue.',
        },
        {
          area: 'wiring',
          title: 'Loose motor connector',
          plainSteps: ['Unplug and reseat the motor connector on the motor and the board.', 'Gently tug the wire while powered — if it cuts out, that is the bad connection.'],
          confidence: 0.55,
          verifyFirst: true,
          whyRanked: 'Loose plugs mimic motor failure; check it before swapping parts (cheap, safe, first).',
        },
        {
          area: 'programming',
          title: 'Motor direction inverted in code',
          plainSteps: ['Find the line that sets the left motor speed.', 'If it only stutters turning right, try flipping the sign and re-upload.'],
          confidence: 0.4,
          verifyFirst: false,
          whyRanked: 'A sign error produces direction-dependent stutter; worth a quick code check.',
        },
      ],
      note: 'Mock response (no API key). Set PROVIDER=deepseek or anthropic with a key for live mentoring. Have an adult present for any battery work.',
    })
  );
}

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
