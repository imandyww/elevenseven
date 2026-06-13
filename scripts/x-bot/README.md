# X bot — automated marketing + feedback loop

Posts a tweet about [elevenseven.ai](https://elevenseven.ai) every 2 hours and
turns replies/mentions into GitHub issues labeled `from-x-feedback`.

Runs as a GitHub Actions cron (`.github/workflows/x-bot.yml`). Each run:

1. **Post** — picks the next content angle (round-robin over 6 angles), pulls
   the live catalog from `/api/agent-catalog` (bundled fallback if that's
   down), has Claude (`claude-sonnet-4-6`) write a fresh ≤280-char tweet that
   must differ from the last 10, and posts it. If Claude is unavailable or X
   rejects a duplicate, a handwritten template variant is used instead.
2. **Feedback** — fetches new mentions since the last run (`since_id`
   cursor), triages each with Claude into
   `feature_request / bug_report / question / spam / other`, and files a
   GitHub issue for the first two. Double dedupe (cursor + triaged-ID list)
   guarantees one issue per tweet, ever.

State (`state.json`: cursor, recent posts, angle pointer, triaged IDs) is
committed to the dedicated **`x-bot-state`** branch — never `main`, so Amplify
doesn't redeploy 12×/day. A failed run shows red in the Actions tab and GitHub
emails the repo owner; that's the alerting.

## One-time manual setup (can't be automated)

X prohibits scripted signup, so steps 1–3 are by hand (~10 minutes):

1. **Create the X account** (e.g. `@elevenseven_ai`). In Settings → Your
   account → Automation, **label it as an automated account** and attach your
   personal account as the manager — required by X automation rules. Put
   https://elevenseven.ai in the bio.
2. **Create a developer app** at https://developer.x.com: new Project + App →
   User authentication settings → enable **OAuth 1.0a** with app permissions
   **Read and Write**. Enable pay-per-use billing (~$0.01/post, ~$0.005/read →
   roughly $5–8/month at this cadence, plus ~$3–5/month Claude API).
3. **Generate the Access Token & Secret _after_ setting Read and Write.**
   Tokens minted before the permission change are read-only — if posting 403s
   with an oauth1-permissions error, regenerate them.
4. **Add the five repo secrets** (Settings → Secrets and variables → Actions):
   - `X_API_KEY` — consumer key ("API Key")
   - `X_API_SECRET` — consumer secret
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_TOKEN_SECRET`
   - `ANTHROPIC_API_KEY`
5. **Create the label:**
   `gh label create from-x-feedback --color FBCA04 --description "Feedback triaged from X replies"`
6. **Fix the production 404s** on `/api/agent-catalog` and
   `/.well-known/agent-commerce.json` (they 404 on elevenseven.ai as of
   2026-06-13 even though the routes exist in the repo) — until then the bot
   always uses its bundled catalog snapshot and the "discovery-endpoints"
   angle points at dead links.

## Testing

```sh
# Local dry run (no X creds needed; composes but never posts)
DRY_RUN=true ANTHROPIC_API_KEY=sk-ant-... npm run xbot:run

# Claude-failure drill: verify the template fallback path
DRY_RUN=true ANTHROPIC_API_KEY=bogus npm run xbot:run
```

Then in GitHub: Actions → x-bot → Run workflow with `dry_run` checked (no
post, green run), then unchecked for the first real post. Reply to that tweet
from a personal account and dispatch again to see the issue get filed; a third
dispatch must NOT file a duplicate.

The cron schedule activates once the workflow file is on the default branch.
