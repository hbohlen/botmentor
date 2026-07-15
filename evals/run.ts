// Deterministic, keyless eval runner for BotMentor.
//
// Runs the `mock` engine path of api/diagnose.ts against fixed fixtures and
// asserts the 4D mentoring contract. No API key, no network. Exit code 0 = pass.
//
// Usage:
//   npm run eval                 # runs mock-engine checks
//   npm run eval -- --verbose    # prints each hypothesis
//
// Why keyless: the fellowship's "enable the org / hand off" story needs a
// quality gate a non-profit volunteer can run in CI without secrets. The mock
// path is the same defensive-parse + contract the live providers rely on.

import { diagnose } from '../api/diagnose';
import { FIXTURES, type EvalFixture } from './fixtures';

type DiagnoseResult = Awaited<ReturnType<typeof diagnose>>;
const REQUIRED_DTAGS = ['Delegation', 'Description', 'Discernment', 'Diligence'];

interface Check {
  fixture: string;
  ok: boolean;
  detail: string;
}

function assertContract(fixture: EvalFixture, result: DiagnoseResult): Check[] {
  const checks: Check[] = [];
  const err = (detail: string): Check => ({ fixture: fixture.name, ok: false, detail });

  // 1. parses into a result with a hypotheses array (never crashes)
  if (!Array.isArray(result.hypotheses)) {
    return [err('result.hypotheses is not an array')];
  }

  // 2. every hypothesis lives in the robotics fault taxonomy
  const badArea = result.hypotheses.find(
    (h) => !fixture.allowedAreas.includes(h.area)
  );
  if (badArea) {
    checks.push(err(`hypothesis area out of taxonomy: "${badArea.area}"`));
  } else {
    checks.push({
      fixture: fixture.name,
      ok: true,
      detail: `${result.hypotheses.length} hypotheses, all within fault taxonomy`,
    });
  }

  // 3. verifyFirst is exercised when expected (Discernment)
  const hasVerify = result.hypotheses.some((h) => h.verifyFirst);
  if (fixture.expectVerifyFirst && !hasVerify) {
    checks.push(err('expected a verifyFirst hypothesis (Discernment flag missing)'));
  } else {
    checks.push({
      fixture: fixture.name,
      ok: true,
      detail: hasVerify ? 'verifyFirst flag present' : 'verifyFirst not required for this fixture',
    });
  }

  // 4. the 4D tags are present (framework visible)
  const tagsOk =
    Array.isArray(result.dTags) &&
    REQUIRED_DTAGS.every((t) => result.dTags.includes(t as (typeof result.dTags)[number]));
  checks.push(
    tagsOk
      ? { fixture: fixture.name, ok: true, detail: `4D tags present: ${result.dTags.join(', ')}` }
      : err(`missing required 4D tags; got [${result.dTags?.join(', ') ?? ''}]`)
  );

  return checks;
}

async function main() {
  const verbose = process.argv.includes('--verbose');
  process.env.PROVIDER = 'mock'; // force the key-free path

  let pass = 0;
  let fail = 0;

  for (const fixture of FIXTURES) {
    const result = await diagnose(fixture.input);
    const checks = assertContract(fixture, result);
    for (const c of checks) {
      if (c.ok) {
        pass++;
        console.log(`  ✓ [${fixture.name}] ${c.detail}`);
      } else {
        fail++;
        console.error(`  ✗ [${fixture.name}] ${c.detail}`);
      }
    }
    if (verbose) {
      console.log(
        `    → ${JSON.stringify(result.hypotheses.map((h) => ({ area: h.area, v: h.verifyFirst })))}`
      );
    }
  }

  console.log(`\nBotMentor eval: ${pass} passed, ${fail} failed (${FIXTURES.length} fixtures).`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Eval harness error:', e);
  process.exit(1);
});
