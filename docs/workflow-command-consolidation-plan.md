# Workflow Command Consolidation Plan

## Objectives

- Merge numbered command templates within each PR workflow folder into a single Markdown command while preserving the existing folder hierarchy (`pr/enhance-review`, `pr/draft-review`, `pr/address-review`).
- Retain all guidance, artifact expectations, and script integrations while adding explicit continue/stop prompts between steps.
- Update repository documentation and tooling references so downstream consumers (linker scripts, provider configs) recognize the new files without workflow regressions.

## Previous State Summary (before consolidation)

### Enhance Review (`library/commands/pr/enhance-review`)

- `1_rewrite-comments.template.md`: rewrote existing review comments, output `tmp/pr-[PR_NUMBER]-comments.md`.
- `2_update-review.template.md`: converted rewritten comments to CSV and applied updates via `edit-pr-comments.js`.

### Draft Review (`library/commands/pr/draft-review`)

- `1_prepare-review.template.md`: gathered PR context and produced structured findings in `tmp/pr-[PR_NUMBER]-review.md`.
- `2_create-review.template.md`: generated review comment CSV and posted a pending GitHub review with `create-pr-review.js`.

### Address Review (`library/commands/pr/address-review`)

- `1_prepare-resolutions.template.md`: planned resolutions for +1 reactions, captured `tmp/pr-[PR_NUMBER]-address-plan.md`.
- `2_apply-resolutions.template.md`: executed fixes, produced reports + CSV.
- `3_reply-to-comments.template.md`: posted replies using `reply-to-comments.js` and the resolved CSV.

## Resulting Structure (after consolidation)

### Enhance Review

- `enhance-review.template.md`: Step 1 rewrites comments, Step 2 updates GitHub, each ending with a Continue prompt.

### Draft Review

- `draft-review.template.md`: Step 1 prepares review findings, Step 2 creates inline review comments, both gated by Continue prompts.

### Address Review

- `address-review.template.md`: Step 1 plans resolutions, Step 2 applies them, Step 3 replies to comments. Steps 1 and 2 include Continue prompts; Step 3 closes the workflow and confirms next actions.

## Implementation Tasks (completed)

- [x] Consolidated templates per workflow with explicit step sections and continue/stop prompts.
- [x] Removed superseded numbered template files.
- [x] Updated `README.md` and supporting documentation to reference the new single-command filenames.
- [x] Verified script placeholders and workflow outputs remain unchanged.

## Decisions

- Filenames follow the workflow name (`enhance-review.template.md`, `draft-review.template.md`, `address-review.template.md`) to keep provider flattening predictable.
- Continue prompts use direct questions (e.g., “Continue to Step 2…?”) so the AI pauses unless the user opts in.
- No additional metadata was required; existing Markdown structure remains compatible with linkers and providers.

## Optional Follow-Up

- Run `npm run lint` and `npx link-ai-commands --dry-run` to validate the repo and confirm provider outputs when convenient.
- Monitor downstream consumer feedback to see if further refinements to prompt phrasing or step boundaries are needed.
