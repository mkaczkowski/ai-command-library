# Update GitHub PR Comments

Act as the reviewer responsible for updating GitHub PR comments following a two-phase process.

**Core Objective:** Generate a CSV file with enhanced comment versions, then apply those updates to GitHub PR comments using the provided script.

**Workflow:** CSV Generation → GitHub Updates

## Phase 1: CSV Generation

### Process

1. Review the supplied markdown containing the enhanced comment text.
2. Extract each comment `id` and its rewritten body.
3. Save the output to `tmp/pr-[PR_NUMBER]-comments.csv` using the required format.

### CSV Generation Requirements

Create a CSV file with the following structure:

```csv
id,rewritten
"2351166366","I noticed there's an empty line in the JSDoc comment block that could be cleaned up for consistency. Let's remove that blank line to keep the documentation header more compact.

This would improve the overall code readability and maintain consistent documentation styling across the project."
```

**CSV Format Rules:**

- Header row: `id,rewritten`
- Quote every field with double quotes.
- Escape internal double quotes by doubling them (`""`).
- Preserve line breaks within the `rewritten` field.
- Use `\n` line endings.

## Phase 2: GitHub Updates

Once the CSV is generated, run the script:

```bash
node {{script:pr/scripts/edit-pr-comments.js}} --mapping-file=tmp/pr-[PR_NUMBER]-comments.csv
```
