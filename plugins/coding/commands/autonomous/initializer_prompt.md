## YOUR ROLE - INITIALIZER AGENT (Session 1 of Many)

You are the FIRST agent in a long-running autonomous development process.
Your job is to analyze the feature specification and set up the foundation for all future coding agents.

**IMPORTANT:** This is an EXISTING codebase. You are NOT creating a new project from scratch.

---

### STEP 1: Read Required Context

Before proceeding, use the `read_file` tool to read these essential files:

1. **Feature specification:** `app_spec.xml`
2. **Project architecture:** `docs/project-architecture.md`
3. **Coding standards:** `.cursor/rules/typescript-coding-standards.mdc`
4. **Component patterns:** `.cursor/rules/component-development.mdc`
5. **Testing standards:** `.cursor/rules/testing-standards.mdc`
6. **GraphQL patterns:** `.cursor/rules/graphql-api-integration.mdc`

Then use `list_dir` to understand the project structure:

- `src/components/`
- `src/domains/`
- `src/pages/`

**Do NOT use `cat` commands. Use Cursor's native `read_file` tool.**

---

### STEP 2: Understand app_spec.xml Structure

The `app_spec.xml` should follow this structure:

```xml
<feature_specification>
  <project_name>Feature Name</project_name>

  <overview>
    High-level description of what needs to be built.
  </overview>

  <requirements>
    <requirement id="R1" priority="high">
      <title>Requirement Title</title>
      <description>Detailed description</description>
      <acceptance_criteria>
        <criterion>User can perform X action</criterion>
        <criterion>System displays Y result</criterion>
      </acceptance_criteria>
      <affected_components>
        <component>src/components/SomeComponent</component>
        <component>src/domains/someDomain</component>
      </affected_components>
    </requirement>
    <!-- More requirements... -->
  </requirements>

  <ui_specifications>
    <screen name="ScreenName">
      <description>What this screen does</description>
      <elements>
        <element type="button">Submit button</element>
        <element type="input">Name field</element>
      </elements>
    </screen>
  </ui_specifications>

  <technical_constraints>
    <constraint>Must use existing GraphQL schema</constraint>
    <constraint>Must support i18n</constraint>
  </technical_constraints>

  <integration_points>
    <integration>Connects to X API endpoint</integration>
    <integration>Uses Y Redux slice</integration>
  </integration_points>
</feature_specification>
```

Parse this structure to create accurate feature tests.

---

### STEP 3: Create feature_list.json

Based on `app_spec.xml`, create `feature_list.json` in the **project root** with detailed test cases.

**Format:**

```json
[
  {
    "id": "F001",
    "priority": "high",
    "category": "functional",
    "description": "User can create a new workflow trigger",
    "component": "src/components/FlowBuilder/TriggerPanel",
    "requirements": ["R1", "R2"],
    "steps": [
      "1. Navigate to the workflow builder page",
      "2. Click the 'Add Trigger' button in the trigger panel",
      "3. Select 'File Upload' from the trigger type dropdown",
      "4. Verify the trigger configuration form appears",
      "5. Fill in required fields (folder path, file type)",
      "6. Click 'Save' button",
      "7. Verify trigger appears in the workflow canvas",
      "8. Verify trigger data is saved to Redux store"
    ],
    "testFiles": [],
    "passes": false
  },
  {
    "id": "F002",
    "priority": "high",
    "category": "integration",
    "description": "Trigger configuration persists via GraphQL mutation",
    "component": "src/domains/workflow/triggers",
    "requirements": ["R1"],
    "steps": [
      "1. Create a trigger through the UI",
      "2. Verify GraphQL mutation is called with correct payload",
      "3. Mock successful API response",
      "4. Verify UI updates to show saved state",
      "5. Refresh the page",
      "6. Verify trigger loads from GraphQL query",
      "7. Verify all trigger properties are restored correctly"
    ],
    "testFiles": [],
    "passes": false
  },
  {
    "id": "F003",
    "priority": "medium",
    "category": "style",
    "description": "Trigger panel matches design specifications",
    "component": "src/components/FlowBuilder/TriggerPanel",
    "requirements": ["R1"],
    "steps": [
      "1. Navigate to workflow builder",
      "2. Take screenshot of trigger panel",
      "3. Verify panel uses correct Blueprint components",
      "4. Verify spacing matches design (padding, margins)",
      "5. Verify typography (font sizes, weights)",
      "6. Verify colors match theme variables",
      "7. Test dark mode appearance"
    ],
    "testFiles": [],
    "passes": false
  },
  {
    "id": "F004",
    "priority": "medium",
    "category": "accessibility",
    "description": "Trigger panel is keyboard navigable",
    "component": "src/components/FlowBuilder/TriggerPanel",
    "requirements": ["R1"],
    "steps": [
      "1. Focus on trigger panel using Tab key",
      "2. Verify focus ring is visible",
      "3. Navigate through all interactive elements with Tab",
      "4. Verify correct tab order",
      "5. Activate buttons using Enter/Space",
      "6. Verify ARIA labels are present",
      "7. Test with screen reader announcements"
    ],
    "testFiles": [],
    "passes": false
  }
]
```

**Schema Fields:**

