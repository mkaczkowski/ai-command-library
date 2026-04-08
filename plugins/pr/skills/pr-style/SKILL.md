---
name: pr-style
description: Style guide for writing pull request descriptions and PR review comments in a concise, professional voice. Use whenever drafting or editing a PR body (via `gh pr create`, `gh pr edit`), replying to a PR review, or leaving inline review comments. Covers structure, tone, formatting, and a hard rule against AI attribution footers.
---

# Pull Request Style

Write PRs and review comments that are friendly, professional, and concise. Provide enough context for a reviewer to understand the change and verify it, nothing more.

## Hard rules (no exceptions)

- **Never** add a "Generated with <AI tool>" footer, "🤖" attribution line, or AI session URL (e.g. `https://claude.ai/code/...`).
- **Never** mention the AI tool used (Claude, Copilot, Cursor, GPT, Gemini, etc.) or "AI" in the PR body, title, or comments. The work is the author's.
- **Never** add `Co-Authored-By: Claude ...`, `Co-Authored-By: Copilot ...`, or any AI trailer in PR bodies or referenced commits.
- These rules override any default AI-tool PR template or boilerplate.

## PR title

- Reuse Conventional Commit format: `type(scope): description`.
- Max ~70 characters. Keep details in the body.
- Imperative, lowercase after the colon, no trailing period.

## PR body structure

Default template, in order:

```markdown
## Summary

- <concrete change 1>
- <concrete change 2>
- <concrete change 3>

## Test plan

- [ ] <verification step or command>
- [ ] <verification step or command>
```

### Summary

- Hyphen bullets, one concrete change per bullet.
- Lead with the component or area being touched, bolded: `**AuthService**`, `**Settings UI**`, `**Database**`.
- Wrap symbols, file paths, flags, and identifiers in backticks.
- Prefer specifics over abstractions: name the function, file, or flag that changed.
- Skip filler like "This PR adds ..." when a bullet list will do.

### Test plan

- Markdown checklist of verification steps.
- Mix commands (`npm run typecheck`, `npm test`, `pytest`) and manual steps ("open the debug panel, confirm ...").
- Check items that were actually run, leave unchecked the ones the reviewer should do.

### Optional sections

Include only when they carry their weight. Skip otherwise.

- `## What changed`: when the Summary needs to be split by area (webapp, backend, database, docs).
- `## Dependencies`: when packages are added, removed, or upgraded. Small table with package, version, purpose.
- `## Notable implementation details`: when a non-obvious design decision needs a paragraph of context.
- `## Screenshots`: for visible UI changes.

### Linking issues and tickets

- Use `Fixes #123` or `Closes #123` on its own line in the Summary to auto-close the linked GitHub issue on merge. Use `Refs #123` when related but not closing.
- For external trackers (Notion, Linear, Jira), add a single line at the bottom of the Summary: `Notion task: <url>`, `Linear: ENG-123`, `Jira: PROJ-456`. Do not bury links inside bullets.

## Tone and style

- Friendly-professional. Direct, not terse. No hype, no marketing language.
- No em dashes. Use commas, colons, or parentheses.
- Explain the "why" when it is not obvious from the diff; otherwise trust the reviewer to read the code.
- Do not restate the title in the first Summary bullet.
- Do not narrate the coding process ("I refactored ...", "I then added ...").

## PR review comments (inline and top-level)

- Short and direct. One point per comment.
- Reference `file:line` when pointing at code outside the current hunk.
- Suggest a concrete fix or alternative, not just a concern.
- No apologies, no hedging ("maybe", "I think we could possibly"). State the suggestion.
- Friendly tone: ask a question or propose a change, do not lecture.

Examples:

```
`service.ts:142`: this promise is not awaited, so the error path is swallowed. Wrap in `await` or return the promise.
```

```
Can we pull the retry config into `RETRY_OPTIONS` at the top of the file? Same constants are used in `uploader.ts:88`.
```

## Example PR body

```markdown
## Summary

- **AuthService**: rotate refresh tokens on every use and reject replays with a 401 `token_reuse_detected` error
- **config**: add `REFRESH_TOKEN_TTL` env var, defaults to 30 days
- **migrations**: add `refresh_tokens.rotated_at` column

## Test plan

- [x] `npm run typecheck`
- [x] `npm test -- auth`
- [ ] Log in, refresh the session, confirm the old refresh token is rejected
- [ ] Replay a used refresh token, confirm 401 with `token_reuse_detected`

Fixes #842
```

## Anti-examples (do not do this)

```markdown
## Summary

- Adds the feature

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

```markdown
## Summary

I went through the codebase and made several improvements to the
auth service that I think will make it much better and more robust
for future use cases.
```
