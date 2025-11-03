### **1️⃣ Title**

**Slide Content:**

- Title: "The Future of Software Development: Making AI Tools Work Together"
- Subtitle: "From Tool Chaos to Competitive Advantage"
- Your Name & Title
- Date
- Background: Clean gradient or tech-themed image (circuit board pattern, abstract network)

**Presenter Notes:**

- Welcome the audience and introduce yourself briefly (30 seconds)
- Set the stage: "Today we're going to cut through the AI hype and talk about something we've been experiencing – how to orchestrate the growing ecosystem of AI tools we're adopting"
- Point to the visual: "This graphic represents our journey – we've made great strides with Copilot and Cursor, but as we add CodeRabbit, Qodo, and build internal MCP servers, we need to move from potential chaos to true coordination"
- Interactive element: "Quick poll - what's your biggest AI tool frustration?" (prepare for common answers)

---

### **2️⃣ The Problem**

**Layout:** Content slide with bullet points and icon array

**Slide Content:**

- **Our Current AI Landscape**
  - ✅ GitHub Copilot in our IDEs (already deployed)
  - ✅ Cursor IDE (successfully adopted)
  - 🔄 CodeRabbit & Qodo (currently piloting)
  - ChatGPT and Claude
  - 🔄 Internal MCP servers (Jira, GitHub, Confluence)
  - 📊 Jellyfish for AI monitoring
- **Challenge: As we grow our AI toolkit, how do we prevent fragmentation?**

> Mention other pilots like Claude Code
> Mention recenlty release DocBot and DocBotOnCall?
> Include AI supported tools like Browserstack

**Presenter Notes:**

- Paint the picture: "Look at where we are – we've successfully deployed Copilot and Cursor, and engineers are seeing real productivity gains"
- Our success story: "The Copilot and Cursor rollout has been a win. Now we're scaling with code review tools and internal integrations"
- The opportunity: "We've already built MCP servers for Jira, GitHub, and Confluence – smart investments that standardize how AI tools access our systems"
- Key stat from research: One study found experienced developers were actually 19% slower when using AI assistants without proper coordination, even though they felt faster – the "productivity placebo" effect
- Our advantage: "Unlike teams starting from scratch, we have real momentum. The question is: how do we maintain quality and consistency as we expand?"
- Transition: "The good news is we're asking this question at exactly the right time"

---

### **3️⃣ The Hidden Costs of Unmanaged AI**

**Layout:** Content slide with process diagram

**Slide Content:**

- **Breaking the Cycle with Smart Monitoring**

**Diagram showing circular flow:**

1. "Pressure to Ship Fast" →
2. "Use AI Without Guardrails" →
3. "Generate Code Quickly" →
4. "Skip Proper Integration" →
5. "Technical Debt Accumulates" →
6. "Slower Future Development" → back to 1

**Breaking the cycle - Our tools:**

- 📊 Jellyfish: Monitor AI code quality trends
- 🔍 CodeRabbit & Qodo: Automated review gates
- 🔗 MCP Servers: Consistent tool integration

**Bottom text:** "We're building the governance layer as we scale"

**Presenter Notes:**

- Walk through the cycle: "This is the trap many companies fall into with AI adoption"
- Step 1-3: "The cycle starts innocently – Copilot makes coding fast, deadlines are tight, so why not ship it?"
- Step 4-5: "But without proper review and integration, code gets pasted in hastily, creating hidden complexity"
- Step 6: "Six months later, the codebase is harder to maintain and development actually slows down"
- The statistic: "Industry data shows code churn – the rate at which code is written and then deleted or rewritten – doubled in 2024"
- Our defensive measures: "This is why we're investing thoughtfully – Jellyfish gives us visibility, our MCP servers standardize integrations, and CodeRabbit/Qodo pilot adds review layers"
- The insight: "We're not just adding AI tools randomly; we're building a governed ecosystem"
- The solution preview: "Let me show you how all these pieces work together"
- Timing: 2-3 minutes