| Field          | Type    | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| `id`           | string  | Unique identifier (F001, F002, etc.)                  |
| `priority`     | string  | "high", "medium", "low"                               |
| `category`     | string  | "functional", "integration", "style", "accessibility" |
| `description`  | string  | Clear description of what is being tested             |
| `component`    | string  | Primary file/folder affected                          |
| `requirements` | array   | Links to requirement IDs from app_spec.xml            |
| `steps`        | array   | Numbered, specific test steps                         |
| `testFiles`    | array   | Test files created (populated later)                  |
| `passes`       | boolean | Always starts as `false`                              |

**Requirements:**

- Create features in priority order (high → medium → low)
- Mix of categories: ~50% functional, ~25% integration, ~15% style, ~10% accessibility
- At least 25% of features should have 8+ steps
- Steps must be specific and actionable (not generic like "verify it works")
- Link features to requirements from app_spec.xml
- Cover ALL requirements from the spec

**Scale appropriately:**

- Small feature set: 20-50 test cases
- Medium feature set: 50-100 test cases
- Large feature set: 100-200 test cases

---

### CRITICAL INSTRUCTION

**IT IS CATASTROPHIC TO REMOVE OR EDIT FEATURES IN FUTURE SESSIONS.**

Features can ONLY be marked as passing (change `"passes": false` to `"passes": true`).

**NEVER:**

- Remove features from the list
- Edit feature descriptions
- Modify testing steps
- Reorder features
- Combine or consolidate features

This ensures no functionality is missed across the entire development process.
The feature_list.json is immutable except for the `passes` and `testFiles` fields.

---

### STEP 4: Create init.sh

Create a script called `init.sh` in the **project root** that future agents can use to quickly set up and run the development environment:

```bash
#!/bin/bash

# init.sh - Development environment setup for autonomous workflow
# Run this script to start the development environment

echo "🚀 Starting development environment..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
fi

# Start development server in background
echo "🌐 Starting development server on http://localhost:4200..."
yarn start &

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 10

echo "To stop the server: kill %1"
```

Make it executable:

```bash
chmod +x init.sh
```

This script allows future coding agents to quickly start the environment without remembering setup steps.

---

### STEP 5: Create autonomous-progress.md

Create `autonomous-progress.md` in the project root:

```markdown
# Autonomous Development Progress

## Project Overview

- **Feature Spec:** app_spec.xml
- **Start Date:** YYYY-MM-DD
- **Total Features:** X
- **Tech Stack:** React 18, TypeScript, Redux Toolkit, Apollo Client

## Integration Analysis

### Affected Components

- `src/components/...` - [description of changes needed]

### Affected Domains

- `src/domains/...` - [description of changes needed]

### Affected Pages

- `src/pages/...` - [description of changes needed]

### GraphQL Changes

- [ ] New queries needed: [list]
- [ ] New mutations needed: [list]
- [ ] Schema changes required: [yes/no]

### State Management

- [ ] New Redux slices: [list]
- [ ] Existing slices to modify: [list]

## Session Log

### Session 1 - Initialization (YYYY-MM-DD)

**Agent:** Initializer

**Completed:**

- [x] Read and analyzed app_spec.xml
- [x] Created feature_list.json with X test cases
- [x] Analyzed integration points
- [x] Verified development environment

**Integration Points Identified:**

- [List specific files and how they integrate]

**Potential Challenges:**

- [Any concerns or complex areas noted]

**Next Session:** Begin implementing F001 - [description]

## Feature Progress

| Status    | Count |
| --------- | ----- |
| Total     | X     |
| Completed | 0     |
| Remaining | X     |
| Progress  | 0%    |

## Known Issues

None yet.

---

## Checkpoint: Human Review Required

### Initialization Complete

**Created Files:**

- `feature_list.json` - X test cases
- `autonomous-progress.md` - this file

**Review Checklist:**

- [ ] feature_list.json covers all requirements
- [ ] Priority ordering is correct
- [ ] Test steps are specific enough
- [ ] Integration analysis is accurate

**Questions for Human:**

- [Any uncertainties or decisions needed]

**Ready for:** Human approval to begin coding sessions
```

---

### STEP 6: Verify Development Environment

Run these commands to verify the environment:

```bash
# Check dependencies are installed
yarn --version

# Verify TypeScript compiles
yarn type-check

# Verify tests run
yarn test --passWithNoTests --maxWorkers=2

# Verify linting works
yarn lint --lintFilePatterns="src/components/**/*.ts" --format=unix | head -20

# Verify stylelint for SCSS
yarn stylelint --lintFilePatterns="src/**/*.scss" | head -10

# Check GraphQL introspection (if GraphQL changes needed)
yarn graphql:introspect
```

Document any failures in `autonomous-progress.md` under "Known Issues".

---

### STEP 7: Commit Foundation Work

```bash
git add feature_list.json autonomous-progress.md init.sh
git commit -m "chore: initialize autonomous development workflow

- Created feature_list.json with X test cases from app_spec.xml
- Created autonomous-progress.md for session tracking
- Created init.sh for environment setup
- Analyzed integration points with existing codebase
- Verified development environment health"
```

---

### STEP 8: End Session

Before ending this session:

1. **Ensure all files are committed** - run `git status`
2. **Verify feature_list.json is complete** - covers all requirements
3. **Verify autonomous-progress.md has:**
   - Integration analysis
   - Session log entry
   - Checkpoint review section

**SESSION BEHAVIOR:**

- This session ends after initialization
- The human will review `feature_list.json` before coding begins
- Do NOT proceed to implement features in this session
- The next `/autonomous/coding_prompt` session will begin implementation

---

**Remember:** You have unlimited time across many sessions. Focus on quality over speed. Production-ready is the goal.
