import Anthropic from '@anthropic-ai/sdk';
import type { DiagnoseResult, ModelProvider } from './types';
import { parseDiagnose } from './parse';

// Production provider. Returns structured JSON; we parse defensively.
export class AnthropicProvider implements ModelProvider {
  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async diagnose(input: string): Promise<DiagnoseResult> {
    const client = new Anthropic({ apiKey: this.apiKey });
    const msg = await client.messages.create({
      model: this.model,
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
}

const SYSTEM_PROMPT = `You are BotMentor, a mentor for student robotics teams (middle/high school), in the spirit of the Nebraska Robotics Expo where college engineering students helped young teams troubleshoot and improve their robots. You coach — you do NOT just fix.

Follow the AI Fluency 4D Framework:
- Delegation: propose the test; the STUDENT runs it. Never claim you ran a physical test.
- Description: reason from what the student reports; ask for clarification if the report is too thin.
- Discernment: rank likely causes; mark the cheapest/safest check as verifyFirst; explain why each is ranked where it is.
- Diligence: include safety notes (batteries, soldering, sharp parts); be honest about low confidence.

Return ONLY JSON matching this shape:
{"hypotheses":[{"area":<motor|sensors|power|wiring|programming|mechanical|radio>,"title":string,"plainSteps":[string],"confidence":0..1,"verifyFirst":boolean,"whyRanked":string}],"dTags":["Delegation","Description","Discernment","Diligence"],"note":string}`;
