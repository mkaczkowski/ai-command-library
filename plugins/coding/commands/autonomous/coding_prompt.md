## YOUR ROLE - CODING AGENT

You are continuing work on a long-running autonomous development task.
This is a FRESH context window - you have no memory of previous sessions.

**IMPORTANT:** This is an EXISTING codebase with established patterns and infrastructure.

---

### STEP 1: GET YOUR BEARINGS (MANDATORY)

Use Cursor's `read_file` tool to read these files (do NOT use `cat` commands):

1. **Progress notes:** `autonomous-progress.md`
2. **Feature specification:** `app_spec.xml`
3. **Feature list:** `feature_list.json`

Also read the coding standards: 4. `.cursor/rules/typescript-coding-standards.mdc` 5. `.cursor/rules/component-development.mdc` 6. `.cursor/rules/testing-standards.mdc`

Then run these commands to check status:

```bash
# Check git status
git status

# Recent commits
git log --oneline -5

# Count features
echo "Completed:" && grep -c '"passes": true' feature_list.json || echo "0"
echo "Remaining:" && grep -c '"passes": false' feature_list.json
```

---

### STEP 2: START DEV SERVER (If Needed for UI Testing)

Check if the dev server is running by listing terminals. If not running:

```bash
# Option 1: Use init.sh (recommended)
./init.sh

# Option 2: Start manually
yarn start
```

Wait for the server to be ready before browser testing.

**Dev Server URL:** `http://localhost:4200`

---

### STEP 3: VERIFY CODEBASE HEALTH

**MANDATORY BEFORE NEW WORK:**

```bash
# TypeScript compilation
yarn type-check

# Linting (check for existing errors)
yarn lint --lintFilePatterns="src/**/*.ts" --lintFilePatterns="src/**/*.tsx" --format=unix | head -30

# Stylelint for SCSS
yarn stylelint --lintFilePatterns="src/**/*.scss" | head -10

# Run existing tests (quick check)
yarn test --passWithNoTests --maxWorkers=2 --testPathPattern=src/test
```

**If ANY issues found:**

1. Document in `autonomous-progress.md`
2. Fix critical issues BEFORE new work
3. If a passing feature is broken, set `"passes": false` in feature_list.json

---

### STEP 4: REGRESSION CHECK

If there are features marked as `"passes": true` in feature_list.json:

1. Use `read_file` to read feature_list.json
2. Find 1-2 critical passing features
3. Run their associated test files:
   ```bash
   yarn test --testPathPattern=src/path/to/feature.test.tsx
   ```
4. For UI features, verify visually with browser tools

**If regression found:**

- Immediately update feature_list.json: `"passes": false`
- Add to "Known Issues" in autonomous-progress.md
- Fix regression BEFORE implementing new features

---

### STEP 5: SELECT NEXT FEATURE

Use `read_file` on `feature_list.json` to find the next feature to implement.

Features are ordered by priority. Find the first one with `"passes": false`:

- High priority features first
- Then medium, then low

Record in your notes:

- Feature ID (e.g., F001)
- Description
- Component affected
- Test steps to complete

**Focus on ONE feature this session.**

---

### STEP 6: IMPLEMENT THE FEATURE

Follow existing codebase patterns strictly.

**Before writing code, read similar existing code:**

- Use `read_file` on similar components
- Use `codebase_search` to find patterns
- Check how similar features are implemented

**Implementation Checklist:**

- [ ] TypeScript types properly defined
- [ ] Component follows project patterns (Blueprint Design System)
- [ ] Props interface documented with JSDoc
- [ ] Internationalization via `react-intl` for all user-facing text
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Error handling with proper error boundaries
- [ ] Unit tests alongside implementation
- [ ] Storybook story if it's a UI component

**File naming conventions:**

- Components: `ComponentName/ComponentName.tsx`
- Tests: `ComponentName/ComponentName.test.tsx`
- Styles: `ComponentName/ComponentName.module.scss`
- Stories: `ComponentName/ComponentName.stories.tsx`

---

### STEP 7: VERIFY WITH TEST INFRASTRUCTURE

Run all relevant tests:

```bash
# 1. TypeScript - MUST pass
yarn type-check

# 2. Lint modified files
yarn lint --lintFilePatterns=src/components/YourComponent/YourComponent.tsx --format=unix

# 3. Stylelint if SCSS modified
yarn stylelint --lintFilePatterns=src/components/YourComponent/YourComponent.module.scss

# 4. Unit tests for the feature
yarn test --testPathPattern=src/components/YourComponent

# 5. GraphQL introspection if schema changed
yarn graphql:introspect

# 6. Run related integration tests if applicable
# Check test/integration/ for relevant .feature files
yarn test:integration --spec=test/integration/your-feature.feature
```

**All tests MUST pass before proceeding.**

---

### STEP 8: VERIFY WITH BROWSER (For UI Features)

For features with UI components, also verify through the browser.

**Ensure dev server is running** (see Step 2).

Use the browser MCP tools:

```
mcp_cursor-ide-browser_browser_navigate → Navigate to http://localhost:4200
mcp_cursor-ide-browser_browser_snapshot → Get page accessibility tree
mcp_cursor-ide-browser_browser_click → Click elements
mcp_cursor-ide-browser_browser_type → Type into inputs
mcp_cursor-ide-browser_browser_take_screenshot → Capture visual state
```

**Browser Verification Checklist:**

- [ ] Feature renders correctly
- [ ] All interactions work as expected
- [ ] No console errors (check with browser_console_messages)
- [ ] Responsive behavior (resize browser if needed)
- [ ] Visual appearance matches spec
- [ ] Loading states display correctly
- [ ] Error states display correctly

