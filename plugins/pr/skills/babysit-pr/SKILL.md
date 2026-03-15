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

This outputs a single JSON object with these fields:

| Field                           | Type    | Description                                                                                     |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `number`                        | number  | PR number                                                                                       |
| `title`                         | string  | PR title                                                                                        |
| `url`                           | string  | PR URL                                                                                          |
| `state`                         | string  | `OPEN`, `CLOSED`, `MERGED`                                                                      |
| `isDraft`                       | boolean | Draft PR flag                                                                                   |
| `headRefName`                   | string  | Source branch name                                                                              |
| `baseRefName`                   | string  | Target branch name                                                                              |
| `mergeable`                     | string  | `MERGEABLE`, `CONFLICTING`, or `UNKNOWN`                                                        |
| `reviewDecision`                | string  | `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or `"null"`                                 |
| `behindCount`                   | number  | Commits behind base branch                                                                      |
| `checks.failedChecks`           | array   | `{name, link, description}` for each failed check                                               |
| `checks.pendingChecks`          | array   | `{name, startedAt}` for each pending check                                                      |
| `reviewThreads.total`           | number  | Total review threads                                                                            |
| `reviewThreads.unresolvedCount` | number  | Unresolved, non-outdated threads needing attention                                              |
| `reviewThreads.unresolved`      | array   | `{isResolved, isOutdated, path, line, comments[]}` — each comment has `{body, user, createdAt}` |
| `reviewThreads.outdatedCount`   | number  | Threads on code that has since changed                                                          |
| `reviewThreads.resolvedCount`   | number  | Threads marked as resolved                                                                      |
| `health.healthy`                | boolean | True if zero blockers and zero warnings                                                         |
| `health.blockers`               | number  | Count of blockers (failed checks, conflicts, changes requested)                                 |
| `health.warnings`               | number  | Count of warnings (draft, pending, no reviewers, etc.)                                          |

**Exit conditions:**

- If the script fails → output the error and **STOP**.
- If `health.healthy` is true → output `PR #<number> — healthy, no action needed.` and **STOP**.

## Step 2: Fix Blockers

Process blockers in this exact order: **2a → 2b → 2c**. Skip a section if its trigger condition is not met.

### 2a: Failing CI Checks

**Trigger:** `checks.failedChecks` is non-empty.

**Skip (loop awareness):** Before processing, check if `checks.failedChecks` is empty but `checks.pendingChecks` is non-empty. Compare each pending check's `startedAt` to now — if any check started within the last 15 minutes, a previous fix is likely being verified. Report "Waiting for CI — N checks pending (started at <time>)" and **STOP**.

**For each failed check**, classify by name and handle accordingly:

| Check name pattern (case-insensitive substring) | Classification    | Action                                                          |
| ----------------------------------------------- | ----------------- | --------------------------------------------------------------- |
| `jenkins` or `continuous-integration`           | Jenkins umbrella  | → Diagnose via Jenkins MCP (see below)                          |
| `sonarqube` or `sonar`                          | Code quality gate | → Report `link` URL to user, **skip** (requires human judgment) |
| `lint` or `eslint` or `stylelint`               | Lint              | → Run `yarn lint`                                               |
| `type` or `typecheck` or `tsc`                  | Type check        | → Run `yarn type-check`                                         |
| `test` or `jest` or `unit`                      | Test              | → Run `yarn test`                                               |
| `build` or `compile`                            | Build             | → Run `yarn build`                                              |
| _(no match)_                                    | Unknown           | → Report as "cannot auto-fix" with `link` URL, **skip**         |

**Diagnosing Jenkins umbrella checks:**

1. Call the Jenkins MCP tool `get_job_details` with the check's `link` URL.
2. Parse the console log for stage names. Map stages using the same pattern table above (e.g., stage containing "lint" → `yarn lint`, "type" → `yarn type-check`, etc.).
3. If no stage name matches, report the relevant log excerpt to the user and **skip**.

**If Jenkins MCP fails:**

