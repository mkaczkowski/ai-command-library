---
name: stacked-prs
description: Create stacked pull requests for GitHub repositories. Use when breaking large features into sequential, dependent PRs with conventional commit titles. Triggers on requests to create stacked PRs, split work into multiple PRs, or organize changes into a PR series.
---

# Stacked PRs

Create a series of dependent pull requests that build on each other, with properly formatted conventional commit titles.

## PR Title Format

```
<type>(<scope>): <description> <order>/<total> (<ticket>)
```

**Components:**

| Part        | Case      | Example                   | Notes                       |
| ----------- | --------- | ------------------------- | --------------------------- |
| type        | lowercase | `feat`, `fix`, `refactor` | Conventional commit type    |
| scope       | lowercase | `perf`, `auth`, `api`     | Feature area in parentheses |
| description | lowercase | `add ReactFlowCanvas...`  | Start lowercase, no period  |
| order/total | numbers   | `2/10`                    | Position in stack           |
| ticket      | UPPERCASE | `ASD-12417`               | Project prefix + number     |

**Conventional commit types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `docs` - Documentation only
- `style` - Formatting, no code change
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `build` - Build system changes
- `ci` - CI configuration

**Examples:**

```
feat(perf): add ReactFlowCanvas with conditional Profiler wrapper 2/10 (ASD-12417)
fix(auth): resolve token refresh race condition 1/3 (PROJ-5521)
refactor(api): extract validation logic into middleware 4/7 (CORE-892)
docs(readme): add API usage examples 2/3 (DOC-445)
```

## Workflow

### 1. Analyze the work

Identify logical chunks that can be reviewed independently:

- Each PR should be functional or at minimum not break the build
- Order by dependencies (foundation first, features built on top later)
- Target 200-400 lines changed per PR when possible

### 2. Create branch structure

```
main (or master)
└── feat/ticket-1-base-setup        (PR 1/N → main/master)
    └── feat/ticket-2-core-logic    (PR 2/N → PR 1 branch)
        └── feat/ticket-3-ui        (PR 3/N → PR 2 branch)
```

Branch naming: `<type>/<ticket>-<order>-<short-description>`

### 3. Create PRs in order

For each chunk:

```bash
# Create branch from previous
git checkout -b feat/TICKET-2-core-logic

# Make changes, commit
git add .
git commit -m "feat(scope): description 2/N (TICKET)"

# Push and create PR
git push -u origin feat/TICKET-2-core-logic
gh pr create --base feat/TICKET-1-base-setup \
  --title "feat(scope): description 2/N (TICKET)" \
  --body "Part 2 of N: [description]

Depends on #[previous PR number]

## Changes
- [list changes]"
```

### 4. PR body template

```markdown
Part X of Y: [Brief description of this chunk]

Depends on #[PR number] <!-- omit for first PR -->

## Changes

- [Change 1]
- [Change 2]

## Stack

- [ ] #[PR 1] - [title excerpt]
- [x] #[PR 2] - [title excerpt] ← you are here
- [ ] #[PR 3] - [title excerpt]
```

### 5. Managing the stack

**When earlier PRs get feedback:**

```bash
# Update PR 1
git checkout feat/TICKET-1-base-setup
# make changes
git commit --amend  # or new commit
git push --force-with-lease

# Rebase PR 2 onto updated PR 1
git checkout feat/TICKET-2-core-logic
git rebase feat/TICKET-1-base-setup
git push --force-with-lease

# Repeat for remaining PRs in stack
```

**When PR 1 merges:**

```bash
# Update PR 2 to target the default branch
gh pr edit [PR-2-number] --base main  # or master

# Rebase PR 2 onto the default branch
git checkout feat/TICKET-2-core-logic
git fetch origin
git rebase origin/main  # or origin/master
git push --force-with-lease
```

## Quick Reference

| Action        | Command                                                    |
| ------------- | ---------------------------------------------------------- |
| Create branch | `git checkout -b <type>/<ticket>-<n>-<desc>`               |
| Create PR     | `gh pr create --base <prev-branch> --title "<title>"`      |
| Update base   | `gh pr edit <number> --base <new-base>`                    |
| Rebase stack  | `git rebase <updated-base> && git push --force-with-lease` |
