---
description: 'Perform detailed work estimation analysis for a Jira task with AI-assisted productivity metrics.'
---

# Jira Task Estimation & Analysis Workflow

Act as the technical lead performing a comprehensive work estimation analysis for a Jira task or epic. Your goal is to break down the work into logical packages, estimate effort with and without AI assistance, identify risks, and provide actionable sprint planning insights.

## Step 1: Gather Task Context

### Phase 1: Retrieve Jira Task

1. If user provides a Jira ticket ID (e.g., JIRA-1234), fetch the ticket details using the MCP tool:

   **Use the `get_jira_issue` MCP tool from box-forge:**
   - Call the tool with the ticket ID
   - The tool will return comprehensive ticket information including description, comments, status, and metadata

   If the MCP tool is not available, ask the user to provide the ticket details directly.

2. If user provides task description directly, skip the fetch step and use the provided text.

3. Extract key information from the Jira response:
   - **Task summary** - What needs to be built
   - **Requirements** - Functional and non-functional requirements
   - **Acceptance criteria** - Definition of done
   - **Comments** - Additional context or clarifications
   - **Dependencies** - Blocked by or blocking other tickets
   - **Priority** - Task priority level

### Phase 2: Review Project Documentation

Read the following documentation files to understand project context:

1. **Architecture patterns** - `@docs/project-architecture.md`
   - Understand current architectural patterns and conventions
   - Review module organization and dependency structure

2. **Testing guidelines** - `@docs/testing-guide.md`
   - Understand testing requirements and levels (unit, integration, e2e)
   - Identify required test coverage expectations

3. **Coding standards** - `@docs/coding-standards.md` (if available)
   - Understand code quality expectations
   - Review naming conventions and style guidelines
   - Identify linting rules and code review criteria

### Phase 3: Analyze Codebase

Search for related implementations to understand:

1. **Existing patterns** - Similar features to leverage:
   - Find components, services, or modules related to the task
   - Identify reusable patterns and utilities

2. **Integration points** - What will be modified:
   - Which files/modules will need changes
   - State management implications

3. **Dependencies** - External factors:
   - Third-party libraries needed
   - Backend (GraphQL)) requirements

## Step 2: Perform Gap Analysis

Identify and document missing or implicit requirements:

### Critical Questions to Address

- **Missing requirements** - What's not explicitly stated but will be needed?
  - Error handling strategies
  - Loading states and user feedback
  - Empty states and edge cases
  - Validation rules

- **External dependencies** - What's outside your control?
  - Backend GraphQL (existing or need to be built)
  - Design reviews

- **Integration complexity** - How does this fit?
  - Impact on existing features
  - Data migration needs
  - Backward compatibility requirements
  - Feature flag strategy

- **Testing requirements** - What needs verification?
  - Unit tests (components, utilities, logic)
  - Integration tests (API, state, routing)
  - E2E tests (user flows, critical paths)
  - Manual testing scenarios
  - Accessibility testing (WCAG 2.1 AA)

- **UX/Design needs** - User experience considerations?
  - User feedback mechanisms (notifications, modals, messages)
  - Visual indicators (loading, success, error states)
  - Responsive design requirements
  - Accessibility considerations

- **Performance implications** - Will this affect performance?
  - Bundle size impact
  - Runtime performance concerns
  - Database query optimization
  - Caching strategies

- **Security considerations** - What are the risks?
  - Permission and authorization checks
  - Input validation and sanitization

- **Documentation needs** - What needs to be written?
  - Preparation of one-pager or RFC
  - Developer documentation

Document your findings in a clear "Gap Analysis" section.

## Step 3: Create Work Breakdown

Break the work into 8-12 logical packages covering the full development lifecycle:

### Typical Package Categories

1. **Foundation/Setup** - Project setup, dependencies, configuration
2. **Core Logic** - Business logic, algorithms, data processing
3. **UI Components** - React components, styling, layouts
4. **Forms & Validation** - Input handling, validation, state management
5. **API Integration** - Backend communication, data fetching
6. **State Management** - Redux/Context setup
7. **Error Handling** - Error boundaries, user feedback, logging
8. **Testing** - Unit tests, integration tests, E2E tests
9. **Accessibility** - ARIA labels, keyboard navigation, screen reader support
10. **Documentation** - Code comments, README updates, API docs
11. **Performance** - Optimization, lazy loading, caching
12. **Code Review & Polish** - PR reviews, refinements, bug fixes

