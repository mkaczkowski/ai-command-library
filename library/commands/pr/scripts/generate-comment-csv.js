#!/usr/bin/env node

/**
 * GitHub PR Comment CSV Generator
 *
 * Converts structured JSON into CSV files that comply with the
 * GitHub PR review workflows in this repository. Handles quoting,
 * embedded newlines, and schema-specific validation so authors can
 * focus on comment content instead of manual CSV escape rules.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createFlagHandler,
  createStandardArgHandlers,
  handleHelp,
  parseArgs,
  validateArgs,
  createStandardValidations,
} from './utils/cli.js';
import { log } from './utils/logger.js';
import {
  COMMON_BOOLEAN_FLAGS,
  REVIEW_COMMENT_CSV_CONFIG,
  ENHANCE_COMMENT_CSV_CONFIG,
  ADDRESS_RESOLVED_CSV_CONFIG,
} from './utils/config.js';
import { ensureDirectoryForFile, readJsonFile } from './utils/fileSystem.js';
import { stringifyCsvRows } from './utils/csv.js';

const HELP_TEXT = `
Convert review comment JSON into a CSV that GitHub scripts in this repo understand.

Usage:
  node generate-comment-csv.js --input=comments.json --output=comments.csv [--schema=review]

Options:
  --input            Path to a JSON file describing the comments (required)
  --output           Destination CSV file path (required)
  --schema           One of: review (default), enhance, resolved
  --verbose          Enable verbose logging
  --help, -h         Show this help message

Input JSON layouts by schema:
  review  -> [{ "path": "src/file.ts", "body": "...", "line": 42, ... }]
  enhance -> [{ "id": "123", "rewritten": "updated body" }]
  resolved -> [{ "commentId": "123", "commitUrl": "https://..." }]
`;

const SCHEMAS = {
  review: {
    headers: REVIEW_COMMENT_CSV_CONFIG.REQUIRED_HEADERS,
    label: 'review comments',
    required: ['path', 'body'],
  },
  enhance: {
    headers: ENHANCE_COMMENT_CSV_CONFIG.REQUIRED_HEADERS,
    label: 'rewritten comments',
    required: ['id', 'rewritten'],
  },
  resolved: {
    headers: ADDRESS_RESOLVED_CSV_CONFIG.REQUIRED_HEADERS,
    label: 'resolved comment mappings',
    required: ['commentId', 'commitUrl'],
  },
};

async function main() {
  try {
    log('INFO', 'GitHub PR Comment CSV Generator starting...');

    const options = parseCliArgs(process.argv.slice(2));
    handleHelp(options, HELP_TEXT);

    const resolvedSchema = resolveSchema(options.schema);
    validateArgs(options, buildValidations());

    const inputPath = path.resolve(options.input);
    const outputPath = path.resolve(options.output);

    const comments = await readCommentData(inputPath);
    if (comments.length === 0) {
      throw new Error('Input JSON contains no comment entries');
    }

    validateComments(comments, resolvedSchema);

    const csvContent = stringifyCsvRows(comments, resolvedSchema.headers);
    await ensureDirectoryForFile(outputPath);
    await writeFile(outputPath, csvContent, 'utf8');

    log('INFO', `Generated ${resolvedSchema.label} CSV with ${comments.length} row(s)`);
    log('INFO', `Output written to: ${outputPath}`);
  } catch (error) {
    log('ERROR', `CSV generation failed: ${error.message}`);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = createStandardArgHandlers();

  const flagHandlers = {
    '--input': createFlagHandler('input'),
    '--output': createFlagHandler('output'),
    '--schema': createFlagHandler('schema', (value) => value?.toLowerCase()),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
    requiredFlags: ['--input', '--output'],
  });
}

function buildValidations() {
  const standardValidations = createStandardValidations();

  return [standardValidations.outputFile];
}

function resolveSchema(requestedSchema) {
  if (!requestedSchema) {
    return SCHEMAS.review;
  }

  const schema = SCHEMAS[requestedSchema];

  if (!schema) {
    const validOptions = Object.keys(SCHEMAS).join(', ');
    throw new Error(`Unknown schema "${requestedSchema}". Use one of: ${validOptions}`);
  }

  log('INFO', `Using ${requestedSchema} schema`);
  return schema;
}

async function readCommentData(inputPath) {
  log('INFO', `Reading comment JSON from: ${inputPath}`);

  const data = await readJsonFile(inputPath);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.comments)) {
    log('INFO', 'Detected "comments" property in JSON; using that for input');
    return data.comments;
  }

  throw new Error('Input JSON must be an array or contain a top-level "comments" array');
}

function validateComments(comments, schema) {
  comments.forEach((comment, index) => {
    if (typeof comment !== 'object' || comment === null) {
      throw new Error(`Entry ${index + 1} must be an object describing a comment`);
    }

    for (const field of schema.required) {
      if (!hasValue(comment[field])) {
        throw new Error(`Entry ${index + 1}: Missing required "${field}" value`);
      }
    }

    if (schema === SCHEMAS.review) {
      validateReviewComment(comment, index);
    }
  });
}

function validateReviewComment(comment, index) {
  const lineFields = ['position', 'line', 'startLine'];
  const positionValues = lineFields
    .map((field) => comment[field])
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '');

  if (positionValues.length === 0) {
    log('WARN', `Entry ${index + 1}: No position/line provided; GitHub will place the comment at file level.`);
  }
}

function hasValue(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return true;
}

await main();
