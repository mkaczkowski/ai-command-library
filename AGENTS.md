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
- `--destination <dir>` - Override destination directory
- `--dry-run` - Preview actions without modifying filesystem

## Architecture

This is an AI command, skills, and agents library that packages reusable commands, Claude Code Skills, and Claude Code Subagents for various AI development tools. The architecture is provider-agnostic with a centralized source.

### Core Structure

- **library/commands/** - Canonical command source shared across all providers
- **library/skills/** - Claude Code Skills source (project and team-shared skills)
- **library/agents/** - Claude Code Subagents source (project and team-shared agents)
- **providers/** - Provider configuration files (claude.json, cursor.json) defining mappings and capabilities
- **scripts/link-commands.js** - Core linking logic for syncing commands, skills, and agents to provider directories
- **bin/link-ai-commands.js** - CLI entry point

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

### Command Categories

Currently focused on GitHub PR workflows:

- **pr/enhance-review/** - Tools for rewriting and improving PR comments
- **pr/draft-review/** - Tools for generating new PR comments
- **pr/scripts/** - JavaScript utilities for GitHub API interactions

### JavaScript Utilities

The `pr/scripts/` directory contains Node.js utilities with modular structure:

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
