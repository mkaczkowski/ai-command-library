---
description: 'Plan, implement, and close the loop on fixes for GitHub PR review feedback.'
---

# GitHub PR Comment Resolution Workflow

Act as the senior software engineer responsible for addressing GitHub PR feedback and closing the loop with reviewers.

**Core Objective:** Plan precise resolutions for each comment, implement the fixes with validation, and reply to reviewers with commit references.

## Step 1: Plan Resolutions

Convert each unresolved GitHub PR comment into an actionable plan.

### Phase 1: Collect Signals

1. Fetch the comment payload covered by this workflow:

   ```bash
   node {{script:pr/scripts/fetch-pr-comments.js}} \
      --pr=[PR_NUMBER] \
      --reaction=+1 \
      --ignore-outdated \
      --include-diff-hunk \
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

### Phase 2: Synthesize Resolution Strategies

For every comment captured in `tmp/pr-[PR_NUMBER]-address-comments.json`:

- Summarize the reviewer’s intent in your own words; do not copy the comment verbatim.
- Capture the underlying issue, including missed edge cases, performance considerations, or guideline violations.
- Determine the minimal code and documentation changes that will satisfy the reviewer. Include follow-on refactors only when they are required for safety or clarity.
- Identify prerequisite context to validate, such as tests to read or modify, feature flags, or UX alignment.
- Reference repository standards that shape the resolution (for example, naming conventions, error-handling patterns, logging, or CI requirements).
- Review `previousComments` for each comment to incorporate past reviewer guidance before finalizing the plan.
- Highlight cross-comment dependencies so implementation can be sequenced without conflicts.
- Flag risks, unknowns, or decisions that require reviewer confirmation.

### Phase 3: Document the Plan

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
- **File & Lines:** [path#start-end](../path#start-end)

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

### Continue?

After drafting the plan, ask: **"Continue to Step 2 (Apply Resolutions)?"**. Stop and return the plan if the user wants to review or adjust it first.

## Step 2: Apply Resolutions

Execute the approved plan, validate changes, and record the outcome.

### Phase 1: Rehydrate Context

1. Read the latest plan produced in Step 1 (`tmp/pr-[PR_NUMBER]-address-plan.md`). Update or regenerate the plan if the PR changed significantly.
2. Revisit relevant standards and examples flagged in the plan so fixes match repository expectations.

### Phase 2: Implement Comment-by-Comment

Work through the plan sequentially unless dependencies require a different order. For each comment:

1. **Inspect the Code:** Open the target file(s) and adjacent modules. Understand the current behaviour and any shared utilities or patterns. Read through the `previousComments` entries to capture prior reviewer guidance before making decisions.
2. **Apply the Change:** Modify code, tests, fixtures, configuration, or documentation exactly as outlined in the plan. Keep changes narrowly scoped to the comment unless a larger refactor is warranted and already documented.
3. **Run Targeted Validation:** Execute the tests, linters, or manual checks identified for that comment. Capture command output and note pass/fail status.
4. **Stage and Commit:**

   ```bash
   git add <files>
   git commit -m "Address PR comment <comment-id>: <title>"
   ```

   - Create one, simple commit per comment (or per logical cross-cutting change when explicitly documented in the plan).
   - Follow conventional commit style for the subject line.
   - Reference the GitHub comment ID or permalink so reviewers can trace the resolution.
   - Capture the commit hash and construct the full PR commit URL. Use the host surfaced in the fetch output (e.g. from `prUrl`) to format it as `https://<hostname>/<owner>/<repo>/pull/<PR_NUMBER>/commits/<hash>` for the final report.

5. **Record Results:** Immediately document the resolution details (changes made, validation run, remaining risks) so they can be copied into the final report. Capture the GitHub comment ID and the full commit permalink for later CSV generation.

#### Handling Cross-Cutting Tasks

- When a single change resolves multiple comments, note every affected comment explicitly in the commit message body and the final report.
- If you uncover new issues or scope increases, document them under "Remaining Concerns" and, if necessary, return to the planning phase before coding further.

### Phase 3: Verification & Clean-Up

1. Ensure the working tree is clean (`git status`).
2. Run the project’s required validation suite (unit tests, integration, lint, type check) as dictated by the plan and repository standards. Document commands and outcomes.
3. Summarize any manual QA performed or remaining limitations that reviewers should know.

### Phase 4: Author the Resolution Report

Populate `tmp/pr-[PR_NUMBER]-address-report.md` with the structure below. Keep entries chronological with your commits. Use the PR URL in `tmp/pr-[PR_NUMBER]-address-comments.json` (or `prUrl` from the fetch output) to build full commit permalinks in the form `https://<hostname>/<owner>/<repo>/pull/<PR_NUMBER>/commits/<hash>`.

```markdown
# PR Comment Resolution Report

**Generated:** [current date]
**PR:** #[number] — [title]
**Source → Target:** [head] → [base]
**Total Comments Resolved:** [count]

---

## Comment [index] – [concise summary]

- **Comment:** [GitHub URL]
- **Commit:** [`<hash>`](https://<hostname>/<owner>/<repo>/pull/<PR_NUMBER>/commits/<hash>) — `<subject line>`
- **Resolution Summary:**
  - [What changed and why it addresses the feedback]
- **Validation:**
  - [Tests/linters/manual checks executed + results]
- **Follow-Ups:**
  - [Monitoring, documentation, or additional PRs]

---

## Cross-Cutting Changes (optional)

- [High-level summary of broader refactors, migrations, or shared updates]

## Validation Matrix

- [Test command] — [✅/⚠️ result]
- [Manual QA] — [✅/⚠️ result]

## Remaining Concerns / Risks

- [Any unresolved issues, TODOs, or items needing reviewer attention]

## Next Steps for Reviewers

1. [Specific areas to focus on during review]
```

### Phase 5: Generate Resolved Comment CSV

1. Consolidate the recorded comment IDs and associated commit permalinks gathered during implementation.
2. Save the CSV to `tmp/pr-[PR_NUMBER]-address-resolved.csv`.

**CSV Format Requirements**

- Header row: `commentId,commitUrl`
- All fields enclosed in double quotes
- Escape internal double quotes by doubling them (`""`)
- Use full commit permalinks in the format `https://<hostname>/<owner>/<repo>/pull/<PR_NUMBER>/commits/<hash>`
- Use `\n` (Unix-style) line endings between rows.

```csv
commentId,commitUrl
"2351166366","https://github.com/example/repo/pull/123/commits/abcdef1234567890"
```

### Continue?

Before replying on GitHub, ask: **"Continue to Step 3 (Reply to Comments)?"**. If the user wants to pause for manual validation or code review, stop here and preserve the report plus CSV.

## Step 3: Reply to Comments

Close each review thread with a concise acknowledgement that points to the resolving commit.

### Preparation

1. Ensure `tmp/pr-[PR_NUMBER]-address-resolved.csv` is up to date and includes every resolved comment exactly once.
2. Verify that each `commitUrl` in the CSV routes to a pushed commit associated with the PR.

### Publish Replies via GitHub CLI

```bash
node {{script:pr/scripts/reply-to-comments.js}} --pr=[PR_NUMBER]
```

If the resolved comment CSV lives somewhere else, add `--csv=<path>` to point the script at the correct file.

### Final Output

After completing the workflow, provide a brief summary describing the updated comment status
