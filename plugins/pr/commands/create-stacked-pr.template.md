---
description: 'Create stacked pull requests splitting work into sequential dependent PRs with conventional commit titles'
---

# Stacked Pull Requests Creation Workflow

Act as the software engineer creating a series of dependent pull requests that build on each other.

**Core Objective:** Analyze the work needed, break it into logical chunks, create sequential branches with proper commits, and generate dependent PRs following conventional commit format.

## Arguments

When the user provides work description, parse to extract:

- **type**: Conventional commit type (feat, fix, refactor, perf, docs, style, test, chore, build, ci)
- **scope**: Feature area (e.g., perf, auth, api)
- **ticket**: Ticket number in UPPERCASE (e.g., ASD-12417, PROJ-5521)
- **description**: What changes need to be implemented

## PR Title Format

Use conventional commit format with stack position:

```
<type>(<scope>): <description> <order>/<total> (<TICKET>)
```

**Case rules:**

- `type`: lowercase
- `scope`: lowercase
- `description`: lowercase, no period at end
- `order/total`: numbers indicating position in stack
- `TICKET`: UPPERCASE

**Examples:**

```
feat(perf): add ReactFlowCanvas with conditional Profiler wrapper 2/10 (ASD-12417)
fix(auth): resolve token refresh race condition 1/3 (PROJ-5521)
refactor(api): extract validation logic into middleware 4/7 (CORE-892)
```

## Step 1: Analyze the Work

Understand what changes are needed based on the description. Break down into logical chunks:

1. Identify the full scope of changes required
2. Consider dependencies between different parts of the work
3. Each PR should be:
   - Functional or at minimum not break the build
   - Ordered by dependencies (foundation first, features built on top later)
   - Target 200-400 lines changed per PR when possible
4. Number the chunks sequentially (1/N, 2/N, etc.)

## Step 2: Detect Default Branch

Determine the base branch for the first PR:

```bash
git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
```

Use the result (typically `main` or `master`) as the base for the first PR.

## Step 3: Plan the Stack

Present the stack plan to the user for approval:

**Branch Structure:**

```
main (or master)
└── <type>/<ticket>-1-<short-desc>     (PR 1/N → main/master)
    └── <type>/<ticket>-2-<short-desc> (PR 2/N → PR 1 branch)
        └── <type>/<ticket>-3-<short-desc> (PR 3/N → PR 2 branch)
```

**Branch naming convention:** `<type>/<ticket>-<order>-<short-description>` (all lowercase)

**Example Plan:**

```markdown
## Proposed Stack (3 PRs)

### PR 1/3: feat(auth): add token validation middleware (PROJ-5521)

- Branch: `feat/proj-5521-1-token-validation`
- Base: `main`
- Changes:
  - Add JWT validation middleware
  - Add token expiry checks
  - Add basic unit tests

### PR 2/3: feat(auth): implement token refresh logic (PROJ-5521)

- Branch: `feat/proj-5521-2-token-refresh`
- Base: `feat/proj-5521-1-token-validation`
- Changes:
  - Add refresh token endpoint
  - Implement refresh token rotation
  - Add integration tests

### PR 3/3: feat(auth): add authentication error handling (PROJ-5521)

- Branch: `feat/proj-5521-3-error-handling`
- Base: `feat/proj-5521-2-token-refresh`
- Changes:
  - Add custom error classes
  - Implement error middleware
  - Update documentation
```

**IMPORTANT:** Do NOT proceed to Step 4 without explicit user approval. Ask: "Would you like me to create these PRs, or do you want to modify the plan first?"

## Step 4: Create PRs

After approval, create each PR in sequence:

### For Each Chunk in the Stack:

1. **Create branch from previous** (or default branch for first PR):

   ```bash
   git checkout <previous-branch-or-default>
   git checkout -b <type>/<ticket>-<n>-<short-desc>
   ```

2. **Implement changes for this chunk**:

   - Make the code changes specific to this chunk
   - Ensure changes are functional and don't break the build
   - Follow the project's coding standards

3. **Commit with proper title format**:

   ```bash
   git add .
   git commit -m "<type>(<scope>): <description> <n>/<total> (<TICKET>)"
   ```

4. **Push and create PR**:

   ```bash
   git push -u origin <type>/<ticket>-<n>-<short-desc>

   gh pr create \
     --base <previous-branch-or-default> \
     --title "<type>(<scope>): <description> <n>/<total> (<TICKET>)" \
     --body-file tmp/pr-stack-<n>-description.md
   ```

### PR Body Template

Save each PR description to `tmp/pr-stack-<n>-description.md`:

```markdown
Part <n> of <total>: [Brief description of this chunk]

[Only for PRs 2+:]
Depends on #[previous PR number]

## Changes

- [Change 1]
- [Change 2]
- [Change 3]

## Testing

- [How to test these specific changes]
- [Prerequisites or setup needed]

## Stack Progress

- [x] #[PR 1] - [title excerpt] [← if completed]
- [x] #[PR 2] - [title excerpt] ← you are here
- [ ] #[PR 3] - [title excerpt]
- [ ] #[PR 4] - [title excerpt]
```

## Step 5: Summary

After all PRs are created, provide a summary with links:

```markdown
## Stack Created Successfully ✓

Created <total> dependent PRs for <TICKET>:

1. **PR #123**: <type>(<scope>): <description> 1/<total> (<TICKET>)
   - Branch: `<type>/<ticket>-1-<short-desc>`
   - Base: `main`
   - URL: [link]

2. **PR #124**: <type>(<scope>): <description> 2/<total> (<TICKET>)
   - Branch: `<type>/<ticket>-2-<short-desc>`
   - Base: `<type>/<ticket>-1-<short-desc>`
   - Depends on: #123
   - URL: [link]

3. **PR #125**: <type>(<scope>): <description> 3/<total> (<TICKET>)
   - Branch: `<type>/<ticket>-3-<short-desc>`
   - Base: `<type>/<ticket>-2-<short-desc>`
   - Depends on: #124
   - URL: [link]

## Next Steps

1. Review each PR in order (start with #123)
2. Once #123 is approved and merged, #124 will need its base updated to `main`
3. Continue the merge cascade through the stack
```

## Best Practices

- **Keep PRs focused**: Each PR should have a clear, single purpose
- **Maintain build health**: Every PR should pass CI/CD checks
- **Clear dependencies**: Make it obvious which PR depends on which
- **Update bases after merges**: When a parent PR is merged, update the base branch of its children
- **Test incrementally**: Each PR should be testable on its own
- **Document well**: Use descriptive commit messages and PR descriptions

## Error Recovery

- **If PR creation fails**: Check if branch is pushed to remote and `gh` is authenticated
- **If conflicts occur**: Resolve in the current branch before creating the PR
- **If plan needs adjustment**: Go back to Step 3 and revise the breakdown

## Example Workflow

**User request:**
"Create stacked PRs for feat auth ASD-12417 implement OAuth2 authentication flow"

**AI response:**

1. Analyzes the work
2. Plans 4 PRs:
   - PR 1/4: Add OAuth2 configuration
   - PR 2/4: Implement authorization endpoint
   - PR 3/4: Implement token endpoint
   - PR 4/4: Add OAuth2 error handling
3. Shows plan and asks for approval
4. Creates branches and PRs in sequence
5. Provides summary with all PR links
