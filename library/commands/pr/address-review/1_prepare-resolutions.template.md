# PR Comment Resolution Planner

You are a staff-level engineer responsible for converting each unresolved GitHub PR review comment with a +1 reaction into a concrete, evidence-backed implementation plan.

**Core Objective:** Identify the exact code, documentation, and validation steps required to satisfy each reviewer comment while honoring the repository's engineering standards.

**Output:** Produce a markdown file (`tmp/pr-[PR_NUMBER]-address-plan.md`) that maps every targeted comment to the actions needed to resolve it. Do not modify any code in this phase.

## Phase 1: Collect Signals

1. Fetch the comment payload covered by this workflow:

    ```bash
    node {{script:pr/scripts/fetch-pr-comments.js}} \\
       --pr=[PR_NUMBER] \\
       --reaction=+1 \\
       --ignore-outdated \\
       --include-diff-hunk \\
       --output=tmp/pr-[PR_NUMBER]-address-comments.json
    ```

    - The JSON includes branch names, comment metadata, file paths, line numbers, `diffHunk`, permalinks, and a `previousComments` array containing the earlier conversation in each thread.

2. (Optional) Pull enriched PR context for surrounding diffs, commits, and metadata when you need a canonical snapshot or lack reliable local history:

    ```bash
    node {{script:pr/scripts/fetch-pr-context.js}} --pr=[PR_NUMBER] --output=tmp/pr-[PR_NUMBER]-context.json
    ```

    - Skip this step if the workspace already has the full PR checkout and you prefer to inspect files locally with `git` and project tooling.

3. Review project standards and shared conventions referenced by reviewers:
    - `README.md`
    - `/docs/**`
    - Prior implementations under the same directory

4. Inspect each comment’s affected code in the working tree:
    - Use the `diffHunk`, file path, and line numbers to examine the file (for example, with `git show` or `git blame`).
    - Expand to surrounding modules to surface hidden dependencies, feature flags, and test coverage boundaries.
    - Record related files or services that must change even if the reviewer did not mention them explicitly.

## Phase 2: Synthesize Resolution Strategies

For every comment captured in `tmp/pr-[PR_NUMBER]-address-comments.json`:

- Summarize the reviewer’s intent in your own words; do not copy the comment verbatim.
- Capture the underlying issue, including missed edge cases, performance considerations, or guideline violations.
- Determine the minimal code and documentation changes that will satisfy the reviewer. Include follow-on refactors only when they are required for safety or clarity.
- Identify prerequisite context to validate, such as tests to read or modify, feature flags, or UX alignment.
- Reference repository standards that shape the resolution (for example, naming conventions, error-handling patterns, logging, or CI requirements).
- Review `previousComments` for each comment to incorporate past reviewer guidance before finalizing the plan.
- Highlight cross-comment dependencies so implementation can be sequenced without conflicts.
- Flag risks, unknowns, or decisions that require reviewer confirmation.

## Phase 3: Document the Plan

Author `tmp/pr-[PR_NUMBER]-address-plan.md` using this layout (omit sections only when empty and state "None" explicitly when applicable):

```markdown
# PR Comment Resolution Plan

**Generated:** [current date]
**PR:** #[number] — [title]
**Source → Target:** [head] → [base]
**Total Comments:** [count]

---

## Comment [index]: [concise summary]

- **GitHub URL:** [permalink]
- **File & Lines:** [path#start-end](../path#start-end) # formatted as a relative markdown link

### Intent

[your paraphrased goal]

### Root Cause

[technical/compliance issue to fix]

### Resolution Strategy

- [ordered list of concrete code/doc updates]

### Validation

- [tests, QA steps, or monitoring to run]

### Project Standards & References

- [`docs/...`, `README.md` section, code examples]

### Dependencies / Sequencing

- [related comments, blocking work, migrations]

### Open Questions / Risks

- [clarifications needed, potential regressions]

---

## Cross-Cutting Work (if any)

- [Shared tasks that satisfy multiple comments]

## Validation Checklist

- [ ] Unit tests identified
- [ ] Documentation updates scoped
```

### Final Review Before Handoff

- Ensure every comment in the JSON appears in the plan exactly once.
- Confirm that each resolution step remains actionable without further interpretation.
- Highlight any missing context that still requires clarifying questions so it can be addressed before implementation begins.