Adjust packages based on the specific task requirements.

## Step 4: Create Estimation Table

Generate a detailed table with the following structure:

### Table Columns

| # | Package | Effort w/ AI (days) | Effort w/o AI (days) | Key Implementation Tasks | Testing Requirements | Risk |

### Column Guidelines

**# (Number):**

- Sequential package number (1-12)

**Package:**

- Descriptive name for the work package
- Should be clear what it covers

**Effort Without AI:**

- Estimated days assuming manual coding
- Based on experienced developer
- Use fractional days (0.5, 1.0, 1.5, 2.0, etc.)
- Consider complexity, unknowns, and dependencies

**Effort With AI:**

- Estimated days with AI assistance
- Realistic reduction for AI-automatable work
- Don't be overly optimistic
- Use fractional days

**AI Usage %:**

- Percentage of work AI can automate or assist with
- Guidelines by task type:
  - Boilerplate/routing: 70-85%
  - Repetitive changes: 75-80%
  - Unit tests: 70-85%
  - Documentation: 60-80%
  - Integration tests: 60-70%
  - Complex logic: 40-60%
  - UX/Design: 20-40%
  - Manual testing: 10-20%
  - Code review: 10-20%

**Key Implementation Tasks:**

- 4-8 high-level tasks per package
- Focus on WHAT needs to be done, not HOW
- Mark each task with symbols:
  - 🤖 = AI can automate this task
  - 👤 = Human judgment required
  - 🤖/👤 = AI assists, human guides
- Keep tasks concise (one line each)
- Use bullet points with proper indentation

**Testing Requirements:**

- List types of tests needed
- Mark with 🤖 or 👤
- Include:
  - Unit tests (components, utilities, hooks)
  - B2B tests with Playwright
  - E2E tests with WDIO (user flows)
  - Manual testing scenarios
  - Accessibility testing

**Risk:**

- Low, Medium, or High
- Brief justification (one line)
- Consider:
  - Complexity and unknowns
  - External dependencies
  - Integration points
  - Testing coverage needs

## Step 5: Generate Summary Sections

After the main estimation table, include these sections:

### 5.1 Effort Summary Table

```markdown
## Effort Summary

| Metric                 | Days                          |
| ---------------------- | ----------------------------- |
| **Total Without AI**   | [sum all "Without AI" column] |
| **Total With AI**      | [sum all "With AI" column]    |
| **AI Time Savings**    | [difference between above]    |
| **Buffer (30-40%)**    | [With AI * 0.20-0.25]         |
| **Realistic Estimate** | [With AI + Buffer]            |
```

### 5.2 AI Usage Legend

```markdown
## AI Usage Legend

**Symbols:**

- 🤖 = AI can fully automate this task
- 👤 = Human judgment and expertise required
- 🤖/👤 = AI assists, human guides and validates
```

## Step 6: Present Analysis for Review

Before finalizing:

1. **Validate completeness:**
   - All packages have realistic estimates
   - Risks are identified and assessed
   - Gap analysis covers unknowns

2. **Check formatting:**
   - Table is well-formatted markdown
   - Symbols render correctly (🤖 👤 🤖/👤)
   - All sections are present and complete

3. **Present to user:**
   - Show the gap analysis
   - Show the estimation table
   - Show all summary sections

## Validation Checklist

Before presenting the final analysis:

- [ ] Task requirements fully understood
- [ ] Relevant documentation reviewed
- [ ] Codebase searched for patterns and integration points
- [ ] Gap analysis identifies missing requirements
- [ ] 8-12 logical work packages defined
- [ ] Estimates are realistic (not overly optimistic)
- [ ] AI usage percentages match task types
- [ ] Key implementation tasks are high-level and clear
- [ ] Risks are assessed and justified
- [ ] Table formatting is correct markdown
