---
description: 'Create Jira flaky test ticket with jira-cli'
---

# Jira Flaky Test Report Creation

Act as a quality engineer filing a flaky test ticket via `jira-cli`. Gather context, draft the ticket using the template below, and prepare the command but don't run it.

## Required Inputs

Collect or confirm each field before drafting the issue:

- **Issue Type**: The Jira issue type for flaky tests (e.g., "Technical Requirement", "Task", "Bug")
- **Summary**: "Fix flaky test: [Scenario Name]" (≤100 chars, no emoji)
- **Test identification**:
  - File path to the test (e.g., test/e2e/features/login.feature)
  - Scenario or test name (e.g., "User can complete review workflow")
  - Test suite type (BDD/Playwright/Jest/Cypress/etc.)
- **Failure symptoms**: Specific error messages, timeouts, or inconsistent behavior patterns
- **Reproduction steps**: Exact command needed to run the failing test
- **Potential causes**: Hypotheses based on error patterns (timing issues, race conditions, test data, environment)
- **Evidence**: CI/CD run links, error logs, stack traces, screenshots
- **Priority**: Issue priority (e.g., Minor, Medium, Major, Critical)
- **Labels**: Relevant labels (default: "flaky-test", add others as needed like "e2e", "unit-test", "integration-test")
- **Parent Epic** (optional): Parent epic ticket ID if applicable

## Ticket Template

```
This test exhibits flaky behavior and needs stabilization.

**Test identification:**
- Feature file: path/to/test.feature
- Scenario: "Scenario name"
- Test suite: BDD/Playwright/Jest

**Failure symptoms:**
- Error messages, timeouts, or inconsistent behavior

**Reproduction:**
- Command: `yarn test:e2e --spec=path/to/test.feature`

**Potential causes:**
- Timing/race conditions, network issues, test data problems, etc.

**Evidence:**
<CI/CD run links>
<Error logs or stack traces>
```

## Output Format

Provide three sections:

1. **Issue Summary** – "Fix flaky test: [Scenario Name]"
2. **Issue Metadata** – Issue Type, Priority, Labels, Parent (if applicable)
3. **jira-cli Command** – Ready-to-run command (don't execute yet)

## Command Template

```bash
jira issue create -t"<ISSUE_TYPE>" -y<PRIORITY> -s"<SUMMARY>" -b"<DESCRIPTION>" -l"<LABELS>" [--parent=<PARENT_ID>] --no-input
```

**Notes:**

- Replace `<ISSUE_TYPE>` with the project's flaky test issue type
- Replace `<PRIORITY>` with appropriate priority level
- Replace `<LABELS>` with comma-separated labels (typically includes "flaky-test")
- Include `--parent=<PARENT_ID>` only if a parent epic is specified
- Adjust assignee flag (`-a`) as needed for the project

## Validation

Before presenting the final response:

- Verify the summary is ≤ 100 characters, actionable, and emoji-free
- Ensure test identification includes file path, scenario/test name, and test suite
- Confirm failure symptoms include specific error messages or stack traces
- Verify reproduction steps include the exact command to run the test
- Check that all CI/CD or log URLs are accessible (or clearly labeled if internal)
- Review the command for shell quoting issues
- Confirm the description uses bold section headings exactly as shown and contains no emoji

If the summary or description contains double quotes, escape them for shell safety. Preserve the exact newline layout inside the quoted description string.

## Example

```bash
jira issue create -t"Task" -yMedium -s"Fix flaky test: User can complete review workflow" -b"This test exhibits flaky behavior and needs stabilization.

**Test identification:**
- Feature file: test/e2e/features/review-workflow.feature
- Scenario: \"User can complete review workflow\"
- Test suite: BDD

**Failure symptoms:**
- TimeoutError: Waiting for element '.submit-button' failed: element not found within 5000ms
- Intermittent \"Network request failed\" errors

**Reproduction:**
- Command: \`yarn test:e2e --spec=test/e2e/features/review-workflow.feature:45\`

**Potential causes:**
- Race condition between form validation and button enablement
- Network timing issues with API call before submission

**Evidence:**
https://ci.example.com/job/project/build/123
https://logs.example.com/test-run/456" -l"flaky-test,e2e" --no-input
```
