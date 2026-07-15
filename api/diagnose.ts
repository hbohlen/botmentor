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
  refs?: string[];
}
interface DiagnoseResult {
  hypotheses: Hypothesis[];
  dTags: DTag[];
  note?: string;
}

// Inline reference index (id -> title/area) kept tiny so the serverless function
// stays self-contained (ADR-001). The full ref bodies live client-side (src/refs.ts)
// and are opened by the doc drawer. Live providers get REF_LIST in-prompt so the
// model cites real IDs; mock attaches area-matched refs directly.
const REF_INDEX: { id: string; title: string; area: string }[] = [
  { id: 'ref-motor-datasheet', title: 'N20 Motor Datasheet', area: 'motor' },
  { id: 'ref-motor-driver', title: 'Motor Driver Wiring', area: 'motor' },
  { id: 'ref-sensor-cal', title: 'Calibrating a Distance Sensor', area: 'sensors' },
  { id: 'ref-line-follower', title: 'Line-Follower Tuning', area: 'sensors' },
  { id: 'ref-battery-spec', title: 'Battery Specs & Runtime', area: 'power' },
  { id: 'ref-battery-sag', title: 'Voltage Sag Under Load', area: 'power' },
  { id: 'ref-power-switch', title: 'Power Switch & Fuse Check', area: 'power' },
  { id: 'ref-wiring-diagram', title: 'Robot Wiring Diagram', area: 'wiring' },
  { id: 'ref-motor-connector', title: 'Reseating Motor Connectors', area: 'wiring' },
  { id: 'ref-arduino-motor', title: 'Arduino Motor Sketch', area: 'programming' },
  { id: 'ref-motor-sign-fix', title: 'Fixing an Inverted Motor Direction', area: 'programming' },
  { id: 'ref-pwm', title: 'PWM & Motor Speed', area: 'programming' },
  { id: 'ref-gearbox-debris', title: 'Gearbox & Debris Check', area: 'mechanical' },
  { id: 'ref-wheel-mount', title: 'Wheel & Axle Mount', area: 'mechanical' },
  { id: 'ref-radio-binding', title: 'Radio Binding & Interference', area: 'radio' },
];

// Precompute the in-prompt reference list as a plain string (no nested template
// literals — they break the SYSTEM_PROMPT template string parsing).
const REF_LIST = REF_INDEX
  .map((r) => r.id + ' (' + r.area + ': ' + r.title + ')')
  .join(', ');

function refIdsForArea(area: string): string[] {
  return REF_INDEX.filter((r) => r.area === area).map((r) => r.id);
}

const SYSTEM_PROMPT =
  'You are BotMentor, a mentor for student robotics teams (middle/high school), in the spirit of the Nebraska Robotics Expo, where University of Nebraska–Omaha engineering students volunteered to coach middle/high-school teams through on-the-spot troubleshooting, repairs, and robot-design improvement under competition-day time pressure. You coach — you do NOT just fix. Your job is to help a nervous 13-year-old get a working robot before their next match, while teaching them to think like a mentor.\n\n' +
  'Picture the expo floor: a student runs up with a robot that "won\'t turn right." You have minutes. You do not touch their robot — you help THEM diagnose it, test the cheapest cause first, and learn why, so they can fix the next problem without you.\n\n' +
  'Follow the AI Fluency 4D Framework:\n' +
  '- Delegation: propose the test in plain language; the STUDENT runs it with their own hands. Never claim you ran a physical test or touched the robot. If the fix needs tools or risk (soldering, batteries, sharp parts), say "have an adult or mentor help with this step."\n' +
  '- Description: reason only from what the student reports. If the report is too thin to diagnose safely, ask ONE sharp clarifying question instead of guessing.\n' +
  '- Discernment: rank likely causes cheap-first and safe-first. Mark the single cheapest/safest check as verifyFirst. Explain in "whyRanked" why each hypothesis sits where it does, so the student learns the reasoning — not just the answer. Be explicit and honest when confidence is low.\n' +
  '- Diligence: include safety notes (batteries, soldering, sharp parts); coach design too — if the root cause is a fragile mount or a bad connection, name the sturdier design. Be honest about low confidence rather than confident-but-wrong.\n\n' +
  'Coach for the result AND the lesson. Each hypothesis may cite 1-3 reference IDs from this library that the student can open to learn more: ' +
  REF_LIST +
  '.\n\nReturn ONLY JSON matching this shape:\n' +
  '{"hypotheses":[{"area":<motor|sensors|power|wiring|programming|mechanical|radio>,"title":string,"plainSteps":[string],"confidence":0..1,"verifyFirst":boolean,"whyRanked":string,"refs":[string]}],"dTags":["Delegation","Description","Discernment","Diligence"],"note":string}';

