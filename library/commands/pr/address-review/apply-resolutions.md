# PR Comment Resolution Executor

You are the implementation lead responsible for addressing every unresolved 👍 GitHub PR review comment identified in `prepare-resolutions.md` and delivering production-ready fixes.

**Core Objective:** Execute the resolution plan, apply code and documentation changes, validate them, and document the outcome.

**Output:** Generate a comprehensive report (`tmp/pr-[PR_NUMBER]-address-report.md`) that records how each comment was resolved, which commits were created, and what validation occurred.

## Phase 1: Rehydrate Context

1. Read the latest plan produced by `prepare-resolutions.md` (`tmp/pr-[PR_NUMBER]-address-plan.md`). Confirm that every comment listed is still unresolved and carries a 👍 reaction. Update or re-run the plan if the PR changed significantly.
2. Revisit relevant standards and examples flagged in the plan (docs, style guides, past commits) so fixes match repository expectations.

## Phase 2: Implement Comment-by-Comment

Work through the plan sequentially unless dependencies require a different order. For each comment:

1. **Inspect the Code:** Open the target file(s) and adjacent modules. Understand the current behaviour and any shared utilities or patterns. Read through the `previousComments` entries to capture prior reviewer guidance before making decisions.
2. **Apply the Change:** Modify code, tests, fixtures, configuration, or docs exactly as outlined in the plan. Keep changes narrowly scoped to the comment unless a larger refactor was justified in the plan.
3. **Run Targeted Validation:** Execute the tests, linters, or manual checks identified for that comment. Capture command output and note pass/fail status.
4. **Stage and Commit:**
   ```bash
   git add <files>
   git commit -m "Address PR comment <comment-id>: <concise summary>"
   ```

   - Create one, simple commit per comment (or per logical cross-cutting change when explicitly documented in the plan).\
   - Follow conventional commit style for the subject line.
   - Reference the GitHub comment ID or permalink so reviewers can trace the resolution.
   - Capture the commit hash and construct the full PR commit URL. Use the host surfaced in the fetch output (e.g. from `prUrl`) to format it as `https://<hostname>/<owner>/<repo>/pull/<PR_NUMBER>/commits/<hash>` for the final report.
5. **Record Results:** Immediately log the resolution details (changes made, validation run, remaining risks) so they can be copied into the final report.

### Handling Cross-Cutting Tasks

- When a single change resolves multiple comments, note every affected comment explicitly in the commit message body and the final report.
- If you uncover new issues or scope creep, capture them under "Remaining Concerns" and, if necessary, loop back to the planning phase before coding further.

## Phase 3: Verification & Clean-Up

1. Ensure the working tree is clean (`git status`).
2. Run the project’s required validation suite (unit tests, integration, lint, type check) as dictated by the plan and repository standards. Document commands and outcomes.
3. Summarize any manual QA performed or remaining limitations that reviewers should know.

## Phase 4: Author the Resolution Report

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

2. [Specific areas to focus on during review]
```

### Final Checklist

- [ ] Working tree clean (`git status` shows no changes)
- [ ] All commits ready for push
- [ ] Report saved to `tmp/pr-[PR_NUMBER]-address-report.md`
- [ ] Outstanding blockers documented in "Remaining Concerns"

Hand the report and commits back to the reviewer once the checklist is complete.
