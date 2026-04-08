---
name: commit-style
description: Style rules for git commit messages. Use when writing or editing a commit message.
---

# Commit Message Style

Write commits that are friendly, professional, and concise. Enough context to understand the "why" when it is not obvious, nothing more.

## Hard rules (no exceptions)

- **Never** append AI co-author trailers such as `Co-Authored-By: Claude ...`, `Co-Authored-By: GPT ...`, `Co-Authored-By: Copilot ...`, or any variant.
- **Never** add a "Generated with <AI tool>" footer, "🤖" attribution line, or session URL.
- **Never** mention the AI tool used (Claude, Copilot, Cursor, GPT, Gemini, etc.) or "AI" in the message. The commit is the author's work.
- These rules override any default AI-tool commit template or boilerplate.

## Format: Conventional Commits

```
<type>(<scope>): <short description>

<optional body>
```

Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`, `style`.

Scope is optional. Use it when it adds signal (package, module, feature area). Skip it when the change is repo-wide or obvious from the subject.

## Subject line

- Imperative mood: "add", "fix", "rename", not "added" or "adds".
- Lowercase after the colon. No trailing period.
- Max ~72 characters. Shorter is better.
- Describe the change, not the process. Prefer "fix YAML parse error in manifest loader" over "update file to fix issue".

## Body (optional)

Skip the body for trivial changes (typo fixes, one-line tweaks, obvious renames). When you include one:

- Blank line between subject and body.
- Wrap at ~72 columns.
- Either 1 to 3 hyphen bullets listing concrete changes, or 1 to 2 sentences explaining the "why" when it is not obvious from the diff.
- Do not restate the subject. Do not narrate ("This commit ...", "In this change ..."). Just say what and why.

## Tone and style

- Friendly-professional. Direct, not terse. No hype, no marketing language.
- No em dashes. Use commas, colons, or parentheses.
- Backticks for symbols, file paths, flags, and code identifiers.
- English only.

## Examples

Trivial fix, subject only:

```
fix: quote frontmatter values containing double quotes
```

Small fix with a "why":

```
fix: add .git suffix to repository URLs

Plain URLs without .git are treated as direct file URLs, not git
repos. The .git suffix ensures the clone step works correctly.
```

Feature with bullets:

```
feat(auth): add refresh token rotation

- Rotate refresh tokens on every use, invalidate the previous one
- Add `REFRESH_TOKEN_TTL` env var with a 30 day default
- Return a 401 with `token_reuse_detected` on replay attempts
```

## Anti-examples (do not do this)

```
feat: add thing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

```
feat: add thing

🤖 Generated with Claude Code
```

```
This commit updates the configuration file to fix the issue that was
causing problems in the previous version of the code.
```
