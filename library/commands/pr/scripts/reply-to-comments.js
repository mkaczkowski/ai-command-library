#!/usr/bin/env node

import path from 'path';
import { log } from './utils/logger.js';
import { ensureGhCli, runGh, runGhJson } from './utils/process.js';
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
import { loadJsonArray, requireNumericStringField, requireObject, requireUrlField } from './utils/jsonValidation.js';
import { resolveExistingPath } from './utils/fileSystem.js';

const HELP_TEXT = `
Reply to GitHub PR review comments using commit mappings from a JSON file.

Usage:
  node reply-to-comments.js --pr=<number>
  node reply-to-comments.js --input=tmp/pr-123-address-resolved.json

Options:
  --pr               Pull request number used to locate tmp/pr-[PR]-address-resolved.json
  --input            Explicit path to the resolved comment JSON (overrides --pr)
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

    handleHelp(options, HELP_TEXT);

    if (!options.input && !options.pr) {
      throw new Error('Provide --pr or --input so the script can locate the resolved comment JSON.');
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

    const inputPath = resolveInputPath(options);

    await ensureGhCli();

    const repo = await resolveRepository(options.repo);
    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);

    log('INFO', `Loading resolved comment mappings from JSON: ${inputPath}`);
    const mappings = await parseResolvedMappings(inputPath);
    log('INFO', `Loaded ${mappings.length} comment mappings from JSON`);

    // Extract PR number for API calls
    const prNumber = options.pr || extractPrNumberFromInputPath(inputPath);
    if (!prNumber) {
      throw new Error(
        'PR number is required for posting replies. Provide --pr or ensure JSON path contains the PR number.'
      );
    }

    log('INFO', `Replying to ${mappings.length} comment(s) in ${repo.owner}/${repo.repo} (PR #${prNumber})`);
    const dryRun = Boolean(options.dryRun);
    if (dryRun) {
      log('INFO', 'Dry run enabled — no replies will be sent.');
    }

    let successes = 0;
    let failures = 0;
    const targetCache = new Map();

    for (const { commentId, commitUrl } of mappings) {
      try {
        // Validate commit URL before proceeding
        const isValidCommit = await validateCommitUrl(repo, commitUrl);
        if (!isValidCommit) {
          throw new Error(`Commit URL validation failed: ${commitUrl}`);
        }

        const { targetId, isReply, htmlUrl } = await resolveReplyTarget(repo, commentId, targetCache);
        if (isReply) {
          log('DEBUG', `Comment ${commentId} is a reply; targeting thread root ${targetId}`);
        }

        // Check for existing reply to prevent duplicates
        const hasExistingReply = await checkForExistingReply(repo, prNumber, targetId, commitUrl);
        if (hasExistingReply) {
          log('INFO', `⊘ Skipping ${commentId} - reply with this commit already exists`);
          successes++; // Count as success since the reply exists
          continue;
        }

        const body = buildReplyBody(commitUrl);

        if (dryRun) {
          log('INFO', `→ [dry-run] ${commentId} → ${targetId} (${commitUrl})`);
          if (htmlUrl) {
            log('DEBUG', `Thread URL: ${htmlUrl}`);
          }
        } else {
          await sendReply(repo, targetId, body, prNumber);
          log('INFO', `✔ Replied to ${commentId}`);
        }
        successes++;
      } catch (error) {
        failures++;
        log('ERROR', `✖ Failed to reply to ${commentId}: ${error.message}`, { error: error.message });
        // Continue with remaining replies instead of failing completely
      }
    }

    log('INFO', `Reply process completed: ${successes} successful, ${failures} failed`);
    if (failures > 0) {
      if (successes > 0) {
        log('WARN', `Some replies failed, but ${successes} comment(s) were successfully addressed`);
        process.exit(1); // Indicate partial failure but allow workflow to continue
      } else {
        throw new Error(`All ${failures} repl${failures === 1 ? 'y' : 'ies'} failed`);
      }
    }
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = {
    ...createStandardArgHandlers(),
    '--dry-run': (options) => ({ ...options, dryRun: true }),
  };

  const flagHandlers = {
    '--input': createFlagHandler('input'),
    '--pr': createFlagHandler('pr', (value) => Number(value)),
    '--repo': createFlagHandler('repo'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS, '--dry-run'],
  });
}

