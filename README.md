# AI Command Library

Reusable AI agent commands and helper scripts that plug into Claude Desktop, Cursor, Codex, and other tooling. The project ships a provider-agnostic command catalogue plus a CLI that syncs commands into the correct provider-specific folders.

## Features

- Canonical command source under `library/commands/` shared by all providers
- Provider metadata (`providers/*.json`) that maps source folders to destinations
- Node-based CLI (`link-ai-commands`) for copying or symlinking commands into tool-specific directories
- GitHub PR utilities for fetching context, preparing feedback, and updating comments

## Prerequisites

- Node.js 22 or newer
- npm 10+
- [GitHub CLI](https://cli.github.com/) for the PR helpers; authenticate with `gh auth login` and ensure the `repo` scope is granted. Enterprise users can set `GH_HOST` or pass `--repo` to the scripts.

## Installation

```bash
npm install -D @mkaczkowski/ai-command-library
```

The package publishes the CLI as a binary named `link-ai-commands`.

If you prefer installing straight from GitHub:

```bash
npm install -D git+https://github.com/mkaczkowski/ai-command-library.git
```

## Linking Commands

Copy commands into a provider workspace:

```bash
npx link-ai-commands --provider claude
```

The command copies `library/commands/pr` to `.claude/commands/pr`. Use `--provider cursor` for `.cursor/commands` or `--provider codex` for `.codex/commands` when working inside a project. To populate user-level command folders (`~/.claude/commands`, `~/.cursor/commands`, `~/.codex/commands`), run the matching `--provider <id>-global` option. You can also supply `--destination` to override the output directory entirely. `--mode symlink` creates symlinks when supported; on Windows the CLI automatically falls back to copy mode if junctions are unavailable.

List bundled providers:

```bash
npx link-ai-commands --list-providers
```

Dry-run actions without touching the filesystem:

```bash
npx link-ai-commands --provider claude --dry-run
```

## Command Catalogue

### Enhance Existing Comments

- `library/commands/pr/enhance-comments/rewrite-comments.md` — rewrites GitHub PR feedback in a collaborative voice ready for bulk upload.
- `library/commands/pr/enhance-comments/update-comments.md` — generates CSV mappings so improved comments can be pushed back to GitHub via the helper script.

### Create New Review Comments

- `library/commands/pr/create-comments/prepare-comments.md` — plans a full PR review, producing structured findings from fetched context.
- `library/commands/pr/create-comments/send-comments.md` — converts review findings into CSV rows usable by the pending review submission script.

## Automating Syncs

- Add `link-ai-commands --provider <id>` to your project's `postinstall` script so command folders stay up to date.
- In multi-tool environments, run the CLI once per provider target.
- CI pipelines can execute the CLI during build steps to verify the destination folders exist before publishing artifacts.

## Development

Clone and install dependencies:

```bash
git clone https://github.com/mkaczkowski/ai-command-library.git
cd ai-command-library
npm install
```

Run linting and formatting checks:

```bash
npm run lint
npm run format:check
```

Automatically fix lint issues and apply formatting:

```bash
npm run lint:fix
npm run format
```

### Releasing

1. Update `CHANGELOG.md` and bump the version in `package.json`.
2. Run `npm run release` to verify linting and formatting.
3. Publish with `npm publish --access public` (requires an npm token with publish rights).
4. Push the release commit and tag to GitHub.

## Repository Layout

```
ai-command-library/
├── library/commands/      # Canonical command source
├── providers/             # Provider mapping metadata
├── scripts/link-commands.js
└── bin/link-ai-commands.js
```

## Support & Feedback

- Report bugs and feature requests via [GitHub issues](https://github.com/mkaczkowski/ai-command-library/issues).
- Security reports should follow the guidance in [`SECURITY.md`](SECURITY.md).

## License

Released under the [MIT License](LICENSE).
