## Start Autonomous Development Workflow

This command validates prerequisites and guides you through starting the autonomous workflow.

---

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] You create app_spec.xml with feature requirements          │
│                         │                                       │
│                         ▼                                       │
│  [2] Run /initializer_prompt (Session 1)                        │
│      → Creates feature_list.json                                │
│      → Creates autonomous-progress.md                           │
│      → Analyzes integration points                              │
│                         │                                       │
│                         ▼                                       │
│  [3] CHECKPOINT: You review feature_list.json                   │
│                         │                                       │
│                         ▼                                       │
│  [4] Run /coding_prompt (Session 2+)                            │
│      → Implements ONE feature                                   │
│      → Runs all tests                                           │
│      → Updates feature_list.json                                │
│                         │                                       │
│                         ▼                                       │
│  [5] CHECKPOINT: You review implementation                      │
│                         │                                       │
│                         ▼                                       │
│  [6] Repeat steps 4-5 until all features complete               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Validate Prerequisites

Let me check if the required files exist:

**Checking for app_spec.xml...**

Use `read_file` to check if `app_spec.xml` exists in the project root.

**If app_spec.xml does NOT exist:**

You need to create it first. Here's the expected structure:

```xml
<feature_specification>
  <project_name>Your Feature Name</project_name>

  <overview>
    High-level description of what you want to build.
    Include context about why this feature is needed.
  </overview>

  <requirements>
    <requirement id="R1" priority="high">
      <title>Core Functionality</title>
      <description>
        Detailed description of this requirement.
        Be specific about what the user should be able to do.
      </description>
      <acceptance_criteria>
        <criterion>User can perform action X</criterion>
        <criterion>System responds with Y</criterion>
        <criterion>Data persists correctly</criterion>
      </acceptance_criteria>
      <affected_components>
        <component>src/components/SomeComponent</component>
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
      <description>Primary interface for this feature</description>
      <layout>Describe the layout</layout>
      <elements>
        <element type="button" name="submit">Submit Action</element>
        <element type="input" name="search">Search field</element>
      </elements>
      <behavior>
        <interaction>On submit, show loading then result</interaction>
      </behavior>
    </screen>
  </ui_specifications>

  <technical_constraints>
    <constraint>Must integrate with existing GraphQL API</constraint>
    <constraint>Must support internationalization (i18n)</constraint>
    <constraint>Must be accessible (WCAG 2.1 AA)</constraint>
    <constraint>Must work with existing Redux store</constraint>
  </technical_constraints>

  <integration_points>
    <integration type="api">Uses /api/workflows endpoint</integration>
    <integration type="state">Extends workflowSlice in Redux</integration>
    <integration type="component">Renders inside BuilderPage</integration>
  </integration_points>

  <out_of_scope>
    <item>Feature X will not be included</item>
    <item>Edge case Y is deferred</item>
  </out_of_scope>
</feature_specification>
```

Create this file in the project root before proceeding.

---

### Step 2: Check Workflow State

**Checking for existing workflow...**

Use `read_file` to check if `feature_list.json` exists.

**If feature_list.json EXISTS:**

An autonomous workflow is already in progress.

Check status:

```bash
echo "Completed:" && grep -c '"passes": true' feature_list.json || echo "0"
echo "Remaining:" && grep -c '"passes": false' feature_list.json
```

**Options:**

- **Continue:** Run `/coding_prompt` to continue implementing features
- **Restart:** Delete `feature_list.json` and `autonomous-progress.md`, then run `/initializer_prompt`

**If feature_list.json does NOT exist:**

Ready to start fresh. Run `/initializer_prompt` to begin.

---

### Step 3: Verify Environment

Before starting, verify the development environment:

```bash
# Check Node/Yarn
node --version
yarn --version

# Check dependencies
yarn

# Verify project builds
yarn type-check

# Verify tests work
yarn test --passWithNoTests --maxWorkers=2

# Check git status
git status
```

**Common Issues:**

| Issue                | Solution                     |
| -------------------- | ---------------------------- |
| Dependencies missing | Run `yarn install`           |
| TypeScript errors    | Fix before starting workflow |
| Uncommitted changes  | Commit or stash first        |

---

### Step 4: Start the Workflow

**For a NEW workflow:**

1. Ensure `app_spec.xml` is complete
2. Run:
   ```
   /initializer_prompt
   ```
3. Review generated `feature_list.json`
4. Approve to continue

**For CONTINUING an existing workflow:**

1. Run:
   ```
   /coding_prompt
   ```
2. Agent will implement next pending feature
3. Review changes at checkpoint
4. Approve to continue

---

### Human Responsibilities

At each checkpoint, you should:

1. **Review the changes** in git diff or PR
2. **Run the app** manually if desired
3. **Check the feature** works as expected
4. **Provide feedback** if something needs adjustment
5. **Start next session** by running `/coding_prompt`

**Approval is implicit** - starting the next `/coding_prompt` session means you approve the previous work.

**If issues found:**

- Edit `feature_list.json` to set `"passes": false`
- Add notes to `autonomous-progress.md`
- The next session will address issues first

---

### File Artifacts

| File                     | Location     | Created By  | Purpose               |
| ------------------------ | ------------ | ----------- | --------------------- |
| `app_spec.xml`           | Project root | You         | Feature specification |
| `feature_list.json`      | Project root | Initializer | Test cases and status |
| `autonomous-progress.md` | Project root | Initializer | Session logs          |
| `init.sh`                | Project root | Initializer | Dev environment setup |

---

### Quick Reference

| Action             | Command                                     |
| ------------------ | ------------------------------------------- |
| Start new workflow | `/initializer_prompt`                       |
| Continue workflow  | `/coding_prompt`                            |
| Check status       | Read `autonomous-progress.md`               |
| Restart            | Delete artifacts, run `/initializer_prompt` |

---

### Next Steps

Based on the checks above:

1. **If app_spec.xml missing:** Create it following the template
2. **If feature_list.json missing:** Run `/initializer_prompt`
3. **If feature_list.json exists:** Run `/coding_prompt` to continue

---

**Ready?** Proceed with the appropriate command based on your workflow state.
