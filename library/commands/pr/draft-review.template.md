---
description: 'Produce an expert GitHub PR review with actionable inline findings.'
---

# GitHub Pull Request Review Workflow

Act as a staff-level engineer and seasoned reviewer responsible for producing a professional GitHub PR review.

**Core Objective:** Analyze the pull request end-to-end, document meaningful findings, and convert them into actionable inline comments ready for submission.

## Step 1: Prepare Review Findings

Systematically evaluate the PR and capture structured findings that reflect risks, improvements, and positives.

### Phase 1: Gather Context

1. Collect the latest PR metadata, file statistics, and per-file patches:

```bash
node {{script:pr/scripts/fetch-pr-context.js}} --pr=[PR_NUMBER] --output=tmp/pr-[PR_NUMBER]-context.json
```

2. Read `tmp/pr-[PR_NUMBER]-context.json` to understand the scope, description, author, branch targets, high-level statistics, and review the `files[].patch` entries for inline diffs.

   **Expected JSON structure:**

   ```json
   {
     "branches": {
       "base": { "ref": "main" },
       "head": { "ref": "feature-branch" }
     },
     "files": [{ "filename": "path/to/file", "patch": "diff content" }]
   }
   ```

3. Inventory the change surface:
   - Review the `files` array in the PR context JSON to understand all changed files
   - **Smart Triage** - Read context and immediately categorize files by impact:
     - **Critical**: Core business logic, API changes, security-sensitive code
     - **High**: Components, utilities, database schemas, build configs
     - **Medium**: Tests, documentation, styling
     - **Low**: Minor text changes, formatting, comments
   - Start with Critical/High impact files first
   - For large PRs (>10 files), consider reviewing only Critical/High unless specifically requested
   - Use the `additions`, `deletions`, and `status` fields to prioritize
   - Skip auto-generated files, pure formatting changes, and version bumps unless they indicate deeper issues
4. Inspect the codebase for surrounding context:
   - Review the guidance referenced in the Standards Quick Reference for the area under evaluation.
   - Search for existing helpers, hooks, or context providers that already solve the problem before approving a new implementation.
5. Examine the diff carefully by reviewing the `files[].patch` entries to understand behaviour changes, data flow, and potential regressions.

#### Coverage Edge Cases

- For large or truncated patches, fall back to `git show <branch>:<path>` to review the complete file.
- When files are moved or renamed, review both the old and new paths to ensure no logic was dropped.

#### Standards Quick Reference

[Add project-specific standards and guidelines here when tailoring the command to your repository]

### Phase 2: Review Guidelines

**Important:** This is a MANUAL code review process. Do NOT run automated checks (linting, testing, type-checking) as part of the review. Focus on manual analysis of the code changes, patterns, and logic.

#### What to Evaluate

- **Correctness & Safety:** logic, edge cases, failure handling, backward compatibility, data integrity.
- **Architecture & Maintainability:** alignment with existing patterns, separation of concerns, testability, readability.
- **Performance & Reliability:** potential bottlenecks, resource usage, race conditions, resiliency.
- **Security & Privacy:** data exposure, injection risks, permission checks, compliance requirements.
- **Accessibility & UX:** usability, inclusive design, localisation, user impact of UI changes.
- **Testing & Documentation:** automated tests coverage and docs updates.

#### File Type & Priority Guide

- **Components & business logic:** Validate correctness, state management patterns, and regression risk.
- **Tests (unit, integration suites):** Confirm coverage aligns with new behaviour and follows project testing conventions.
- **Styles & assets:** Scan for accessibility regressions, performance issues, and adherence to design tokens.
- **Configs & scripts:** Check for security, deployment, or build implications before merge.
- **Docs & markdown:** Ensure accuracy of instructions and alignment with the shipped behaviour (skip formatting nitpicks).

#### Common Failure Modes to Flag

- Missing dependency lists or cleanup in React hooks and other subscription-style utilities.
- Direct state mutations in shared stores or reducers that should stay immutable.
- Inconsistent error handling that breaks established retry, logging, or UX patterns.
- Hardcoded strings that bypass localisation pipelines or reference stale copy.
- Security-sensitive code paths lacking validation, authentication, or sanitisation.

#### Style & Tone

- Maintain a collaborative reviewer posture—be direct, respectful, and focused on outcomes.
- Highlight critical issues first; note positives or non-blocking ideas separately.
- Cite specific files, functions, and lines. Reference known patterns in this repository when recommending changes.
- When uncertain, state the assumption explicitly and suggest follow-up validation rather than guessing.

### Phase 3: Output Format

Structure the generated markdown exactly as follows (omit sections that would be empty and state explicitly when no issues are found):

````markdown
# PR Review Feedback

**Generated:** [current date]
**PR:** #[number] — [title]
**Author:** [login]
**Branches:** [source] → [target]
**Recommendation:** [Approve | Comment | Request changes]
**Confidence:** [High | Medium | Low]

---

## Overview

- [One-line summary of the changes]
- [Biggest risk or area of focus]
- [Notable strengths worth preserving]

