# The Future of Software Development: Making AI Tools Work Together

## **Slide 1: Title Slide**

### **Slide Content:**

- **Title:** "The Future of Software Development: Making AI Tools Work Together"
- **Subtitle:** "From Tool Chaos to Competitive Advantage"
- Your Name & Title
- Date

### **Presenter Notes:**

- **Welcome (30 seconds):** Introduce yourself and set a collaborative tone
- **Opening hook (STRONG START):** "Show of hands – how many of you have accepted an AI suggestion this week that you later had to rewrite?" [Pause for response] "You're not alone. Industry data shows 41% of AI-generated code requires significant refactoring within 6 months. Today, we're going to fix that."
- **Transition to context:** "We're cutting through the AI hype to talk about something we're living through – how to orchestrate our growing ecosystem of AI tools while maintaining quality, security, and sustainable velocity"
- **Visual reference:** "This graphic represents our journey – we've made great strides with Copilot and Cursor, but as we add CodeRabbit, Qodo, and build internal MCP servers, we need to move from potential chaos to true coordination"
- **Set expectations:** "This isn't theoretical – by the end of this session, you'll understand our three-layer framework, see concrete examples, and know your role in the rollout"

---

## **Slide 3: The Problem - Our Current AI Landscape**

### **Slide Content:**

**Our Current AI Toolkit:**

- ✅ **Deployed:**
  - GitHub Copilot (in IDEs) – ~[TODO: Get from license data]% developer adoption → [TODO: Survey avg time saved per week]
  - Cursor IDE – ~[TODO: Get from internal survey]% developer adoption → [TODO: Measure acceptance rate]
  - ChatGPT and Claude – Ad-hoc usage
  - Internal MCP servers (Jira, GitHub, Confluence) – Operational
  - Jellyfish (AI impact monitoring) – Dashboard ready
  - DocBot (automated documentation synchronization to Box AI Hubs with MCP integration)
  - BrowserStack (AI-powered testing) – Integrated

- 🔄 **Currently Piloting:**
  - CodeRabbit & Qodo (automated code review)
  - Claude Code (terminal-based agentic coding)
  - SignalFx MCP Server (APM trace analysis)
  - Google Cloud Logging MCP Server (log querying and retrieval)

**The Central Challenge:**

> "79% of developers now use AI tools industry-wide (GitHub 2024), and our internal adoption is equally strong. As we scale from 5 to 10+ AI capabilities, how do we prevent fragmentation, maintain quality, and prove ROI?"

**What Success Looks Like:**

- 🎯 Increase AI suggestion acceptance rate: 30% → 70%+
- 📈 Maintain or improve DORA metrics (deployment frequency, lead time, MTTR, change failure rate)
- 🚀 Reduce code churn by 50% (less AI-generated code requiring rewrites)
- 💡 80%+ developer satisfaction with AI tooling
- 💰 Measurable ROI: productivity gains > tool costs + training investment

**What We've Built Right:**

- Strong MCP infrastructure (ahead of most companies)
- Monitoring capability with Jellyfish
- High developer adoption and enthusiasm
- Real productivity gains reported

**What's Missing:**

- Standardization across tools
- Consistent quality gates for AI-generated code
- Clear data governance and security policies
- Measurable ROI and cost tracking
- Formal orchestration between tools

### **Presenter Notes:**

- **Interactive element (START):** "Quick poll – which of these tools have YOU used in the last week? [Show of hands for each: Copilot, Cursor, ChatGPT, Claude] This shows how embedded AI is in our workflow already"
- **Paint the picture:** "Look at where we are – we've successfully deployed Copilot and Cursor, and engineers are seeing real productivity gains"
- **Adoption success:** "Our adoption rates are exceptional. Developers are hungry for these tools"
- **Success metrics introduced:** "But we want to be specific about what success looks like. Not just 'use AI more' but concrete targets: 70%+ acceptance rates, maintained DORA metrics, reduced code churn, high developer satisfaction, and measurable ROI"
- **MCP advantage:** "We've already built MCP servers for Jira, GitHub, Confluence, and just launched DocBot for AI-searchable documentation – smart early investments that most companies haven't made yet"
- **DocBot highlight:** "DocBot is particularly exciting – it automatically syncs docs from GitHub, Confluence, and Slack to Box AI Hubs, making our entire knowledge base searchable by any MCP-enabled tool. Developers can now ask AI questions and get answers from our actual documentation"
- **MCP pilot servers:** "We're also piloting two specialized MCP servers – SignalFx for APM trace analysis and Google Cloud Logging for comprehensive log querying. These will give AI tools deep visibility into production performance and debugging data"
- **SignalFx MCP capabilities:** "The SignalFx MCP server lets AI analyze APM traces directly – total spans and duration, error counts, slowest spans. Imagine AI suggesting optimizations based on actual production trace data"
- **GCL MCP capabilities:** "The Google Cloud Logging MCP server provides structured log querying with filters for resource type, trace IDs, HTTP status, and more. AI can now troubleshoot issues by querying production logs directly instead of requiring manual log searches"
- **Jellyfish positioning:** "We have monitoring capability ready to go. This is our competitive edge – most companies are flying blind"
- **The gap:** "But here's the challenge – each tool operates independently. Copilot doesn't know what Cursor suggested. CodeRabbit doesn't know about our architectural standards"
- **Industry context:** "GitHub's 2024 survey shows 79% of developers now use AI tools. This isn't bleeding edge anymore – it's mainstream. The question is whether you use them well or poorly"
- **The statistics:** "Research from multiple sources shows that experienced developers can be 19% slower when using AI assistants without proper coordination, even though they feel faster – the 'productivity placebo' effect"
- **Our opportunity:** "Unlike teams starting from scratch, we have momentum, infrastructure, and real adoption. The question is: how do we add the governance layer while maintaining velocity?"
- **Critical insight:** "Companies with orchestration frameworks report 2.3x higher productivity than those with ad-hoc adoption (Gartner 2024)"
- **Transition:** "The good news? We're asking this question at exactly the right time – before problems compound"
- **Timing:** 3-4 minutes

---

## **Slide 4: Three-Layer Framework**

### **Slide Content:**

**Our Governance Architecture**

**Pyramid Diagram with Concrete Examples:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        🔴 GOVERNANCE LAYER                         │
│     Human oversight with AI support                │
│     • Jellyfish monitoring                         │
│     • CodeRabbit/Qodo gates                        │
│     • Security review protocols                    │
│     • Cost & ROI tracking                          │
│                                                     │
│     Example: CodeRabbit flags security issue       │
│              → Auto-escalates to senior review     │
│                                                     │
│    ────────────────────────────────────            │
│                                                     │
│           🟡 ORCHESTRATION LAYER                   │
│        AI agents working together                  │
│     • MCP servers (Jira, GitHub, Confluence, DocBot)│
│     • Agentic workflows                            │
│     • Tool interoperability                        │
│     • Context sharing                              │
│                                                     │
│     Example: Jira ticket → Cursor generates code   │
│              → Claude Code writes tests            │
│              → Auto-updates ticket                 │
│                                                     │
│    ────────────────────────────────────            │
│                                                     │
│              🟢 FOUNDATION LAYER                   │
│         Shared standards & conventions             │
│     • AGENTS.md (single source of truth)           │
│     • Prompt templates library                     │
│     • Security & data policies                     │
│     • Coding conventions & architecture            │
│                                                     │
│     Example: AGENTS.md specifies "use structured   │
│              logging" → All tools follow convention│
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Arrow pointing up alongside pyramid:** "Each layer enables the next"

### **Presenter Notes:**

- **Frame the solution:** "This three-layer framework is how we'll transform our AI toolkit from a collection of tools into an integrated development platform"
- **Foundation layer detail:** "Layer 1 is about alignment – ensuring all our AI tools understand OUR conventions, not just generic patterns. AGENTS.md is the single source of truth that every tool reads. Our prompt libraries ensure consistency. Our security policies define boundaries"
- **Why it matters:** "Without this foundation, every tool makes different assumptions. Copilot suggests one pattern, Cursor suggests another, CodeRabbit flags both as issues. We've all experienced this chaos"
- **Orchestration layer detail:** "Layer 2 is about coordination – our MCP servers enable tools to work together. Instead of copy-pasting from Jira to Copilot, they share context directly. Instead of sequential tool usage, we enable multi-agent workflows"
- **Example workflow:** "Imagine: CodeRabbit finds an issue, automatically creates a Jira ticket via MCP, Cursor picks up that ticket context and suggests a fix, Claude Code writes the test, DocBot updates the documentation – all coordinated, all using shared context"
- **Our advantage:** "We're ahead here – most companies are still building what we've already operationalized"
- **Governance layer detail:** "Layer 3 is about quality and oversight. Jellyfish monitors impact. CodeRabbit/Qodo provide automated review. Humans maintain final authority on critical decisions"
- **The balance:** "This layer ensures we move fast without breaking things. Speed with quality, not speed versus quality"
- **Status transparency:** "We're honest about where we are. Foundation needs the most work (AGENTS.md rollout). Orchestration is strong (MCP servers operational). Governance is emerging (pilots in progress)"
- **Synergy principle:** "Each layer reinforces the others. Good standards (Layer 1) make orchestration effective (Layer 2). Good orchestration provides data for governance (Layer 3). Good governance improves standards"
- **Industry validation:** "This model aligns with Anthropic's recommendations for enterprise AI deployment and Gartner's AI governance frameworks"
- **Timing:** 4-5 minutes

