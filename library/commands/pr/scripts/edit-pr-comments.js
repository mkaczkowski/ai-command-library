#!/usr/bin/env node

/**
 * GitHub PR Comment Updater
 *
 * Updates review comments using mappings defined in a CSV file.
 */
import { log } from './utils/logger.js';
import { ensureGhCli, runGh } from './utils/process.js';
import { resolveRepository } from './utils/repository.js';
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  parseArgs,
  showHelp,
  validateArgs,
} from './utils/cli.js';
import { COMMON_BOOLEAN_FLAGS, ENHANCE_COMMENT_CSV_CONFIG } from './utils/config.js';
import { createIdFieldValidator, createStringFieldValidator, parseCSVFile } from './utils/csv.js';

const HELP_TEXT = `
Update existing GitHub PR comments with new content.

Usage:
  node .claude/commands/pr/scripts/edit-pr-comments.js --mapping-file=comments.csv

Options:
  --mapping-file      Path to a CSV file with columns: id,rewritten
  --repo              Target repository in owner/repo format (auto-detected from git remote if omitted)
  --verbose           Enable detailed logging
  --help, -h          Show this message

Mapping file example (CSV):
id,rewritten
"123456789","Let's keep the loading state consistent with the rest of the form.

Please reuse the existing helper instead of duplicating it."
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

    if (options.help) {
      showHelp(HELP_TEXT);
      return;
    }

    const standardValidations = createStandardValidations();
    const validations = [standardValidations.repository, standardValidations.mappingFile];

    validateArgs(options, validations);

    await ensureGhCli();

    log('INFO', `Loading comment mappings from CSV: ${options.mappingFile}`);
    const mappings = await parseMappingFile(options.mappingFile);
    if (mappings.size === 0) {
      throw new Error('No comment updates provided in CSV file');
    }
    log('INFO', `Loaded ${mappings.size} comment mappings from CSV`);

    const repo = await resolveRepository(options.repo);
    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);
    console.log(`Updating ${mappings.size} comment(s) in ${repo.owner}/${repo.repo}`);

    let failures = 0;
    let successes = 0;
    for (const [commentId, body] of mappings.entries()) {
      try {
        log('DEBUG', `Updating comment ${commentId}`, { bodyLength: body.length });
        await updateComment(repo, commentId, body);
        successes++;
        console.log(`✔ Updated ${commentId}`);
        log('DEBUG', `Successfully updated comment ${commentId}`);
      } catch (error) {
        failures++;
        console.error(`✖ Failed to update ${commentId}: ${error.message}`);
        log('ERROR', `Failed to update comment ${commentId}`, { error: error.message });
      }
    }

    log('INFO', `Update completed: ${successes} successful, ${failures} failed`);
    if (failures > 0) {
      throw new Error(`${failures} update(s) failed`);
    }
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Parse CLI arguments into an options object.
 * @param {string[]} argv
 * @returns {{help?: boolean, mappingFile?: string, repo?: string}}
 */
function parseCliArgs(argv) {
  const argHandlers = createStandardArgHandlers();

  const flagHandlers = {
    '--mapping-file': createFlagHandler('mappingFile'),
    '--repo': createFlagHandler('repo'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
    requiredFlags: ['--mapping-file'],
  });
}

/**
 * Load comment mappings from a CSV file with columns: id, rewritten.
 * @param {string} filePath
 * @returns {Promise<Map<string, string>>}
 */
async function parseMappingFile(filePath) {
  const { REQUIRED_HEADERS, EXPECTED_COLUMNS } = ENHANCE_COMMENT_CSV_CONFIG;

  const fieldValidators = [createIdFieldValidator('id'), createStringFieldValidator('rewritten')];

  const rowProcessor = (row) => {
    return {
      ...row,
      formattedBody: row.rewritten,
    };
  };

  const { rows } = await parseCSVFile(filePath, {
    requiredHeaders: REQUIRED_HEADERS,
    expectedColumns: EXPECTED_COLUMNS,
    fieldValidators,
    rowProcessor,
  });

  const mapping = new Map();
  rows.forEach((row) => {
    mapping.set(row.id, row.formattedBody);
  });

  return mapping;
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
