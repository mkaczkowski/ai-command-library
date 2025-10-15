---
description: 'Create Jira bug reports with jira-cli for any project using the Bug issue type.'
---

# Jira Bug Report Creation Checklist

Act as the quality engineer responsible for filing a Jira bug via `jira-cli`. Gather the full context, draft the ticket using the template below, and finish by preparing the exact command the developer should run.

## 1. Required Inputs

Collect or confirm each field before drafting the issue:

- **Summary** – concise, action-oriented, and must not include emoji or decorative symbols.
- **Problem description** – what the user attempted and what went wrong (one or two sentences).
- **Reproduction steps** – ordered steps a teammate can follow.
- **Observed behavior** – what currently happens.
- **Expected behavior** – what should happen instead.
- **Evidence** – screenshots, videos, logs, etc. Prefer secure links over inline images.
- **Environment** – dev, staging, or prod; prompt until provided.
- **Additional notes** – browser, OS, feature flags, rollouts, or other diagnostics.
- **Formatting** – confirm the description uses bold section headings compatible with Jira and remains emoji-free.

## 2. Ticket Template

Always format the description exactly as follows (omit sections with no information rather than leaving them blank):

```
[Short problem statement mirroring the summary.]

**Repro steps:**
- Step 1…
- Step 2…
- Step 3…

**Observed:**
- Bullet point(s) describing the incorrect behavior.

**Expected:**
- Bullet point(s) describing the desired behavior.

**Environment:**
- Specify dev, staging, or prod (include build numbers if relevant).

**Additional notes:**
- Diagnostic info or clarifications (browser, OS, feature flags, rollouts).

**Screenshots / Video:**
<one link per line>
```

## 3. Output Requirements

Produce three clearly labeled sections in your final response:

1. **Issue Summary** – single line text ready for Jira.
2. **Issue Description** – fenced code block (```) containing the fully formatted description template populated with the collected details, including bold Jira-friendly section headings.
3. **jira-cli Command** – a sentence confirming you will run the command after approval, followed by a fenced `bash` block containing a single `jira issue create` invocation. Use `-tBug`, `-s"<SUMMARY>"`, `-b"<DESCRIPTION BLOCK>"`, and `--no-input`. The description must embed newline characters directly inside the quoted string. Do not run this command yet.

## 4. Validation

Before presenting the final response:

- Verify the summary is ≤ 100 characters, actionable, and emoji-free.
- Check that reproduction steps are specific and reproducible.
- Confirm observed vs. expected sections are mutually exclusive statements.
- Ensure every URL is accessible (or clearly labeled if internal).
- Review the command for shell quoting issues.
- Confirm the description uses the bold section headings exactly as shown and contains no emoji.

If the summary or description contains double quotes, escape them for shell safety. Preserve the exact newline layout inside the quoted description string.

Render the full command using the `jira-cli`. (for manual execution)

```bash
jira issue create -tBug -s"<SUMMARY>" -b"<DESCRIPTION BLOCK>" --no-input
```

## Example

```bash
jira issue create -tBug -s"Fix error after submitting contact form" -b"Contact form submissions result in an error page instead of saving the request.

**Repro steps:**
- Navigate to the contact page.
- Fill in all required fields.
- Click Submit.

**Observed:**
- A 500 error page appears instead of a confirmation.

**Expected:**
- Submission succeeds and a confirmation message is shown.

**Environment:**
- staging

**Screenshots / Video:**
https://example.com/contact-form-error" --no-input
```