---

## **Slide 5: The Hidden Costs of Unmanaged AI**

### **Slide Content:**

**The Technical Debt Cycle**

**Circular Diagram:**

1. Pressure to Ship Fast →
2. Use AI Without Guardrails →
3. Generate Code Quickly →
4. Skip Proper Review & Integration →
5. Technical Debt Accumulates →
6. Codebase Becomes Harder to Maintain →
7. Development Velocity Drops → (back to 1, with increased pressure)

**Industry Data:**

- 📊 Code churn (code written then rewritten/deleted)
- ⚠️ 41% of AI-generated code requires significant refactoring within 6 months
- 📉 19% productivity loss despite developers feeling faster
- 💰 Hidden costs: rework, bug fixes, architectural inconsistency

**Our Defense Strategy:**

- 📊 **Jellyfish:** Monitor code quality trends and AI impact
- 🔍 **CodeRabbit & Qodo:** Automated review gates catch issues early
- 🔗 **MCP Servers:** Consistent tool integration prevents fragmentation
- 📏 **AGENTS.md:** Shared standards prevent architectural drift
- 🛡️ **Security protocols:** Human review gates for critical code
- 💵 **Cost tracking:** Monitor tool expenses vs. productivity gains

**Bottom Banner:** "We're building the governance layer as we scale"

### **Presenter Notes:**

- **The trap:** "This cycle is playing out at companies worldwide as they rush to adopt AI without governance"
- **Step-by-step walkthrough:**
  - **Steps 1-2:** "Deadlines are tight, AI makes coding fast – why slow down with process?"
  - **Step 3:** "Copilot generates code in seconds. Cursor completes entire functions. It feels incredibly productive"
  - **Step 4:** "But without proper review, code gets pasted in hastily. Integration is superficial. Patterns are inconsistent"
  - **Steps 5-6:** "Six months later, the codebase is a maze. Nobody knows which code was AI-generated or human-written. Maintenance becomes harder than greenfield development"
  - **Step 7:** "The productivity gains evaporate. Development slows. Pressure increases. The cycle repeats with even more desperation"
- **The alarming statistics:**
  - "Industry data shows code churn – the rate at which code is rewritten or deleted – doubled in 2024"
  - "41% of AI-generated code requires significant refactoring within six months"
  - "That productivity placebo effect we mentioned? Developers felt 19% faster but were objectively slower"
- **Real company example:** "A mid-size tech company saw initial 40% productivity gains with AI. Within 8 months, they had accumulated so much technical debt that they needed a 3-month refactoring initiative. Net result: they were slower than before AI adoption"
- **Our defensive measures explained:**
  - **Jellyfish:** "Gives us early warning signals. We can see code quality degrading before it becomes critical"
  - **CodeRabbit/Qodo:** "Automated first-pass review catches issues that would otherwise slip through"
  - **MCP servers:** "Standardized integration prevents tool fragmentation"
  - **AGENTS.md:** "Ensures consistency across all AI suggestions"
  - **Security protocols:** "Human experts review sensitive code regardless of AI involvement"
  - **Cost tracking:** "Ensures we're actually getting ROI, not just feeling productive"
- **Proactive vs. reactive:** "We're building governance concurrently with adoption, not after we have problems. This is rare and smart"
- **The counterfactual:** "Without these measures, we'd likely fall into this cycle. With them, we compound productivity instead of accumulating debt"
- **Key principle:** "Speed without quality is just technical debt. Our goal is to keep both velocity and quality trending upward together"
- **Timing:** 3-4 minutes

---

## **Slide 6: Foundation Layer – AGENTS.md**

### **Slide Content:**

**AGENTS.md: The Missing Piece**

**What It Is:**

- 📄 Machine-readable project README at repository root
- 🎯 Single source of truth for ALL AI tools (Copilot, Cursor, CodeRabbit, Qodo, Claude Code)
- ✅ Plain Markdown – human-readable too
- 🔄 Version-controlled like code
- 🌐 Industry-standard format (emerging consensus)

**Before/After Comparison:**

> (TODO) Image: Split screen showing code suggestion without AGENTS.md vs. with AGENTS.md

**❌ Without AGENTS.md:**

```javascript
// AI makes generic assumptions
catch (error) {
  console.log(error);  // Inconsistent with our standards
}
```

**✅ With AGENTS.md (specifies OUR standards):**

```javascript
// AI follows our conventions
catch (error) {
  logger.error('File processing failed', {
    error,
    userId,
    transactionId,
    timestamp: Date.now()
  });
  metrics.increment('file.errors');
  throw new PaymentError(error);
}
```

**💡 DEMO MOMENT (2 min):**

If available, pull up an actual AGENTS.md file from a pilot project and show:

- The file structure and key sections
- A before/after Copilot suggestion comparison using the same code
- How the AI suggestion improves when AGENTS.md is present

**Impact Data:**

- Teams report "dramatically fewer simple mistakes" after implementing AGENTS.md
- AI suggestion acceptance rates improve 35-50%
- Onboarding time for new AI tools reduced by ~70%
- Documentation quality improves as side benefit

