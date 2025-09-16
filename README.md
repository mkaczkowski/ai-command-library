# AI Command Library

Reusable set of custom AI agent commands that can be consumed by tooling such as Claude Desktop, Cursor, and Codex. The repository packages the commands and a small CLI that syncs the right files into provider-specific folders.

## Repository Layout

```
ai-command-library/
├── library/commands/      # Canonical command source shared across providers
├── providers/             # Provider mapping metadata
├── scripts/link-commands.js
└── bin/link-ai-commands.js
```

`library/commands` mirrors the `.claude/commands` structure so Markdown instructions and helper scripts remain untouched.

## Using as an npm Package (Option B)

1. **Publish** the private repository to GitHub and (optionally) the GitHub npm registry.
   - `cd ai-command-library`
   - `git init && git add .`
   - `git commit -m "chore: initial command library"`
   - `gh repo create mkaczkowski/ai-command-library --private --source . --push`
   - If you prefer installing via `npm`, configure `.npmrc` with:
     ```ini
     @mkaczkowski:registry=https://npm.pkg.github.com
     //npm.pkg.github.com/:_authToken=<github-personal-access-token>
     ```
   - Publish the package when ready:
     ```bash
     npm publish
     ```
     (or use `npm publish --access restricted` for private scopes.)

2. **Install inside each project**:
   ```bash
   npm install -D @mkaczkowski/ai-command-library
   ```
   For direct Git installs you can use:
   ```bash
   npm install -D git+ssh://git@github.com/mkaczkowski/ai-command-library.git
   ```

3. **Link the commands** into your tooling folder:
   ```bash
   npx link-ai-commands --provider claude
   ```
   This copies the canonical `library/commands` content to `.claude/commands`. Use
   `--provider cursor` to target `.cursor/commands`, or `--destination` to override
   the target directory entirely.

4. (Optional) add a project script for convenience:
   ```json
   "scripts": {
     "sync-ai-commands": "link-ai-commands --provider claude"
   }
   ```
   Run `npm run sync-ai-commands` whenever you update the library version.

## CLI Reference

```
link-ai-commands [options]

Options:
  -p, --provider <name>     Provider configuration (default: claude)
  -d, --destination <dir>   Override the destination directory
  -m, --mode <copy|symlink> Copy files (default) or create symlinks
      --dry-run             Show planned actions without modifying the filesystem
      --list-providers      Show bundled provider configurations
  -h, --help                Print usage help
```

The CLI reads provider definitions from the `providers/` directory. Each provider
specifies a `defaultTargetDir` and a set of folder mappings, making it easy to add
new integrations. To add a provider, create a new JSON file similar to
`providers/claude.json` and re-run the CLI with the new provider ID.

## Automating Syncing

- Add `link-ai-commands --provider <id>` to your project's `postinstall` hook to
  keep commands synchronized after every dependency install.
- For repositories with multiple AI tools, run the CLI twice with different providers.
- CI pipelines can run the CLI during build steps to ensure command folders exist.

## Future Enhancements

- Publish typed provider metadata for editor autocompletion.
- Add validation tests that ensure command Markdown files declare required frontmatter.
- Ship prebuilt automation scripts (Git hooks, GitHub Actions) for keeping commands fresh.

## License

This package is scoped as private (`UNLICENSED`). Update the license field before
making the repository public.
