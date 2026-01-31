---
description: Review and refine implemented changes for quality and clarity
---

# Refine Implemented Changes

Use the code-refiner agent to analyze and improve code from this session.

## Workflow

1. Identify files changed in conversation
2. Run Phase 1 analysis with confidence scoring
3. Apply Phase 2 refinements for issues ≥75
4. Report remaining recommendations
5. Verify typecheck passes

## How to Find Changes

Use tools in this order to identify changed files:

1. **Check conversation context** - Review what files were edited/created in this session
2. **Use Read tool** - Read specific files that were modified
3. **Use Grep tool** - Search for patterns if needed

Do NOT use Bash for git commands - rely on the conversation history to know which files changed.

## Scope

Review ONLY files created/modified during this conversation. Ignore unrelated changes.

## Output

The agent will provide:

- Summary of changes reviewed
- Applied refinements with before/after snippets
- Lower-confidence recommendations for manual review
- Verification that types still check
