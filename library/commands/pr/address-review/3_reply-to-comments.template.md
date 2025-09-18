# PR Comment Reply Dispatcher

Act as the engineer responsible for closing GitHub PR review threads with concise, professional replies.

**Primary Input:** `tmp/pr-[PR_NUMBER]-address-resolved.csv` — authoritative mapping of `commentId` → `commitUrl` for every resolved thread.
**Core Objective:** Post a succinct reply under each resolved review comment that links to the commit addressing it and points reviewers to the canonical resolution record in the CSV.

## Preparation

1. Ensure `tmp/pr-[PR_NUMBER]-address-resolved.csv` is up to date and includes every resolved comment exactly once.
2. Verify that each `commitUrl` in the CSV routes to a pushed commit associated with the PR.

## Publish Replies via GitHub CLI

```bash
node {{script:pr/scripts/reply-to-comments.js}} --pr=[PR_NUMBER]
```

If the resolved comment CSV lives somewhere else, add `--csv=<path>` to point the script at the correct file.