function parseDiagnose(raw: string): DiagnoseResult {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw new Error('no JSON');
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<DiagnoseResult>;
    return {
      hypotheses: Array.isArray(parsed.hypotheses)
        ? (parsed.hypotheses as Hypothesis[]).map((h) => ({
            ...h,
            refs: Array.isArray(h.refs)
              ? h.refs.filter((id) => REF_INDEX.some((r) => r.id === id))
              : [],
          }))
        : [],
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

export interface StructuredContext {
  selectedSystem: string;
  symptomLabel: string;
  observations: { prompt: string; answer: string; source: 'student' }[];
  freeText?: string;
}

export function normalizeDiagnoseRequest(body: unknown): { input: string; context?: StructuredContext } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Missing "input" or structured context.' };
  const value = body as { input?: unknown; context?: unknown };
  const input = typeof value.input === 'string' ? value.input.trim() : '';
  if (value.context === undefined) return input ? { input } : { error: 'Missing "input".' };
  const context = value.context as Partial<StructuredContext>;
  if (typeof context.selectedSystem !== 'string' || typeof context.symptomLabel !== 'string' || !Array.isArray(context.observations) || !context.observations.every((item) => item && typeof item.prompt === 'string' && typeof item.answer === 'string' && item.source === 'student')) return { error: 'Malformed structured context.' };
  const structured: StructuredContext = { selectedSystem: context.selectedSystem, symptomLabel: context.symptomLabel, observations: context.observations, ...(typeof context.freeText === 'string' ? { freeText: context.freeText } : {}) };
  const summary = [`Selected robot system: ${structured.selectedSystem}.`, `Student-selected symptom: ${structured.symptomLabel}.`, ...structured.observations.map((item) => `Student observation: ${item.prompt} Answer: ${item.answer}.`), structured.freeText ? `Student free-text: ${structured.freeText}` : '', input].filter(Boolean).join('\n');
  return { input: summary, context: structured };
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
    const res = await fetch(
      `${process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'}/v1/chat/completions`,
      {
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
      }
    );
    if (!res.ok) throw new Error(`Provider error ${res.status}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return parseDiagnose(data.choices[0].message.content);
  }

  // Mock — key-free, clearly labeled. Refs are area-matched from REF_INDEX.
  const normalizedInput = input.toLowerCase();
  if (normalizedInput.includes('battery') && /(hot|swollen|smell|leak|damage)/.test(normalizedInput)) {
    return parseDiagnose(JSON.stringify({ hypotheses: [{ area: 'power', title: 'Potentially unsafe battery condition', plainSteps: ['Stop using the battery and move away from the robot if it is safe to do so.', 'Tell an adult mentor immediately; do not charge, open, or test the battery yourself.'], confidence: 0.95, verifyFirst: true, whyRanked: 'Heat, swelling, odor, leaks, or physical damage are safety signals, not a student repair task.', refs: refIdsForArea('power') }], note: 'Mock safety escalation: mentor or adult review is required before any further battery troubleshooting.' }));
  }
  if (normalizedInput.includes('not sure') || normalizedInput.includes('something else')) {
    return parseDiagnose(JSON.stringify({ hypotheses: [{ area: 'mechanical', title: 'Not enough evidence to choose a safe repair path', plainSteps: ['Pause hands-on changes and write down what you can observe safely.', 'Ask a mentor to review the robot with you before changing parts or wiring.'], confidence: 0.2, verifyFirst: true, whyRanked: 'The student explicitly reported uncertainty, so a mentor review is safer than guessing at a repair.', refs: refIdsForArea('mechanical') }], note: 'Mock low-confidence path: BotMentor is uncertain and recommends mentor review rather than a speculative fix.' }));
  }
  const mock = {
    hypotheses: [
      {
        area: 'power',
        title: 'Battery sags under load',
        plainSteps: [
          'Fully charge the battery, then try again.',
          'If it works fresh but fails after a minute, the battery is weak.',
        ],
        confidence: 0.65,
        verifyFirst: false,
        whyRanked:
          'Weak batteries cause intermittent "one side dies" and stuttering — the most common expo issue.',
        refs: refIdsForArea('power'),
      },
      {
        area: 'wiring',
        title: 'Loose motor connector',
        plainSteps: [
          'Unplug and reseat the motor connector on the motor and the board.',
          'Gently tug the wire while powered — if it cuts out, that is the bad connection.',
        ],
        confidence: 0.55,
        verifyFirst: true,
        whyRanked: 'Loose plugs mimic motor failure; check it before swapping parts (cheap, safe, first).',
        refs: refIdsForArea('wiring'),
      },
      {
        area: 'programming',
        title: 'Motor direction inverted in code',
        plainSteps: [
          'Find the line that sets the left motor speed.',
          'If it only stutters turning right, try flipping the sign and re-upload.',
        ],
        confidence: 0.4,
        verifyFirst: false,
        whyRanked: 'A sign error produces direction-dependent stutter; worth a quick code check.',
        refs: refIdsForArea('programming'),
      },
    ],
    note: 'Mock response (no API key). Set PROVIDER=deepseek or anthropic with a key for live mentoring. Have an adult present for any battery work.',
  };
  return parseDiagnose(JSON.stringify(mock));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const normalized = normalizeDiagnoseRequest(req.body);
  if ('error' in normalized) {
    res.status(400).json({ error: normalized.error });
    return;
  }
  try {
    const result = await diagnose(normalized.input);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
