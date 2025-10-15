---
description: 'Create Jira bug reports with jira-cli using the BWP project and Bug issue type.'
---

# Jira Bug Report Creation Checklist

Act as the quality engineer responsible for filing a Jira bug via `jira-cli`. Gather the full context, draft the ticket using the template below, and finish by preparing the exact command the developer should run.

## 1. Required Inputs

Collect or confirm each field before drafting the issue:

- **Summary** – concise, action-oriented, and prefixed with relevant emoji if provided.
- **Problem description** – what the user attempted and what went wrong (one or two sentences).
- **Reproduction steps** – ordered steps a teammate can follow.
- **Observed behavior** – what currently happens.
- **Expected behavior** – what should happen instead.
- **Evidence** – screenshots, videos, logs, etc. Prefer secure links over inline images.
- **Environment** – dev, staging, or prod; prompt until provided.
- **Additional notes** – browser, OS, feature flags, rollouts, or other diagnostics.

## 2. Ticket Template

Always format the description exactly as follows (omit sections with no information rather than leaving them blank):

```
[Short problem statement mirroring the summary.]

Repro steps:
- Step 1…
- Step 2…
- Step 3…

Observed:
- Bullet point(s) describing the incorrect behavior.

Expected:
- Bullet point(s) describing the desired behavior.

Environment:
- Specify dev, staging, or prod (include build numbers if relevant).

Additional notes:
- Diagnostic info or clarifications (browser, OS, feature flags, rollouts).

Screenshots / Video:
<one link per line>
```

## 3. Output Requirements

Produce three clearly labeled sections in your final response:

1. **Issue Summary** – single line text ready for Jira.
2. **Issue Description** – fenced code block (```) containing the fully formatted description template populated with the collected details.
3. **jira-cli Command** –  fenced `bash` block pointing to `jira issue create`, using the populated summary and description. Do not run this command yet

## 4. Validation

Before presenting the final response:

- Verify the summary is ≤ 100 characters and actionable.
- Check that reproduction steps are specific and reproducible.
- Confirm observed vs. expected sections are mutually exclusive statements.
- Ensure every URL is accessible (or clearly labeled if internal).
- Review the command for shell quoting issues.


Render the formatted summary, description, and command. Do not execute the command yourself.

## Next steps

Once the user confirms these details, you (the assistant) will execute the following command with `jira-cli`:

If the summary contains quotes, escape them for shell safety. Preserve newlines in the heredoc description exactly as written.

```bash
jira issue create \
  --project BWP \
  --issuetype Bug \
  --summary "<SUMMARY>" \
  --description "$(cat <<'EOF'
<DESCRIPTION BLOCK>
EOF
)"
```

After successful creation, provide the user with the Jira issue key and URL.