## Findings

[If no issues found, state: "No issues found - this implementation meets quality standards."]

[If issues exist, list them as follows:]

### 1. [Severity: Blocker/Major/Minor] [Short title]

**Area:** `[file/path.ext#Lline]`

#### Issue

[Describe the problem, referencing expected behaviour or standards]

##### code (optional)

```[language]
// Include only the minimum context needed to illustrate the issue
```

##### suggested changes (optional)

```[language]
// Provide a concrete fix, test addition, or follow-up action
```

#### Recommendation

[Summarise the action the author should take]

#### Rationale

[Explain why the change is needed; cite patterns, docs, or risk]

### [Repeat for each finding]

## Additional Observations

- [Optional improvements or questions that are non-blocking]
- [Future enhancement suggestions]
- [Docs or tests to consider for future development]
````

### Phase 4: Analysis Checklist

- [ ] Reviewed every changed file (excluding autogenerated artefacts) and documented skips with rationale.
- [ ] Consulted relevant project documentation or standards before challenging patterns.
- [ ] Verified behaviour changes against the PR description.
- [ ] Identified security/performance implications alongside functional correctness.

### Phase 5: Understand the Source Markdown

Convert curated findings into actionable inline PR comments and prepare them for submission.

#### Input File

- Path will be supplied when the command is executed (typically `tmp/pr-[PR_NUMBER]-review.md`).
- The document follows the structure defined in Step 1, especially the `## Findings` section where each `###` heading represents an actionable piece of feedback.

#### Parsing Requirements

For each finding block under `## Findings`:

1. Treat the heading `### [Severity] [Short title]` as metadata.
2. Extract supporting fields: the canonical finding layout is
   - `**Area:**` `[path/to/file.ext#L123]` (range variant: `[path/to/file.ext#L120-L128]`)
   - `Issue:` Paragraph describing the problem
   - `##### code (optional)` followed by a fenced block (language inferred from the opening fence)
   - `##### suggested changes (optional)` followed by a fenced block
   - `Recommendation:` Requested action, typically a single sentence
   - `Rationale` Why the change matters; may include inline references
3. Ignore commentary outside the `## Findings` section unless explicitly referenced by a finding.
4. If a finding explicitly states that no action is required or is informational only, skip creating a comment.

### Phase 6: Craft Review Comment Bodies

Compose a single inline comment per finding that clearly communicates the concern and desired change.

- Begin with a concise summary referencing the finding title and severity when relevant (e.g. `Blocker – Shadowed token reuse`).
- Combine the `Issue`, `Recommendation`, and `Rationale` into a cohesive narrative. Keep the tone collaborative and specific.
- Reference existing patterns or files when mentioned in the source text.
- Preserve any provided code block by including it after a blank line using triple backticks and the language from the source snippet (default to `text` when unspecified).
- Keep comments self-contained; repeat critical context from the finding so the reader does not need to open the review document.
- Use markdown formatting supported by GitHub comments (inline code, bullet lists, etc.) sparingly for clarity.

### Phase 7: Map Areas to Diff Locations

When converting the `Area` field into JSON comment entries:

- Strip formatting markers from the extracted `Area` value:
  - Convert `path/to/file#L120-L128` to `path/to/file:120-128` before splitting.
- Split the normalised area at the last colon to separate `path` from location details.
- For single line references (`path:123`), set:
  - `path` → `path`
  - `line` → `123`
- For ranges (`path:120-128`), set:
  - `path` → `path`
  - `line` → `120`
- If the area points to multiple disjoint locations, create separate comment objects for each unique location.
- Preserve the relative ordering of findings from the source markdown.

### Phase 8: JSON Preparation

#### Recommended automation

1. Capture the review output in `tmp/pr-[PR_NUMBER]-review-comments.json` using the fields expected by the review script (`path`, `body`, and optional location metadata).

   ```json
   [
     {
       "path": "src/components/Card.tsx",
       "body": "Blocker – Shadowed token reuse. I noticed ...",
       "line": 128
     }
   ]
   ```

2. Validate the JSON file:
   - Confirm every entry includes `path` and `body`, adding a location field (`line`, `startLine`, or `position`) for inline comments when needed.
   - Ensure inline code fences remain intact by opening the file in a JSON-aware editor or running `node -e "require('./tmp/pr-[PR_NUMBER]-review-comments.json')"`.

### Continue?

Before progressing to next step, ask the user: **"Continue to Step 2: Finalise and Submit?"**. If they are not ready, stop here.

## Step 2: Finalise and Submit

1. Double-check the JSON for empty bodies, missing locations, or malformed escaping.
2. Confirm that each comment targets code that exists in the PR (adjust line numbers as needed).

**Important:** Use only the provided scripts for creating and sending data to GitHub. GitHub CLI should be used exclusively for fetching and reading data.

3. Once satisfied, run the provided script:

```bash
node {{script:pr/scripts/create-pr-review.js}} --input=tmp/pr-[PR_NUMBER]-review-comments.json --pr=[PR_NUMBER]
```
