# CLAUDE.md

This file provides guidance when working with code in this repository.

## Commands

### Development Commands
- `npm run lint` - Runs linting (currently outputs "No lint configured")
- `npx link-ai-commands --provider claude` - Links AI commands to `.claude/commands`
- `npx link-ai-commands --provider cursor` - Links AI commands to `.cursor/commands`
- `npx link-ai-commands --help` - Show CLI usage and options
- `npx link-ai-commands --list-providers` - Show available provider configurations

### CLI Options
- `--mode copy|symlink` - Transfer mode (default: copy)
- `--destination <dir>` - Override destination directory
- `--dry-run` - Preview actions without modifying filesystem

## Architecture

This is an AI command library that packages reusable commands for various AI development tools (Claude, Cursor, Codex). The architecture is provider-agnostic with a centralized command source.

### Core Structure
- **library/commands/** - Canonical command source shared across all providers
- **providers/** - Provider configuration files (claude.json, cursor.json) defining mappings
- **scripts/link-commands.js** - Core linking logic for syncing commands to provider directories
- **bin/link-ai-commands.js** - CLI entry point

### Provider System
Each provider config specifies:
- `sourceRoot` - Source directory (typically "library/commands")
- `defaultTargetDir` - Default destination (e.g., ".claude/commands")
- `mappings` - Array of source-to-target folder mappings

### Command Categories
Currently focused on GitHub PR workflows:
- **pr/enhance-comments/** - Tools for rewriting and improving PR comments
- **pr/create-comments/** - Tools for generating new PR comments
- **pr/scripts/** - JavaScript utilities for GitHub API interactions

### JavaScript Utilities
The `pr/scripts/` directory contains Node.js utilities with modular structure:
- **utils/** - Shared utilities (CLI parsing, GitHub API, logging, file system)
- **fetch-pr-*.js** - Scripts for retrieving PR data (context, comments)
- **create-pr-review.js** - Script for creating PR reviews
- **edit-pr-comments.js** - Script for modifying existing comments

### Key Patterns
- ES modules throughout (type: "module" in package.json)
- Modular utility functions in utils/ subdirectory
- CLI argument parsing with standardized flag handling
- GitHub CLI (gh) integration for API access
- CSV-based data exchange for comment workflows
