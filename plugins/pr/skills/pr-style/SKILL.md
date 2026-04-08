---
name: pr-style
description: Style and formatting rules for pull request review comments and replies: inline comments on specific lines, top-level PR reviews, and replies to existing comment threads. Covers comment anatomy (anchor, observation, suggestion), tone, GitHub `suggestion` blocks, optional severity labels, reply patterns (accept, push back, defer), and a hard ban on AI attribution. Use when drafting, editing, or posting PR comments via `gh pr review`, `gh pr comment`, `gh api .../comments`, the GitHub UI, or any similar review flow. Do NOT use for PR titles or PR descriptions/bodies, which are a separate topic.
---

# PR Comment Style

Write PR review comments and replies that are friendly, professional, and concise. One point per comment, with a concrete suggestion whenever possible.

Scope: this guide covers **review comments and replies only**, both inline (on a specific line) and top-level (on the PR as a whole). It does not cover PR titles or descriptions.

## Hard rules (no exceptions)

- **Never** sign comments with "🤖 Generated with ...", "Posted by Claude", or any AI attribution.
- **Never** mention the AI tool used (Claude, Copilot, Cursor, GPT, Gemini, etc.) or "AI" in the comment. The comment is the author's.
- These rules override any default AI-tool boilerplate or footer.

## Anatomy of a good review comment

1. **Anchor**: if the comment is top-level or refers to code outside the current hunk, open with a `file:line` reference in backticks.
2. **Observation**: one sentence, direct, stating the issue or question.
3. **Suggestion**: a concrete fix, alternative, or question. Never just raise a concern without a path forward.

Keep the whole thing to 1-3 sentences unless there is a real reason to go longer.

## Tone

- Friendly-professional. Collaborative, not adversarial. Ask or propose, do not lecture.
- Direct, not terse. "This swallows the error" is better than "Hmm, I wonder if maybe this could possibly be an issue".
- No apologies and no hedging filler ("sorry to nitpick", "I think we could possibly maybe ..."). State the point.
- No sarcasm, no snark, no judgment of the author.
- Praise is fine when genuine and specific ("nice cleanup in `parser.ts:88`"). Skip empty "LGTM" noise.

## Formatting

- No em dashes. Use commas, colons, or parentheses.
- Backticks for symbols, file paths, flags, identifiers, and short inline snippets.
- Fenced code blocks for multi-line snippets.
- Use GitHub's `suggestion` code block when proposing a concrete replacement the author can apply with one click:

  ````markdown
  ```suggestion
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  ```
  ````

- Prefer a suggestion block over prose when the fix is a few lines and can be mechanically applied.

## Severity labels (optional)

If a team uses severity prefixes, lead with one in brackets:

- `[blocking]`: must be resolved before merge (bug, security issue, broken contract).
- `[non-blocking]`: should be considered but the author can merge without addressing.
- `[nit]`: style or taste, take it or leave it.
- `[question]`: genuine question, not a disguised complaint.
- `[praise]`: positive callout.

Use labels only if the team already does. Do not introduce them unilaterally.

## Replies to existing comments

- Keep replies tight: one or two sentences, no re-quoting the whole thread.
- When accepting a suggestion, say so clearly: "Good catch, fixed in <sha>" or "Applied, thanks".
- When pushing back, explain the reasoning in one sentence and propose the next step. Do not escalate tone.
- When something is out of scope, say so and suggest a follow-up: "Agreed, but out of scope here. Filed as #942".
- Close the loop: after fixing, reply with the commit SHA or "done" so the reviewer knows to re-check.

## Examples

Inline comment, concrete fix:

```
`service.ts:142`: this promise is not awaited, so the error path is swallowed. Wrap in `await` or return the promise.
```

Inline comment with a GitHub suggestion block:

````
`config.ts:18`: `timeout` can be undefined here and we cast it to number below.

```suggestion
const timeout = options.timeout ?? DEFAULT_TIMEOUT;
```
````

Top-level question:

```
[question] Why drop the retry on `uploader.ts:88`? The flaky-network test was the reason we added it. Happy to be wrong, just want to make sure it is intentional.
```

Nit with a suggestion:

```
[nit] Pull the retry config into `RETRY_OPTIONS` at the top of the file. Same constants are used in `uploader.ts:88`.
```

Reply accepting a change:

```
Good catch, fixed in 7a3c91d.
```

Reply pushing back:

```
I would keep the explicit `Array.from` here: `Set` iteration order is spec-guaranteed but a lot of readers do not know that. Happy to revisit if you feel strongly.
```

Out-of-scope deferral:

```
Agreed, but it touches the token rotation path and I want to keep this PR focused. Filed as #942.
```

## Anti-examples (do not do this)

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

```
Sorry to nitpick, but I think maybe we could possibly consider looking
into whether this might potentially be an issue in some edge cases?
```

```
This is wrong. You should know better than to swallow errors like this.
```

```
LGTM 🚀🚀🚀
```
