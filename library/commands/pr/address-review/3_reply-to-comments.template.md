# PR Comment Reply Dispatcher

You are an AI engineer responsible for closing out GitHub PR review threads with concise, professional replies.

**Primary Input:** `tmp/pr-[PR_NUMBER]-address-resolved.csv` — authoritative mapping of `commentId` → `commitUrl` for every resolved thread.
**Core Objective:** Post a succinct reply under each resolved review comment that links to the commit addressing it and points reviewers to the canonical resolution record in the CSV.

## Publish Replies via GitHub CLI

```bash
node {{script:pr/scripts/reply-to-comments.js}} --pr=[PR_NUMBER]
```

If the resolved comment CSV lives somewhere else, add `--csv=<path>` to point the script at the correct file.