- - Current challenge: "As we pilot CodeRabbit and Qodo, and continue investing in AI tooling, we need to ensure these tools amplify rather than complicate our workflows"
- - The productivity placebo: "Research shows that without coordination, developers feel faster but objective output can actually decrease by 19%"
- - Our advantage: "This is exactly why we invested in Jellyfish – we can actually measure AI impact on our codebase health, not just developer sentiment"
- - The key insight: "As one expert put it: 'speed without quality is technical debt' – our goal is to keep both lines moving up together"
- Q2: Cursor brought new capabilities but also confusion

---

### **4️⃣ Three-Layer Framework**

```
┌────────────────────────────────────────────────────────────┐
│ Pyramid Diagram:                                           │
│                                                            │
│  [Human-in-the-Loop] Speed with oversight      , Jellyfish monitoring + code review tools
│  [Orchestration] Our MCP servers (Jira, GitHub, Confluence), AI agents working together
│  [Foundation] AGENTS.md, Rules, Slash Cmds, Memory          │
│                                                            │
│ Caption: “Every layer reinforces governed autonomy.”        │
└────────────────────────────────────────────────────────────┘
```

> **Arrow pointing up alongside pyramid:** "Our Competitive Advantage"

**Presenter Notes:**

- Frame the solution: "We've already started building this framework, sometimes without realizing it"
- Pillar 1 explanation: "We need all our AI tools – Copilot, Cursor, CodeRabbit, Qodo – reading from the same playbook about our standards and conventions. This is where AGENTS.md comes in"
- Pillar 2 explanation: "Our MCP servers for Jira, GitHub, and Confluence are exactly this – coordinated access to our tools. We're ahead of most companies here"
- Pillar 3 explanation: "With Jellyfish monitoring and our pilot of CodeRabbit and Qodo, we're building the governance layer. Human oversight with automated support"
- The promise: "When these three pillars are fully in place, our AI tools will compound productivity instead of creating silos"
- Our position: "We're not starting from scratch – we're completing a framework we've already begun"

---

### **5️⃣ Foundation — Shared Rules**

**Layout:** Content slide with bullet points and file icon

**Slide Content:**

- **What is AGENTS.md? (Our Next Investment)**
  - 📄 Machine-readable project README
  - 🎯 Single source of truth for ALL AI tools
  - Works with: Copilot ✅, Cursor ✅, Code Review tooling ✅
- **What Goes Inside:**
  - Project structure & setup commands
  - Our coding conventions & style guides
  - CI/CD & testing instructions
  - Security policies & architectural patterns

> **Bottom callout:** "One file per repo. All AI tools aligned."

> Show before -> after
> ![[Pasted image 20251103210122.png]]
> https://dev.to/proflead/what-is-agentsmd-and-why-should-you-care-3bg4

> Check if coderabbit and Qodo honor AGENTS.md

**Presenter Notes:**

- The concept: "AGENTS.md is the missing piece that will align all our AI tools"
- The problem it solves: "Right now, Copilot makes assumptions, Cursor makes different assumptions, and when we fully deploy CodeRabbit and Qodo, they'll make their own assumptions too"
- How it works: "We create a single markdown file at each repo root that explicitly tells every AI tool how OUR codebase works"
- Real impact: Teams report "dramatically fewer simple mistakes" and "far less likely to misunderstand the codebase"
- Our context: "Think about when a new engineer joins – they read our documentation to understand conventions. AGENTS.md does the same for AI tools"
- Key benefit: "Because it's plain Markdown, it's human-readable too – it actually improves our documentation practices"
- Implementation: "We should start with 2-3 key projects, document our conventions, and see immediate improvements in AI suggestions"
- Start with the problem: "Currently, each of our AI tools operates somewhat independently"
- Left side walkthrough: "Copilot has learned some patterns from our code, Cursor has its own understanding, and when CodeRabbit and Qodo are fully deployed, they'll each interpret our code differently"
- The consequence: "This leads to inconsistent suggestions and requires engineers to mentally translate each tool's output"
- Right side walkthrough: "With AGENTS.md, we explicitly document our conventions once, and every tool follows them"
- Our ecosystem: "This works beautifully with our MCP servers – the servers provide access to tools, AGENTS.md provides the conventions"
- The transformation: "Now all suggestions follow our patterns, use our architecture, and match our style guides"
- Implementation reality: "We don't need to do this for every repo on day one. Start with our most active projects and expand"
- Mainstream support: "Copilot, Cursor, CodeRabbit, and Qodo all recognize and honor AGENTS.md"
- Highlight each section: "Notice we're giving explicit, actionable instructions specific to our environment"
- Integration points: "This new section tells AI tools to use our MCP servers – connecting our infrastructure"
- The power: "Now when Copilot suggests code, it knows to use our style guide from Confluence, keep functions under 50 lines, and follow our Git workflow"
- Our specifics: "We mention TypeScript/Java, our vault for secrets, our PR process – these are OUR conventions"
- Common mistake to avoid: "Don't make this a novel – keep it focused on what AI needs to write good code for YOUR project"
- Evolution: "This is a living document – as we refine our practices or add new tools, we update AGENTS.md"
- Action item: "We should create a template AGENTS.md that teams can customize for their projects"

