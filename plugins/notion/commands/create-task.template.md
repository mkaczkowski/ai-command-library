---
description: 'Create a Notion task with structured content based on task type (Bug/Feature/Polish)'
---

# Create Notion Task

Create a well-structured task in a Notion database using the Notion MCP.

**Input:** $ARGUMENTS (task title or description)

## Prerequisites

This command requires:

1. **Notion MCP server** configured in your MCP settings
2. **Database configuration** - you must know your:
   - Data Source ID: `collection://{id}` (fetch from database URL)
   - Task type options (may include emojis like `🐞 Bug`)

If database is not configured, ask user for the database URL and fetch it to get the data source ID.

## Step 1: Analyze Task

From the input, determine:

### Task Type

Infer from keywords:

- **Bug**: "fix", "bug", "broken", "error", "crash", "issue", "not working"
- **Feature request**: "add", "implement", "create", "new", "enable", "support"
- **Polish**: "improve", "update", "refactor", "clean", "revamp", "tweak", "adjust"

### Priority

Infer or ask:

- **High**: "critical", "urgent", "blocker", "asap"
- **Medium**: default
- **Low**: "minor", "nice to have", "eventually"

### Effort Level

Infer from scope:

- **Small**: Single file, simple change, UI tweak
- **Medium**: Multiple files, new component, moderate logic
- **Large**: Architecture change, new feature system, many files

If any cannot be confidently inferred, ask the user.

## Step 2: Gather Context

For implementation tasks, optionally search the codebase to identify:

- Relevant files that would be modified
- Current implementation details
- Related patterns or components

Keep this brief - just enough for accurate task content.

## Step 3: Generate Content

Use the appropriate template based on task type:

### Bug Template

```markdown
## Summary

[One sentence describing the bug]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Observe: ...]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Root Cause

[If known, otherwise "To be investigated"]

## Proposed Fix

[Brief approach to fix]

## Files to Modify

| File           | Changes          |
| -------------- | ---------------- |
| `path/to/file` | [What to change] |

## Acceptance Criteria

- [ ] Bug no longer reproducible
- [ ] No regression in related functionality
```

### Feature Request Template

```markdown
## Summary

[One sentence describing the feature]

## Current State

[What exists now, or "N/A - new feature"]

## Implementation

[Numbered steps or subsections with approach]

## Files to Modify

| File           | Changes          |
| -------------- | ---------------- |
| `path/to/file` | [What to change] |

## Acceptance Criteria

- [ ] [Specific testable criterion]
- [ ] Unit tests added
```

### Polish Template

```markdown
## Summary

[One sentence describing the improvement]

## Current State

[What it looks/works like now]

## Proposed Changes

[What to change - can include options to explore]

## Files to Modify

| File           | Changes          |
| -------------- | ---------------- |
| `path/to/file` | [What to change] |

## Acceptance Criteria

- [ ] [Visual/UX improvement achieved]
- [ ] No regression
```

## Step 4: Create Task

Use the Notion MCP to create the task:

```
mcp__notion__notion-create-pages
- parent: { "data_source_id": "{configured_data_source_id}" }
- pages: [{
    "properties": {
      "Task name": "[Clear, actionable title]",
      "Status": "Not started",
      "Priority": "[High|Medium|Low]",
      "Effort level": "[Small|Medium|Large]",
      "Task type": "[Bug|Feature request|Polish]",
      "Description": "[1-2 sentence summary]"
    },
    "content": "[Generated markdown content]"
  }]
```

**Important**: Task type values may include emojis depending on database configuration. Fetch the database first to get exact option names.

## Step 5: Confirm

After creation, display:

- Task name
- Link to the created task
- Summary of properties set

## Examples

**Input:** `add dark mode toggle to settings`

- Type: Feature request
- Priority: Medium
- Effort: Medium

**Input:** `fix crash when audio device disconnects`

- Type: Bug
- Priority: High
- Effort: Small

**Input:** `make the header less prominent`

- Type: Polish
- Priority: Medium
- Effort: Small

## Error Handling

- **MCP not connected**: Inform user to check Notion MCP configuration
- **Database not found**: Ask user for database URL, fetch to get data source ID
- **Invalid task type**: Fetch database schema to get valid options
- **Creation failed**: Display error message and suggest fixes
