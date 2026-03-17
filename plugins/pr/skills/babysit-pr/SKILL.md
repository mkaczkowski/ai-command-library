---
name: babysit-pr
description: PR health monitor that checks CI, reviews, comments, and merge status, then autonomously fixes issues. Designed for periodic use with /loop.
---

# PR Babysitter

You are an autonomous PR health monitor. Check the PR state, fix what you can, report what you cannot.

## Step 1: Collect PR State

Run the co-located data collection script:

```bash
.claude/skills/babysit-pr/collect-pr-state.sh $ARGUMENTS
```

`$ARGUMENTS` is the PR number (optional — defaults to current branch's PR).

The script outputs a JSON object. Key fields: `health.healthy` (early exit), `checks.failedChecks` (CI failures), `mergeable` (conflicts), `reviewThreads.unresolved` (review feedback), `reviewers` (assigned reviewers). See script source for full schema.

**Exit conditions:**

- If the script fails → output the error and **STOP**.
- If `health.healthy` is true → output `PR #<number> — healthy, no action needed.` and **STOP**.
- If `checks.failedChecks` is empty AND `checks.pendingChecks` is non-empty AND any check's `startedAt` is within the last 15 minutes → report "Waiting for CI — N checks pending (started at <time>)" and **STOP**. This prevents re-analyzing a PR where a previous fix is still being verified by CI.

## Step 2: Fix Blockers

Process blockers in this exact order: **2a → 2b → 2c**. Skip a section if its trigger condition is not met.

### 2a: Failing CI Checks

**Trigger:** `checks.failedChecks` is non-empty.

**For each failed check**, classify by name and handle accordingly:

| Check name pattern (case-insensitive substring) | Classification    | Action                                                  |
| ----------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `jenkins` or `continuous-integration`           | Jenkins umbrella  | → Diagnose via Jenkins MCP (see below)                  |
| `sonarqube` or `sonar`                          | Code quality gate | → Report `link` URL to user, **skip**                   |
| `lint` or `eslint` or `stylelint`               | Lint              | → Run `yarn lint`                                       |
| `type` or `typecheck` or `tsc`                  | Type check        | → Run `yarn type-check`                                 |
| `test` or `jest` or `unit`                      | Test              | → Run `yarn test`                                       |
| `build` or `compile`                            | Build             | → Run `yarn build`                                      |
| _(no match)_                                    | Unknown           | → Report as "cannot auto-fix" with `link` URL, **skip** |

**Diagnosing Jenkins umbrella checks:**

1. Call `get_job_details` with the check's `link` URL.
2. Parse console log for stage names → map via classification table above.
3. For downstream failures (`Downstream Job failed!!` pattern):
   call `get_job_details` on the downstream URL.
   If 404 → try `list_artifacts` on parent. If no artifacts → suggest re-triggering CI.
4. If failure is in E2E/integration tests → report as non-local, suggest re-trigger.
5. If no match → report log excerpt and skip.

**On MCP failure:** 404/null → suggest retrigger with empty commit. 401/403 → fall back to local commands (lint → type-check → test). Other → report and skip.

**Fixing a classified check (lint/type/test/build):**

1. Run the local command to reproduce the failure.
2. If the command **succeeds locally** (exit code 0) but CI failed → report: "Cannot reproduce `<check>` failure locally — possible environment difference. See CI logs: `<link>`". **Skip** this check.
3. If the command **fails** → read the error output, locate the failing files, and fix the code.
4. Re-run the same command to verify the fix. Success = exit code 0.
5. If still failing after **3 attempts** (fix → verify cycles) → report: "Cannot auto-fix `<check>` after 3 attempts" with the latest error output. **Skip** this check.
6. Stage only the changed files, commit (`fix(<scope>): <description>`), and push.

After pushing a fix, **STOP**. Do not process remaining failed checks — let CI re-run and re-invoke the skill on the next /loop cycle.

### 2b: Merge Conflicts

**Trigger:** `mergeable` equals `CONFLICTING`.

1. Fetch and rebase:
   ```bash
   git fetch origin <baseRefName> && git rebase origin/<baseRefName>
   ```
2. If conflicts arise, read both sides of each conflict marker:
   - For non-overlapping edits in **separate files/functions** → accept both sides.
   - For overlapping edits in the **same block** → present both versions with surrounding context to the user and **ask which to keep**.
3. After resolving all conflicts: `git add <resolved files> && git rebase --continue`.
4. Verify: run `yarn type-check`. If it fails, fix type errors before proceeding.
5. **Ask the user before force-pushing.** If approved → `git push --force-with-lease`. If rejected → run `git rebase --abort` and report "Merge conflicts require manual resolution."

### 2c: Review Feedback

**Trigger:** `reviewThreads.unresolvedCount` > 0.

**Important:** Always present the analysis and wait for explicit user approval before making changes. Do not auto-fix review feedback.

1. Read `reviewThreads.unresolved` — each thread has `path`, `line`, and `comments[]` (each with `body`, `user`, `createdAt`). Focus on the **first comment** in each thread (the reviewer's original feedback).
2. For each unresolved thread, classify:
   - **Requires code change** — contains action words (change, fix, remove, add, update, rename, use, replace) or code suggestions (inline code blocks).
   - **Discussion/question** — ends with `?`, or contains "why", "how", "could you explain", "what about", "thoughts on".
   - **Ambiguous** — does not clearly fit either category.
3. Present analysis to the user: list each comment with its classification and your proposed change (or "no action needed" for discussions).
4. After user approves specific changes → make edits, commit, push, and reply:
   ```bash
   gh pr comment <number> --body "Addressed review feedback: <summary>"
   ```

## Step 3: Report Warnings

After processing all blockers, report each applicable warning. Do not auto-fix these.

| Condition                                         | Output                                                       |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `isDraft` is true                                 | "PR is in draft mode"                                        |
| `checks.pendingChecks` is non-empty               | "N checks pending — waiting for CI"                          |
| `reviewDecision` is `REVIEW_REQUIRED` or `"null"` | "Awaiting code review"                                       |
| `reviewers` array is empty                        | "No reviewers assigned — consider adding reviewers"          |
| `reviewThreads.unresolvedCount` > 0               | "N unresolved review threads (presented in Step 2c)"         |
| `reviewThreads.outdatedCount` > 0                 | "N outdated review threads (code has changed since comment)" |
| `behindCount` > 0                                 | "Branch is N commits behind `<baseRefName>`"                 |

## Step 4: Summary

Always output this format:

```
PR #<number> Status
===================
Branch: <headRefName> -> <baseRefName>

Actions Taken:
  - <7-char SHA> <scope>: <description> (from fixes made in this run)
  - (or "None")

Remaining Issues:
  - <issue and why it needs attention>
  - (or "None")
```

## Rules

- **Fix CI failures autonomously.** Lint, types, tests, builds are mechanical — fix and push without asking.
- **Fix only the reported issue.** Do not refactor unrelated code. Include auto-fix formatting changes from linters in the same commit.
- **Conventional commits.** `fix(scope): description`, `style(scope): lint fix`, etc.
- **Follow project standards.** All code changes must follow `docs/coding-standards.md`.
- **Do not auto-publish drafts or assign reviewers.**
- **On unexpected errors** (network failure, permission denied, unrecognized output): output the full error, state what was being attempted, and **STOP**.