---

### **6️⃣ Extending the Foundation**

```
┌────────────────────────────────────────────────────────────┐
│ Shared AI Standards                                         │
│                                                            │
│ .cursor/rules    /refactor /analyze /doc    Memory: on     │
│                                                            │
│ [IDE mockup left]   [Slash command palette right]           │
│ Top callout: “Persistent Team Context”                     │
│ Bottom: “One config aligns every agent.”                   │
└────────────────────────────────────────────────────────────┘
```

> Mention docs and detailed rules

> Add presenter notes

**Intent:** Display real config-level unification.  
**Animation:** Slash commands animate in; memory pulse highlight.

---

### **7️⃣ Orchestration - Model Context Protocol (MCP)**

**Slide Content:**

- **Central diagram:** Our MCP implementation
- Center: Our MCP Server cluster
- Connected systems: • JIRA (ticket context) • GitHub (code, PRs, issues) • Confluence (documentation) • Jellyfish (metrics) • Future: Slack, PagerDuty
- **Protocol box:** "Unified access for all AI tools"
- **Performance metric:** "90% faster context gathering"

> Mention DocBot?

> Mention future Figma, Blueprint (design system)

**Intent:** Show MCP as connective tissue of systems.  
**Animation:** Data pulses animate outward from center.

**Presenter Notes:**

- We built MCP servers for our core tools: JIRA, GitHub, Confluence
- Game changer: Copilot and Cursor can now see JIRA tickets directly
- Example: AI understands ticket context when generating code
- All our AI tools access the same internal data through MCP
- Next phase: Adding more internal tools to MCP network
- Jellyfish integration lets us track AI tool usage patterns
- - Relatable metaphor for our setup
- Each AI tool can access any of our systems via MCP
- No more copy-pasting from JIRA to Copilot
- Cursor can see Confluence docs while coding
- CodeRabbit can check JIRA requirements during review
- We're expanding the network quarterly
- The shift: "We've already built the foundation for multi-agent orchestration – our MCP servers"
- How it works: "A lead agent can break down complex tasks and dispatch pieces to specialized sub-agents who work in parallel"
- Our advantage: "By building MCP servers for Jira, GitHub, and Confluence, we've created the shared toolset that all agents can use"
- Real example: "Imagine Copilot writes code, CodeRabbit reviews it, and simultaneously an agent updates the Jira ticket and Confluence documentation – all using our MCP servers"
- MCP explained: "Our MCP implementation is Anthropic's Model Context Protocol – it's a universal adapter that lets any agent call our internal tools without custom integration"
- The magic: "Because all agents use the same MCP servers, they share context and access – ensuring consistency"
- The stat: "Well-orchestrated multi-agent systems achieve roughly 90% faster performance than single-agent workflows"
- Our next steps: "As we expand our AI toolkit, we can plug new agents into our existing MCP infrastructure"
- Architecture walkthrough: "We have three operational MCP servers – for GitHub, Jira, and Confluence"
- The connection: "Any AI agent – whether it's Copilot, Cursor, or the CodeRabbit/Qodo tools we're piloting – can be configured with these MCP endpoints"
- What this enables: "Now any agent can read our code, check open Jira tickets, or update Confluence docs using the same standardized interface"
- Real benefit: "When Copilot generates code for a feature, CodeRabbit can check the associated Jira ticket to understand context – no manual linking needed"
- Consistency enforcement: "Because they're all using our MCP servers, they all have access to the same information about our projects, tickets, and documentation"
- Our advantage: "Most companies are still figuring this out. We've already invested in the infrastructure"
- Next step: "As we add more AI tools, they just plug into this existing infrastructure – no custom integrations needed"

