# Code Review Plugin

A plugin group for automated code review and refinement.

## Overview

This plugin provides tools for reviewing and improving code quality. Unlike read-only reviewers that only report issues, the code-refiner agent actively applies fixes.

## Components

### Agents

| Agent          | Purpose                        | Tools                             |
| -------------- | ------------------------------ | --------------------------------- |
| `code-refiner` | Analyzes and fixes code issues | Glob, Grep, LS, Read, Edit, Write |

### Commands

| Command                       | Description                                |
| ----------------------------- | ------------------------------------------ |
| `/code-review:refine-changes` | Invoke the code-refiner on session changes |

## Usage

After completing code changes in a session:

```
/code-review:refine-changes
```

The agent will:

1. Identify files modified in the current conversation
2. Analyze code against project standards and quality criteria
3. Apply high-confidence fixes (≥75) automatically
4. Report remaining recommendations for manual review
5. Verify types still check

## Comparison with pro-workflow's code-reviewer

| Aspect     | `code-reviewer` (pro-workflow)     | `code-refiner` (this plugin) |
| ---------- | ---------------------------------- | ---------------------------- |
| Location   | `coding/commands/pro-workflow/`    | `code-review/`               |
| Purpose    | Analysis only                      | Analysis + Fixes             |
| Tools      | Read-only (Glob, Grep, Read, etc.) | Includes Edit, Write         |
| Scope      | Reviews git diff by default        | Reviews session changes      |
| Confidence | ≥80 threshold                      | ≥75 threshold                |
| Color      | Red                                | Orange                       |

These agents are **complementary**:

- Use `code-reviewer` for PR reviews and audits (read-only, git-based)
- Use `code-refiner` for iterative improvement during development (active fixes, session-based)

## Installation

```bash
npx link-ai-commands --provider claude --plugins code-review
```

## Configuration

The agent reads project standards from `CLAUDE.md`. Ensure your project has clear coding guidelines for best results.

## Review Criteria

The agent evaluates code against:

- **Project Standards**: Reads CLAUDE.md for project-specific conventions (imports, exports, naming, etc.)
- **Code Quality**: Function length, nesting depth, magic values, dead code, duplication
- **TypeScript**: Type safety, return types, assertions, null handling
- **React Patterns**: Re-render optimization, useEffect cleanup, dependency arrays
- **Clarity**: Nested ternaries, clever one-liners, redundant comments
