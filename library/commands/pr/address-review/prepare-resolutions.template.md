# PR Comment Resolution Planner

You are a staff-level engineer responsible for transforming every unresolved 👍 GitHub PR review comment into a concrete, evidence-backed plan of attack.

**Core Objective:** Identify the exact code, documentation, and validation steps required to satisfy each reviewer comment while honoring the repository's engineering standards.

**Output:** Produce a markdown file (`tmp/pr-[PR_NUMBER]-address-plan.md`) that maps every targeted comment to the actions needed to resolve it. Do not modify any code in this phase.

## Phase 1: Collect Signals

1. Fetch the comment payload that this workflow is scoped to:

```bash
node {{script:pr/scripts/fetch-pr-comments.js}} \\
   --pr=[PR_NUMBER] \\
   --reaction=+1 \\
   --ignore-outdated \\
   --include-diff-hunk \\
   --output=tmp/pr-[PR_NUMBER]-address-comments.json
```

````
- The JSON includes branch names, comment metadata, file paths, line numbers, `diffHunk`, permalinks, and an `previousComments` array containing the earlier conversation in each thread. Reload it if new reactions appear.
2. (Optional) Pull enriched PR context for surrounding diffs, commits, and metadata when you need a canonical snapshot or lack reliable local history:
 ```bash
 node {{script:pr/scripts/fetch-pr-context.js}} --pr=[PR_NUMBER] --output=tmp/pr-[PR_NUMBER]-context.json
````

- Skip this step if the workspace already has the full PR checkout and you prefer to inspect files ad hoc with `git` and local tooling.

3. Review project standards and shared conventions referenced by reviewers:
   - `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`
   - `/docs/**`, `/library/commands/pr/**`, and any architecture notes in the repo
   - Prior implementations under the same directory or feature flag
4. Inspect each comment’s affected code in the working tree:
   - Use the `diffHunk`, file path, and line numbers to jump into the file (`git show`, `git blame`, etc)
   - Expand to surrounding modules to surface hidden dependencies, feature flags, and test coverage boundaries
   - Record related files or services that must be touched even if not referenced explicitly in the comment

## Phase 2: Synthesize Resolution Strategies

For every comment captured in `tmp/pr-[PR_NUMBER]-address-comments.json`:

- Summarize the reviewer’s intent using your own words; avoid copy-pasting the comment verbatim.
- Capture the underlying issue, including any missed edge cases, performance considerations, or guideline violations.
- Determine the minimal code and documentation changes that will fully satisfy the reviewer (include follow-on refactors only when required for safety or clarity).
- Identify prerequisite context you must validate: tests to read or modify, migrations, feature flags, telemetry, build configuration, UX copy alignment, etc.
- Reference repository standards that influence the resolution (e.g., naming conventions, error-handling patterns, logging, CI requirements).
- Review `previousComments` for each comment to understand prior reviewer guidance or clarifications before drafting your resolution strategy.
- Call out cross-comment dependencies so implementation can be sequenced without conflicts.
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
- **File & Lines:** [path#Lstart-Lend](path#Lstart-Lend) # formatted as a markdown link

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
- Confirm resolution steps remain actionable without further interpretation.
- Highlight any missing context that still requires clarifying questions so it can be addressed before coding begins.