function resolveInputPath(options) {
  if (options.input) {
    return resolveExistingPath(options.input);
  }

  const derivedPath = buildDefaultAddressResolvedJsonPath(options.pr);
  try {
    return resolveExistingPath(derivedPath);
  } catch (error) {
    const absoluteDerivedPath = path.resolve(derivedPath);
    throw new Error(`Expected JSON at ${absoluteDerivedPath}. Provide --input to specify an alternate location.`);
  }
}

function buildDefaultAddressResolvedJsonPath(prNumber) {
  const normalized = String(prNumber ?? '').trim();
  if (!normalized) {
    throw new Error('PR number is required to locate the resolved JSON file');
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error('PR number must be a positive number');
  }

  return path.join('tmp', `pr-${numeric}-address-resolved.json`);
}

function extractPrNumberFromInputPath(inputPath) {
  const filename = path.basename(inputPath);
  const match = filename.match(/^pr-(\d+)-address-resolved\.json$/);
  return match ? Number(match[1]) : null;
}

async function parseResolvedMappings(filePath) {
  const entries = await loadJsonArray(filePath, { label: 'resolved comment mapping(s)' });

  return entries.map((entry, index) => {
    const mappingLabel = 'Mapping';
    const normalized = requireObject(entry, index, { label: mappingLabel });

    const commentId = requireNumericStringField(normalized, 'commentId', index, { label: mappingLabel });
    const commitUrl = requireUrlField(normalized, 'commitUrl', index, { label: mappingLabel });

    return {
      commentId,
      commitUrl,
    };
  });
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

async function sendReply(repo, targetCommentId, body, prNumber) {
  log('DEBUG', `Posting reply to comment ${targetCommentId}`);
  const payload = `${JSON.stringify({ body, in_reply_to: Number(targetCommentId) })}\n`;
  const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/${prNumber}/comments`;

  await runGh(['api', '--method', 'POST', endpoint, '--input', '-'], {
    input: payload,
    host: repo.host,
  });

  log('DEBUG', `Reply posted to ${targetCommentId}`);
}

async function validateCommitUrl(repo, commitUrl) {
  try {
    // Extract commit hash from URL
    const commitHash = commitUrl.split('/').pop();
    if (!commitHash || commitHash.length < 7) {
      throw new Error('Invalid commit hash in URL');
    }

    // Check if commit exists in the repository
    const endpoint = `/repos/${repo.owner}/${repo.repo}/commits/${commitHash}`;
    await runGhJson(['api', endpoint], { host: repo.host });

    log('DEBUG', `Commit URL validated: ${commitUrl}`);
    return true;
  } catch (error) {
    log('WARN', `Commit URL validation failed: ${commitUrl} - ${error.message}`);
    return false;
  }
}

async function checkForExistingReply(repo, prNumber, targetCommentId, commitUrl) {
  try {
    // Get all comments for the PR and look for our reply pattern
    const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/${prNumber}/comments`;
    const allComments = await runGhJson(['api', endpoint], { host: repo.host });

    // Find comments that reply to our target and contain the commit URL
    // Check for both old format ("Done") and new format ("Thanks for the feedback")
    const existingReply = allComments.find(
      (comment) =>
        comment.in_reply_to_id === Number(targetCommentId) &&
        comment.body &&
        comment.body.includes(commitUrl) &&
        (comment.body.includes('Thanks for the feedback') || comment.body.includes('Done'))
    );

    if (existingReply) {
      log('DEBUG', `Existing reply found for comment ${targetCommentId} with commit ${commitUrl}`);
      return true;
    }

    return false;
  } catch (error) {
    log('DEBUG', `Could not check for existing replies: ${error.message}`);
    return false;
  }
}

function buildReplyBody(commitUrl) {
  return `Thanks for the feedback! This has been addressed in ${commitUrl}`;
}

main();
