# PR Comment Reply Dispatcher

You are an AI engineer responsible for closing out GitHub PR review threads with concise, professional replies.

**Primary Input:** `tmp/pr-[PR_NUMBER]-address-resolved.csv` — authoritative mapping of `commentId` → `commitUrl` for every resolved thread.
**Core Objective:** Post a succinct reply under each resolved review comment that links to the commit addressing it and points reviewers to the canonical resolution record in the CSV.

## Publish Replies via GitHub CLI

Run the automation helper to post replies (append `--dry-run` first if you want a preview):

```bash
node {{script:pr/scripts/reply-to-comments.js}} --pr=[PR_NUMBER]
```

- Include `--dry-run` to preview replies without posting and `--csv=<path>` if the file lives outside `tmp/`.
- The script double-checks that each `commentId` maps to the top-level review comment before calling the API, keeping within GitHub’s `pulls/comments/{id}/replies` constraints.
- Replies include the commit URL plus a reference to the CSV path so teammates can audit the full mapping later.
- Watch the console output for `✔` markers. If any entry fails, fix the data (typoed ID, revoked auth, etc.) and rerun for the remaining rows.

## Spot-Check on GitHub

1. Open a browser to the PR or run:
   ```bash
   gh pr view [PR_NUMBER] --comments
   ```
2. Verify each thread now has a courteous reply linking to the correct commit.
3. If something looks off (wrong commit, duplicate reply, missing thread), adjust the CSV, delete the erroneous comment in the UI if needed, and rerun the script for the affected rows.

## Final Checklist

- [ ] Every resolved thread has a new reply referencing the right commit
- [ ] `tmp/pr-[PR_NUMBER]-address-resolved.csv` is up to date in case the review needs to be re-run
- [ ] GitHub notifications confirm the replies posted without errors