- **404 or null build** → Report: "Jenkins build logs expired. Re-trigger CI with: `git commit --allow-empty -m 'chore: retrigger CI' && git push`". **Skip** this check.
- **Auth error (401/403)** → Report the error. Fall back: run `yarn lint`, then `yarn type-check`, then `yarn test` sequentially. Stop at first failure and fix that.
- **Other error** → Report the error and `link` URL. **Skip** this check.

**Fixing a classified check (lint/type/test/build):**

1. Run the local command to reproduce the failure.
2. If the command **succeeds locally** (exit code 0) but CI failed → report: "Cannot reproduce `<check>` failure locally — possible environment difference. See CI logs: `<link>`". **Skip** this check.
3. If the command **fails** → read the error output, locate the failing files, and fix the code.
4. Re-run the same command to verify the fix. Success = exit code 0.
5. If still failing after **3 attempts** (fix → verify cycles) → report: "Cannot auto-fix `<check>` after 3 attempts" with the latest error output. **Skip** this check.
6. Stage only the changed files, commit (`fix(<scope>): <description>`), and push.

After pushing a fix, **STOP**. Do not process remaining failed checks — let CI re-run and re-invoke the skill on the next /loop cycle to check the result.

### 2b: Merge Conflicts

**Trigger:** `mergeable` equals `CONFLICTING`.

1. Fetch and rebase:
   ```bash
   git fetch origin <baseRefName> && git rebase origin/<baseRefName>
   ```
2. If conflicts arise, read both sides of each conflict marker:
   - If changes are in **different logical areas** (non-overlapping edits) → accept both sides.
   - If changes **conflict semantically** (same line/block modified differently) → present both versions with surrounding context to the user and **ask which to keep**. Do not guess merge intent.
3. After resolving all conflicts: `git add <resolved files> && git rebase --continue`.
4. Verify: run `yarn type-check`. If it fails, fix type errors before proceeding.
5. **Ask the user before force-pushing.** If approved → `git push --force-with-lease`. If rejected → run `git rebase --abort` and report "Merge conflicts require manual resolution."

### 2c: Review Feedback

**Trigger:** `reviewThreads.unresolvedCount` > 0 (regardless of `reviewDecision` — reviewers often leave comments without formally requesting changes).

**Important:** This step requires user interaction. If running via `/loop`, present the analysis in the Step 4 summary and **STOP** — do not make changes without explicit user approval.

1. Read `reviewThreads.unresolved` from the JSON — each thread has `path`, `line`, and `comments[]` (each comment has `body`, `user`, `createdAt`). Focus on the **first comment** in each thread (the reviewer's original feedback); subsequent comments are replies/discussion.
2. For each unresolved thread, classify:
   - **Requires code change** — comment contains action words (change, fix, remove, add, update, rename, use, replace) or code suggestions (inline code blocks).
   - **Discussion/question** — comment ends with `?`, or contains "why", "how", "could you explain", "what about", "thoughts on".
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
  - <commitSHA 7-char> <scope>: <description>
  - (or "None")

Remaining Issues:
  - <issue and why it needs attention>
  - (or "None")
```

## Rules

- **Fix CI failures autonomously.** Lint, types, tests, builds are mechanical — fix and push without asking.
- **Do not auto-fix review feedback.** Present proposed changes, wait for explicit user approval.
- **Do not force-push without confirmation.**
- **Do not auto-publish drafts or assign reviewers.**
- **One fix per run.** After pushing a CI fix, STOP and let CI re-run. The next /loop cycle will pick up remaining issues.
- **Verify before pushing.** Run the relevant check locally and confirm exit code 0 before committing.
- **Fix only the reported issue.** Do not refactor unrelated code. If project standards require formatting changes in the same file (e.g., auto-fix from linter), include them in the same commit.
- **Conventional commits.** `fix(scope): description`, `style(scope): lint fix`, etc.
- **Follow project standards.** All code changes must follow `docs/coding-standards.md`.
- **On unexpected errors** (network failure, permission denied, unrecognized output): output the full error, state what was being attempted, and **STOP**. Do not proceed to the next step.
