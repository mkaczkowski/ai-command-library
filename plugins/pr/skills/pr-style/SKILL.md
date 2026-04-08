---
name: pr-style
description: Style rules for PR review comments and replies. Use when drafting or posting a PR review comment, inline comment, or thread reply.
---

# PR Comment Style

Write PR review comments and replies that are friendly, professional, and concise. One point per comment, with a concrete suggestion whenever possible.

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

- Friendly, inclusive, collaborative. Ask or propose, do not lecture.
- Direct, not terse. "This swallows the error" is better than "Hmm, I wonder if maybe this could possibly be an issue".
- No sarcasm, no snark, no judgment of the author.
- Praise is fine when genuine and specific ("nice cleanup in `parser.ts:88`"). Skip empty "LGTM" noise.

### Preferred phrasing

Lean on these openers and softeners. They keep the tone friendly and collaborative without turning into hedging filler:

- **Questions and proposals**: `Could you ...`, `Would you ...`, `Can you ...`, `What do you think?` / `WDYT?`
- **Opinion markers** (use sparingly, when the point is subjective): `IMO`, `TBH`, `I would ...`, `I would try to ...`
- **Verification asks**: `Can you double-check ...`, `Just to confirm ...`, `Just making sure ...`

Keep them first-person and specific. "Could you wrap this in `await`?" beats "This should be awaited." "WDYT about pulling this into a constant?" beats "This should be a constant."

Avoid hedging filler that adds no information: "sorry to nitpick", "I think we could possibly maybe ...", "not sure if this is a big deal but ...". Soften with phrasing, not with apology.

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

## Nits

For small style or taste comments the author can take or leave, prefix the comment with `nit:` (lowercase, followed by a space).

```
nit: pull the retry config into `RETRY_OPTIONS` at the top of the file.
```

## Replies to existing comments

- Keep replies tight: one or two sentences, no re-quoting the whole thread.
- When accepting a suggestion, say so clearly: "Good catch, fixed in <sha>" or "Applied, thanks".
- When pushing back, explain the reasoning in one sentence and propose the next step. Do not escalate tone.
- When something is out of scope, say so and suggest a follow-up: "Agreed, but out of scope here. Filed as #942".
- Close the loop: after fixing, reply with the commit SHA or "done" so the reviewer knows to re-check.

## Examples

Inline comment, concrete fix:

```
`service.ts:142`: could you wrap this in `await`? Right now the promise isn't awaited, so the error path gets swallowed.
```

Inline comment with a GitHub suggestion block:

````
`config.ts:18`: `timeout` can be undefined here and we cast it to number below. WDYT about defaulting it?

```suggestion
const timeout = options.timeout ?? DEFAULT_TIMEOUT;
```
````

Verification ask:

```
Just to confirm, can you double-check that the migration on `schema.sql:42` is idempotent? We replay this file on staging every morning.
```

Top-level question:

```
What do you think about keeping the retry on `uploader.ts:88`? The flaky-network test was the reason we added it, so I want to make sure dropping it is intentional.
```

Nit with a suggestion:

```
nit: WDYT about pulling the retry config into `RETRY_OPTIONS` at the top of the file? The same constants are used in `uploader.ts:88`.
```

Reply accepting a change:

```
Good catch, fixed in 7a3c91d.
```

Reply pushing back:

```
TBH I would keep the explicit `Array.from` here. `Set` iteration order is spec-guaranteed, but IMO a lot of readers don't know that. Happy to revisit if you feel strongly.
```

Out-of-scope deferral:

```
Agreed, but it touches the token rotation path and I would try to keep this PR focused. Filed as #942, can you take a look there?
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
