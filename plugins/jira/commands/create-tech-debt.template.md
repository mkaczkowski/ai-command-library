---
description: 'Create Jira technical debt ticket with jira-cli'
---

# Jira Technical Debt Ticket Creation

Act as a technical lead filing a technical debt ticket via `jira-cli`. Gather context, draft the ticket using the template below, and prepare the command but don't run it.

## Required Inputs

- **Issue Type**: The Jira issue type for technical debt (e.g., "Technical Requirement", "Task", "Story")
- **Summary**: Concise description (≤100 chars, no emoji)
- **What**: Clear description of what needs to be done
- **Where**: Specific location/component/module affected
- **Why**: Business or technical justification
- **Acceptance Criteria**: Testable/verifiable requirements
- **Priority**: Issue priority (e.g., Minor, Major, Critical)
- **Labels**: Relevant labels (e.g., tech-debt, refactoring, performance)
- **Parent Epic** (optional): Parent epic ticket ID if applicable

## Ticket Template

```
**What:**
<Clear description of what technical work needs to be done>

**Where:**
<Specific files, components, modules, or areas of the codebase affected>

**Why:**
<Technical or business justification - why this matters now>

**Acceptance Criteria:**
- [ ] Verify that <specific testable requirement>
- [ ] Verify that <specific testable requirement>
- [ ] Verify that <specific testable requirement>
- [ ] Verify that <specific testable requirement>

**Dependencies:**
Please link to related story or technical requirement tickets using the "depends on" relationship.

**References:**
<Links to useful notes, presentations, documentation, ADRs, or other artifacts>
```

## Output Format

Provide three sections:

1. **Issue Summary** – Concise summary line
2. **Issue Metadata** – Issue Type, Priority, Labels, Parent (if applicable)
3. **jira-cli Command** – Ready-to-run command (don't execute yet)

## Command Template

```bash
jira issue create -t"<ISSUE_TYPE>" -y<PRIORITY> -s"<SUMMARY>" -b"<DESCRIPTION>" -a$(jira me) -l"<LABELS>" [--parent=<PARENT_ID>] --no-input
```

**Notes:**

- Replace `<ISSUE_TYPE>` with the project's technical debt issue type
- Replace `<PRIORITY>` with appropriate priority level
- Replace `<LABELS>` with comma-separated labels
- Include `--parent=<PARENT_ID>` only if a parent epic is specified
- Adjust assignee flag (`-a`) as needed for the project

## Example

```bash
jira issue create -t"Task" -yMinor -s"Replace deprecated date library in reporting module" -b"**What:**
Replace moment.js with date-fns in the reporting module.

**Where:**
- src/components/Reports/DateFilter.tsx
- src/utils/dateHelpers.ts

**Why:**
- moment.js is deprecated and no longer maintained
- date-fns is lighter (reduces bundle size by ~50KB)
- Better TypeScript support

**Acceptance Criteria:**
- [ ] Verify that all date formatting functions use date-fns
- [ ] Verify that existing tests pass
- [ ] Verify that bundle size is reduced

**Dependencies:**
Link related tickets using \"depends on\" relationship

**References:**
- Migration guide: https://github.com/date-fns/date-fns/blob/main/docs/upgradeGuide.md" -a$(jira me) -l"tech-debt,dependencies" --no-input
```

## Tips

- **What**: Use action verbs (Refactor, Upgrade, Remove, Consolidate, Migrate, Document)
- **Where**: Be specific with file paths or component names
- **Why**: Include measurable impact when possible (performance, maintainability, security)
- **Acceptance Criteria**: Make them testable and verifiable
- **Labels**: Use relevant tags (tech-debt, refactoring, performance, security, testing, documentation)