**Reference:** [What is AGENTS.md and why should you care?](https://dev.to/proflead/what-is-agentsmd-and-why-should-you-care-3bg4)

### **Presenter Notes:**

- **The concept:** "AGENTS.md is the breakthrough that aligns all our AI tools around OUR conventions, not generic patterns"
- **The problem it solves:** "Right now, Copilot makes assumptions based on general programming patterns. Cursor makes different assumptions. When we deploy CodeRabbit and Qodo, they'll make their own assumptions. The result? Inconsistent suggestions that require manual correction"
- **How it works:** "We create a single markdown file at each repository root that explicitly tells every AI tool about OUR codebase – our conventions, our patterns, our architecture, our gotchas"
- **The analogy:** "Think about when a new engineer joins. They read documentation to understand conventions. AGENTS.md does the same for AI tools – it's onboarding documentation for agents"
- **Why Markdown:** "Plain text, human-readable, version-controlled, no special tooling needed. It improves our documentation practices overall"
- **Before/After walkthrough:**
  - **Left side:** "Generic error handling that AI suggests without context. It works, but doesn't match our observability standards"
  - **Right side:** "With AGENTS.md specifying our error handling conventions, AI generates code that follows our structured logging, metrics tracking, and error handling patterns"
- **Real impact data:** "Teams implementing AGENTS.md report 35-50% higher AI suggestion acceptance rates. That means less time fixing AI suggestions, more time writing new features"
- **Repository-level understanding:** "Modern AI tools now maintain repository-level context – they understand relationships across files. AGENTS.md helps them understand not just structure, but OUR architectural decisions and design philosophy"
- **Integration with MCP:** "This works beautifully with our MCP servers. MCP provides access to tools (Jira, GitHub, Confluence). AGENTS.md provides the conventions for how to use that information"
- **Living document:** "AGENTS.md evolves as our practices evolve. When we adopt new patterns or learn lessons, we update AGENTS.md. All AI tools instantly benefit"
- **Implementation strategy:** "We don't need to do this for every repo on day one. Start with our 2-3 most active projects, document conventions, see immediate improvements, then expand"
- **Industry adoption:** "Copilot, Cursor, CodeRabbit, Qodo, and Claude Code all recognize and honor AGENTS.md. It's becoming the industry standard for AI tool configuration"
- **Prompt engineering connection:** "AGENTS.md is essentially a persistent, structured prompt that every tool reads. It's prompt engineering at scale"
- **Template approach:** "We'll create a canonical template that teams can customize for their projects. This ensures baseline consistency while allowing project-specific additions"
- **Governance integration:** "Changes to AGENTS.md go through PR review just like code. This ensures quality and creates visibility into evolving standards"
- **Timing:** 4-5 minutes

---

## **Slide 7: Extending the Foundation**

### **Slide Content:**

**Additional Shared Standards & Prompt Engineering**

**Configuration Layers:**

```
┌──────────────────────────────────────────────────┐
│  AGENTS.md    .cursor/rules    Prompt Library   │
│                                                  │
│  [Standards]  [IDE Config]     [Team Patterns]  │
│                                                  │
│  "One Configuration Approach Aligns Every Tool" │
└──────────────────────────────────────────────────┘
```

**Prompt Engineering Framework:**

**Prompt Library:**

- 📚 Curated, tested prompts for common tasks
- 🎯 Context window management patterns
- 📝 Few-shot examples for better results

**Slash Commands (Standardized):**

- `/refactor` – Apply our refactoring standards
- `/test` – Generate tests per our conventions
- `/doc` – Create documentation per our template
- `/review` – Pre-review code before PR
- `/security` – Security-focused analysis
- `/explain` – Code explanation for knowledge sharing

**Tool-Specific Configurations:**

- **`.cursor/rules`:** Team-specific coding patterns
- **Memory settings:** Persistent context across sessions

**Key Principle:** "Reduce cognitive load – developers use the same approaches across all AI tools"

### **Presenter Notes:**

- **Beyond AGENTS.md:** "While AGENTS.md is foundational, we extend standardization through additional layers"
- **Prompt library rationale:** "Companies with formal prompt engineering practices see 35-50% higher AI suggestion acceptance rates. We're building that systematically"
- **What goes in the library:**
  - "Prompts that consistently produce good results for OUR codebase"
  - "Context window management techniques – how to structure large amounts of context effectively"
  - "Few-shot examples – showing AI examples of good code from our repos improves suggestions"
  - "Negative prompting – explicitly telling AI what NOT to do catches common mistakes"
  - "Chain-of-thought patterns – when to ask AI to show its reasoning before suggesting code"
- **Acceptance tracking:** "We track which prompts have high acceptance rates and promote those. Failed prompts get refined or retired"
- **Slash commands standardization:** "Creating a common language across the team. Everyone knows `/refactor` triggers our standard refactoring approach, applying our conventions consistently"
- **Example workflow:** "Developer writes code, runs `/review` to get AI pre-review before submitting PR, catches issues early, PR review is faster and more focused on architecture"
- **Cursor rules integration:** "The `.cursor/rules` file complements AGENTS.md with IDE-specific patterns. For example, specifying preferred keyboard shortcuts or auto-formatting preferences"
- **Memory features:** "Modern AI tools can maintain context across sessions. We enable and configure this consistently so AI remembers project context between coding sessions"
- **Cognitive load reduction:** "The goal is developers don't need to remember different approaches for different tools. One mental model, consistently applied"
- **Implementation in template:** "These recommendations will be included in our AGENTS.md template as suggested configurations"
- **Continuous improvement loop:** "As developers discover effective prompts, they contribute them to the library. As the library grows, everyone benefits"
- **Repository-level vs. organization-level:** "AGENTS.md is per-repository. The prompt library and slash command standards are organization-level, ensuring consistency across all projects"
- **Timing:** 3 minutes

---

## **Slide 8: Orchestration Layer – Model Context Protocol (MCP)**

### **Slide Content:**

**AI Agents Working Together via MCP**

**Architecture Diagram:**

```
              ┌─────────────────────────┐
              │   AI Tools Layer:       │
              │ Copilot • Cursor        │
              │ CodeRabbit • Claude Code│
              └───────────┬─────────────┘
                          │
              ┌───────────▼─────────────┐
              │   MCP Server Cluster    │
              │  (Anthropic Protocol)   │
              └───────────┬─────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────┐
        │                 │                 │             │
   ┌────▼───┐        ┌───▼────┐       ┌────▼────┐   ┌────▼────┐
   │  Jira  │        │ GitHub │       │Confluence│   │ DocBot  │
   │ (MCP)  │        │ (MCP)  │       │  (MCP)   │   │  (MCP)  │
   └────────┘        └────────┘       └──────────┘   └─────────┘
```

**Real Workflow Example (Debugging Production Issue):**

1. **Developer receives alert:** "Fix payment timeout issue in production"
2. **Cursor reads Jira ticket** via Jira MCP (auto-loads context, no copy-paste)
3. **Queries DocBot MCP** for payment service architecture documentation
4. **Queries SignalFx MCP** for recent payment timeout APM traces
5. **Queries GCL MCP** for error logs matching the trace IDs from SignalFx
6. **Analyzes complete context** and suggests fix based on actual production data
7. **Claude Code generates regression tests** to prevent future timeouts
8. **CodeRabbit verifies** fix addresses the root cause from the Jira ticket
9. **Auto-updates Jira ticket** with PR link and resolution summary

**⏱️ Time Comparison:**

- **Before MCP:** 30 min context gathering (switching between 5 tools) + development time
- **After MCP:** 5 min context gathering (AI auto-queries) + development time
- **Time saved:** ~25 min per debugging session, 90% reduction in manual context switching

**Performance Metrics:**

- 90% faster context gathering vs. manual copy-paste
- Multi-agent systems: 3-5x improvement over sequential workflows

### **Presenter Notes:**

- **The breakthrough:** "MCP is Anthropic's universal adapter that lets any AI agent access our internal tools without custom integration"
- **Our advantage:** "We've already built this infrastructure – MCP servers for Jira, GitHub, Confluence, and DocBot are operational. We're piloting SignalFx (APM traces) and Google Cloud Logging MCP servers. Most companies are still planning what we've implemented"
- **How it works:** "Instead of each AI tool requiring custom integration with each system, they all speak MCP. One protocol, universal access"
- **No more manual work:** "Developers no longer copy-paste from Jira to Copilot. No more switching between Confluence and IDE to reference documentation. AI tools access this information directly"
- **DocBot breakthrough:** "Just launched – automated documentation synchronization from GitHub, Confluence, and Slack into Box AI Hubs. Any MCP-enabled tool can now search across all our documentation in real-time. This solves the 'where did I see that?' problem by making all docs AI-searchable and contextually available"
- **Current capabilities:**
  - "Copilot can read Jira ticket requirements while writing code"
  - "Cursor can reference Confluence architecture docs while suggesting implementations"
  - "CodeRabbit can verify PR addresses the actual Jira ticket requirements"
  - "Any LLM can search across synchronized documentation via DocBot's MCP endpoint"
- **Pilot capabilities (SignalFx & GCL MCP):**
  - "AI can analyze APM traces to identify performance bottlenecks – download traces, analyze span duration, find error patterns, identify slowest operations"
  - "AI can query production logs with sophisticated filters – trace IDs, HTTP status codes, service IDs, resource types – enabling faster root cause analysis"
  - "Imagine debugging: AI detects slow API response, queries SignalFx for trace data, identifies the bottleneck span, searches GCL for related error logs, and suggests the fix – all automated"
- **Multi-agent workflows:** "This is where it gets exciting – orchestrated workflows where agents collaborate"
- **Bug fix example walkthrough:**
  - "CodeRabbit catches an issue during PR review"
  - "Instead of just flagging it, it creates a Jira ticket via MCP with full context"
  - "Cursor picks up that ticket context and suggests a fix"
  - "Claude Code generates tests to prevent regression"
  - "DocBot updates documentation to reflect the fix"
  - "Jira ticket auto-updates with resolution"
  - "All coordinated, all using shared context"
- **The stat:** "Research shows well-orchestrated multi-agent systems achieve 3-5x better performance than sequential tool usage"
- **Zero integration tax:** "When we add a new AI tool, it just plugs into our existing MCP infrastructure. No custom integration needed"
- **Repository-level context:** "Modern AI tools maintain repository-level understanding. MCP provides them with real-time data about the actual system state – tickets, recent commits, documentation updates"
- **SDLC integration:** "MCP provides context at every stage of development. Pre-commit, AI has ticket context. During PR, AI has code history. In CI, AI has test results. This creates continuous intelligence"
- **Expansion roadmap:**
  - "Currently piloting: SignalFx MCP (APM trace analysis) and Google Cloud Logging MCP (structured log querying) – these add production observability to AI workflows"
  - "Q1 2026: Slack MCP integration for real-time communication context (DocBot already syncs Slack history)"
  - "Q2 2026: Design tool integration closing the design-to-code gap"
  - "Q3 2026: Incident management for production awareness"
- **Security layer:** "MCP servers implement our data governance policies – they filter sensitive data and audit access"
- **Agentic AI trend:** "Anthropic and other leaders are moving toward agentic systems – AI that can complete multi-step tasks. MCP is the infrastructure enabling this"
- **Competitive positioning:** "Most companies are struggling with fragmented tool integration. We're positioned to leverage next-generation agentic workflows because we built the foundation"
- **Timing:** 4-5 minutes

---

## **Slide 9: Human-in-the-Loop Governance**

### **Slide Content:**

**The Golden Rule: AI Suggests, Humans Decide**

**Automation Matrix:**

| ✅ **Automate These**    | ⚠️ **Require Extra Review** | 🚫 **Always Require Senior Review** |
| ------------------------ | --------------------------- | ----------------------------------- |
| Boilerplate code         | Complex business logic      | Security-critical code              |
| Standard CRUD operations | API integrations            | Authentication/authorization        |
| Test generation          | Data transformations        | Payment processing                  |
| Documentation            | Performance-sensitive code  | Cryptography                        |
| Configuration files      | Multi-service coordination  | Access control                      |
| API client generation    | Database queries            | Data migrations                     |
| Data model definitions   | Error handling patterns     | PCI/PHI/regulated data              |

**AI Accuracy Reality Check:**

- 🎯 AI hallucination rate: 15-30% in code generation
- 🔍 Hallucinations often look plausible but fail subtly
- 🛡️ Most dangerous: AI suggesting deprecated APIs, insecure patterns, or incorrect external integrations
- ✅ Protection: Verification protocols + automated gates + human expertise

**Verification Protocols:**

- ✓ Always validate AI suggestions against official documentation
- ✓ Test AI-generated algorithms with edge cases
- ✓ Senior engineer sign-off for sensitive areas

**Automated Gates Can Block:**

- Style violations
- Security scan failures
- Obvious bugs (syntax errors, type mismatches)
- AGENTS.md compliance failures
- Secrets/credentials in code

**Human Review Focuses On:**

- System architecture and design patterns
- Business logic correctness
- Edge case handling
- Performance implications
- Security implications beyond automated scans
- Integration complexity

### **Presenter Notes:**

- **Interactive element (START):** "Let's test our judgment. I'll show a code scenario – thumbs up if you think AI can handle it, thumbs down if it needs senior review. Ready? [Show example: JWT token validation code]" [Pause for response] "Great instinct – that's in the 'Always Require Senior Review' column. Security-critical code always needs expert eyes, no matter how good the AI suggestion looks"
- **The non-negotiable principle:** "Even with sophisticated AI, humans must remain in the loop for critical decisions"
- **Automation column explained:** "These are perfect for AI – repetitive, well-defined patterns where AI excels. Generate test skeletons, API documentation, standard CRUD endpoints – let AI handle these completely after automated verification"
- **Extra review column:** "These require judgment but may not need senior expertise. Complex business logic, integrations, data transformations – standard engineers can review effectively"
- **Senior review column:** "These require deep expertise and understanding of consequences. Security, payments, authentication, cryptography – always need senior oversight"
- **Real danger example:** "A company shipped AI-generated authentication code without expert review. It had a subtle vulnerability that passed automated tests but was exploitable. Cost them millions in incident response"
- **AI hallucination reality:** "AI tools hallucinate 15-30% of the time. That means they confidently suggest code that's plausible but wrong"
- **Common hallucinations:**
  - "Suggesting deprecated API endpoints that look right"
  - "Inventing functions that don't exist in libraries"
  - "Applying patterns from one framework to another incorrectly"
  - "Making assumptions about external service behavior"
- **Example to share:** "AI suggested using a deprecated endpoint in a third-party API. It looked correct, passed linting, but would have caused production failures. Caught only because we require verification of external API calls"
- **Ground truth checking:** "Our MCP servers provide real system state. AI can verify assumptions against actual Jira tickets, actual code in GitHub, actual documentation in Confluence"
- **Review process walkthrough:**
  - **Automated checks:** "First pass catches obvious issues – syntax, style, security patterns"
  - **AGENTS.md compliance:** "Verify suggestions follow our documented conventions"
  - **Risk-based routing:** "High-risk code (security, payments) auto-routes to senior engineers"
  - **Human focus:** "Engineers focus on what humans do best – architecture, judgment, edge cases"
- **Tools in action:** "CodeRabbit and Qodo provide automated first-pass review. They catch 60-70% of issues automatically, freeing humans for higher-level review"
- **Configuration strategy:** "We'll configure CodeRabbit/Qodo to flag code in sensitive areas automatically. Payment processing? Escalate to senior review. Authentication changes? Security team review"
- **Cultural norm:** "Document these guidelines in our engineering wiki. Make it clear where AI operates independently and where humans must intervene"
- **MCP security integration:** "MCP servers help AI understand high-risk areas based on Jira ticket labels ('security'), Confluence documentation ('sensitive data'), or file paths (payment service)"
- **The balance:** "Goal is AI-augmented development where mundane tasks are automated but creative problem-solving and critical decisions stay human"
- **Measurement via Jellyfish:** "Track outcomes – are we shipping faster without more bugs? Is change failure rate stable? This validates our governance is working"
- **Timing:** 4-5 minutes

---

## **Slide 10: Building AI-Aware Culture – Transparency Practices**

### **Slide Content:**

**Transparency & Accountability**

**Declaration Practices:**

✅ **In Pull Requests:**

```markdown
## AI Assistance Used

- Used Copilot for initial function structure
- Cursor suggested error handling patterns
- CodeRabbit flagged edge case issue (addressed)
- Generated tests with Claude Code
```

✅ **In Commit Messages:**

```bash
git commit -m "feat: add payment processor [ai-assisted]

- Core logic: human-written
- Error handling: Copilot suggestion (modified)
- Tests: Claude Code generated, human-verified
"
```

**Why Declare AI Usage:**

- Reviewers know to check for common AI pitfalls
- Creates organizational learning data
- Enables better metrics and analysis
- Normalizes AI as a tool, not something to hide
- Helps identify patterns in AI effectiveness

**Open Discussion Practices:**

✓ Retrospectives: Dedicated AI discussion time

- What worked well? What didn't?
- Where did AI save time? Where did it cost time?
- What new AI pitfalls did we discover?

✓ Engineering meetings: Share AI wins and lessons

- "Here's how we solved X using Y tool"
- "Here's where AI led us astray"
- "Here's a prompt pattern that works well"

✓ Document rejected suggestions:

- When AI suggestions are rejected, document why
- Patterns of rejection inform AGENTS.md updates
- Learning loop: rejection analysis → better prompts → better suggestions

**No-Shame Culture:**

- Rejecting AI suggestions is good – it means thinking critically
- Using AI isn't cheating – it's using available tools
- AI failures are learning opportunities, not problems

### **Presenter Notes:**

- **Cultural shift:** "As we scale AI, transparency and learning become cultural imperatives"
- **Why declaration matters:** "When developers declare AI usage in PRs, reviewers know to pay extra attention to common AI pitfalls – hallucinations, deprecated patterns, incorrect assumptions"
- **Example:** "Seeing 'Used Copilot for error handling' signals reviewer to verify error handling is comprehensive and matches our standards"
- **Make it normal:** "Normalize saying 'I used Copilot for this' in PR descriptions. It's not weakness – it's transparency about the development process"
- **Commit message practice:** "Including [ai-assisted] tag enables analysis. Jellyfish can correlate AI usage with code quality metrics over time"
- **Organizational learning:** "Aggregate data on AI usage helps us understand where AI helps most and where it struggles"
- **Pattern recognition:** "If multiple PRs note 'Copilot suggested X but we modified to Y', that's signal to update AGENTS.md to specify Y pattern"
- **Retrospective value:** "Dedicate 5-10 minutes in retros to AI discussion. What saved time? What created work? What bugs were AI-related?"
- **Failure discussion:** "In one retro, a team realized AI kept suggesting synchronous patterns where they needed async. Led to AGENTS.md update specifying async preference"
- **Engineering meetings:** "Brief AI wins and lessons. 'We used this prompt pattern and got great results' helps everyone"
- **Rejection documentation:** "When someone rejects most AI suggestions in a session, that's valuable signal. Why were suggestions bad? What was AI missing? Feed that back"
- **Learning loop:** "Rejection patterns → AGENTS.md updates → better prompts → improved suggestions → higher acceptance → less rework"
- **No-shame principle:** "Critical to emphasize: using AI isn't cheating, and rejecting AI isn't failure. Both are appropriate tool usage"
- **Trust building:** "Transparency builds trust. Leadership sees honest assessment, not inflated productivity claims. Engineers see realistic expectations"
- **Avoid metrics gaming:** "If people hide AI usage for fear of judgment, we lose learning opportunities and risk quality issues"
- **Implementation:** "Add PR template prompts asking about AI usage. Make it easy to declare, not an extra burden"
- **Timing:** 3 minutes

---

## **Slide 11: Building AI-Aware Culture – Learning Systems**

### **Slide Content:**

**Systematic Learning & Improvement**

**Prompt Library:**

**Structure:**

```
Prompts by Category:
├── Refactoring
│   ├── Extract function (90% acceptance)
│   ├── Simplify conditionals (85% acceptance)
│   └── Remove duplication (80% acceptance)
├── Testing
│   ├── Unit test generation (95% acceptance)
│   ├── Edge case identification (75% acceptance)
│   └── Integration test scaffolds (88% acceptance)
├── Documentation
│   ├── Function documentation (92% acceptance)
│   ├── API documentation (87% acceptance)
│   └── Architecture diagrams (70% acceptance)
└── Code Review
    ├── Security analysis (82% acceptance)
    ├── Performance review (78% acceptance)
    └── Best practices check (85% acceptance)
```

**Learning Mechanisms:**

📊 **Acceptance Tracking:**

- Track which prompts yield high acceptance rates
- Promote effective prompts, retire ineffective ones
- A/B test prompt variations to optimize

🔄 **Feedback Loop:**

- Developer uses prompt → Accepts or rejects suggestion → Logs feedback
- Monthly review: Which prompts need refinement?
- Update library based on aggregate feedback

📚 **Best Practice Sharing:**

- Weekly "AI Win of the Week" in Slack
- Quarterly prompt library review session
- Cross-team learning: What works for Backend? Frontend?

### **Presenter Notes:**

- **Systematic approach:** "We're building a formal prompt engineering practice, not ad-hoc experimentation"
- **Library structure:** "Organize prompts by category – refactoring, testing, documentation, review. Each category contains battle-tested prompts"
- **Acceptance rates matter:** "Track which prompts work. 90% acceptance is excellent. 50% means the prompt needs refinement or retirement"
- **Example walkthrough:** "This 'Extract Function' prompt has 90% acceptance because it's specific, references AGENTS.md, and includes key constraints"
- **Why specify 'do not change behavior':** "This phrase significantly reduces AI hallucinations during refactoring. Without it, AI sometimes 'improves' logic in ways that break functionality"
- **Template components:**
  - **Context:** When to use this prompt
  - **Acceptance rate:** Historical effectiveness
  - **Prompt:** The actual prompt text
  - **Tips:** Lessons learned from usage
- **Continuous improvement:** "A/B test prompt variations. Try two versions of a refactoring prompt, see which gets better results"
- **Feedback loop mechanics:**
  - "Developer tries prompt from library"
  - "If suggestion is good, that's data point supporting the prompt"
  - "If suggestion is bad, developer logs why – too generic, missed context, hallucinated, etc."
  - "Monthly, review feedback and refine prompts"
- **Cross-team learning:** "Backend team discovers great prompt for API testing. Share it. Frontend team adapts it for UI testing"
- **AI Win of the Week:** "Gamify learning. Slack channel where people share 'This prompt saved me 2 hours' stories"
- **Quarterly review:** "Dedicated session reviewing prompt library. Which prompts are stale? What new patterns emerged?"
- **Repository-level prompts:** "Some prompts work better for certain types of projects. Tag prompts with relevant project types"
- **Integration with AGENTS.md:** "Prompts reference AGENTS.md standards. This creates reinforcement – AGENTS.md defines what, prompts define how to ask for it"
- **Measurement via Jellyfish:** "Track acceptance rates over time. Are we getting better at prompting? Is AI getting better at understanding our requests?"
- **Team variance:** "Interesting to compare: does Backend team have higher acceptance for certain prompts than Frontend? Why? Cross-pollinate learnings"
- **New tool onboarding:** "When we add a new AI tool, test our prompt library against it. Do our prompts work? Do they need adaptation?"
- **Avoid prompt fatigue:** "Not every task needs a special prompt. The library is for common, high-value tasks where optimization matters"
- **Living library:** "This evolves continuously. As AI models improve, prompts may need less specification. As our standards evolve, prompts update to match"
- **Timing:** 3-4 minutes

---

## **Slide 12: How We'll Measure Success**

### **Slide Content:**

**Leading Indicators (Monthly Tracking):**

- 📊 **AI Suggestion Acceptance Rate**
  - Target: 60%+ by Month 3, 70%+ by Month 6
  - Baseline: ~30% without configuration
  - Measure: % of AI suggestions accepted without modification

- 😊 **Developer Satisfaction Score**
  - Target: 4/5+ satisfaction rating
  - Method: Monthly pulse surveys
  - Questions: "AI tools help me be more productive" / "AI tools are well-integrated"

- 📝 **AGENTS.md Coverage**
  - Target: 80% of active repositories by Month 6
  - Measure: % of repos with AGENTS.md file
  - Quality gate: AGENTS.md includes minimum required sections

- 🎓 **Training Completion Rate**
  - Target: 100% by Month 2
  - Measure: % of developers who completed core training modules
  - Include: Workshops, self-paced content, office hours attendance

**Lagging Indicators (Quarterly Tracking):**

- 📈 **DORA Metrics Trend**
  - Deployment Frequency (maintain or improve)
  - Lead Time for Changes (maintain or improve)
  - Mean Time to Recovery (maintain or improve)
  - Change Failure Rate (maintain or improve)
  - Goal: AI adoption should NOT degrade these metrics

- 🔍 **Code Quality Metrics**
  - Code churn rate (target: reduce by 50%)
  - Technical debt ratio (maintain or improve)
  - Bug density (maintain or improve)
  - Code review cycle time (maintain or improve)

- ⏱️ **Time-to-Market**
  - Feature delivery velocity (target: increase)
  - Story points delivered per sprint (target: increase)
  - Epic completion time (target: reduce)

- 💰 **ROI Calculation**
  - Total cost: Tool licenses + training hours + maintenance
  - Total benefit: Time saved × hourly rate + quality improvements
  - Break-even target: Month 4-5

**Red Flags to Watch:**

- ⚠️ Increasing change failure rate → AI code quality issues
- ⚠️ Declining developer satisfaction → Tool frustration or poor configuration
- ⚠️ Widening skill gaps → Champions advancing, others falling behind
- ⚠️ Decreasing acceptance rates → AI suggestions getting worse or AGENTS.md outdated
- ⚠️ Rising code churn → Too much AI-generated code requiring rework

### **Presenter Notes:**

- **Measurement philosophy:** "We measure what matters – leading indicators give us early signals, lagging indicators validate long-term impact"
- **Leading vs. lagging:** "Leading indicators are like speedometer readings – they tell us how we're doing right now. Lagging indicators are like arriving at the destination – they tell us if we actually got there"
- **Acceptance rate detail:** "This is our #1 leading indicator. If acceptance rates stay low, something's wrong – bad configuration, poor prompts, or inadequate AGENTS.md"
- **Developer satisfaction is critical:** "If developers hate the tools, adoption will fail. We track this monthly and act on feedback immediately"
- **AGENTS.md coverage strategy:** "Start with top active repos, expand systematically. 80% coverage captures the vast majority of development activity"
- **Training completion:** "Non-negotiable. Everyone gets trained, not just volunteers. This prevents skill gaps and ensures consistent usage"
- **DORA metrics guard rails:** "Critical principle: AI adoption should NOT degrade our core delivery metrics. If deployment frequency drops or failure rate rises, we pause and diagnose"
- **Code quality emphasis:** "Code churn is the killer metric. If we're generating code that gets rewritten, we're wasting time, not saving it"
- **ROI transparency:** "We track actual costs and actual benefits. No hand-waving. Productivity gains must exceed investment"
- **Break-even expectation:** "Conservative estimate is 4-5 months. Some teams may break even faster, others slower. We track per-team to understand variance"
- **Red flags proactive:** "We don't wait for disaster. Red flags trigger immediate investigation and course correction"
- **Example: Change failure rate rising:** "If this happens, we investigate: Is AI generating buggy code? Are reviews too fast? Do we need stricter gates?"
- **Example: Developer satisfaction declining:** "Immediate action: Survey why, gather feedback, adjust configuration, provide additional training, or change tools if needed"
- **Dashboard visibility:** "Jellyfish dashboard shows all these metrics in real-time. Leadership reviews monthly. Teams review weekly"
- **Course correction culture:** "These metrics aren't just for reporting – they drive action. Low acceptance rate? Update AGENTS.md. High churn? Review standards. Rising failures? Tighten review gates"
- **Success celebration:** "When we hit targets, we celebrate publicly. Share wins, recognize contributors, reinforce positive outcomes"
- **Timing:** 4-5 minutes

---

## **Slide 15: Common Pitfalls to Avoid**

### **Slide Content:**

**Learning from Industry Failures**

**Scenario 1: The Speed Trap**

- ❌ **What happened:** Team used AI aggressively with minimal review
- 📉 **Result:** Code churn doubled, 6-month refactor needed, velocity collapsed
- 💀 **Data:** 41% of AI code required significant refactoring
- ⚠️ **Early Warning Signs:**
  - PR review time dropping significantly
  - Increasing bug reports 2-3 sprints after "productive" sprint
  - Developers saying "I'll clean this up later"
  - Rising technical debt metrics in Jellyfish
- ✅ **Our Protection:** Multi-layer review (CodeRabbit → human) + Jellyfish monitoring

**Scenario 2: Inconsistent Adoption**

- ❌ **What happened:** Each team used AI differently, no shared standards
- 📉 **Result:** Codebase fragmentation, cross-team collaboration difficult
- 💀 **Example:** One team async, another sync – AI reinforced divergence
- ✅ **Our Protection:** AGENTS.md standardization + documented conventions

**Scenario 3: Security Blindspot**

- ❌ **What happened:** AI-generated auth code merged without expert review
- 📉 **Result:** Critical vulnerability in production, $2M+ incident cost
- 💀 **Pattern:** AI hallucinated "secure" but subtly flawed implementation
- ⚠️ **Early Warning Signs:**
  - PRs with auth/security changes merged in <2 hours
  - Security-tagged tickets without security team review
  - Authentication code changes during senior engineer PTO
  - AI suggestions for cryptography or access control accepted without verification
- ✅ **Our Protection:** Mandatory senior review for security + automated scanning + CodeRabbit security rules

**Scenario 4: The Measurement Failure**

- ❌ **What happened:** Celebrated productivity gains, ignored tech debt accumulation
- 📉 **Result:** Initial gains eroded, team slower after 6 months than before AI
- 💀 **Trap:** Measuring output (commits) not outcomes (value delivered)
- ✅ **Our Protection:** Jellyfish tracks DORA metrics + quality + technical debt

**Scenario 5: The Tool Outage**

- ❌ **What happened:** Primary AI tool had outage, team paralyzed
- 📉 **Result:** Lost productivity during critical deadline
- 💀 **Dependency:** Over-reliance on single tool
- ✅ **Our Protection:** Tool redundancy (Copilot + Cursor) + rollback procedures + manual workflows documented

**Common Thread:** All failures from moving fast without governance

### **Presenter Notes:**

- **Interactive element (START):** "Before we dive in, which scenario concerns you most for OUR team? [Show of hands for each scenario]" [Pause for response] "Good to know – we'll make sure to address those concerns specifically in our rollout plan"
- **Learn from others:** "These are real patterns from companies that adopted AI without proper governance"
- **Scenario 1 deep dive:** "A fintech startup moved so fast with AI they accumulated massive technical debt. Developers generated code quickly, but integration was poor"
- **Early warning emphasis:** "The key is spotting problems early. If you see PR review times dropping dramatically or developers deferring cleanup, raise the flag immediately"
- **The refactoring crisis:** "After 6 months, they needed a full quarter to refactor and consolidate AI-generated code. Lost all initial gains"
- **Our multi-layer defense:** "CodeRabbit catches issues immediately. Human review catches what automation misses. Jellyfish tracks long-term quality"
- **Scenario 2 reality:** "Enterprise company let teams adopt AI ad-hoc. Six months later, each team had different patterns, conventions, approaches"
- **Cross-team friction:** "New developers couldn't move between teams – each codebase looked different despite being the same tech stack"
- **Collaboration breakdown:** "Shared libraries became inconsistent. Integration points were nightmares. Code reviews became debates about style"
- **AGENTS.md solution:** "Single source of truth prevents this fragmentation. All teams follow same conventions, all AI tools suggest same patterns"
- **Scenario 3 – the nightmare:** "Payment startup, small team, used Copilot for authentication. Senior engineer on vacation, code merged quickly"
- **The vulnerability:** "Subtle flaw in JWT validation. Looked secure, passed basic tests, but was exploitable"
- **Discovery:** "Security researcher found it, reported responsibly. Could have been disastrous"
- **The cost:** "Emergency patch, security audit, customer notification, regulatory scrutiny. Over $2M in total costs"
- **Our safeguards:** "Authentication, authorization, cryptography, payment logic – always senior review, always security team oversight"
- **Automated protection:** "CodeRabbit configured with security rules. Flags suspicious patterns automatically"
- **Scenario 4 – GDPR nightmare:** "Developer doing data analysis, pasted customer emails into ChatGPT to extract insights"
- **The violation:** "Customer PII sent to external service without consent. Clear GDPR violation"
- **The outcome:** "Regulatory investigation, fine, customer notification, trust damage"
- **Common pattern:** "Happens when developers don't understand data policies or when policies are unclear"
- **Our defense:** "Clear data classification. MCP layer filters sensitive data. Training on what data can/cannot go to AI"
- **Scenario 5 – measurement trap:** "Team celebrated 50% more commits. Felt incredibly productive"
- **Hidden reality:** "Deployment frequency actually decreased. Change failure rate increased. Technical debt accumulated"
- **The irony:** "They were working harder but delivering less value. Busy but not effective"
- **Why it happens:** "Measured output (commits, lines of code) instead of outcomes (features deployed, customer value)"
- **Jellyfish advantage:** "We measure what matters – DORA metrics, code quality, technical debt. Can't fool these metrics"
- **Scenario 6 – dependency risk:** "GitHub Copilot had multi-hour outage. Team was largely blocked"
- **The problem:** "Over-reliance on single tool. No documented fallback process"
- **Impact:** "Critical deadline, team couldn't maintain velocity without AI assistance"
- **Our redundancy:** "Multiple tools (Copilot + Cursor). If one is down, use the other. Manual workflows documented for worst-case"
- **Rollback procedures:** "If AI tool is causing problems (bad suggestions, service issues), we can quickly disable and revert to manual processes"
- **Common thread:** "All these failures share one pattern: moving fast without governance, measurement, or safety nets"
- **Our different approach:** "We're building governance concurrently with adoption. We're measuring rigorously. We're learning from others' mistakes"
- **The promise:** "These scenarios won't happen to us because we're proactive, not reactive"
- **Timing:** 4-5 minutes

---

## **Slide 16: Honest Risk Assessment**

### **Slide Content:**

**What Could Go Wrong & Our Mitigations:**

| **Risk**                                     | **Mitigation**                                                                                                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adoption slower than expected**            | • Champion network for peer support<br>• Incentives for early adopters<br>• Executive sponsorship and visibility<br>• Flexible timeline with no hard deadlines                                           |
| **Tool vendor lock-in**                      | • MCP abstraction layer reduces vendor dependency<br>• Multi-tool strategy (Copilot + Cursor + others)<br>• Standards-based approach (AGENTS.md works with any tool)<br>• Documented rollback procedures |
| **Initial productivity dip during learning** | • Training and support infrastructure<br>• Realistic 3-month ramp-up expectations<br>• Office hours and champion support<br>• Gradual rollout, not big bang                                              |
| **Resistance from senior engineers**         | • Early involvement in framework design<br>• Demonstrate value with pilot projects<br>• Address concerns directly in town halls<br>• Position as augmentation, not replacement                           |
| **Budget constraints for tools**             | • Phased rollout to spread costs<br>• ROI tracking justifies continued investment<br>• Start with free/cheaper tiers<br>• Prioritize highest-impact tools first                                          |
| **Technical debt from poor AI usage**        | • Multi-layer review process (automated + human)<br>• Jellyfish monitoring for early warning<br>• AGENTS.md prevents worst practices<br>• Regular code quality audits                                    |

**What We're NOT Doing:**

- ❌ Mandating specific tools (we provide options and guidance)
- ❌ Replacing human judgment with automation (augmentation, not automation)
- ❌ Moving fast without measurement (Jellyfish tracking from day 1)
- ❌ One-size-fits-all approach (teams can customize within standards)
- ❌ Penalizing developers for rejecting AI suggestions (critical thinking encouraged)
- ❌ Hiding costs or overpromising benefits (transparent ROI tracking)

**Our Safety Nets:**

- 🛡️ Rollback capability – can disable tools quickly if problems arise
- 📊 Continuous monitoring – Jellyfish dashboards show real-time impact
- 🔄 Feedback loops – monthly surveys, retrospectives, Slack discussions
- 🚦 Quality gates – automated and human review prevent bad code shipping
- 👥 Human-in-the-loop – final authority on critical decisions stays with engineers

### **Presenter Notes:**

- **Transparency principle:** "We're honest about risks. This builds trust and sets realistic expectations"
- **Risk 1 - Slow adoption:** "Some developers will be slower to adopt. That's okay. We support them with champions, training, and time. No pressure tactics"
- **Risk 2 - Vendor lock-in:** "This is real. That's why we built MCP and use AGENTS.md – tool-agnostic approaches. If Copilot becomes expensive or problematic, we can switch"
- **Risk 3 - Productivity dip:** "First 1-2 months may feel slower as developers learn. We account for this in our ROI calculations and timeline"
- **Risk 4 - Senior engineer resistance:** "Most skeptical but also most influential. We involve them early, listen to concerns, demonstrate value. Win them over, don't force compliance"
- **Risk 5 - Budget constraints:** "Tool costs add up. We track ROI monthly and adjust. If a tool isn't delivering value, we cut it"
- **Risk 6 - Technical debt:** "The big one. That's why we built the entire three-layer framework – to prevent this specific risk"
- **What we're NOT doing - autonomy:** "We're not mandating 'you must use Copilot for all coding.' We provide tools, training, standards – developers choose how to use them"
- **What we're NOT doing - replacement:** "AI assists, humans decide. We're crystal clear on this. Job security is not at risk"
- **What we're NOT doing - blind faith:** "We measure everything. If metrics show AI is hurting productivity, we course-correct immediately"
- **Safety nets explained:**
  - **Rollback:** "If Copilot starts giving bad suggestions or has service issues, we can disable it org-wide in hours, not days"
  - **Monitoring:** "Jellyfish shows us problems early, before they compound"
  - **Feedback:** "We actively solicit input and act on it. This isn't top-down edict, it's collaborative improvement"
  - **Quality gates:** "CodeRabbit catches issues. Humans catch what CodeRabbit misses. Nothing bad ships"
  - **Human authority:** "Engineers can always override AI. Always. No questions asked"
- **Confidence building:** "Yes, there are risks. But we've thought through each one together and have mitigations in place. We're prepared, not naive"
- **Compare to alternatives:** "The riskiest path is doing nothing. 79% of developers use AI tools. If we don't adopt thoughtfully as a team, individual adoption will happen chaotically without guardrails"
- **Transparency builds trust:** "By acknowledging risks openly, we demonstrate we're serious and thoughtful. This isn't hype – it's engineering. We're in this together"
- **Timing:** 3-4 minutes

---

## **Slide 17: Resistance Management**

### **Slide Content:**

**Common Objections & Responses:**

**"AI will replace my job"**

- ✅ Response: "AI augments, not replaces. Roles evolve from coding boilerplate to architecture and design"
- Data: "79% of developers use AI tools – it's now a core skill, like version control"
- Career value: "Mastering AI tools makes you more valuable, not less"

**"This will slow me down"**

- ✅ Response: "Short-term learning curve, long-term acceleration"
- Data: "After 3-month ramp, developers report 20-40% productivity gains"
- Support: "We provide training and support during learning curve"

**"AI suggestions are wrong too often"**

- ✅ Response: "That's why we're building AGENTS.md and standards"
- Plan: "Acceptance rates improve from ~30% baseline to 70%+ with proper configuration"
- Iteration: "Your feedback helps us improve prompts and configurations"

**"I don't trust AI with critical code"**

- ✅ Response: "Neither do we – that's why human review remains mandatory"
- Policy: "Security, payments, auth always require senior human review"
- Balance: "AI for boilerplate and standard patterns, humans for critical decisions"

**"Too many tools, too complex"**

- ✅ Response: "That's exactly why we're orchestrating – to reduce complexity"
- Vision: "AGENTS.md and MCP make tools work together consistently"
- Result: "One mental model, not five different tools to learn"

### **Presenter Notes:**

- **Job replacement fear:** "The #1 concern is always job security. Address it directly and honestly"
- **Reality check:** "AI is a tool that makes developers more productive and valuable, not a replacement. Roles evolve – less time on boilerplate, more time on architecture, design, and creative problem-solving"
- **Industry perspective:** "79% of developers already use AI tools. This is mainstream. Mastering AI tools is now a core competency like Git or IDEs"
- **Learning curve acknowledgment:** "Yes, there's a 3-month learning curve. But we provide training, office hours, and champion support. After ramp-up, developers report 20-40% productivity gains"
- **Quality concerns:** "Valid concern about AI suggestion quality. That's exactly why we're building AGENTS.md and standards. We see acceptance rates improve from ~30% baseline to 70%+ with proper configuration"
- **Trust concerns:** "Healthy skepticism is appropriate. That's why we have mandatory human review for critical code – security, payments, authentication always require senior oversight"
- **Complexity reduction:** "The orchestration framework actually reduces complexity. Instead of learning five different tools with five different approaches, we create one consistent mental model"
- **Framework as enabler:** "AGENTS.md provides shared context, MCP provides tool integration, governance provides safety nets. This makes AI tools easier to use, not harder"
- **Timing:** 2-3 minutes

---

## **Slide 18: Communication Plan**

### **Slide Content:**

**Channels:**

- Weekly email updates on rollout progress
- Slack channel (#ai-development) for discussion and support
- Monthly town halls for Q&A and success stories
- Engineering meeting time dedicated to AI topics
- Confluence space with all documentation and resources

**Leadership Role:**

**Engineering Managers:**

- Champion adoption on their teams
- Identify and support early adopters
- Address concerns and resistance
- Provide time and resources for training
- Celebrate team wins

**Senior Engineers:**

- Model best practices
- Mentor others on effective AI usage
- Contribute to prompt library
- Provide technical guidance on AGENTS.md

**Engineering Leadership:**

- Executive sponsorship and visible support
- Resource allocation and prioritization
- Remove blockers and obstacles
- Review metrics and course-correct
- Celebrate organization-wide successes

### **Presenter Notes:**

- **Change management importance:** "Technology rollouts fail due to people, not technology. We're investing in change management"
- **Phase 1 – Awareness:**
  - "Before training, everyone needs to understand WHY. Strategic context matters"
  - "Executive sponsorship: This isn't optional or experimental, it's strategic"
  - "Competitive context: 79% of developers use AI tools. We must too, but we'll do it right"
  - "Town halls: Open forum for concerns. Make it safe to ask 'Will this replace me?'"
- **Phase 2 – Training:**
  - "16 hours per developer is substantial investment but necessary"
  - "Hands-on workshops: Use real code from our repos, not toy examples"
  - "AGENTS.md creation workshop: Teams create their first AGENTS.md file together"
  - "Prompt engineering fundamentals: How to get good results from AI tools"
  - "Self-paced resources for different learning styles"
  - "Office hours: Regular sessions where developers can ask questions"
- **Phase 3 – Pilot & Champions:**
  - "Identify natural early adopters – usually 10-15% of team"
  - "These become champions who help others"
  - "Provide extra support: First to get new tools, direct access to Platform Team"
  - "Document wins: 'Champion X saved Y hours using Z technique'"
  - "Peer learning: Champions run sessions for their teams"
- **Phase 4 – Scale & Sustain:**
  - "Broaden deployment with champion network providing peer support"
  - "Feedback loops: Regular surveys, retrospectives, Slack discussions"
  - "Continuous improvement: Use feedback to refine training, docs, configs"
  - "Integration: AI tools become standard part of workflow, not add-on"
  - "Celebrate: Publicize successes, share metrics, recognize contributions"
- **Resistance management:**
  - "Job replacement fear is #1 concern. Address directly and honestly"
  - "Reality: AI augments developers, makes them more productive and valuable"
  - "Roles evolve: Less time writing boilerplate, more time on architecture, design, problem-solving"
  - "Career value: Mastering AI tools is now a core competency like Git or IDEs"
- **"Slow me down" concern:**
  - "Acknowledge learning curve exists – about 3 months to proficiency"
  - "But after ramp: 20-40% productivity gains are real"
  - "We provide support during learning: training, office hours, champions"
- **"Wrong too often" concern:**
  - "Valid today – baseline acceptance ~30% without configuration"
  - "AGENTS.md and standards improve this to 70%+"
  - "Your feedback drives improvements to prompts and configurations"
- **Trust concerns:**
  - "Appropriate skepticism – we share it"
  - "That's why mandatory human review for critical code"
  - "Use AI for what it's good at, humans for what humans are good at"
- **Complexity concerns:**
  - "Valid – multiple tools can be overwhelming"
  - "Orchestration reduces this: AGENTS.md + MCP make tools work consistently"
  - "One mental model, not tool-specific approaches"
- **Success metrics for change:**
  - "Developer satisfaction: Are developers happy with tools? Survey regularly"
  - "Training completion: Everyone gets trained, not just volunteers"
  - "Active usage: Adoption rates track engagement"
  - "Feedback participation: Are developers contributing to improvement?"
  - "Champion growth: 15-20% championing means good organic adoption"
- **Communication cadence:**
  - "Weekly updates: Rollout progress, wins, upcoming milestones"
  - "Slack channel: Real-time support and discussion"
  - "Monthly town halls: Bigger forum for Q&A and celebration"
  - "Engineering meetings: Regular time dedicated to AI topics"
  - "Confluence: Central hub for all documentation"
- **Messaging themes:**
  - "Competitive necessity: Explain market reality"
  - "Quality focus: Reassure we're not sacrificing quality for speed"
  - "Career development: Frame as opportunity, not threat"
  - "Transparency: Honest about challenges, learning together"
  - "Developer agency: You control the tool, it doesn't control you"
- **Leadership responsibility:**
  - "Engineering Managers are frontline change leaders"
  - "They provide time, resources, support, encouragement"
  - "Senior Engineers model best practices and mentor"
  - "Engineering Leadership provides air cover and removes obstacles"
- **Critical success factor:** "Change management isn't optional overhead. It's what makes technology adoption successful"
- **Timing:** 3-4 minutes

---

## **Slide 19: Your 30/60/90 Day Journey**

### **Slide Content:**

**📅 Next 30 Days: Foundation**

**Week 1: Launch & Awareness**

- Training kickoff sessions for all developers
- Champion identification (10-15% of team)
- Slack channel (#ai-development) goes live
- First town hall: Framework overview

**Week 2: AGENTS.md Pilot**

- Select 2-3 most active repositories
- Pilot teams create initial AGENTS.md files
- Document lessons learned
- Begin acceptance rate tracking

**Week 3: Prompt Library v1**

- Launch initial prompt library (20-30 tested prompts)
- Office hours begin (2x per week)
- Champions start peer training sessions

**Week 4: First Metrics Review**

- Review Week 2-4 data from Jellyfish
- Assess pilot AGENTS.md impact
- Gather champion feedback
- Adjust approach based on learnings

**📅 Days 31-60: Scale**

**Week 5-6: Expand AGENTS.md**

- Roll out to top 10 active repositories
- Template refinement based on pilot learnings
- Cross-team knowledge sharing sessions

**Week 7: Automated Review Pilots**

- CodeRabbit pilot begins (select teams)
- Qodo pilot begins (select teams)
- Configure review rules based on AGENTS.md standards

**Week 8: Mid-point Assessment**

- Survey developer satisfaction (first data point)
- Review acceptance rate trends
- Celebrate early wins publicly
- Address emerging issues

**📅 Days 61-90: Optimize**

**Week 9-10: Broad Deployment**

- AGENTS.md in all active repositories
- Prompt library grows to 50+ tested prompts
- CodeRabbit/Qodo expand beyond pilots

**Week 11: MCP Workflow Automation**

- Launch coordinated multi-agent workflows
- Demonstrate Jira → Cursor → Claude Code → Jira loop
- Begin SignalFx & GCL MCP integration (if ready)

**Week 12: Quarterly Review**

- Comprehensive metrics review (DORA, quality, ROI)
- Retrospective: what worked, what didn't
- Plan next quarter improvements
- Celebrate successes, recognize contributors

**🎯 Quick Wins to Expect:**

- **Week 2:** First "wow" moments with AGENTS.md improving suggestions
- **Week 4:** Noticeable improvement in AI suggestion quality for pilot teams
- **Week 8:** Time savings becoming measurable in Jellyfish data
- **Week 12:** Cultural shift toward AI-augmented development visible

**🚦 Success Criteria by Day 90:**

- ✅ 80%+ AGENTS.md repository coverage
- ✅ 60%+ AI suggestion acceptance rate (up from ~30% baseline)
- ✅ 4/5+ developer satisfaction score
- ✅ DORA metrics maintained or improved
- ✅ Measurable productivity gains (5-15% minimum)

### **Presenter Notes:**

- **Realistic timeline:** "This is a 90-day sprint to establish the foundation. Full maturity takes 6-12 months, but we see benefits within weeks"
- **Week 1 emphasis:** "Everything starts with awareness and training. We invest heavily upfront to prevent confusion and resistance"
- **Champions are critical:** "10-15% early adopters become force multipliers. They help peers, share wins, identify issues early"
- **Week 2 - AGENTS.md pilot:** "We don't do all repos at once. Start small, learn, iterate, then scale. This prevents mass mistakes"
- **Pilot learnings matter:** "What works in one repo may need tweaking for another. We document patterns and anti-patterns"
- **Week 3 - Prompt library:** "20-30 prompts sounds small, but these are battle-tested for OUR codebase. Quality over quantity"
- **Office hours value:** "Developers can get immediate help. Reduces frustration, speeds learning, builds confidence"
- **Week 4 - First metrics:** "Early data point. Are we on track? What needs adjustment? Course-correct early"
- **Days 31-60 acceleration:** "Foundation is set. Now we scale. Acceptance rates should be rising. Satisfaction should be positive"
- **Week 7 - CodeRabbit/Qodo:** "Automated review pilots start after AGENTS.md is established. Need standards first, then automation"
- **Week 8 - Mid-point check:** "Critical checkpoint. Developer satisfaction survey tells us if we're on the right track. If satisfaction is low, we adjust immediately"
- **Celebrate wins:** "Publicly recognize teams with high acceptance rates, innovative prompt usage, excellent AGENTS.md files"
- **Days 61-90 optimization:** "By now, foundation is solid. We optimize workflows, expand automation, demonstrate advanced capabilities"
- **Week 11 - MCP workflows:** "Show the full power – coordinated multi-agent workflows. This is where it gets exciting"
- **Week 12 - Quarterly review:** "Comprehensive assessment. DORA metrics, quality trends, ROI calculation. Validate the framework is working"
- **Quick wins explained:** "Week 2 'wow' moments are important for momentum. Early wins build enthusiasm and overcome skepticism"
- **Week 12 cultural shift:** "By day 90, AI tools should feel normal, not novel. Integrated into workflow, not add-on"
- **Success criteria realistic:** "60% acceptance rate by day 90 is ambitious but achievable. Some teams will exceed, some will lag"
- **Flexibility important:** "This is a roadmap, not a rigid plan. We adjust based on feedback and data. Agile approach"
- **Post-90 days:** "After day 90, we continue optimizing, expanding MCP integrations, refining prompts. This is continuous improvement, not one-time project"
- **Timing:** 4-5 minutes

---

## **Slide 20: How You Can Help**

### **Slide Content:**

**For Engineering Managers:**

☑ **Schedule 16 hours of training time** for your team in the first 30 days
☑ **Identify 1-2 champions** from your team who are enthusiastic early adopters
☑ **Dedicate 30 min in weekly 1:1s** to discuss AI adoption progress and challenges
☑ **Celebrate team wins publicly** in standups, retrospectives, and team meetings
☑ **Protect learning time** – don't penalize initial productivity dips
☑ **Escalate blockers quickly** to Platform Team or Engineering Leadership

**For Senior Engineers:**

☑ **Attend AGENTS.md creation workshop** for your primary project
☑ **Contribute at least 1 prompt** to the shared prompt library this month
☑ **Mentor 2-3 junior engineers** on AI best practices and effective prompting
☑ **Provide honest feedback** in retrospectives about what works and what doesn't
☑ **Model critical thinking** – show when to accept AI suggestions and when to reject them
☑ **Review and approve AGENTS.md changes** for your team's repositories

**For Individual Contributors:**

☑ **Complete training modules** within first 30 days (self-paced + workshops)
☑ **Experiment with tools on non-critical tasks first** to build confidence
☑ **Declare AI usage in PRs** using the template ("Used Copilot for..." format)
☑ **Share both wins and failures** in retrospectives and Slack
☑ **Ask questions in office hours** or #ai-development channel – no question is too basic
☑ **Reject AI suggestions thoughtfully** when they don't meet standards – that's encouraged!

**For Engineering Leadership:**

☑ **Executive sponsorship and communication** – visible support from the top
☑ **Resource allocation approval** – budget for tools, training time, champion support
☑ **Remove blockers when identified** – vendor negotiations, policy updates, tooling issues
☑ **Review monthly progress dashboards** with Platform Team
☑ **Attend quarterly town halls** to answer questions and provide strategic context
☑ **Celebrate organization-wide successes** publicly

**For Platform/DevEx Team:**

☑ **Maintain AGENTS.md templates** and documentation
☑ **Run office hours** 2x per week minimum
☑ **Monitor Jellyfish dashboards** daily for anomalies
☑ **Curate and test prompt library** submissions
☑ **Provide technical support** for tool configurations and issues
☑ **Gather and synthesize feedback** from champions and surveys

### **Presenter Notes:**

- **Role-specific approach:** "Everyone has a part to play. These are concrete, actionable items – not vague 'be supportive' statements"
- **Engineering Managers - training time:** "16 hours is non-trivial. That's 2 full days or 4 half-days spread over a month. Protect this time"
- **Engineering Managers - champions:** "Let them self-select. Don't assign reluctant people as champions. Enthusiasm is the prerequisite"
- **Engineering Managers - 1:1 time:** "Dedicate time specifically to AI adoption. What's working? What's frustrating? What do they need?"
- **Engineering Managers - protect learning:** "First month may see velocity dip. Don't panic. Don't pressure. This is investment, not waste"
- **Senior Engineers - workshop attendance:** "We need senior voices in AGENTS.md creation. Junior engineers can draft, but seniors validate conventions"
- **Senior Engineers - prompt contribution:** "Just one prompt. But make it good. Show junior engineers what effective prompting looks like"
- **Senior Engineers - mentoring:** "Pair with junior engineers. Show them your workflow. Demonstrate when to trust AI and when to override"
- **Senior Engineers - critical thinking model:** "Most important role: show that rejecting AI suggestions is good engineering, not failure"
- **Individual Contributors - training:** "Non-negotiable. Everyone gets trained. Creates baseline competency and shared language"
- **Individual Contributors - experiment safely:** "Don't start with production auth code. Start with tests, documentation, boilerplate. Build confidence"
- **Individual Contributors - declare usage:** "Transparency helps everyone learn. When you say 'Used Cursor for error handling,' reviewers know to check error handling closely"
- **Individual Contributors - share failures:** "Failed experiments are valuable data. If Copilot suggested something wrong, share it so others learn"
- **Individual Contributors - reject thoughtfully:** "You are ENCOURAGED to reject AI suggestions that don't meet our standards. Critical thinking is paramount"
- **Engineering Leadership - visible support:** "If leadership doesn't visibly support this, adoption will be tepid. Show up to town halls, reference it in communications"
- **Engineering Leadership - resources:** "Training takes time. Tools cost money. Champion support requires bandwidth. Approve these investments"
- **Engineering Leadership - remove blockers:** "When vendor negotiations stall or policies need updating, leadership clears the path"
- **Engineering Leadership - monthly review:** "Stay informed. Review Jellyfish dashboard. Ask questions. Hold Platform Team accountable"
- **Platform Team - office hours:** "This is where learning happens. Developers come with real problems, get real help"
- **Platform Team - dashboard monitoring:** "Catch problems early. If acceptance rates tank or satisfaction drops, investigate immediately"
- **Collective responsibility:** "This isn't Platform Team's project. It's everyone's transformation. Each role contributes"
- **Accountability without pressure:** "These are expectations, but realistic ones. We support, we don't punish"
- **Timing:** 3-4 minutes

---

## **Slide 21: Q&A**

### **Slide Content:**

**Questions?**

**Contact & Resources:**

- **Slack:** #ai-development (real-time discussion and support)
- **Office Hours:** Tuesdays & Thursdays, 2-3 PM (Platform Team availability)
- **Confluence:** [Link to AI Governance Space] (documentation, templates, FAQs)
- **Feedback:** Monthly surveys and continuous feedback via Slack
- **Platform Team:** [team-email@company.com] (technical questions and support)

**Thank You!**

Together, we're building a competitive advantage through thoughtful AI adoption.

### **Presenter Notes:**

- **Open Q&A:** "Take as much time as needed for questions. This is critical for addressing concerns"
- **Likely questions:**
  - "When does this start?" → Answer: Training begins Week 1, pilot in Week 2
  - "Is this mandatory?" → Answer: Training is mandatory, tool usage is strongly encouraged but flexible
  - "What if my team is in the middle of a critical project?" → Answer: Flexible timeline, coordinate with your EM
  - "Which tool should I use?" → Answer: Start with Copilot (most widely available), experiment with Cursor, we'll provide guidance
  - "What if AI suggestions are really bad?" → Answer: That's why we're building AGENTS.md and standards – to improve quality
  - "How much time will this take?" → Answer: 16 hours training spread over 30 days, then tools save time
  - "What if I prefer not to use AI?" → Answer: We encourage adoption, but you maintain autonomy. Discuss concerns with your EM
- **Resource emphasis:** "All materials will be in Confluence. Office hours are your friend. Slack channel for quick questions"
- **Feedback loop:** "We actively want your input. This framework evolves based on what you tell us works and doesn't work"
- **Thank you note:** "Appreciate engagement. This is a journey we're taking together"
- **Follow-up:** "Slide deck and recording will be shared. Resources go live next week"
- **Timing:** 10-15 minutes (as needed)
