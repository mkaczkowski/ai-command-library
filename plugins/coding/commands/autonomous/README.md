# Autonomous Development Workflow

Cursor IDE slash commands for running an autonomous, multi-session development workflow to implement features from a specification.

## Overview

The autonomous workflow enables an AI agent to implement features across multiple sessions, with human checkpoints after each feature for quality control.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   app_spec.xml  ──►  /initializer_prompt  ──►  Session 1    │
│        │                                            │       │
│        │                                            ▼       │
│        │                              feature_list.json     │
│        │                              autonomous-progress.md│
│        │                                            │       │
│        │                                     [CHECKPOINT]   │
│        │                                            │       │
│        │         ┌──────────────────────────────────┘       │
│        │         │                                          │
│        │         ▼                                          │
│        └────►  /coding_prompt  ──►  Session 2, 3, 4...      │
│                      │                                      │
│                      ▼                                      │
│               Implement Feature                             │
│                      │                                      │
│                      ▼                                      │
│               [CHECKPOINT]  ◄─── Human Review               │
│                      │                                      │
│                      ▼                                      │
│               Next Feature...                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Commands

| Command                          | Purpose                                 | When to Use                   |
| -------------------------------- | --------------------------------------- | ----------------------------- |
| `/autonomous/start_autonomous`   | Validate prerequisites and get guidance | First time or unsure of state |
| `/autonomous/initializer_prompt` | Create feature list and setup           | Session 1 only                |
| `/autonomous/coding_prompt`      | Implement features one at a time        | Session 2 onwards             |

**Note:** Commands are in `.cursor/commands/autonomous/` folder.

## Quick Start

### 1. Create Your Specification

Create `app_spec.xml` in the project root:

```xml
<feature_specification>
  <project_name>My Feature</project_name>

  <overview>
    Description of what you want to build.
  </overview>

  <requirements>
    <requirement id="R1" priority="high">
      <title>Core Feature</title>
      <description>Detailed description of what should be built.</description>
      <acceptance_criteria>
        <criterion>User can do X</criterion>
        <criterion>System shows Y</criterion>
      </acceptance_criteria>
      <affected_components>
        <component>src/components/TargetComponent</component>
      </affected_components>
    </requirement>

    <requirement id="R2" priority="medium">
      <title>Secondary Feature</title>
      <description>...</description>
      <acceptance_criteria>
        <criterion>...</criterion>
      </acceptance_criteria>
    </requirement>
  </requirements>

  <ui_specifications>
    <screen name="MainScreen">
      <description>What this screen does</description>
      <elements>
        <element type="button">Submit</element>
        <element type="input">Search field</element>
      </elements>
    </screen>
  </ui_specifications>

  <technical_constraints>
    <constraint>Must use existing GraphQL schema</constraint>
    <constraint>Must support i18n</constraint>
    <constraint>Must be accessible (WCAG 2.1 AA)</constraint>
  </technical_constraints>

  <integration_points>
    <integration>Uses workflow GraphQL endpoint</integration>
    <integration>Extends workflowSlice Redux state</integration>
  </integration_points>
</feature_specification>
```

**Tips for good specifications:**

- Be specific about requirements
- Include acceptance criteria
- Reference existing components/patterns
- Specify technical constraints
- Note what's out of scope

### 2. Run the Initializer (Session 1)

```
/start_autonomous
```

This validates prerequisites. Then run:

```
/initializer_prompt
```

The initializer will:

- Parse your specification
- Generate `feature_list.json` with test cases
- Create `autonomous-progress.md` for tracking
- Analyze integration points with existing code

### 3. Review the Feature List

After Session 1, review `feature_list.json`:

- Are all requirements captured as features?
- Are the test steps specific and actionable?
- Is the priority order correct?
- Are the component paths accurate?

**This is your chance to catch issues before coding begins.**

### 4. Continue with Coding Sessions

For each subsequent session:

```
/coding_prompt
```

Each coding session will:

1. Verify codebase health (type-check, lint, tests)
2. Check for regressions in passing features
3. Implement ONE feature from the list
4. Run all tests (unit, integration, browser)
5. Update feature_list.json
6. Request human review

### 5. Review at Checkpoints

After each feature, review:

- [ ] Code follows project patterns
- [ ] Tests are comprehensive
- [ ] i18n used for user-facing text
- [ ] Accessibility attributes present
- [ ] UI matches requirements (if applicable)
- [ ] No regressions introduced

Then start the next `/coding_prompt` session.

## File Artifacts

### app_spec.xml (You Create)

Your feature specification in XML format. This is the source of truth.

**Location:** Project root

### init.sh (Generated)

Shell script to quickly start the development environment.

**Location:** Project root

**Usage:**

```bash
./init.sh
```

This script:

- Installs dependencies if needed
- Runs type check
- Starts the dev server on port 4200

### feature_list.json (Generated)

List of features with test cases and pass/fail status.

**Location:** Project root

**Structure:**

```json
[
  {
    "id": "F001",
    "priority": "high",
    "category": "functional",
    "description": "Feature description",
    "component": "src/components/ComponentName",
    "requirements": ["R1"],
    "steps": ["1. Navigate to page", "2. Click button", "3. Verify result"],
    "testFiles": ["src/components/ComponentName/ComponentName.test.tsx"],
    "passes": false
  }
]
```

**Rules:**

- Only modify `passes` and `testFiles` fields
- Never remove features
- Never edit descriptions or steps

