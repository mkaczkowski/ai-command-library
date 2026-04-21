---
description: 'Produce an expert GitHub PR review with actionable inline findings using 4 parallel review agents.'
---

# GitHub Pull Request Review Workflow

Act as a staff-level engineer and seasoned reviewer responsible for producing a professional GitHub PR review. Use 4 parallel review agents to analyze the PR, then convert findings into actionable inline comments for submission.

## Step 1: Review and Prepare Findings

### Phase 1: Gather PR Context

1. Collect PR metadata:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
node "$REPO_ROOT/.cursor/commands/pr/scripts/fetch-pr-context.js" --pr=[PR_NUMBER] --output="$REPO_ROOT/tmp/pr-[PR_NUMBER]-context.json"
```

2. Read `$REPO_ROOT/tmp/pr-[PR_NUMBER]-context.json` and extract:
   - `number`, `title`, `author`, `state`
   - `branches.base.ref` and `branches.head.ref`
   - `stats` (additions, deletions, changedFiles)
   - `body` (PR description)

3. Store these as `PR_META` for the review header in Phase 4.

4. Checkout the PR branch to ensure local files match the PR HEAD:
   ```bash
   gh pr checkout [PR_NUMBER]
   ```
   If this fails due to uncommitted changes, ask the user to stash or commit first.

5. Determine the diff command:
   ```bash
   DIFF_CMD="git diff origin/<base_ref>...HEAD"
   ```
   Where `<base_ref>` is `branches.base.ref` from the PR context.

### Phase 2: Launch 4 Review Agents in Parallel

Send exactly **1 message** containing all 4 Agent tool calls. All agents run in parallel.

**Agent call 1** -- Use `subagent_type: "full-review:full-reviewer-correctness"`. Prompt:

```
Review the code changes for correctness issues (logic, bugs, security, performance, test coverage).

Run this command to see the changes: {{DIFF_CMD}}

Read each changed file in full for context before reviewing.

PR description for context:
{{PR_BODY}}
```

**Agent call 2** -- Use `subagent_type: "full-review:full-reviewer-conventions"`. Prompt:

```
Review the code changes for convention and quality issues (code quality, reusability, architecture conformance).

Run this command to see the changes: {{DIFF_CMD}}

Read each changed file in full for context. Search the codebase for existing utilities and patterns before flagging reuse issues.
```

**Agent call 3** -- Use `subagent_type: "cursor-consult:cursor-reviewer"`. Prompt:

```
Review the code changes on the current branch.
```

**Agent call 4** -- Use `subagent_type: "qodo-consult:qodo-reviewer"`. Prompt:

```
Run a self-review of all code changes on the current branch.
```

Wait for ALL agents to return. External agent failures (cursor, qodo) are non-blocking.

### Phase 3: Synthesize Results and Build JSON

#### 3a. Parse Internal Agent Findings

Internal agents (correctness, conventions) output structured lines:

```
FILE: <path> | LINE: <number> | PRIORITY: [Critical|High|Medium] | ISSUE: <description> | SUGGESTION: <fix>
```

For each finding, build a JSON comment object:

```json
{
  "path": "<path>",
  "line": <number>,
  "body": "<severity_prefix> - <issue_description>\n\n**Suggestion:** <fix>"
}
```

**Priority-to-severity mapping for the body prefix:**
- `Critical` -> `**Blocker**`
- `High` -> `**Major**`
- `Medium` -> `**Minor**`

#### 3b. Parse External Agent Findings

External agents (cursor, qodo) output freeform text. Extract any findings that reference specific files and line numbers. Convert those to JSON comment objects using the same format above.

Findings without file/line references go into the review body summary (used in Step 2).

#### 3c. Cross-Analysis

Compare findings across all agents:
- When 2+ agents flag the same file and similar issue, note it as a high-confidence finding. Elevate the priority if not already Critical.
- Deduplicate: if multiple agents found the same issue at the same file+line, keep one comment with the clearest description. Mention the agreeing agents in the body (e.g., "Flagged by correctness reviewer and qodo reviewer").

#### 3d. Rewrite into Review Comments

The agent output is terse (e.g., `ISSUE: Missing null check | SUGGESTION: Add optional chaining`). Rewrite each finding into a well-crafted GitHub review comment body.

**Use the `/pr-style` skill** to guide the tone, formatting, and structure of each comment body. Invoke it before writing comments to load the style rules.

For each finding:

1. Start with the severity prefix and a short descriptive title: `**Blocker** - Missing null check on API response`
2. Write 1-3 sentences explaining the problem. Cite the specific function, variable, or expression name.
3. Add a `**Suggestion:**` section. If the fix is non-obvious, include a concrete code snippet.
4. Follow all formatting and tone rules from `/pr-style`.

Example transformation:

Agent output:
```
FILE: src/api/client.ts | LINE: 42 | PRIORITY: Critical | ISSUE: response.data accessed without null check, will throw if API returns empty body | SUGGESTION: Add optional chaining: response.data?.user
```

Rewritten comment body:
```
**Blocker** - Null access on API response