## **8️⃣ Human-in-the-Loop Governance**

**Layout:** Content slide with two-column structure

**Slide Content:**

- **The Golden Rule: AI Suggests, Humans Decide**

**Left Column - "Automate These:"**

- Boilerplate & repetitive code
- Test generation & documentation
- Standard CRUD operations
- API client generation
- Configuration file setup
- Data model definitions

👤 \*\*Right Column

- Security-critical code
- System architecture decisions
- Complex business logic
- Production database migrations
- Payment processing
- Authentication/authorization logic

**Presenter Notes:**

- The non-negotiable: "Even with all our AI tools, humans must remain in the loop"
- Automation vs human judgment: "Use automated checks for style, security, and obvious bugs – these can block PRs automatically"
- Our tools: "This is where CodeRabbit and Qodo come in – they provide that automated first-pass review"
- Human focus: "Reserve human review for what humans do best – architectural decisions, system design, and judgment calls"
- Real example: "A senior engineer should always review code that touches our payment systems, even if CodeRabbit says it's clean"
- Measurement mindset: "Jellyfish lets us track outcomes – are we shipping faster without more bugs?"
- Our advantage: "By piloting CodeRabbit and Qodo carefully, we're building the review layer before we need to scale it"
- The balance: "The goal is AI-augmented development where mundane tasks are automated but creative problem-solving stays huma
- Strategic deployment: "As we scale AI adoption, we need clear guidelines about when to use what"
- Green light scenarios: "Copilot and Cursor excel at grunt work – boilerplate, tests, standard patterns"
- Example: "Generating test skeletons, API documentation, data model code – let AI handle these"
- Yellow light scenarios: "For business logic, use AI for first drafts but expect significant human refinement"
- Red light scenarios: "Never let AI make security or architectural decisions without senior oversight"
- Our context: "Given our domain, we need to be especially careful with anything touching sensitive data or financial transactions"
- CodeRabbit/Qodo role: "As we pilot these tools, we can configure them to flag code in sensitive areas for extra review"
- Cultural norm: "We should document these guidelines in our engineering wiki so everyone knows the boundaries"
- MCP connection: "Our MCP servers can help AI tools understand what parts of our codebase are high-risk based on Jira ticket labels or Confluence documentation"

## **Slide 12: Team Culture – Transparency & Learning**

**Layout:** Content slide with checklist format

**Slide Content:**

- **Building Our AI-Aware Culture**

**Transparency Practices:** ✓ Declare AI usage in PRs ("Used Copilot for X") ✓ Tag AI-generated code in commits ✓ Share prompts that worked well ✓ Discuss AI failures openly in retros

**Learning Practices:** ✓ Maintain a prompt library (in Confluence) ✓ Review AI effectiveness in retros ✓ Use Jellyfish data to track patterns ✓ Update AGENTS.md based on learnings ✓ Share wins in engineering meetings

**Our Tools Supporting This:**

- Confluence: Document best practices & prompts
- Jellyfish: Track AI adoption & impact
- Jira: Tag tickets where AI was heavily used

**Presenter Notes:**

- Cultural shift: "As we scale AI, we need to build transparency into our culture"
- Transparency benefit: "When developers declare AI usage, reviewers know to double-check output carefully"
- Our approach: "Let's make it normal to say 'I used Copilot for this function' in PR descriptions"
- Learning together: "In retrospectives, discuss not just time saved but also bugs caught or issues created"
- Confluence usage: "We should create a space in Confluence for sharing effective prompts and AI techniques"
- Real practice: "Teams can build a library of prompts that work well for our codebase and domain"
- Jellyfish value: "We can use Jellyfish to identify which teams are getting the most value from AI and learn from them"
- Feedback loop: "Track which AI suggestions get accepted vs. rejected to tune our approach"
- Example: "If Copilot keeps suggesting patterns that don't match our architecture, that's feedback to improve AGENTS.md"
- Our advantage: "With Jellyfish, we can measure this more rigorously than most companies"