### autonomous-progress.md (Generated)

Session logs, integration analysis, and progress tracking.

**Location:** Project root

**Contains:**

- Project overview
- Integration analysis
- Session-by-session log
- Feature progress stats
- Known issues
- Checkpoint review requests

## Testing Integration

The workflow uses the project's existing test infrastructure:

| Test Type   | Command                                    | Purpose               |
| ----------- | ------------------------------------------ | --------------------- |
| Type Check  | `yarn type-check`                          | TypeScript validation |
| ESLint      | `yarn lint --lintFilePatterns=<file>`      | Code style for TS/TSX |
| Stylelint   | `yarn stylelint --lintFilePatterns=<file>` | Code style for SCSS   |
| Unit Tests  | `yarn test --testPathPattern=<path>`       | Component/hook logic  |
| GraphQL     | `yarn graphql:introspect`                  | gql.tada schema sync  |
| Storybook   | `yarn storybook`                           | Component preview     |
| Integration | `yarn test:integration --spec=<file>`      | Workflow integration  |
| Browser     | MCP browser tools                          | Visual verification   |

## Human Checkpoints

Checkpoints ensure quality and allow course correction.

### After Initialization (Session 1)

- Review `feature_list.json` for completeness
- Verify all requirements are captured
- Check priority ordering makes sense
- Approve integration analysis

### After Each Feature (Session 2+)

- Review code changes (git diff)
- Run the app manually if desired
- Verify against requirements
- Provide feedback if needed
- Start next session to continue

### On Issues

- Agent will pause and request guidance
- Review the issue details in autonomous-progress.md
- Provide direction before continuing

## Best Practices

### Writing Good Specifications

1. **Be specific** - Include exact requirements, not vague descriptions
2. **Include acceptance criteria** - What does "done" look like?
3. **Reference existing patterns** - Point to similar features in codebase
4. **Specify edge cases** - What should happen in error scenarios?
5. **Define scope clearly** - Include "out of scope" section

### During Development

1. **Don't skip checkpoints** - Review each feature before proceeding
2. **Provide feedback early** - Catch issues before they compound
3. **Keep sessions focused** - One feature at a time is intentional
4. **Trust the process** - The workflow handles regressions

### Troubleshooting

**Feature marked passing but has issues:**

```bash
# Edit feature_list.json to set the feature's passes to false
# Add issue to autonomous-progress.md
# Next session will fix it first
```

**Agent stuck on an issue:**

1. Check `autonomous-progress.md` for details
2. Review "Questions/Concerns" section
3. Provide guidance in the checkpoint comments
4. Consider simplifying the requirement

**Want to start over:**

```bash
rm feature_list.json autonomous-progress.md
# Update app_spec.xml if needed
# Run /initializer_prompt
```

**Rollback a bad commit:**

```bash
git log --oneline -5  # Find the bad commit
git revert HEAD       # Revert last commit
# Or: git reset --hard HEAD~1  # Discard last commit entirely
```

## Integration with Project Workflows

This autonomous workflow integrates with existing project infrastructure:

- Uses coding standards from `.cursor/rules/`
- Follows Blueprint Design System patterns
- Integrates with existing test infrastructure
- Uses project's GraphQL patterns
- Creates commits following project conventions

**Best for:** Implementing **new features** from specifications

**Not for:** Bug fixes, refactoring, or maintenance (use standard workflow)

## Example Session Flow

```
Session 1 (Initializer):
├── Read app_spec.xml
├── Read project architecture and patterns
├── Create feature_list.json (50 features)
├── Create autonomous-progress.md
├── Analyze integration points
├── Verify development environment
├── Commit foundation work
└── CHECKPOINT: Human reviews feature list
    └── You review, approve or adjust

Session 2 (Coding):
├── Read progress and feature list
├── Verify codebase health (type-check, lint, tests)
├── Select F001 (highest priority, not passing)
├── Read similar existing code
├── Implement F001 - TriggerPanel component
├── Write unit tests
├── Run all verification (tests, lint, browser)
├── Mark F001 as passing
├── Commit changes
├── Update progress notes
└── CHECKPOINT: Human reviews F001
    └── You review code, run app, approve

Session 3 (Coding):
├── Verify F001 still works (regression check)
├── Verify codebase health
├── Implement F002 - Trigger configuration form
├── Write tests, verify in browser
├── Mark F002 as passing
└── CHECKPOINT: Human reviews F002

... continue until all features complete ...

Final Session:
├── All features passing
├── Final verification
└── Workflow complete!
```

## Recovery Procedures

### If Tests Start Failing

1. Agent will detect in Step 3 (Verify Codebase Health)
2. Agent will fix before implementing new features
3. If can't fix, will document and request human guidance

### If Feature is Too Complex

1. Agent will note challenges in autonomous-progress.md
2. Will complete what's possible
3. Will request human guidance for remainder

### If Human Wants Changes

1. Edit `feature_list.json` to set `"passes": false`
2. Add specific feedback to `autonomous-progress.md`
3. Next session will address the feedback

## Limitations

- One feature per session (prevents overwhelming changes)
- Requires human checkpoint after each feature
- Best for new feature implementation, not debugging
- Relies on good specification quality

## Support

For issues with the autonomous workflow:

1. Check `autonomous-progress.md` for session details
2. Review `feature_list.json` for current state
3. Consult project docs in `docs/`
4. Check `.cursor/rules/` for coding standards
