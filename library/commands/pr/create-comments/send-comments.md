# Create GitHub PR Review Comments

You are a senior reviewer responsible for converting curated review findings into actionable GitHub PR inline comments
that can be submitted as a pending review.

**Core Objective:** Transform the findings markdown produced by `prepare-comments.md` into a CSV file compatible with
`.claude/commands/pr/scripts/create-pr-review.js`, ready to be uploaded as a pending review.

**Workflow:** Review Findings Markdown → Build Inline Comment Bodies → Export CSV → Submit Review

## Phase 1: Understand the Source Markdown

### Input File

- Path will be supplied when the command is executed (typically `tmp/pr-[PR_NUMBER]-review.md`).
- The document follows the structure defined in `prepare-comments.md`, especially the `## Findings` section where each
  `###` heading represents an actionable piece of feedback.

### Parsing Requirements

For each finding block under `## Findings`:

1. Treat the heading `### [Severity] [Short title]` as metadata.
2. Extract supporting fields: the canonical finding layout is
   - `- **Area:**` `[path/to/file.ext#L123]` (range variant: `[path/to/file.ext#L120-L128]`)
   - `**Issue**:` Paragraph describing the problem
   - `### code (optional)` followed by a fenced block (language inferred from the opening fence)
   - `### suggested changes (optional)` followed by a fenced block
   - `**Recommendation**:` Requested action, typically a single sentence
   - `**Rationale**:` Why the change matters; may include inline references
3. Ignore commentary outside the `## Findings` section unless explicitly referenced by a finding.
4. If a finding explicitly states that no action is required or is informational only, skip creating a comment.

## Phase 2: Craft Review Comment Bodies

Compose a single inline comment per finding that clearly communicates the concern and desired change.

- Begin with a concise summary referencing the finding title and severity when relevant (e.g. `Blocker – Shadowed token reuse`).
- Combine the `Issue`, `Recommendation`, and `Rationale` into a cohesive narrative. Keep the tone collaborative and specific.
- Reference existing patterns or files when mentioned in the source text.
- Preserve any provided code block by including it after a blank line using triple backticks and the language from the
  source snippet (default to `text` when unspecified).
- Keep comments self-contained; repeat critical context from the finding so the reader does not need to open the review
  document.
- Use markdown formatting supported by GitHub comments (inline code, bullet lists, etc.) sparingly for clarity

## Phase 3: Map Areas to Diff Locations

When converting the `Area` field to CSV columns:

- Strip formatting markers from the extracted `Area` value:
  - Remove leading `- `, trailing punctuation, and outer backticks.
  - Convert `path/to/file#L120-L128` to `path/to/file:120-128` before splitting.
- Split the normalised area at the last colon to separate `path` from location details.
- For single line references (`path:123`), set:
  - `path` → `path`
  - `line` → `123`
  - `startLine` → blank
- For ranges (`path:120-128`), set:
  - `line` → ending line (`128`)
  - `startLine` → starting line (`120`)
- Leave `position` blank unless the source explicitly provides a diff `position` value (rare; honour it when present).
- Default `side` to `RIGHT` unless instructed otherwise; if a `startLine` is used, default `startSide` to match `side`.
- If the area points to multiple disjoint locations, create separate comment rows for each unique location.
- Preserve the relative ordering of findings from the source markdown.

## Phase 4: CSV Output Specification

Generate a CSV file with the exact header order:

```csv
path,position,body,line,startLine,side,startSide
"src/components/Card.tsx","","Blocker – Shadowed token reuse. I noticed ...","128","120","RIGHT","RIGHT"
```

CSV rules:

- Quote every field with double quotes.
- Escape internal quotes by doubling them (`""`).
- Preserve intentional line breaks inside the `body` field.
- Ensure the file uses `\n` line endings.

Save the file to `tmp/pr-[PR_NUMBER]-review-comments.csv` (the PR number will be provided in context).

## Phase 5: Finalise and Submit

1. Double-check the CSV for empty bodies, missing locations, or malformed quoting.
2. Confirm that each comment targets code that exists in the PR (adjust line numbers as needed).
3. Once satisfied, run:
   ```bash
   node .claude/commands/pr/scripts/create-pr-review.js --comments-file=tmp/pr-[PR_NUMBER]-review-comments.csv --pr=[PR_NUMBER]
   ```
