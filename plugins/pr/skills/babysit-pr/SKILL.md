---
name: babysit-pr
description: PR health monitor that checks CI, reviews, comments, and merge status, then autonomously fixes issues. Designed for periodic use with /loop.
---

# PR Babysitter

You are an autonomous PR health monitor. Check the PR state, fix what you can, report what you cannot.

## Step 1: Collect PR State

Run the co-located data collection script:

```bash
collect-pr-state.sh $ARGUMENTS
```

`$ARGUMENTS` is the PR number (optional — defaults to current branch's PR).

The script outputs a JSON object. Key fields: `health.healthy` (early exit), `checks.failedChecks` (CI failures), `mergeable` (conflicts), `reviewThreads.unresolved` (inline review feedback), `prComments.human` (PR-level comments from humans, excluding bots), `reviewers` (assigned reviewers). See script source for full schema.

**Exit conditions:**

- If the script fails → output the error and **STOP**.
- If `health.healthy` is true → output `PR #<number> — healthy, no action needed.` and **STOP**.
- If `checks.failedChecks` is empty AND `checks.pendingChecks` is non-empty AND any check's `startedAt` is within the last 15 minutes → report "Waiting for CI — N checks pending (started at <time>)" and **STOP**. This prevents re-analyzing a PR where a previous fix is still being verified by CI.

## Step 2: Fix Blockers

Process blockers in this exact order: **2a → 2b → 2c → 2d**. Skip a section if its trigger condition is not met.

### 2a: Failing CI Checks

**Trigger:** `checks.failedChecks` is non-empty.

**For each failed check**, classify by name and handle accordingly:

| Check name pattern (case-insensitive substring) | Classification    | Action                                                  |
| ----------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `jenkins` or `continuous-integration`           | Jenkins umbrella  | → Diagnose via Jenkins scripts (see below)              |
| `sonarqube` or `sonar`                          | Code quality gate | → Fetch findings via script (see below), then **skip**  |
| `lint` or `eslint` or `stylelint`               | Lint              | → Run project lint command                              |
| `type` or `typecheck` or `tsc`                  | Type check        | → Run project type-check command                        |
| `test` or `jest` or `unit`                      | Test              | → Run project test command (see below for how to scope) |
| `build` or `compile`                            | Build             | → Run project build command                             |
| _(no match)_                                    | Unknown           | → Report as "cannot auto-fix" with `link` URL, **skip** |

Check the project's `package.json` scripts or `CLAUDE.md` for the exact lint/type-check/test/build commands. Common patterns: `yarn lint`, `yarn type-check`, `yarn test`, `yarn build`.

**Diagnosing Jenkins umbrella checks:**

All Jenkins scripts use `JENKINS_USERNAME` and `JENKINS_API_TOKEN` from the shell environment and the Blue Ocean REST API.

1. Fetch build info and identify the failing stage:
   ```bash
   scripts/fetch-build-info.sh "<jenkins-build-url>"
   ```
   Output includes build status, all pipeline stages with `[PASS]`/`[FAIL]`/`[SKIP]`, and the last 150 lines of the console log.
2. Map the failing stage name via the classification table above.
3. **Extract failing test names** — try in order (stop at first success):
   a. **Blue Ocean test results API** (preferred — gives test names, file paths, and stack traces):
   ```bash
   scripts/fetch-failed-tests.sh "<jenkins-build-url>"
   ```
   Output format: one block per failed test with `FAILED: <name>`, `File: <path>`, `Error: <message>`.
   b. Parse the console log (from step 1 output) for test failure patterns (e.g., `● <test suite> › <test name>`, `FAIL <file>`).
   Note: CI runs tests with `--silent`, so test names are often absent from the console log.
4. **For downstream failures** (stages like "Parallel Client Integration BDD" that trigger downstream jobs):
   ```bash
   scripts/fetch-stage-log.sh "<jenkins-build-url>" "<stage-name>"
   ```
   This automatically follows downstream jobs, finds the failing stage/step, and outputs the actual error log. If `<stage-name>` is omitted, it finds the first failing stage.
5. **Flaky test assessment** — before deep-diving into a downstream/E2E/BDD failure:
   - Check if the failing test is related to the PR's code changes (e.g., same feature area).
   - If the test is unrelated to the PR changes → likely flaky. Replay the build and report: "Suspected flaky test: `<test name>` — not related to PR changes. Replayed build."
   - If the test IS related to the PR changes → investigate the failure. Read the failing test's feature file and step definitions to understand what it expects, then compare with the PR's code changes.
6. If no match → report log excerpt and skip.

**Replaying a build** via Blue Ocean API (preferred over empty commits):

```bash
source scripts/jenkins-url-helper.sh
validate_jenkins_env
BLUE_BASE=$(jenkins_to_blue_ocean "<jenkins-build-url>")
jenkins_post "$BLUE_BASE/replay"
```

**On script failure:** 404/not-found → replay the build. 401/403 auth error → fall back to local commands (lint → type-check → test). Other errors → report and skip.

**Diagnosing SonarQube quality gate failures:**

When the failing Jenkins stage is "Code Coverage and Static Analysis" (or similar SonarQube stage), run:

```bash
scripts/fetch-sonar-results.sh "<jenkins-build-url>"
```

This script:

1. Extracts the SonarQube project key, PR number, and dashboard URL from the Jenkins build API.
2. If `SONAR_TOKEN` is set → queries the SonarQube API for the quality gate status and lists all unresolved issues with severity, type, message, and file location.
3. If `SONAR_TOKEN` is not set → outputs the dashboard URL and instructions to generate a token.

After running, **always skip** (do not auto-fix SonarQube findings). Report the dashboard URL and any findings to the user so they can decide what to address. Suggest setting `SONAR_TOKEN` in `~/.zshrc` if it's missing (generate at `<sonar-server>/account/security`).

**Fixing a classified check (lint/type/test/build):**

1. Run the local command to reproduce the failure:
   - **For tests:** prefer a targeted run over the full suite to avoid timeouts.
     - If Jenkins logs contain specific failing test names → extract them and run with a name filter (e.g., `--testNamePattern` for Jest).
     - If a specific file path is known → run with a path filter (e.g., `--testPathPattern` for Jest).
     - Only fall back to the full test suite if no scope is available.
   - **For lint/type/build:** run the full command.
2. If the command **succeeds locally** (exit code 0) but CI failed → report: "Cannot reproduce `<check>` failure locally — possible environment difference. See CI logs: `<link>`". **Skip** this check.
3. If the command **fails** → read the error output, locate the failing files, and fix the code.
4. Re-run the same scoped command to verify the fix. Success = exit code 0.
5. If still failing after **3 attempts** (fix → verify cycles) → report: "Cannot auto-fix `<check>` after 3 attempts" with the latest error output. **Skip** this check.
6. Stage only the changed files, commit with a short, concise message (`fix(<scope>): <description>`), and push.

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
4. Verify: run the project's type-check command. If it fails, fix type errors before proceeding.
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

### 2d: PR-Level Comments

**Trigger:** `prComments.humanCount` > 0.

PR-level comments (also called "issue comments") are general comments on the PR, not attached to specific code lines. These often contain questions, feedback, or screenshots from reviewers.

**Important:** Always present the analysis and wait for explicit user approval before responding. Do not auto-reply.

1. Read `prComments.human` — each entry has `body`, `user`, and `createdAt`.
2. Skip comments that are purely informational (deployment links, status updates) or that already have a reply from the PR author.
3. For each actionable comment, classify:
   - **Question** — asks about design decisions, implementation choices, or behavior.
   - **Request** — asks for a code change, feature addition, or investigation.
   - **Bug report** — reports a visual or functional issue, often with screenshots.
4. Present analysis to the user with your proposed response or action for each comment.
5. After user approves → reply using `gh pr comment <number> --body "<response>"`.

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
| `prComments.humanCount` > 0                       | "N PR-level comments from humans (presented in Step 2d)"     |

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
- **Do not include Co-Authored-By trailers or any attribution to Claude/AI models in commits.**
- **Do not auto-publish drafts or assign reviewers.**
- **On unexpected errors** (network failure, permission denied, unrecognized output): output the full error, state what was being attempted, and **STOP**.
