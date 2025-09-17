# Update GitHub PR Comments

You are tasked with updating GitHub PR comments following a two-phase process.

**Core Objective:** Generate a CSV file with enhanced comment versions, then apply those updates to actual GitHub PR
comments using a provided script.

**Workflow:** CSV Generation → GitHub Updates

## Phase 1: CSV Generation

### Process

1. **Analyze the comments sections** from the provided markdown file
2. **Generate CSV file** with format: `id,original,rewritten`
3. **Save to** `tmp/pr-[PR_NUMBER]-comments.csv`

### CSV Generation Requirements

Create a CSV file with exactly three columns:

```csv
id,original,rewritten
"2351166366","remove empty","I noticed there's an empty line in the JSDoc comment block that could be cleaned up for consistency. Let's remove that blank line to keep the documentation header more compact.

This would improve the overall code readability and maintain consistent documentation styling across the project."
```

**CSV Format Rules:**

- Header row: `id,original,rewritten`
- All fields enclosed in double quotes
- Escape internal double quotes by doubling them (`""`)
- Preserve line breaks within enhanced comments
- Use exact header format

## Phase 2: GitHub Updates

Once the CSV is generated, run the script:

```bash
node .claude/commands/pr/scripts/edit-pr-comments.js --mapping-file=tmp/pr-[PR_NUMBER]-comments.csv
```

## Usage

To use this prompt:

- Execute `update-review.md` with the path to the markdown file containing the enhanced comments.
