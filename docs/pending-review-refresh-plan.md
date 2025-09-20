# Pending Review Refresh Plan

## Overview

- Current tooling posts fresh pending reviews from CSV (`create-pr-review.js`) but cannot update or replace an existing draft.
- Review comment enhancements (`edit-pr-comments.js`) only apply to already submitted comments and cannot touch pending reviews.
- Goal: allow reviewers to regenerate a pending review with updated comment text/locations while avoiding duplicate drafts.

## Objectives

1. Detect the reviewer’s existing pending review for a PR and safely replace it when requested.
2. Provide a workflow to export pending-review comments, adjust their content, and recreate the draft with the revised data.
3. Maintain compatibility with existing CSV comment generation while minimizing redundant round-trips to the GitHub API.

## Proposed Changes

### 1. GitHub Review Utility

- Add `library/commands/pr/scripts/utils/github.js` (or extend an existing helper module) with functions to:
  - Retrieve the current viewer login via `gh api user`.
  - List reviews for a PR using `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews` (handle pagination).
  - Filter reviews where `user.login` matches the viewer and `state === "PENDING"`.
  - Delete a pending review via `DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}`.
- Expose typed return values so callers can reason about IDs, states, and timestamps.

### 2. Extend `create-pr-review.js`

- Introduce a `--replace-pending` flag (name TBD) and surface it in `HELP_TEXT`.
- Before building the payload:
  - Resolve repo/PR as today.
  - If the flag is set, call the helper to find pending reviews authored by the viewer.
  - Warn (and abort unless `--force` scoped flag is provided) if multiple pending reviews exist for the current viewer or by other reviewers.
  - Delete the matching pending review(s) and log the outcome prior to calling `submitReview`.
- Add guardrails:
  - If no pending review is found when `--replace-pending` is used, emit an info log and continue.
  - Ensure deletion happens **before** submitting the new review so API errors leave the original draft intact.

### 3. Enhance `fetch-pr-comments.js`

- Update the GraphQL selection to include additional fields needed to rebuild CSV rows:
  - `position`, `originalPosition`, `side`, `startSide`, `originalLine`, `originalStartLine`, `commit { oid }`.
- Extend the mapped comment objects to expose these fields (and the `pullRequestReview.fullDatabaseId` already captured).
- Consider adding a `--review-id` filter to narrow output to a specific pending review.

### 4. New Export Script (`export-pending-review.js`)

- Location: `library/commands/pr/scripts/export-pending-review.js`.
- Responsibilities:
  - Accept `--review-id` or `--from-pending` (auto-detect the viewer’s pending review on the target PR).
  - Invoke `fetch-pr-comments` logic (direct import or shared module) to obtain review threads.
  - Filter to comments belonging to the target review ID.
  - Transform each comment into the CSV schema consumed by `create-pr-review` (`path,position,body,line,startLine,side,startSide`).
  - Preserve ordering (e.g., by thread created time or comment ID) and default `side/startSide` when absent.
  - Output to `tmp/pr-[PR]-pending-review.csv` or a user-specified `--output` path.
- Provide `--dry-run` to print a summary without writing a file.

### 5. AI Command & Template Updates

- Update `library/commands/pr/draft-review/draft-review.template.md (Step 2)` to document the refresh loop:
  1. Export the pending review CSV.
  2. Adjust comment bodies/locations.
  3. Re-run `create-pr-review.js --replace-pending` with the updated CSV.
- Mention the destructive nature of `--replace-pending` (removes previous draft).
- Consider adding a dedicated command snippet for running the exporter.

## Testing & Validation

- **Unit Tests**
  - Mocked `gh` invocations for the review helper (list and delete flows, pagination, no review found).
  - CSV export transformations (single-line, multi-line, ranged comments).
- **Integration / Smoke**
  - Scripted test invoking the exporter + `create-pr-review` with `--replace-pending`, stubbing `gh` via fixtures to ensure the sequence issues DELETE before POST and handles errors gracefully.
- **Manual Verification**
  - On a sandbox PR: create a pending review, export it, tweak bodies, and recreate to confirm no duplicate drafts remain and comment anchors are preserved.

## Documentation

- README draft-review section: describe the new exporter and `--replace-pending` flag.
- CLI help text for `create-pr-review.js` and the new exporter.
- If applicable, add a troubleshooting note covering enterprise hosts and permission errors when deleting reviews.

## Open Questions

- Confirm flag naming (`--replace-pending` vs `--refresh`), and whether a separate `--force` should bypass multi-review warnings.
- Decide if exporter should live as a standalone CLI or be folded into an existing script via a new mode.
- Determine caching behavior: should we store snapshots of the exported CSV to help diff revisions between runs?

## Suggested Next Steps

1. Align with stakeholders on CLI ergonomics and open questions above.
2. Implement the helper + `create-pr-review` updates (with tests) since they are prerequisites for safe refreshes.
3. Enhance `fetch-pr-comments` query/transform and add the exporter script.
4. Update documentation/templates and perform manual validation before release.
