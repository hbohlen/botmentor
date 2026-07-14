# Runbooks — BotMentor

Operational procedures for anyone running BotMentor after the original author is gone.
Each runbook is a copy-paste sequence. Prereq: Vercel CLI installed (`npm i -g vercel`),
authenticated (`vercel whoami`), repo linked (`vercel link --project botmentor --scope hbohlen-systems1`).

## R1. Deploy a change
```bash
git push origin main          # Vercel auto-builds + redeploys production
vercel ls                     # confirm newest deployment shows ● Ready / Production
curl -s -X POST https://botmentor.vercel.app/api/diagnose \
  -H 'Content-Type: application/json' \
  -d '{"input":"left motor stutters"}' | head -c 120   # must be JSON, NOT "<!DOCTYPE"
```

## R2. Add or rotate an API key (provider credential)
Keys live in Vercel, NOT in the repo. Add (pipe avoids interactive prompt):
```bash
echo "<KEY>" | vercel env add DEEPSEEK_API_KEY production
vercel env add PROVIDER production            # value: deepseek
vercel env add DEEPSEEK_BASE_URL production   # value: https://api.deepseek.com
vercel env add DEEPSEEK_MODEL production      # value: deepseek-v4-flash
```
To rotate: `vercel env rm DEEPSEEK_API_KEY production` then re-add. Env changes trigger a redeploy.

## R3. Switch the demo between mock / deepseek / anthropic
- `mock` (default, no key, zero cost, canned answers): ensure `PROVIDER` is unset or `mock`.
- `deepseek` (real, cheap): `PROVIDER=deepseek` + `DEEPSEEK_API_KEY`.
- `anthropic` (production-grade): `PROVIDER=anthropic` + `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL=claude-sonnet-5`.
Vercel reads `PROVIDER` at function start; change it via `vercel env add PROVIDER production` then redeploy.

## R4. Run locally (development)
```bash
export PATH="$HOME/.local/share/mise/installs/node/22.23.1/bin:$PATH"
npm install --include=dev          # NOTE: this env has npm omit=dev globally; --include=dev is REQUIRED
cp .env.example .env               # fill keys if testing live providers
PROVIDER=mock PORT=8788 npx tsx src/server/index.ts   # Express proxy on :8788
npm run dev                        # Vite UI on :5173, proxies /api -> :8788
```

## R5. Troubleshooting (the two real failures we hit)
| Symptom in browser | Cause | Fix |
|---|---|---|
| `Unexpected token 'T', "The page c"...` | Browser called `/api/diagnose`, got Vercel's HTML 404 — the serverless function was NOT deployed (old commit, or `api/diagnose.ts` missing). | Deploy a commit that contains `api/diagnose.ts`. Verify with R1 curl. |
| `A server error has occurred` / `FUNCTION_INVOCATION_FAILED` in logs with `ERR_MODULE_NOT_FOUND: /var/task/api/engine` | Vercel's `@vercel/node` bundler **externalizes relative imports inside `api/`**. Any `import` from a sibling file (`./engine`, `../src/...`) is left as a bare specifier and fails at runtime. | Keep `api/diagnose.ts` fully self-contained — zero relative imports. Do NOT split the function into `./engine` + `./providers`. |
| `401` / "Protected deployment" when curling a `*.vercel.app` URL directly | Vercel Auth is on for preview deployments. | Probe the production alias `botmentor.vercel.app`, not the per-deploy URL. The app itself is unaffected. |

## R6. Add a new fault area to the mentor's vocabulary
Edit `SYSTEM_PROMPT` inside `api/diagnose.ts`: add the area to the `area:<...>` union list and (optionally) a mock hypothesis. Re-deploy (R1). No DB migration needed — the model reasons freely within the listed areas.

## R7. Add a new model provider
In `api/diagnose.ts` `diagnose()`, add an `else if (provider === 'yours')` branch that calls your endpoint and passes `SYSTEM_PROMPT` + user input, then `parseDiagnose(text)`. Keep the defensive JSON parse — never trust raw model output.
