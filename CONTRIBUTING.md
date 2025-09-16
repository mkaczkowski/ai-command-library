# Contributing

Thanks for your interest in improving the AI Command Library! This project welcomes issues and pull requests from the community.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies with `npm install` and ensure you are using Node.js 22 or newer.
3. Create a feature branch (`git checkout -b feature/my-improvement`).

## Development Workflow

- Run `npm run lint` and `npm run format:check` before opening a pull request.
- Use `npm run lint:fix` and `npm run format` to automatically address style issues.
- Ensure CLI changes include updated documentation or usage examples where applicable.
- Update `CHANGELOG.md` when a change affects users.

## Pull Requests

- Describe the motivation and behaviour changes clearly.
- Reference related issues in the pull request description.
- Keep commits focused; rebasing or squashing before merging is encouraged.
- PRs must pass the GitHub Actions workflow before merge.

## Reporting Issues

Submit bugs and feature requests at [GitHub issues](https://github.com/mkaczkowski/ai-command-library/issues). Include:

- Observed behaviour and expected behaviour
- Steps to reproduce
- Environment details (OS, Node version, CLI command)

## Security

Please follow the coordinated disclosure process outlined in [`SECURITY.md`](SECURITY.md) for anything that might impact the security of users.

## Code of Conduct

This project adheres to the standards described in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). By participating you are expected to uphold this code.
