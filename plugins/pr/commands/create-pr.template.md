---
description: 'Create a GitHub pull request following the project template.'
---

# GitHub Pull Request Creation Workflow

Act as the software engineer creating a well-documented pull request.

**Core Objective:** Analyze branch changes, populate the PR template with concise information, and create the pull request after user approval.

## Step 1: Gather Context

### Phase 1: Branch Analysis

1. Verify branch state and get commit history:

   ```bash
   git status && git rev-parse --abbrev-ref HEAD
   BASE=$(git merge-base HEAD origin/main)
   git log $BASE..HEAD --oneline
   git diff $BASE..HEAD --stat
   ```

2. Review changes to understand:
   - **Primary purpose**: bug fix, feature, refactor, or performance improvement
   - **Implementation**: key architectural decisions
   - **Scope**: affected files/modules, breaking changes
   - **Testing**: tests added or modified
   - **Dependencies**: new or updated packages

3. Extract project-specific context:
   - Ticket ID from branch name (if applicable: JIRA, Linear, GitHub issue, etc.)
   - Dependencies from package files

> **User-Provided Context:** If the user provided a description, use it as the primary "what" and "why". Supplement with technical details from code analysis (testing, dependencies, implementation specifics).

### Phase 2: Load Template

```bash
cat .github/PULL_REQUEST_TEMPLATE.md
```

Use this as the source of truth for PR structure. If missing, inform the user.

## Step 2: Draft PR Description

Populate each section of the template:

**Description:**

- 1-3 sentences: what changed, why, and implementation approach
- Include ticket reference if found in branch/commits (JIRA, Linear, GitHub issue, etc.)

**Dependencies:**

- List new packages with versions
- Note significant updates
- State "None" if unchanged

**Testing Strategy:**

- Mark applicable test types (Unit, Integration, Visual)
- Provide specific testing steps that include:
  - Prerequisites and setup requirements
  - Step-by-step actions with expected outcomes
  - Edge cases and error scenarios to verify
  - Any test data or configuration needed

**Screenshots:**

- For UI changes: Use the default placeholder/table from the template (user adds screenshots later on GitHub)
- For non-UI changes: State "N/A - No visual changes"

**Author Checklist:**

- Check only items that are actually true for this PR
- Leave items unchecked if they don't apply or aren't met

## Step 3: Present for Approval

Show the user:

1. **PR Title** (≤72 characters)
2. **PR Description** (populated template in fenced markdown block)

**Validation before presenting:**

- Title concise (≤72 chars)
- Description explains why
- Testing instructions are specific
- No placeholder text remains (screenshot tables are OK)

**IMPORTANT:** Do NOT proceed to Step 4 without explicit user approval. Ask: "Would you like me to create this PR, or do you want to modify anything first?"

### PR Title Format

Follow conventional commit format (≤72 characters):

**With ticket reference:**
`<type>(<scope>): <description> (TICKET-ID)`

**Without ticket reference:**
`<type>(<scope>): <description>`

**Examples:**

- `feat(api): add workflow endpoint (JIRA-1234)`
- `fix: resolve navigation bug (GH-567)`
- `refactor(auth): simplify token validation`
- `docs: update API documentation`

## Step 4: Create Pull Request

After approval:

1. Save the PR draft to a temporary file:

   ```bash
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   mkdir -p tmp
   cat > "tmp/pr-draft-$BRANCH.md" <<'EOF'
   [Insert the approved PR description here]
   EOF
   ```

2. Ensure branch is pushed to remote:
   - Check if branch exists on remote: `git ls-remote --heads origin $(git rev-parse --abbrev-ref HEAD)`
   - If not pushed, inform user: "Branch not found on remote. Please run: `git push -u origin <branch-name>`"
   - Wait for user to push before proceeding

3. Create the PR:

   ```bash
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   gh pr create \
     --base main \
     --head "$BRANCH" \
     --title "[Insert approved PR title]" \
     --body-file "tmp/pr-draft-$BRANCH.md"
   ```

4. Display the PR URL returned by `gh pr create`

**Error Recovery:**

- If PR already exists: Ask user if they want to edit the existing PR with `gh pr edit`
- If `gh` authentication fails: Inform user to run `gh auth status` and authenticate

## Example: UI Feature with Dependencies

**Branch**: `JIRA-1234-user-search`

**Commits**:

- `feat: add search component with debouncing`
- `test: add unit tests for search component`
- `docs: update component documentation`

**Example PR Title:** `feat(search): add user search with debounced input (JIRA-1234)`

**Example PR Description:**

```markdown
## Description

- **Related Ticket**: [JIRA-1234](https://your-jira-instance.atlassian.net/browse/JIRA-1234)

Added a new user search component with debounced input to improve search performance and reduce API calls. The search interface provides real-time results while minimizing server load through intelligent debouncing and client-side caching.

**Solution overview:**

- Debounced search input prevents excessive API calls during rapid typing (300ms delay)
- Client-side result cache stores recent searches to eliminate redundant requests
- Loading and error states provide clear feedback during search operations
- Search component integrates seamlessly with existing user management pages

**Key changes:**

- New `UserSearch` component with debounced input handling
- Cache service for storing and retrieving recent search results
- Updated user list page to include search functionality
- Test coverage for search behavior, debouncing, and caching logic

### Dependencies

- `lodash.debounce@^4.0.8` - Debounce utility for search input
- `react@^18.2.0` - Updated from 18.1.0 for improved hook performance

## Testing Strategy

### Test Coverage

- [x] **Unit Tests** - Component/function tests added/updated
- [ ] **Integration Tests** - Cross-component interaction tests
- [ ] **Visual Tests** - Storybook stories added/updated

### Testing Instructions

1. Navigate to the users page
2. Enter a search query in the search box
3. Verify results appear after 300ms delay
4. Verify typing additional characters resets the debounce timer
5. Verify loading state shows during search
6. Verify error message displays for failed searches

## Screenshots/Screen Recordings

[Use the default placeholder/table structure from .github/PULL_REQUEST_TEMPLATE.md]

## Author Checklist

- [x] PR Size - Changes are small and focused (under 500 lines) or justified
- [x] Testing - Manually tested changes work as expected
- [ ] Performance - No performance testing conducted yet
- [x] Documentation - Updated relevant documentation and comments
```

**Example Command**:

```bash
gh pr create \
  --base main \
  --head JIRA-1234-user-search \
  --title "feat(search): add user search with debounced input (JIRA-1234)" \
  --body-file tmp/pr-draft-JIRA-1234-user-search.md
```