**DO:**

- Navigate to the actual page
- Interact like a real user (click, type, scroll)
- Take screenshots as evidence
- Check console for errors

**DON'T:**

- Skip browser verification for UI features
- Mark passing without visual confirmation
- Use JavaScript evaluation to bypass UI

---

### STEP 9: UPDATE feature_list.json

After THOROUGH verification, update the feature:

**You may ONLY modify:**

- `"passes"`: `false` → `true`
- `"testFiles"`: Add paths to test files created

Example:

```json
{
  "id": "F001",
  "passes": true,
  "testFiles": [
    "src/components/TriggerPanel/TriggerPanel.test.tsx",
    "src/components/TriggerPanel/TriggerPanel.stories.tsx"
  ]
}
```

**NEVER modify:** id, priority, category, description, component, requirements, steps

---

### STEP 10: COMMIT YOUR PROGRESS

```bash
git add .
git commit -m "feat: implement [feature description] (F001)

- Added [specific components/files]
- Created tests: [test file paths]
- Verified: type-check, lint, unit tests, browser
- Updated feature_list.json: F001 passing"
```

---

### STEP 11: UPDATE autonomous-progress.md

Add a new session entry:

```markdown
### Session N - YYYY-MM-DD

**Feature:** F001 - [Description]
**Status:** Completed

**Changes Made:**

- Created `src/components/NewFeature/NewFeature.tsx`
- Created `src/components/NewFeature/NewFeature.test.tsx`
- Created `src/components/NewFeature/NewFeature.stories.tsx`
- Updated `src/domains/workflow/hooks/useFeature.ts`

**Test Results:**

- Type check: PASS
- Lint: PASS
- Stylelint: PASS
- Unit tests: PASS (X tests)
- Browser verification: PASS

**Issues Discovered:** None

**Next Session:** Proceed to F002 - [description]

## Feature Progress

| Status    | Count |
| --------- | ----- |
| Total     | X     |
| Completed | Y     |
| Remaining | Z     |
| Progress  | Y/X%  |
```

---

### STEP 12: CHECKPOINT - REQUEST HUMAN REVIEW

**After completing a feature, request human review before ending session.**

Add this section to autonomous-progress.md:

```markdown
---

## Checkpoint: Human Review Required

### Feature Completed: F001 - [Description]

**Files Changed:**

- src/components/NewFeature/NewFeature.tsx (new)
- src/components/NewFeature/NewFeature.test.tsx (new)
- src/domains/workflow/hooks/useFeature.ts (modified)

**Test Evidence:**

- All tests passing
- Screenshots captured (if UI feature)

**Review Checklist:**

- [ ] Code follows project patterns
- [ ] TypeScript types are correct
- [ ] Tests cover main scenarios
- [ ] i18n used for user-facing text
- [ ] Accessibility attributes present
- [ ] No regressions in existing features

**Questions/Concerns:**

- [Any decisions that need human input]
- [Any spec ambiguities encountered]

**Ready for:** Human approval to proceed to F002
```

---

### STEP 13: END SESSION CLEANLY

Before ending:

1. **Commit all work:**

   ```bash
   git status  # Should show nothing to commit
   ```

2. **Final verification:**

   ```bash
   yarn type-check
   yarn lint --lintFilePatterns="src/**/*.ts" --format=unix | head -10
   ```

3. **Confirm feature_list.json updated**

4. **Confirm autonomous-progress.md updated** with:
   - Session log entry
   - Updated feature progress
   - Checkpoint section

**SESSION BEHAVIOR:**

- After checkpoint, this session ends
- Human reviews the implementation
- Next `/coding_prompt` session continues with next feature

---

## TESTING REQUIREMENTS SUMMARY

| Test Type   | Command                                    | When                       |
| ----------- | ------------------------------------------ | -------------------------- |
| Type Check  | `yarn type-check`                          | Always                     |
| ESLint      | `yarn lint --lintFilePatterns=<file>`      | Always for modified TS/TSX |
| Stylelint   | `yarn stylelint --lintFilePatterns=<file>` | When SCSS modified         |
| Unit Tests  | `yarn test --testPathPattern=<path>`       | Always for new features    |
| GraphQL     | `yarn graphql:introspect`                  | When GraphQL changes       |
| Storybook   | `yarn storybook`                           | For UI components          |
| Integration | `yarn test:integration --spec=<file>`      | For workflow features      |
| Browser     | MCP browser tools                          | For UI features            |

---

## RECOVERY: If Something Goes Wrong

**Tests failing after your changes:**

1. Run `git diff` to see what changed
2. Fix the issue
3. Re-run tests
4. If stuck, document in autonomous-progress.md

**Previous session broke something:**

1. Check `git log` for recent commits
2. Run `git diff HEAD~1` to see changes
3. If needed: `git revert HEAD` to undo last commit
4. Document the issue and fix

**Feature harder than expected:**

1. Document challenges in autonomous-progress.md
2. Add to "Questions/Concerns" in checkpoint
3. Human can provide guidance before next session

---

## IMPORTANT REMINDERS

**Goal:** Production-quality implementation following existing patterns

**This Session:** Complete ONE feature with full verification

**Priority Order:**

1. Fix failing tests/regressions first
2. Implement next pending feature
3. Document everything

**Quality Bar:**

- Zero TypeScript errors
- Zero lint errors
- All tests passing
- Browser verification for UI
- Code matches existing patterns
- i18n for all user text
- Accessibility attributes

**Always:** Request human review after completing a feature

---

Begin by running Step 1 (Get Your Bearings).
