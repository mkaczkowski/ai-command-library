#!/usr/bin/env node

/**
 * GitHub PR Pending Review Creator
 *
 * Creates a pending review on an existing pull request using comment data from JSON.
 */
import { log } from './utils/logger.js';
import { ensureGhCli, runGhJson } from './utils/process.js';
import { getCurrentPRNumber, resolveRepository } from './utils/repository.js';
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  handleHelp,
  parseArgs,
  validateArgs,
} from './utils/cli.js';
import { COMMON_BOOLEAN_FLAGS } from './utils/config.js';
import {
  loadJsonArray,
  requireNonEmptyStringField,
  requireObject,
  requireOptionalPositiveIntegerField,
  requireStringField,
} from './utils/jsonValidation.js';

const HELP_TEXT = `
Create a pending GitHub PR review populated with inline comments supplied via JSON.

Usage:
  node create-pr-review.js --input=comments.json [options]

Options:
  --input                Path to a JSON file describing review comments (required)
  --pr                   Pull request number (auto-detects current PR if omitted)
  --repo                 Repository in owner/repo format (auto-detected when omitted)
  --review-body          Text to use as the review summary body
  --commit               Commit SHA to anchor the review (optional)
  --verbose              Enable detailed logging
  --help, -h             Show this help message

Comments JSON format (array of objects):
[
  {
    "path": "src/index.ts",
    "body": "Please extract helper",
    "line": 12
  }
]

Rules:
  - Provide either line/startLine or position for inline comments, otherwise they will target the file.
`;

async function main() {
  try {
    log('INFO', 'GitHub PR Pending Review Creator starting...');

    const options = parseCliArgs(process.argv.slice(2));
    log('DEBUG', 'Parsed CLI options', options);

    handleHelp(options, HELP_TEXT);

    const standardValidations = createStandardValidations();
    const validations = [
      standardValidations.repository,
      standardValidations.prNumber,
      {
        ...standardValidations.mappingFile,
        field: 'input',
        message: '--input must point to an existing file',
      },
    ];

    validateArgs(options, validations);

    await ensureGhCli();

    log('INFO', `Loading review comments from JSON: ${options.input}`);
    const comments = await parseCommentsFile(options.input);
    log('INFO', `Loaded ${comments.length} review comment(s) from JSON`);

    if (comments.length === 0) {
      throw new Error('No review comments provided in JSON file');
    }

    const repo = await resolveRepository(options.repo);
    const prNumber = await resolvePullRequestNumber(options.pr);

    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);
    log('INFO', `Target PR number: ${prNumber}`);

    // Check for existing pending reviews
    await checkForExistingPendingReview(repo, prNumber);

    log('INFO', `Creating pending review on PR #${prNumber} with ${comments.length} comment(s)`);

    const reviewBody = resolveReviewBody(options);
    const payload = buildReviewPayload({
      reviewBody,
      commit: options.commit,
      comments,
    });

    await submitReview(repo, prNumber, payload);
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = createStandardArgHandlers();

  const flagHandlers = {
    '--input': createFlagHandler('input'),
    '--repo': createFlagHandler('repo'),
    '--pr': createFlagHandler('pr', (value) => parseInt(value.trim(), 10)),
    '--review-body': createFlagHandler('reviewBody'),
    '--commit': createFlagHandler('commit'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
    requiredFlags: ['--input'],
  });
}

async function resolvePullRequestNumber(providedPr) {
  if (providedPr) {
    return providedPr;
  }

  log('INFO', 'Auto-detecting PR number using gh pr view');
  return getCurrentPRNumber();
}

function resolveReviewBody(options) {
  if (options.reviewBody !== undefined) {
    return options.reviewBody;
  }

  return undefined;
}

async function parseCommentsFile(filePath) {
  const entries = await loadJsonArray(filePath, { label: 'review comment(s)' });

  return entries.map((entry, index) => buildCommentFromEntry(entry, index));
}

/**
 * Builds a GitHub review comment from a JSON entry.
 *
 * Field Naming Strategy:
 * This function accepts both camelCase (JavaScript convention) and snake_case
 * (GitHub API convention) field names for developer convenience. Examples:
 * - startLine or start_line
 * - startSide or start_side
 *
 * The output always uses GitHub's snake_case format as required by the API.
 */
function buildCommentFromEntry(entry, index) {
  const commentLabel = 'Comment';
  const normalized = requireObject(entry, index, { label: commentLabel });

  const path = requireNonEmptyStringField(normalized, 'path', index, {
    label: commentLabel,
    trimResult: true,
  });
  const body = requireNonEmptyStringField(normalized, 'body', index, {
    label: commentLabel,
    trimResult: false,
  });

  const comment = {
    path,
    body,
  };

  const line = requireOptionalPositiveIntegerField(normalized, 'line', index, { label: commentLabel });
  if (line !== undefined) {
    comment.line = line;
  }

  const startLine = resolveOptionalInteger(normalized, 'startLine', 'start_line', index, commentLabel);
  if (startLine !== undefined) {
    comment.start_line = startLine;
  }

  const position = requireOptionalPositiveIntegerField(normalized, 'position', index, { label: commentLabel });
  if (position !== undefined) {
    comment.position = position;
  }

  const side = resolveOptionalString(normalized, 'side', index, commentLabel);
  if (side !== undefined) {
    comment.side = side;
  }

  const startSide = resolveOptionalString(normalized, 'startSide', index, commentLabel, 'start_side');
  if (startSide !== undefined) {
    comment.start_side = startSide;
  }

  return comment;
}

