#!/usr/bin/env node

/**
 * GitHub PR Comment Updater
 *
 * Updates review comments using mappings defined in a JSON file.
 */
import { log } from './utils/logger.js';
import { ensureGhCli, runGh } from './utils/process.js';
import { resolveRepository } from './utils/repository.js';
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  parseArgs,
  handleHelp,
  validateArgs,
} from './utils/cli.js';
import { COMMON_BOOLEAN_FLAGS } from './utils/config.js';
import { loadJsonArray, requireNonEmptyStringField, requireObject } from './utils/jsonValidation.js';

const HELP_TEXT = `
Update existing GitHub PR comments with new content.

Usage:
  node scripts/edit-pr-comments.js --input=comments.json

Options:
  --input             Path to a JSON file with entries: { id, rewritten }
  --repo              Target repository in owner/repo format (auto-detected from git remote if omitted)
  --verbose           Enable detailed logging
  --help, -h          Show this message

Mapping file example (JSON):
[
  {
    "id": "123456789",
    "rewritten": "Let's keep the loading state consistent with the rest of the form.\n\nPlease reuse the existing helper instead of duplicating it."
  }
]
`;

/**
 * Entry point. Parses arguments, loads mappings, and updates each comment.
 * @returns {Promise<void>}
 */
async function main() {
  try {
    log('INFO', 'GitHub PR Comment Updater starting...');

    const options = parseCliArgs(process.argv.slice(2));
    log('DEBUG', 'Parsed CLI options', options);

    handleHelp(options, HELP_TEXT);

    const standardValidations = createStandardValidations();
    const validations = [
      standardValidations.repository,
      {
        ...standardValidations.mappingFile,
        field: 'input',
        message: '--input must point to an existing file',
      },
    ];

    validateArgs(options, validations);

    await ensureGhCli();

    log('INFO', `Loading comment mappings from JSON: ${options.input}`);
    const mappings = await parseMappingFile(options.input);
    if (mappings.size === 0) {
      throw new Error('No comment updates provided in JSON file');
    }
    log('INFO', `Loaded ${mappings.size} comment mappings from JSON`);

    const repo = await resolveRepository(options.repo);
    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);
    log('INFO', `Updating ${mappings.size} comment(s) in ${repo.owner}/${repo.repo}`);

    let failures = 0;
    let successes = 0;
    for (const [commentId, body] of mappings.entries()) {
      try {
        log('DEBUG', `Updating comment ${commentId}`, { bodyLength: body.length });
        await updateComment(repo, commentId, body);
        successes++;
        log('INFO', `✔ Updated ${commentId}`);
        log('DEBUG', `Successfully updated comment ${commentId}`);
      } catch (error) {
        failures++;
        log('ERROR', `✖ Failed to update ${commentId}: ${error.message}`, { error: error.message });
      }
    }

    log('INFO', `Update completed: ${successes} successful, ${failures} failed`);
    if (failures > 0) {
      throw new Error(`${failures} update(s) failed`);
    }
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parse CLI arguments into an options object.
 * @param {string[]} argv
 * @returns {{help?: boolean, input?: string, repo?: string}}
 */
function parseCliArgs(argv) {
  const argHandlers = createStandardArgHandlers();

  const flagHandlers = {
    '--input': createFlagHandler('input'),
    '--repo': createFlagHandler('repo'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
    requiredFlags: ['--input'],
  });
}

/**
 * Load comment mappings from a JSON file with entries: { id, rewritten }.
 * @param {string} filePath
 * @returns {Promise<Map<string, string>>}
 */
async function parseMappingFile(filePath) {
  const mappings = new Map();
  const entries = await loadJsonArray(filePath, { label: 'comment mapping(s)' });

  entries.forEach((entry, index) => {
    const mappingLabel = 'Mapping';
    const normalized = requireObject(entry, index, { label: mappingLabel });

    const id = requireNonEmptyStringField(normalized, 'id', index, {
      label: mappingLabel,
      trimResult: true,
    });
    const rewritten = requireNonEmptyStringField(normalized, 'rewritten', index, {
      label: mappingLabel,
      trimResult: false,
    });

    mappings.set(id, rewritten);
  });

  return mappings;
}

/**
 * Update a single PR review comment via the REST API.
 * @param {{host: string, owner: string, repo: string}} repo
 * @param {string} rawId
 * @param {string} body
 * @returns {Promise<void>}
 */
async function updateComment(repo, rawId, body) {
  log('DEBUG', `Starting comment update for ID: ${rawId}`);

  const payload = `${JSON.stringify({ body })}\n`;
  const apiBase = `/repos/${repo.owner}/${repo.repo}`;
  const endpoint = `${apiBase}/pulls/comments/${rawId}`;

  log('DEBUG', `API endpoint: PATCH ${endpoint}`);
  try {
    await runGh(['api', '--method', 'PATCH', endpoint, '--input', '-'], {
      input: payload,
      host: repo.host,
    });
    log('DEBUG', `Comment ${rawId} updated successfully`);
  } catch (error) {
    log('ERROR', `Failed to update comment ${rawId}: ${error.message}`);
    throw error;
  }
}

main();
