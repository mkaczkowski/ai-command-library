---
description: 'Generate a detailed engineering task breakdown for a feature following standard project conventions.'
---

# Engineering Task Breakdown Workflow

Act as a Technical Lead performing a comprehensive task breakdown and estimation for the provided Epic or Feature request. Your goal is to break down the work into logical, implementation-ready phases and tasks, strictly following the project's estimation standards.

## Step 1: Context & Analysis

Before generating the breakdown, you must understand the existing system and requirements.

1.  **Review Project Documentation**:
    - **Architecture**: `docs/project-architecture.md`
    - **Testing**: `docs/testing-guide.md`
    - **Components**: `docs/component-development.md`

2.  **Analyze Requirements**:
    - Review the user's request/Jira ticket.
    - Identify the core domains and components involved.
    - **Search the codebase** for relevant existing implementations to leverage or extend.
    - Check for existing UI patterns in Storybook.

## Step 2: Gap Analysis & Interactive Review

**STOP AND WAIT** before generating the full breakdown.

1.  Create a section titled **Gap Analysis** containing:
    - **Missing Requirements**: Implicit needs not stated (e.g., error handling, loading states, empty states).
    - **UI/UX Details**: Are designs provided? Are there missing states (hover, focus, error)?
    - **Dependencies**: Backend APIs (GraphQL schema readiness), third-party libraries, or other teams.
    - **Risks**: Technical complexity, performance concerns, security implications, or legacy code impact.
    - **Questions**: Specific questions for the user to clarify scope.

2.  **Present this Gap Analysis to the user** and explicitly ask for clarification on the questions and concerns raised.

3.  **Do not proceed** to Step 3 until the user has answered the questions or explicitly requested to proceed with the current assumptions.

## Step 3: Generate Task Breakdown

Once the user confirms or provides answers, generate the full breakdown using the **strict format** defined below. Do NOT deviate from this structure. Do NOT include "AI estimated effort" columns.

### 3.1 Formatting Rules

1.  **Story Point Scale**: You MUST include the standard scale definition at the top.
2.  **Phase Overview**: Use a summary table for high-level planning.
3.  **Task Granularity**: Tasks should be implementation-ready (approx. 1-5 days of work).
4.  **Deliverables**: List specific files to be created or modified.
5.  **Testing**: Every task must include relevant test deliverables (Unit, Integration, Storybook, E2E).

### 3.2 Required Output Template

Use the following Markdown structure exactly.

#### Header Section

```markdown
## Story Point Estimation Guide

**Story Point Scale (8 SP ≈ 2 weeks = 1 Engineer Sprint [ES]):**

- **1 Point**: ~1 - Trivial task, minimal complexity, no dependencies, low risk
- **2 Points**: ~2 days - Simple task, straightforward implementation, few dependencies, low-medium risk
- **3 Points**: ~3 days - Moderate task, some complexity, some dependencies, low-medium risk
- **5 Points**: ~1 week - Complex task, significant complexity, multiple dependencies, medium risk
- **8 Points**: ~2 weeks - Very complex task, high complexity, many dependencies, high risk
- **13 Points**: ~3 weeks - Extremely complex task, should be broken down further if possible

**Factors to Consider:**

- Technical complexity
- Number of dependencies
- Risk level (Low/Medium/High)
- Testing requirements (Unit, Integration, E2E)
- Unknown factors

**Note:** Estimates assume a mid-level engineer working 5 hours/day on focused development.

---

## Phase Overview

| Phase | Name         | Objective         | Key Tasks |
| ----- | ------------ | ----------------- | --------- |
| 1     | [Phase Name] | [Phase Objective] | 1.1, 1.2  |
| ...   | ...          | ...               | ...       |
```

#### Phase & Task Section

For each Phase, create a section. For each Task, use this exact block:

```markdown
---

## Phase [N]: [Phase Name]

**Phase objective:** [Description]

### Task [N].[M]: [Task Name]

**Story Points:** [Points]

**Description:**
[Detailed technical description of what needs to be done]

**Deliverables:**

- `src/path/to/file.ts`:
  - [Specific implementation detail]
  - [Specific implementation detail]
- [Test files]
- [Storybook stories if UI]

**Acceptance Criteria:**

- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

**Dependencies:** [Task IDs or None]

**Risk:** [Low/Medium/High] - [Reason]
```

### 3.3 Example Output Reference

Here is an example of how a Phase and Task should be formatted (Do not copy this content, use it as a style guide):

```markdown
## Phase 1: Foundation - Execution Domain & Types

**Phase objective:** Define core execution types, Redux state management, and comprehensive tests.

### Task 1.1: Create Execution Domain Types, Redux State & Tests

**Story Points:** 3

**Description:**
Create TypeScript type definitions, implement Redux Toolkit slice with selectors for execution state management, and provide comprehensive test coverage for the slice and selectors.

**Deliverables:**

- `src/domains/execution/execution.types.ts`:
  - `ExecutionSnapshot` - main execution data structure
  - `NodeExecutionData` - per-node execution state
- `src/domains/execution/execution.slice.ts`:
  - State: `{ execution: ExecutionSnapshot | null }`
  - Actions: `setExecution`, `clearExecution`
- `src/domains/execution/execution.slice.test.ts`

**Acceptance Criteria:**

- [ ] All types align with backend GraphQL schema
- [ ] Redux slice follows Redux Toolkit patterns
- [ ] All selectors are tested with various state scenarios

**Dependencies:** Task 2.1, Task 2.2

**Risk:** Medium - Types must align with backend schema
```

#### Summary Section

At the very end of the document:

```markdown
---

## Summary

**Story Point Scale (8 SP ≈ 1 Engineer Sprint [ES]):**

**Total Story Points:** [Total] ≈ [Total / 8] ES

**Realistic Timeline with 20% Buffer For a Single Mid-Level Engineer:** [Calculated ES * 1.2] ES
```

## Validation Checklist

Before outputting the final response, verify:

1.  Is the **Story Point Scale** exactly as specified?
2.  Are **Deliverables** specific?
3.  Are **Acceptance Criteria** actionable checkboxes?
4.  Is the math in the **Summary** correct?
5.  Do all **Dependencies** reference existing tasks (no forward references)?
6.  Are there no **circular dependencies** in the task graph?
7.  Do dependencies follow **chronological order** (earlier phases before later)?

## Testing Requirements Matrix

Use this matrix to determine required test coverage for each task:

| Component Type   | Unit Tests | Integration | Storybook | E2E | Notes                                 |
| ---------------- | ---------- | ----------- | --------- | --- | ------------------------------------- |
| UI Component     | ✓          | ✓           | ✓         | -   | All visual states in Storybook        |
| Business Logic   | ✓          | -           | -         | -   | High coverage for complex logic       |
| Utility/Hook     | ✓          | -           | ✓\*       | -   | \*Storybook only if has visual output |
| State Management | ✓          | ✓           | -         | -   | Test selectors and reducers           |
| Full Feature     | ✓          | ✓           | ✓         | ✓   | Complete coverage across all layers   |
| Infrastructure   | ✓          | ✓           | -         | -   | Focus on failure modes and edge cases |

**Legend:** ✓ = Required, - = Not applicable, ✓\* = Conditional

When creating task deliverables, reference this matrix to ensure appropriate test files are included.