## (optional) **Slide 15: Measuring Success – Key Metrics**

**Layout:** Content slide with dashboard mockup

**Slide Content:**

- **Our Jellyfish AI Impact Dashboard**

**Visual: Sample metrics dashboard layout**

**Top Row - "North Star Metrics":**

- 🚀 Deployment Frequency: **[Current]** (Target: +30% ↑)
- ⚡ Lead Time: **[Current]** (Target: -35% ↓)
- 🐛 Defect Escape Rate: **[Current]** (Target: ↔️ stable)

**Middle Row - "AI Effectiveness":**

- ✅ AI-Assisted Commits: **[Track trend]**
- 🤖 Copilot/Cursor Adoption: **[Track by team]**
- ⏱️ Review Time: **[Current]** (Target: -25% with CodeRabbit/Qodo)
- 💡 AI Suggestion Acceptance: **[Measure after AGENTS.md]**

**Bottom Row - "Quality Indicators":**

- 🔄 Code Churn Rate: **[Monitor]**
- 📊 Complexity Trend: **[Should improve]**
- 🔍 CodeRabbit/Qodo Effectiveness: **[Track in pilot]**

**Side note:** "Dashboard exists in Jellyfish - we just need to configure the views"

**Presenter Notes:**

- Dashboard concept: "The beauty is Jellyfish can already track most of this – we just need to set up the views"
- North Star metrics: "These are our primary success indicators – deployment frequency and lead time"
- Baseline reality: "We can insert our current numbers here and track improvement"
- Defect stability: "This is critical – faster delivery shouldn't mean more bugs"
- AI effectiveness section: "Jellyfish can show us AI adoption by team, feature, or project"
- Copilot/Cursor tracking: "We can see which teams are using these tools most effectively"
- Review time impact: "As we deploy CodeRabbit and Qodo, we should see review time decrease"
- AGENTS.md validation: "Once AGENTS.md is implemented, measure whether AI suggestions get accepted more often"
- Quality indicators: "These are our early warning system for technical debt"
- Code churn tracking: "If this spikes, AI might be generating throwaway code"
- Pilot metrics: "During CodeRabbit/Qodo pilot, track how many issues they catch vs. miss"
- Configuration: "We should work with our Jellyfish admin to set up these specific views this quarter"
- Measurement mindset: "Jellyfish gives us the ability to measure all of this rigorously"
- Why DORA metrics: "These industry-standard metrics tell us if AI is actually helping us ship better software faster"
- Baseline importance: "We have historical data in Jellyfish – this is our competitive advantage for measurement"
- Deployment frequency: "Are we shipping more often? This should improve with faster code generation"
- Lead time: "Time from commit to production should decrease as review becomes more efficient"
- Critical metric: "Defect rate should NOT increase – if bugs spike, we're moving too fast without enough review"
- Developer satisfaction: "We should survey teams quarterly about AI tool effectiveness"
- AI-specific tracking: "Jellyfish can show us what percentage of commits used AI assistance"
- Review time: "As CodeRabbit/Qodo are deployed, review time should decrease while quality improves"
- Acceptance rate: "If developers reject most AI suggestions, something's wrong with our AGENTS.md or tool configuration"
- Quality check: "Compare issue types flagged by AI vs. humans to optimize our review stack"

## **Slide 16: Common Pitfalls to Avoid**

**Layout:** Content slide with before/after scenarios

**Slide Content:**

- **Learning from Others' Mistakes**

**Scenario 1: "The Speed Trap"** ❌ **What happened:** Team used AI aggressively, no review process 📉 **Result:** Code churn doubled, 6-month refactor needed ✅ **Our Protection:** CodeRabbit/Qodo + human review + Jellyfish tracking