`response.data` is accessed at line 42 without checking if the response body is defined. If the API returns an empty or error response, this will throw a runtime TypeError.

**Suggestion:** Add optional chaining: `response.data?.user`
```

#### 3e. Write JSON

Save the comment array to `$REPO_ROOT/tmp/pr-[PR_NUMBER]-review-comments.json`:

```json
[
  {
    "path": "src/components/Card.tsx",
    "body": "**Blocker** - Shadowed token reuse\n\nThe `token` variable shadows...\n\n**Suggestion:** Rename to `refreshToken`.",
    "line": 128
  }
]
```

Validate the JSON: every entry must have `path` (string), `body` (string), and `line` (integer). Remove entries missing any of these fields.

If no findings were produced (all agents returned "No issues found"), output `[]` and inform the user: "No issues found across all 4 review agents. Nothing to submit." Then STOP, do not proceed to Phase 4.

### Phase 4: Present Review Summary

Output the review summary for the user:

````markdown
# PR Review Feedback

**PR:** #[number] - [title]
**Author:** [author]
**Branches:** [head_ref] -> [base_ref]
**Stats:** +[additions] -[deletions] across [changedFiles] files
**Agents:** [N]/4 completed

---

## Findings ([total] issues: [critical] blocker, [high] major, [medium] minor)

[For each finding, show:]
### [N]. [Severity] - [Short title]
**File:** `[path]#L[line]`
[Issue description]
**Suggestion:** [fix]

## Cross-Model Agreements
[Bullet list of findings flagged by 2+ agents]

## Review Body Summary
[1-2 paragraph summary of the overall change quality, incorporating external agent perspectives. This becomes the review body text when submitting.]
````

Then ask: **"Continue to Step 2: Finalize and Submit?"**

If the user is not ready, stop here.

## Step 2: Finalize and Submit

1. Double-check `$REPO_ROOT/tmp/pr-[PR_NUMBER]-review-comments.json` for empty bodies, missing locations, or malformed JSON.
2. Confirm that each comment targets a file that exists in the PR diff (cross-reference with `$REPO_ROOT/tmp/pr-[PR_NUMBER]-context.json` files list).

**Important:** Use only the provided scripts for creating and sending data to GitHub. **NEVER use `gh pr review` command in any form.**

3. Submit the review:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
node "$REPO_ROOT/.cursor/commands/pr/scripts/create-pr-review.js" --input="$REPO_ROOT/tmp/pr-[PR_NUMBER]-review-comments.json" --pr=[PR_NUMBER]
```

**Note:** If it fails because of existing pending reviews, ask the user to add `--discard-existing` flag. If the user agrees:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
node "$REPO_ROOT/.cursor/commands/pr/scripts/create-pr-review.js" --input="$REPO_ROOT/tmp/pr-[PR_NUMBER]-review-comments.json" --pr=[PR_NUMBER] --discard-existing
```
