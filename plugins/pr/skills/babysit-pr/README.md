# babysit-pr

Autonomous PR health monitor that checks CI status, reviews, comments, and merge conflicts, then automatically fixes issues it can and reports what requires manual intervention.

## Features

- **Auto-fixes CI failures** — lint, type-check, test, build failures
- **Diagnoses Jenkins umbrella checks** — uses Jenkins MCP to read console logs and identify which stage failed
- **Tracks unresolved review threads** — uses GitHub GraphQL to distinguish resolved/unresolved/outdated comments
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

### Jenkins MCP Server

For Jenkins CI checks, this skill uses the `mcp-server-jenkins` tool to fetch console logs. If not configured, it will fall back to running all local checks sequentially.

**Setup:**

1. Install mcp-server-jenkins: https://github.com/your-org/mcp-server-jenkins
2. Configure in `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "mcp-server-jenkins": {
         "command": "uv",
         "args": ["--directory", "/path/to/mcp-server-jenkins", "run", "run_server.py"],
         "env": {
           "JENKINS_OUTPUT_DIR": "/tmp/jenkins-context"
         }
       }
     }
   }
   ```
3. Add credentials to `.env` in the mcp-server-jenkins directory:
   ```
   JENKINS_USERNAME=your-username
   JENKINS_API_TOKEN=your-api-token
   ```

## How It Works

1. **Collect PR state** — fetches PR metadata, checks, and review threads via `gh` CLI and GraphQL
2. **Fix blockers** in priority order:
   - **Failing CI checks** — maps check names to local commands, reproduces and fixes failures
   - **Merge conflicts** — rebases onto base branch, asks for approval before force-push
   - **Review feedback** — presents analysis and proposed changes, waits for user approval
3. **Report warnings** — draft status, pending checks, missing reviewers, etc.
4. **One fix per run** — after pushing a CI fix, stops and waits for CI to re-run

## What Gets Auto-Fixed

- Lint errors (`yarn lint`)
- Type errors (`yarn type-check`)
- Test failures (`yarn test`)
- Build failures (`yarn build`)

## What Requires Manual Approval

- Review feedback changes
- Merge conflict resolution (asks before force-push)
- SonarQube issues (reports URL only)
- Unknown CI checks

## Files

- `SKILL.md` — AI agent instructions
- `collect-pr-state.sh` — Data collection script (GraphQL + gh CLI)
- `README.md` — This file
