# babysit-pr

Autonomous PR health monitor that checks CI status, reviews, comments, and merge conflicts, then automatically fixes issues it can and reports what requires manual intervention.

## Features

- **Auto-fixes CI failures** — lint, type-check, test, build failures
- **Diagnoses Jenkins umbrella checks** — uses shell scripts + Blue Ocean REST API to identify failing stages and fetch test results
- **Handles SonarQube failures** — extracts quality gate status, failed conditions, and coverage gaps
- **Tracks unresolved review threads** — uses GitHub GraphQL to distinguish resolved/unresolved/outdated comments
- **Handles PR-level comments** — surfaces human feedback from PR conversations
- **Handles merge conflicts** — fetches and rebases, asks for confirmation before force-pushing
- **Loop-aware** — designed for `/loop` mode, avoids duplicate work when CI is re-running

## Usage

```bash
/babysit-pr <PR_NUMBER>
```

Or use in loop mode to check every N minutes:

```bash
/loop 10m /babysit-pr 1234
```

## Requirements

### GitHub Enterprise

This skill supports GitHub Enterprise instances. It auto-detects the hostname from the PR URL and passes `--hostname` to GraphQL queries.

### Jenkins (shell scripts)

For Jenkins CI checks, this skill uses shell scripts that call the Jenkins Blue Ocean REST API directly via `curl`.

**Setup:**

1. Set credentials in `~/.zshrc`:
   ```bash
   export JENKINS_USERNAME=your-username
   export JENKINS_API_TOKEN=your-api-token
   ```
2. Optionally set SonarQube token (generate at `<sonar-server>/account/security`):
   ```bash
   export SONAR_TOKEN=your-sonar-token
   ```

> **Note:** `curl` must be excluded from RTK rewriting if RTK is installed. Add `exclude_commands = ["curl"]` to your RTK config.

## How It Works

1. **Collect PR state** — fetches PR metadata, checks, and review threads via `gh` CLI and GraphQL
2. **Fix blockers** in priority order:
   - **Failing CI checks** — maps check names to local commands or Jenkins scripts, reproduces and fixes failures
   - **Merge conflicts** — rebases onto base branch, asks for approval before force-push
   - **Review feedback** — presents analysis and proposed changes, waits for user approval
   - **PR-level comments** — surfaces human comments, waits for user approval before responding
3. **Report warnings** — draft status, pending checks, missing reviewers, etc.
4. **One fix per run** — after pushing a CI fix, stops and waits for CI to re-run

## What Gets Auto-Fixed

- Lint errors (`yarn lint`)
- Type errors (`yarn type-check`)
- Test failures (`yarn test`)
- Build failures (`yarn build`)

## What Requires Manual Approval

- Review feedback changes
- PR-level comment responses
- Merge conflict resolution (asks before force-push)
- SonarQube issues (reports findings, never auto-fixes)
- Unknown CI checks

## Files

- `SKILL.md` — AI agent instructions
- `scripts/collect-pr-state.sh` — Data collection script (GraphQL + gh CLI)
- `scripts/jenkins-url-helper.sh` — Shared helper: URL conversion + authenticated curl
- `scripts/fetch-build-info.sh` — Build status, stages, and console log tail
- `scripts/fetch-failed-tests.sh` — Failed test names, file paths, and error details
- `scripts/fetch-stage-log.sh` — Detailed stage/step logs, follows downstream jobs
- `scripts/fetch-sonar-results.sh` — SonarQube quality gate status and findings
- `README.md` — This file