**Scenario 2: "Inconsistent Adoption"** ❌ **What happened:** Each team used AI differently, no standards 📉 **Result:** Codebase became fragmented and hard to maintain ✅ **Our Protection:** AGENTS.md standardization + team guidelines

**Scenario 3: "Security Blindspot"** ❌ **What happened:** AI-generated auth code merged without review 📉 **Result:** Critical vulnerability in production ✅ **Our Protection:** Security scans + extra review for sensitive code + CodeRabbit/Qodo flags

**Scenario 4: "Measurement Failure"** ❌ **What happened:** Celebrated productivity but ignored tech debt 📉 **Result:** Slowed down after initial gains ✅ **Our Protection:** Jellyfish tracks DORA metrics + code quality trends

**Presenter Notes:**

- Learn from failure: "These are real patterns from companies that adopted AI without proper governance"
- Scenario 1 walkthrough: "One team moved so fast with AI they accumulated massive technical debt"
- Our safeguards 1: "We're building multiple review layers – automated and human"
- Scenario 2 explanation: "Without standards, each team interpreted AI suggestions differently"
- The consequence: "After 6 months, code from different teams looked like it came from different companies"
- Our safeguards 2: "AGENTS.md will ensure all teams follow the same conventions"
- Scenario 3 reality: "This happened to a fintech company – costly and embarrassing"
- The security lesson: "Authentication, authorization, payment logic – these need expert human review"
- Our safeguards 3: "We'll configure our tools to require extra scrutiny on security-sensitive code"
- Scenario 4 irony: "Team celebrated 50% more commits but deployment frequency actually decreased"
- The measurement failure: "They tracked output instead of outcomes"
- Our safeguards 4: "Jellyfish measures what matters – are we shipping faster with high quality?"
- Common thread: "We're avoiding all these because we're being methodical and measuring properly"

## **Slide 17: The Future – Where This Is Heading**

**Layout:** Content slide with diverging paths diagram

**Slide Content:**

- **Two Possible Futures for Us**

**Visual: Y-shaped path diagram**

**Starting Point (2025):** "Today: We have Copilot, Cursor, MCP servers, Jellyfish"

**Path A - "Continue Ad-Hoc":**

- Quick initial gains ↗
- No standardization ↘
- Inconsistent AI usage ↘
- Growing technical debt ↘
- **2027 Result:** Competitors catch up 📉

**Path B - "Complete the Framework":**

- tools and practices standardization ↗
- Code review tooling deployed ↗
- Sustained quality + velocity ↗
- Continuous optimization ↗
- **2027 Result:** market leadership 📈

**We choose:** Path B ✅

> add more real examples and more complex features we should add more futuristic plans like:
>
> **Emerging Now (2025):** 🧠 Self-improving agents (learning from feedback) 🔌 Native IDE orchestration (Cursor leading the way) 📊 Advanced monitoring (we
> have Jellyfish ✅)
> **Coming Soon (2026):** 🏭 Industry-specific models 🏗️ AI-assisted architecture design 🔗 Deeper MCP ecosystem (we're already here ✅)
> **Future (2027):** 🌐 Autonomous development pipelines 🎯 Predictive tech debt management

**Presenter Notes:**

- Fork in the road: "We're at a critical decision point"
- Our advantage: "We're already ahead with our current investments"
- Path A warning: "If we stop here and just use Copilot and Cursor without governance, we'll plateau"
- Path A reality: "Initial productivity gains will erode as technical debt accumulates"
- Path A risk: "Other companies will catch up and pass us by implementing better governance"
- Path B opportunity: "This is what we're building – complete the framework we've started"
- Path B characteristics: "Add AGENTS.md for standardization, deploy CodeRabbit/Qodo for automated review, continue measuring in Jellyfish"
- Path B trajectory: "Productivity compounds over time as our processes mature and optimize"
- Path B endpoint: "By 2027, we have a structural competitive advantage that's hard to replicate"
- The decision: "The next 90 days are critical – we need to execute the roadmap"
- Our choice: "We're committing to Path B – completing what we've started"
