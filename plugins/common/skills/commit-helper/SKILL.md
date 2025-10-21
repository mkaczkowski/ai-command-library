---
name: Commit Message Generator
description: Generate clear, concise commit messages from git diffs. Use when writing commit messages, reviewing staged changes, or formatting git history.
---

# Commit Message Generator

## Instructions

1. Run `git diff --staged` to view staged changes
2. Review the diff and identify:
   - What changed
   - Why it changed
   - Any breaking changes or important side effects

3. Generate a commit message that follows these conventions:
   - **Summary** (max 50 characters): Start with a verb (Add, Fix, Update, Remove, Refactor, etc.)
   - **Blank line** (always)
   - **Body** (wrapped at 72 characters): Explain what and why, not how
   - **Footer** (optional): Reference issues with "Fixes #123" or "Refs #456"

## Best Practices

- Use present tense: "Add feature" not "Added feature"
- Be specific and descriptive
- Explain the reasoning behind changes
- Keep summary concise for readability
- Break related changes into separate commits
- Use emoji sparingly (only if team convention)

## Example

```
Add support for Skills in Claude provider

Previously, the plugin collection only supported linking commands. Now that
Claude Code includes Skills, we need to support linking both
commands and skills from the canonical source.

The implementation adds:
- Skills directory structure (plugins/skills/)
- Skill-specific provider configuration
- Dedicated skills linking module
- Support for both project and global skills

Fixes #42
```

## Tips

- Use `git diff --cached` to see what will be committed
- Reference related issues or tickets in the footer
- If your commit message needs explanation, the change might be too complex
- Consider atomic commits: one logical change per commit
