# GitHub Pull Request Review Planner

Act as a staff-level engineer and seasoned reviewer responsible for producing a professional GitHub pull request review. Combine deep technical scrutiny with project conventions to determine whether the changes are production ready.

**Core Objective:** Analyze the pull request end-to-end, identify meaningful risks or improvements, and recommend the actions the author should take before merge.

**Output:** Generate a markdown file (`tmp/pr-[PR_NUMBER]-review.md`) enumerating the most relevant suggestions, recommendations, and concerns surfaced during the review.

## Phase 1: Gather Context

1. Collect the latest PR metadata, file statistics, and per-file patches:

```bash
node {{script:pr/scripts/fetch-pr-context.js}} --pr=[PR_NUMBER] --output=tmp/pr-[PR_NUMBER]-context.json
```

2. Read `tmp/pr-[PR_NUMBER]-context.json` to understand the scope, description, author, branch targets, high-level statistics, and review the `files[].patch` entries for inline diffs.
3. Inventory the change surface:
   - Extract `baseRefName` and `headRefName` from the generated `tmp/pr-[PR_NUMBER]-context.json`, then run
     ```bash
     BASE_REF=$(jq -r '.baseRefName' tmp/pr-[PR_NUMBER]-context.json)
     HEAD_REF=$(jq -r '.headRefName' tmp/pr-[PR_NUMBER]-context.json)
     git diff --name-only "${BASE_REF}...${HEAD_REF}" \
       ':(exclude)yarn.lock' \
       ':(exclude)package-lock.json' \
       ':(exclude)pnpm-lock.yaml' \
       ':(exclude)*.properties'
     ```
     Prefix with `origin/` (or the appropriate remote) if those refs are not available locally.
   - Categorise each file by impact level (Critical / High / Medium / Low) and by file type to prioritise the review effort.
4. Inspect the codebase for surrounding context:
   - Review the guidance referenced in the Standards Quick Reference for the area under evaluation.
   - Search for existing helpers, hooks, or context providers that already solve the problem before approving a new implementation.
5. Examine the diff carefully by reviewing the `files[].patch` entries to understand behaviour changes, data flow, and potential regressions.

### Coverage Edge Cases

- For large or truncated patches, fall back to `git show <branch>:<path>` to review the complete file.
- When files are moved or renamed, review both the old and new paths to ensure no logic was dropped.

### Standards Quick Reference

[Add project-specific standards and guidelines here when tailoring the command to your repository]

## Phase 2: Review Guidelines

### What to Evaluate

- **Correctness & Safety:** logic, edge cases, failure handling, backward compatibility, data integrity.
- **Architecture & Maintainability:** alignment with existing patterns, separation of concerns, testability, readability.
- **Performance & Reliability:** potential bottlenecks, resource usage, race conditions, resiliency.
- **Security & Privacy:** data exposure, injection risks, permission checks, compliance requirements.
- **Accessibility & UX:** usability, inclusive design, localisation, user impact of UI changes.
- **Testing & Documentation:** automated tests coverage and docs updates.

### File Type & Priority Guide

- **Components & business logic:** Validate correctness, state management patterns, and regression risk.
- **Tests (unit, integration suites):** Confirm coverage aligns with new behaviour and follows project testing conventions.
- **Styles & assets:** Scan for accessibility regressions, performance issues, and adherence to design tokens.
- **Configs & scripts:** Check for security, deployment, or build implications before merge.
- **Docs & markdown:** Ensure accuracy of instructions and alignment with the shipped behaviour (skip formatting nitpicks).

### Common Failure Modes to Flag

- Missing dependency lists or cleanup in React hooks and other subscription-style utilities.
- Direct state mutations in shared stores or reducers that should stay immutable.
- Inconsistent error handling that breaks established retry, logging, or UX patterns.
- Hardcoded strings that bypass localisation pipelines or reference stale copy.
- Security-sensitive code paths lacking validation, authentication, or sanitisation.

### Style & Tone

- Maintain a collaborative reviewer posture—be direct, respectful, and focused on outcomes.
- Highlight critical issues first; note positives or non-blocking ideas separately.
- Cite specific files, functions, and lines. Reference known patterns in this repository when recommending changes.
- When uncertain, state the assumption explicitly and suggest follow-up validation rather than guessing.

## Phase 3: Output Format

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

### [Severity: Blocker/Major/Minor] [Short title]

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
- [Docs or tests to add, or manual checks to run]

````

### Severity Guidance

- **Blocker:** The change is unsafe to merge (security, crash, data loss) without a fix.
- **Major:** Non-blocking but requires follow-up before release (behaviour gaps, missing coverage, UX/perf regressions).
- **Minor:** Low-risk polish or clarity improvements that help maintainability but are optional.

## Key Reminders

1. Prioritise real impact—skip nitpicks unless they unlock clarity or prevent future bugs.
2. Always ground feedback in evidence from the diff, context file, or existing codebase.
3. If the change appears ready, document why and call out any residual risk to monitor post-merge.
4. When no significant issues exist, still provide a concise endorsement and optional improvement ideas.
5. Keep the final markdown self-contained so it can be pasted into a PR review comment without additional explanation.

## Analysis Checklist

- [ ] Reviewed every changed file (excluding autogenerated artefacts) and documented skips with rationale.
- [ ] Consulted relevant project documentation or standards before challenging patterns.
- [ ] Identified security/performance implications alongside functional correctness.

Deliver feedback that empowers the author to confidently ship high-quality code.