/**
 * Resolves an optional integer field that accepts both camelCase and snake_case naming.
 * This accommodates developer preference for camelCase input while maintaining
 * compatibility with GitHub API's snake_case requirements.
 *
 * @param {Object} entry - The JSON entry to validate
 * @param {string} camelName - The camelCase field name (e.g., 'startLine')
 * @param {string} snakeName - The snake_case field name (e.g., 'start_line')
 * @param {number} index - Entry index for error reporting
 * @param {string} label - Label for error messages
 * @returns {number|undefined} The resolved integer value
 *
 * @example
 * // Both formats are accepted:
 * resolveOptionalInteger(entry, 'startLine', 'start_line', 0, 'Comment')
 * // Accepts: { startLine: 5 } or { start_line: 5 }
 */
function resolveOptionalInteger(entry, camelName, snakeName, index, label) {
  const camelValue = requireOptionalPositiveIntegerField(entry, camelName, index, { label });
  if (camelValue !== undefined) {
    return camelValue;
  }

  if (snakeName) {
    return requireOptionalPositiveIntegerField(entry, snakeName, index, { label });
  }

  return undefined;
}

/**
 * Resolves an optional string field with support for alternate field names.
 * Used to accommodate both camelCase and snake_case field naming conventions.
 *
 * @param {Object} entry - The JSON entry to validate
 * @param {string} fieldName - The primary field name
 * @param {number} index - Entry index for error reporting
 * @param {string} label - Label for error messages
 * @param {string} [alternateFieldName] - Alternative field name (e.g., snake_case variant)
 * @returns {string|undefined} The resolved string value
 */
function resolveOptionalString(entry, fieldName, index, label, alternateFieldName) {
  const value = entry?.[fieldName];
  if (value !== undefined && value !== null) {
    return requireStringField(entry, fieldName, index, {
      label,
      allowEmpty: false,
      trimResult: true,
    });
  }

  if (!alternateFieldName) {
    return undefined;
  }

  const alternateValue = entry?.[alternateFieldName];
  if (alternateValue === undefined || alternateValue === null) {
    return undefined;
  }

  return requireStringField(entry, alternateFieldName, index, {
    label,
    allowEmpty: false,
    trimResult: true,
  });
}

function buildReviewPayload({ reviewBody, commit, comments }) {
  const payload = {
    comments,
  };

  if (commit) {
    payload.commit_id = commit;
  }

  if (reviewBody !== undefined) {
    const trimmedBody = reviewBody.trim();
    if (trimmedBody) {
      payload.body = reviewBody;
    }
  }

  return payload;
}

/**
 * Check if the current user already has a pending review on the PR
 * @param {Object} repo - Repository object
 * @param {number} prNumber - Pull request number
 * @returns {Promise<void>}
 */
async function checkForExistingPendingReview(repo, prNumber) {
  log('DEBUG', `Checking for existing pending reviews on PR #${prNumber}`);

  try {
    const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/${prNumber}/reviews`;
    const response = await runGhJson(['api', endpoint], {
      host: repo.host,
    });

    const pendingReviews = response.filter((review) => review.state === 'PENDING');

    if (pendingReviews.length > 0) {
      log('ERROR', 'Cannot create new pending review - existing pending review(s) found');
      log('INFO', 'You have the following pending review(s) that must be submitted or dismissed first:');

      pendingReviews.forEach((review) => {
        log('INFO', `  - Review ${review.id} (created: ${review.created_at})`);
      });

      log('INFO', '\n📝 To fix this:');
      log('INFO', '1. Submit the pending review(s) on GitHub, OR');
      log('INFO', '2. Dismiss the pending review(s) on GitHub, OR');
      log('INFO', '3. Ask Claude to help submit the reviews');
      log('INFO', '\nPending review IDs:', pendingReviews.map((r) => r.id).join(', '));

      throw new Error(`Cannot create new review - ${pendingReviews.length} pending review(s) already exist`);
    }

    log('DEBUG', 'No pending reviews found - safe to create new review');
  } catch (error) {
    if (error.message.includes('pending review')) {
      throw error; // Re-throw our custom error
    }
    log('WARN', `Could not check for pending reviews: ${error.message}`);
    log('INFO', 'Proceeding with review creation - please check manually if creation fails');
  }
}

async function submitReview(repo, prNumber, payload) {
  const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/${prNumber}/reviews`;
  const payloadString = `${JSON.stringify(payload)}\n`;

  log('DEBUG', `Submitting review via POST ${endpoint}`);

  const response = await runGhJson(['api', '--method', 'POST', endpoint, '--input', '-'], {
    input: payloadString,
    host: repo.host,
  });

  const reviewId = response.id || response.node_id || 'unknown';
  const state = response.state || 'pending';
  log('INFO', `✔ Created pending review ${reviewId} (state: ${state})`);
}

main();
