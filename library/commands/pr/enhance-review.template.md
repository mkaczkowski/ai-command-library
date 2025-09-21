---
description: 'Rewrite GitHub PR review comments to make them collaborative and actionable.'
---

# GitHub Pull Request Comment Enhancement Workflow

Act as a senior frontend engineer and experienced reviewer responsible for improving existing GitHub PR review comments.

**Core Objective:** Rewrite draft review comments to make them collaborative and actionable, then publish the enhanced versions back to GitHub.

## Step 1: Rewrite Comments

Transform existing PR comments so they remain technically accurate while sounding collaborative and actionable.

### Phase 1: Collect Source Material

1. Fetch the latest comment data:

   ```bash
   node {{script:pr/scripts/fetch-pr-comments.js}} --ignore-outdated --reaction=eyes --pending --pr=[PR_NUMBER]
   ```

2. Review the fetched threads alongside the relevant code to understand context, existing patterns, and project conventions.
3. Consult `README.md`, `/docs/**`, and prior implementations under the same directory to confirm terminology and standards before rewriting.

### Phase 2: Rewrite Guidance

#### ⚠️ CRITICAL: AI Hint Processing

**ALWAYS check for AI hint sections before rewriting any comment.**

- If the original comment contains an `AI` heading, you MUST follow its instructions to customize the rewrite.
- Exclude the `AI` heading and its content from the rewritten response - it's private guidance only.

**Common AI Hint Examples:**

- `AI: focus on security concerns` → Emphasize security aspects in the rewrite
- `AI: simplify for junior developers` → Use simpler language and add more explanation

#### Tone and Style

- Maintain a collaborative voice; prefer phrasing such as "I recommend...", "Could we...", or "Let's consider...".
- Write in natural paragraphs instead of rigid sections.
- Provide clear rationale and next steps without sounding directive or dismissive.

#### GitHub Markdown

- Use single backticks for inline code: `fileName.ts`, `functionName()`, `variableName`.
- Use fenced code blocks with a language hint for multi-line examples:

  ```typescript
  // Minimal snippet showing the proposed change
  ```

#### Do Not Include

- Structured headings like "Issue:" or "Suggestion:" unless the original comment already used them.
- Restatements of meta-analysis or commentary about the review process.
- Markdown sections named `AI` from the source comment; treat them as private guidance only.

#### Working with AI Hint Sections

- If the original comment contains an `AI` heading, use its details to refine the rewrite.
- Exclude the `AI` heading and its content from the rewritten response.

#### Recommended Comment Flow

1. Open with a concise observation tied to the diff.
2. Describe the recommended change and reference existing patterns when relevant.
3. Provide a minimal code example if it clarifies the suggestion.
4. Close with the value or risk mitigation the change delivers.
5. Skip rewriting entirely if the original comment is already professional, accurate, and appropriately scoped.

### Phase 3: Output Format

Produce the rewritten comments using the template below. Keep numbering sequential and align file references with the fetched data.

````markdown
# Rewritten PR Comments

**Generated:** [current date]
**PR:** [source branch] → [target branch]
**Total Comments:** [number]

---

## Comment 1

**ID:** [id]
**File:** `[path]:[lines]`
**AI Hint:** [Note any AI hint found, or "None"]

### Original

[original comment text]

### Rewritten

I noticed that [observation]. Could we [recommended change] to stay consistent with `[reference example]`?

```typescript
// Include only the minimum necessary snippet to illustrate the improvement
```

This keeps the behaviour aligned with [benefit or risk mitigation].

---

## Comment 2

[Repeat for each comment]
````

### Continue?

Before moving on, ask the user: **"Continue to Step 2 (Update Review Comments)?"**. If they decline, stop the workflow after handing back the rewritten comments for manual review.

## Step 2: Update Review Comments

Convert the enhanced comments into JSON and apply the updates to GitHub.

### Phase 1: JSON Preparation

#### Process

1. Review the supplied markdown containing the enhanced comment text.
2. Extract each comment `id` and its rewritten body.
3. Save the output to `tmp/pr-[PR_NUMBER]-comments.json` as an array of `{ id, rewritten }` objects.

#### JSON Requirements

**Recommended automation**

1. Prepare `tmp/pr-[PR_NUMBER]-comments.json` with the rewritten comment bodies:

   ```json
   [
     {
       "id": "2351166366",
       "rewritten": "I noticed there's an empty line in the JSDoc comment block that could be cleaned up for consistency. Let's remove that blank line to keep the documentation header more compact."
     }
   ]
   ```

2. Confirm the JSON parses correctly by running `node -e "require('./tmp/pr-[PR_NUMBER]-comments.json')"` from the repository root.

**Manual fallback**

Create the JSON file manually following the same structure as the example above. Ensure each entry contains a trimmed `id` and a non-empty `rewritten` string.

### Phase 2: GitHub Updates

Once the JSON is ready, run the script:

```bash
node {{script:pr/scripts/edit-pr-comments.js}} --input=tmp/pr-[PR_NUMBER]-comments.json
```

### Continue?

Confirm with the user before executing the script: **"Proceed with updating the comments on GitHub now?"**. If they choose not to continue, pause and allow further review of the JSON file.

This will update the PR comments on GitHub with the rewritten versions.

### Final Output

After completing the workflow, provide a brief summary describing the updated comment status (e.g., number of comments rewritten and whether GitHub updates were applied).
