#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { log } from './utils/logger.js';
import { ensureGhCli, runGh, runGhJson } from './utils/process.js';
import { resolveRepository } from './utils/repository.js';
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  parseArgs,
  showHelp,
  validateArgs,
} from './utils/cli.js';
import { ADDRESS_RESOLVED_CSV_CONFIG, COMMON_BOOLEAN_FLAGS } from './utils/config.js';
import { createNumericIdFieldValidator, createUrlFieldValidator, parseCSVFile } from './utils/csv.js';

const HELP_TEXT = `
Reply to GitHub PR review comments using commit mappings from a CSV file.

Usage:
  node {{script:pr/scripts/reply-to-comments.js}} --pr=<number>
  node {{script:pr/scripts/reply-to-comments.js}} --csv=tmp/pr-123-address-resolved.csv

Options:
  --pr               Pull request number used to locate tmp/pr-[PR]-address-resolved.csv
  --csv              Explicit path to the resolved comment CSV (overrides --pr)
  --repo             Target repository in owner/repo format (auto-detected from git remote if omitted)
  --dry-run          Preview replies without calling the GitHub API
  --verbose          Enable detailed logging
  --help, -h         Show this message
`;

async function main() {
  try {
    log('INFO', 'GitHub PR Comment Reply script starting...');

    const options = parseCliArgs(process.argv.slice(2));
    log('DEBUG', 'Parsed CLI options', options);

    if (options.help) {
      showHelp(HELP_TEXT);
      return;
    }

    if (!options.csv && !options.pr) {
      throw new Error('Provide --pr or --csv so the script can locate the resolved comment CSV.');
    }

    const standardValidations = createStandardValidations();
    const validations = [];
    if (options.pr !== undefined) {
      validations.push(standardValidations.prNumber);
    }
    if (options.repo !== undefined) {
      validations.push(standardValidations.repository);
    }

    validateArgs(options, validations);

    const csvPath = resolveCsvPath(options);
    const csvReference = buildResolutionReference(options, csvPath);

    await ensureGhCli();

    const repo = await resolveRepository(options.repo);
    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);

    log('INFO', `Loading resolved comment mappings from CSV: ${csvPath}`);
    const mappings = await parseResolvedMappings(csvPath);
    log('INFO', `Loaded ${mappings.length} comment mappings from CSV`);

    console.log(`Replying to ${mappings.length} comment(s) in ${repo.owner}/${repo.repo}`);
    const dryRun = Boolean(options.dryRun);
    if (dryRun) {
      console.log('Dry run enabled — no replies will be sent.');
    }

    let successes = 0;
    let failures = 0;
    const targetCache = new Map();

    for (const { commentId, commitUrl } of mappings) {
      try {
        const { targetId, isReply, htmlUrl } = await resolveReplyTarget(repo, commentId, targetCache);
        if (isReply) {
          log('DEBUG', `Comment ${commentId} is a reply; targeting thread root ${targetId}`);
        }

        const body = buildReplyBody(commitUrl, csvReference);

        if (dryRun) {
          console.log(`→ [dry-run] ${commentId} → ${targetId} (${commitUrl})`);
          if (htmlUrl) {
            log('DEBUG', `Thread URL: ${htmlUrl}`);
          }
        } else {
          await sendReply(repo, targetId, body);
          console.log(`✔ Replied to ${commentId}`);
        }
        successes++;
      } catch (error) {
        failures++;
        console.error(`✖ Failed to reply to ${commentId}: ${error.message}`);
        log('ERROR', `Failed to reply to ${commentId}`, { error: error.message });
      }
    }

    log('INFO', `Reply process completed: ${successes} successful, ${failures} failed`);
    if (failures > 0) {
      throw new Error(`${failures} repl${failures === 1 ? 'y' : 'ies'} failed`);
    }
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    console.error(error.message);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = {
    ...createStandardArgHandlers(),
    '--dry-run': (options) => ({ ...options, dryRun: true }),
  };

  const flagHandlers = {
    '--csv': createFlagHandler('csv'),
    '--pr': createFlagHandler('pr', (value) => Number(value)),
    '--repo': createFlagHandler('repo'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS, '--dry-run'],
  });
}

function resolveCsvPath(options) {
  if (options.csv) {
    const resolved = path.resolve(options.csv);
    if (!fs.existsSync(resolved)) {
      throw new Error(`CSV file not found: ${resolved}`);
    }
    return resolved;
  }

  const derivedPath = path.resolve(`tmp/pr-${options.pr}-address-resolved.csv`);
  if (!fs.existsSync(derivedPath)) {
    throw new Error(`Expected CSV at ${derivedPath}. Provide --csv to specify an alternate location.`);
  }
  return derivedPath;
}

function buildResolutionReference(options, csvPath) {
  if (options.csv) {
    const relative = path.relative(process.cwd(), csvPath);
    return relative || path.basename(csvPath);
  }
  return `tmp/pr-${options.pr}-address-resolved.csv`;
}

async function parseResolvedMappings(filePath) {
  const { REQUIRED_HEADERS, EXPECTED_COLUMNS } = ADDRESS_RESOLVED_CSV_CONFIG;

  const fieldValidators = [createNumericIdFieldValidator('commentId'), createUrlFieldValidator('commitUrl')];

  const { rows } = await parseCSVFile(filePath, {
    requiredHeaders: REQUIRED_HEADERS,
    expectedColumns: EXPECTED_COLUMNS,
    fieldValidators,
  });

  return rows;
}

async function resolveReplyTarget(repo, commentId, cache) {
  const cacheKey = String(commentId);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/comments/${commentId}`;
  log('DEBUG', `Fetching comment metadata from ${endpoint}`);

  const comment = await runGhJson(['api', endpoint], { host: repo.host });
  const targetId = comment.in_reply_to_id ? String(comment.in_reply_to_id) : String(comment.id);
  const info = {
    targetId,
    isReply: Boolean(comment.in_reply_to_id),
    htmlUrl: comment.html_url,
  };

  cache.set(cacheKey, info);
  return info;
}

async function sendReply(repo, targetCommentId, body) {
  log('DEBUG', `Posting reply to comment ${targetCommentId}`);
  const payload = `${JSON.stringify({ body })}\n`;
  const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/comments/${targetCommentId}/replies`;

  await runGh(['api', '--method', 'POST', endpoint, '--input', '-'], {
    input: payload,
    host: repo.host,
  });

  log('DEBUG', `Reply posted to ${targetCommentId}`);
}

function buildReplyBody(commitUrl, csvReference) {
  return `Thanks for the review—addressed in ${commitUrl}.\n\nResolution mapping: \`${csvReference}\``;
}

main();
