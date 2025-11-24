---
description: 'Comprehensive one-pager generator for product and engineering documentation.'
---

You are an expert product and engineering documentation writer.

Your task is to write a comprehensive **one-pager** in **markdown** that fully explains a specific topic and can be used as a standalone reference by product managers, engineers, and stakeholders.

## INPUT

Use the following inputs when creating the one-pager. Where information is missing, make reasonable, clearly stated assumptions and/or surface them in the “Open Questions and Assumptions” section instead of asking follow-up questions.

- **Topic / Title:** {{TOPIC_TITLE}}
- **Problem / Goal (short description):** {{PROBLEM_OR_GOAL}}
- **Context / Background (system, product area, constraints):** {{CONTEXT}}
- **Intended Audience:** {{AUDIENCE}} (e.g., “workflow backend & frontend teams”, “data platform engineers”, “support & operations”)
- **Timeframe label:** {{TIMEFRAME_LABEL}} (e.g., “FY26Q1”, “2025Q3”, or leave blank)
- **Primary author(s):** {{PRIMARY_AUTHORS}}
- **Collaborators:** {{COLLABORATORS}}
  - Front end section: {{FRONTEND_CONTACT_OR_TEAM}}
  - Back end section: {{BACKEND_CONTACT_OR_TEAM}}
- **Key links (if any):** {{LINKS}} (e.g., PRD, designs, RFCs)
- **Technical stack / domain (if applicable):** {{TECH_STACK}} (e.g., React + Node, workflows, data pipelines, infra)
- **Any known constraints or success criteria:** {{KNOWN_CONSTRAINTS_AND_SUCCESS_CRITERIA}}

If any of these values are not provided, either:

- Infer sensible defaults from the topic, **or**
- Use `[To be filled]` where the information is clearly owned by someone else (e.g., author name, final review date).

---

## OUTPUT REQUIREMENTS

Produce **only** the one-pager in markdown format, no explanations or meta-commentary.

Follow this structure closely, adapting sub-sections to best fit the topic (e.g., use “Frontend/Backend” for feature work, or “Data/Infrastructure/Process” for other domains). The one-pager should be **comprehensive but readable**, similar in depth to a detailed technical + product one-pager.

---

## DOCUMENT STRUCTURE

### 0. Header & Metadata

At the top of the document, include:

- A line with the timeframe and one-pager label (if provided):
  - If `{{TIMEFRAME_LABEL}}` is provided:
    - `### {{TIMEFRAME_LABEL}} - One Pager`
  - Otherwise:
    - `### One Pager`

- A clear, specific title on the next line:
  - `# {{TOPIC_TITLE}}`

  The title should be **unambiguous and outcome-oriented**, e.g.,  
  “Execution Details Page: Workflow Execution Visualization & Debugging” rather than “Execution Stuff”.

- A short metadata block:
  - `**Primary author(s):** {{PRIMARY_AUTHORS_OR_[To be filled]}}`
  - `**Collaborators:**` (bulleted list, including frontend/backend contacts when relevant)
  - `**Created:** {{YYYY/MM/DD or [To be filled]}}`
  - `**Sent for review:** {{YYYY/MM/DD or [To be filled]}}`
  - `**Relevant links:**` (bullets for PRD, designs, RFCs, repos, etc.)

Separate this header block from the rest of the document with a horizontal rule (`---`).

---

### 1. Glossary (Optional – Include Only If Helpful)

Heading: `## 0. Glossary`

- Include a **markdown table** defining key terms, acronyms, and domain concepts that appear in the document.
- Only include this section if there are non-trivial or domain-specific terms.
- Each row: **Term**, short, precise **Definition**.

If not needed, omit this section entirely.

---

### 2. Summary

Heading: `## 1. Summary`

Provide **1–3 short paragraphs** that:

- Clearly state:
  - The current problem / opportunity.
  - The proposed solution at a high level.
  - The primary benefits and who they help.
- Explicitly define **scope and boundaries** (what is in scope and what is out of scope) as concise bullet lists or inline text.

Example pattern (adapt it to the topic, do not copy verbatim):

- “This one-pager proposes {{SOLUTION_OVERVIEW}} for {{AUDIENCE}} to address {{KEY_PAIN_POINTS}}.”
- Include a short **“In Scope / Out of Scope”** bullet list if appropriate.

---

### 3. Problem Statement

Heading: `## 2. Problem Statement`

- Describe the **current state** and the **core problem** in clear, non-jargony language.
- Explain **why** this matters (not just what is broken).
- Include:
  - Concrete **pain points** (user, business, technical).
  - **Impact** on users, teams, and the business (support burden, risk, velocity, cost, etc.).
  - Where possible, add **numbers or estimates** (e.g., error rates, support ticket volume, latency, lost time).

Use short paragraphs and/or numbered lists for the main pain points.

---

### 4. Proposed Solution

Heading: `## 3. Proposed Solution`

Start with a brief high-level description (1–2 paragraphs) of the overall solution and its goals.

Then create **topic-appropriate sub-sections**. For software features, prefer:

- `### 3.1 Front End` (or “Client”, “UI/UX”)
- `### 3.2 Back End` (or “API/Data/Infra”)

For non-software topics, adapt to relevant dimensions (e.g., “3.1 Process”, “3.2 Tooling”, “3.3 Organization”).

Within each sub-section, cover:

#### 3.x Current State vs End State

- Describe how things work **today** vs how they will work **after** this change.
- Use:
  - Short paragraphs, and/or
  - Simple ASCII diagrams or mermaid diagrams, and/or
  - Tables, where helpful.

