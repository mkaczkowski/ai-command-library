# CLAUDE.md

This file provides guidance when working with code in this repository.

## Commands

### Development Commands

- `npm run lint` - Runs ESLint across the JavaScript sources
- `npx link-ai-commands --provider claude` - Links AI commands, skills, and agents to `.claude/commands`, `.claude/skills`, and `.claude/agents`
- `npx link-ai-commands --provider cursor` - Links AI commands to `.cursor/commands`
- `npx link-ai-commands --provider codex-global` - Links flattened commands to `~/.codex/prompts`
- `npx link-ai-commands --help` - Show CLI usage and options
- `npx link-ai-commands --list-providers` - Show available provider configurations

### CLI Options

- `--mode copy|symlink` - Transfer mode (default: copy)
- `--plugins <list>` - Comma-separated list of plugin groups to install (e.g., "debugger,pr"). Omit to install all groups.
- `--dry-run` - Preview actions without modifying filesystem
- `--list-groups` - Show available plugin groups

## Architecture

This is an AI command, skills, and agents plugin collection that packages reusable commands, Claude Code Skills, and Claude Code Subagents for various AI development tools. The architecture is provider-agnostic with a centralized source organized into logical plugin groups.

### Core Structure

- **plugins/{group}/commands/** - Commands for a specific group (e.g., pr, jira, debugger)
- **plugins/{group}/skills/** - Skills for a specific group
- **plugins/{group}/agents/** - Agents for a specific group
- **plugins/common/** - Ungrouped resources that don't belong to a specific group
- **providers/** - Provider configuration files (claude.json, cursor.json) defining mappings and capabilities
- **scripts/link-commands.js** - Core linking logic for syncing commands, skills, and agents to provider directories
- **bin/link-ai-commands.js** - CLI entry point

### Plugin Groups

Resources are organized into plugin groups representing cohesive feature sets:

- **debugger/** - Debugging tools (agents, skills)
- **pr/** - Pull request workflow commands
- **jira/** - JIRA integration commands
- **common/** - Standalone utilities that don't belong to a specific group

Each group can contain:

- `commands/` - Command templates (markdown files)
- `skills/` - Claude Code Skills (directories with SKILL.md)
- `agents/` - Claude Code Subagents (markdown files)

### When to Create a New Group

✓ **Create a new group when:**

- You have related commands, skills, and/or agents that work together
- Resources represent a cohesive feature set or integration
- Examples: "github", "linear", "testing", "deployment"

✓ **Use common/ when:**

- Resource is a standalone utility
- Resource doesn't belong to any specific feature set
- Resource is cross-cutting and used across multiple contexts

### Provider System

Each provider config specifies:

- `id` - Provider identifier (e.g., "claude", "cursor")
- `label` - Display name for the provider
- `defaultCommandsTargetDir` - Default destination for commands (e.g., ".claude/commands")
- `defaultSkillsTargetDir` - Default destination for skills (Claude only, e.g., ".claude/skills")
- `defaultAgentsTargetDir` - Default destination for agents (Claude only, e.g., ".claude/agents")
- `supportsSkills` - Boolean flag indicating if provider supports Skills (true only for Claude)
- `supportsAgents` - Boolean flag indicating if provider supports Agents (true only for Claude)
- `mappings` - Array of source-to-target folder mappings for commands

### Skills Support

Skills are currently supported for Claude providers only:

- **Project Skills** (`claude` provider): Stored in `.claude/skills/`, shared with team via git
- **Global Skills** (`claude-global` provider): Stored in `~/.claude/skills/`, personal setup

When linking for Claude, both commands and skills are synced automatically. Each skill consists of:

- `SKILL.md` - Skill metadata and instructions (required)
- Supporting files - Documentation, templates, scripts (optional)

### Agents Support

Agents (subagents) are currently supported for Claude providers only:

- **Project Agents** (`claude` provider): Stored in `.claude/agents/`, shared with team via git
- **Global Agents** (`claude-global` provider): Stored in `~/.claude/agents/`, personal setup

When linking for Claude, commands, skills, and agents are all synced automatically. Each agent consists of:

- `.md` file - Agent metadata with YAML frontmatter and system prompt (required)
  - `name` - Unique identifier for the agent
  - `description` - When to invoke this agent
  - `tools` - Optional comma-separated list of allowed tools
  - `model` - Optional model specification (sonnet, opus, haiku, or 'inherit')

### Naming Conventions for Skills and Agents

When creating skills and agents across plugin groups, follow these conventions to avoid conflicts:

**Important:** All skills and agents from selected plugin groups link to the same destination directories (e.g., `.claude/skills/`, `.claude/agents/`). If two groups define a skill or agent with the same name, the second one will silently overwrite the first during linking.

**Best Practices:**

- **Use descriptive, unique names** - Prefix skills/agents with group-specific identifiers when appropriate
  - ✓ Good: `pr-formatter`, `debugger-analyzer`, `jira-reporter`
  - ✗ Avoid: `formatter`, `analyzer`, `reporter` (too generic, conflict-prone)

- **Document naming in group README** - Each group should document its naming conventions
  - Create a `GROUP_NAME/README.md` explaining the group's resources and their purposes
  - List all skills and agents defined in that group

- **Validate at group creation time** - When adding a new group, review existing skill/agent names:
  - Run `npx link-ai-commands --list-groups` to see all groups
  - Check each group's `skills/` and `agents/` directories
  - Ensure no naming conflicts with other groups

- **Consider cross-group usage** - For shared utilities:
  - Place in the `common/` group with clear naming
  - Example: `common/skills/commit-helper/` is clearly a shared resource

**Note:** Future versions may add runtime validation to detect and warn about naming conflicts before linking occurs.

### Selective Installation Examples

Install all groups (default):

```bash
npx link-ai-commands --provider claude
```

Install specific plugin groups only:

```bash
npx link-ai-commands --provider claude --plugins debugger,pr
```

List available plugin groups:

```bash
npx link-ai-commands --list-groups
```

Dry run to preview changes:

```bash
npx link-ai-commands --provider claude --plugins pr --dry-run
```

### PR Group Resources

The `pr/` group includes:

- **commands/** - Pull request workflow commands:
  - `enhance-review.template.md` - Tools for rewriting and improving PR comments
  - `draft-review.template.md` - Tools for generating new PR comments
  - `address-review.template.md` - Tools for addressing review comments
  - `scripts/` - JavaScript utilities for GitHub API interactions

### JavaScript Utilities

The `pr/commands/scripts/` directory contains Node.js utilities with modular structure:

- **utils/** - Shared utilities (CLI parsing, GitHub API, logging, file system)
- **fetch-pr-\*.js** - Scripts for retrieving PR data (context, comments)
- **create-pr-review.js** - Script for creating PR reviews
- **edit-pr-comments.js** - Script for modifying existing comments

### Key Patterns

- ES modules throughout (type: "module" in package.json)
- Modular utility functions in utils/ subdirectory
- CLI argument parsing with standardized flag handling
- GitHub CLI (gh) integration for API access
- JSON-based data exchange for comment workflows
