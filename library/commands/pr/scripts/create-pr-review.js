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