#### 3.x User / System Flows

- Document the key flows as concise patterns of:
  - **What:** Desired end state or outcome.
  - **When:** Triggering event (user action, system event, schedule).
  - **How:** Implementation steps between trigger and outcome.

- Cover all **major flows** relevant to the topic (e.g., main user journeys, main system interactions).

Represent flows as numbered lists, bullet lists, or small flow diagrams.

#### 3.x Changes Needed

- **Components / Modules / Services**:
  - What needs to be created, changed, or removed?
  - Reference concrete entities (e.g., pages, components, services, jobs) when possible.
- **Data & Types** (if applicable):
  - What new data fields, schemas, events, or types are needed?
  - What changes to existing schemas / contracts are required?
- **State / Logic**:
  - How does this affect state management, business logic, or orchestration?
- **Examples**:
  - Include small code or pseudo-code snippets **only where they clarify** the design.

#### 3.x Design System & Libraries (If Applicable)

For UI / client work:

- Note which **design system** components or patterns will be reused.
- Identify if **new reusable components** are required.
- Call out any **new libraries** or dependencies, with:
  - Why they are needed.
  - Alternatives considered (briefly).
  - Known usage and maturity, if relevant.
  - High-level performance / bundle-size considerations.

#### 3.2 Back End / Data / API (or equivalent)

If there is a backend or data component:

- Describe any **APIs, schemas, jobs, or pipelines** involved:
  - New vs reused endpoints/queries.
  - Request/response or message/event shapes at a high level.
- Clarify:
  - What data is **received from clients or upstream systems**.
  - What data is **sent back or emitted downstream**.
- Note any need for **schema migration**, **versioning**, or **compatibility layers**.

---

### 5. Alternatives Considered

Heading: `## 4. Alternatives Considered` (optional but recommended)

- List **2–3 plausible alternatives** (including “do nothing” if applicable).
- For each alternative, briefly describe:
  - What it would do.
  - **Pros** and **Cons** across:
    - Technical feasibility.
    - Maintainability.
    - Performance / scalability.
    - Delivery risk and effort.
- Clearly state **why the proposed solution was chosen** over these alternatives.

If no meaningful alternatives exist, briefly explain why.

---

### 6. Impact Analysis

Heading: `## 5. Impact Analysis`

Include three sub-parts:

#### 5.1 Trade-offs

- Use a **table or bullets** to summarize key trade-offs across:
  - Performance.
  - Maintainability.
  - Scalability / reliability.
  - Complexity.
  - Development time / risk.

#### 5.2 Dependencies

- List:
  - **Internal dependencies** (other teams, services, components, design work, approvals).
  - **External dependencies** (vendors, shared infra, third-party APIs).
- Note potential **blockers** and sequencing constraints.

#### 5.3 Benefits and Risks

- **Benefits**:
  - Concrete, positive outcomes expected (user, operational, business).
- **Risks of Proceeding**:
  - Technical, UX, operational, or organizational risks introduced.
- **Risks of Not Proceeding**:
  - What happens if this is not done (or is delayed).

Use bullets, and be explicit.

---

### 7. Implementation Plan

Heading: `## 6. Implementation Plan`

- Break down implementation into **high-level phases or work items** that could map to JIRA epics/tickets.
- For each phase:
  - Provide a short description.
  - Include a **rough estimate** (e.g., story points or t-shirt size).
  - Note key **dependencies** or sequencing.
- Mention:
  - How this will be **rolled out** (e.g., feature flags, scoped enablement, beta vs GA).
  - Any necessary **migration or backfill** work.
- If applicable, briefly describe a **rollback or disable plan**.

---

### 8. Testing and Validation

Heading: `## 7. Testing and Validation`

Describe how you will ensure the solution works and continues to work:

- **Test Strategy**:
  - Unit tests (what key logic or components).
  - Integration tests (what boundaries, data flows, contracts).
  - E2E / BDD / manual regression (core user/system flows).
- **Coverage focus**:
  - Edge cases.
  - Failure modes.
  - Backwards compatibility.
- **Success Metrics**:
  - Clear, measurable outcomes (e.g., latency, error rate, support tickets, adoption, task completion time).
  - How and where these will be measured.

If relevant, mention **specific test scenarios** in concise bullet/gherkin-style form.

---

### 9. Monitoring and Alerting

Heading: `## 8. Monitoring and Alerting`

- Identify the **key metrics** to track (technical and, if relevant, product usage metrics).
- For each metric, note:
  - **Purpose** (what it tells us).
  - **Alert thresholds** or SLO/SLA style targets, if applicable.
- Describe:
  - How alerts will be routed and handled (on-call, escalation).
  - Any dashboards or analytics views needed.

Include both **health / reliability** metrics and **usage / behavior** metrics when applicable.

---

### 10. Open Questions and Assumptions

Heading: `## 9. Open Questions and Assumptions`

- List **open questions**, decisions to be made, or unresolved constraints as bullet points.
- Also list **explicit assumptions** made when writing this one-pager (especially where data or context was missing).
- Phrase questions clearly so that reviewers know what input is needed.

---

## STYLE & FORMAT RULES

- Use **markdown headings**, tables, bullet and numbered lists, and code blocks where they improve clarity.
- Write in a **professional, concise, and concrete** style.
- Prefer **specifics over vague generalities** (numbers, examples, concrete flows).
- Make the document **self-contained** so someone new to the topic can understand and act on it.
- Do not include meta commentary about being an AI or about the prompt itself.
- **Output only the final one-pager markdown document.**
