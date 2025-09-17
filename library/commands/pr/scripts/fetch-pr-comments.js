#!/usr/bin/env node

/**
 * GitHub PR Comment Fetcher
 *
 * Retrieves review comments for a pull request and supports optional filters.
 */

import fs from 'fs';
import path from 'path';
import { log } from './utils/logger.js';
import { ensureGhCli, runGhJson } from './utils/process.js';
import { getCurrentPRNumber, resolveRepository } from './utils/repository.js';
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  parseArgs,
  showHelp,
  validateArgs,
} from './utils/cli.js';
import { COMMON_BOOLEAN_FLAGS, PAGINATION_LIMITS } from './utils/config.js';
import { ALLOWED_REACTIONS, mapReactionNameToContent, normalizeReactionName } from './utils/reactions.js';

const ALLOWED_REACTION_NAMES = ALLOWED_REACTIONS.join(', ');

const HELP_TEXT = `
GitHub PR Comments Fetcher

Fetches review comments from a specified pull request. Each result represents the latest comment in a thread that passes your filters and includes an previousComments array with the earlier discussion.

Usage: node fetch-pr-comments.js [--pr=123] [OPTIONS]

Optional:
  --pr=123                 PR number to fetch comments from (auto-detects current PR if omitted)
  --repo=owner/repo        Repository (auto-detects current repo if omitted)
  --author=jdoe            Only include comments from this author
  --output=filename        Output to file instead of stdout
  --reaction=name          Only include comments with the given reaction (${ALLOWED_REACTION_NAMES})
  --include-diff-hunk      Include the original diff hunk captured with each comment
  --ignore-outdated        Skip outdated threads and comments
  --pending                Only include comments from pending reviews
  --verbose                Enable detailed logging
  --help                   Show this help message

Examples:
  # Fetch review comments from current PR in current repository
  node fetch-pr-comments.js

  # Fetch review comments from PR #123 in current repository
  node fetch-pr-comments.js --pr=123

  # Fetch only comments with eyes reactions
  node fetch-pr-comments.js --pr=123 --reaction=eyes

  # Skip outdated comments
  node fetch-pr-comments.js --pr=123 --ignore-outdated

  # Fetch comments from specific repository
  node fetch-pr-comments.js --pr=456 --repo=facebook/react

  # Save output to file
  node fetch-pr-comments.js --pr=789 --output=pr-comments.json --verbose
  
  # Include the original diff hunk with each comment
  node .claude/commands/pr/scripts/fetch-pr-comments.js --pr=123 --include-diff-hunk
`;

/**
 * Parse CLI arguments into an options object.
 * @param {string[]} argv
 * @returns {Object}
 */
function parseCliArgs(argv) {
  const argHandlers = {
    ...createStandardArgHandlers(),
    '--ignore-outdated': (options) => ({ ...options, ignoreOutdated: true }),
    '--pending': (options) => ({ ...options, pending: true }),
    '--include-diff-hunk': (options) => ({ ...options, includeDiffHunk: true }),
  };

  const flagHandlers = {
    '--repo': createFlagHandler('repo'),
    '--author': createFlagHandler('author'),
    '--pr': createFlagHandler('pr', (value) => parseInt(value.trim())),
    '--output': createFlagHandler('output'),
    '--reaction': createFlagHandler('reaction', normalizeReactionName),
  };

  const parsedOptions = parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS, '--ignore-outdated', '--pending', '--include-diff-hunk'],
  });

  if (!parsedOptions.reaction) {
    return parsedOptions;
  }

  const reactionContent = mapReactionNameToContent(parsedOptions.reaction);

  return {
    ...parsedOptions,
    reactionContent,
  };
}

/**
 * Build the GraphQL query used to fetch review threads for a PR.
 * @param {number} prNumber
 * @returns {string}
 */
function buildPRCommentsQuery(prNumber, { includeDiffHunk = false } = {}) {
  const { THREADS, COMMENTS, REACTIONS } = PAGINATION_LIMITS;

  const diffHunkField = includeDiffHunk ? '                  diffHunk\n' : '';

  return `
    query FetchPRComments($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: ${prNumber}) {
          baseRefName
          headRefName
          reviewThreads(first: ${THREADS}) {
            nodes {
              id
              isResolved
              isOutdated
              comments(first: ${COMMENTS}) {
                nodes {
                  id
                  fullDatabaseId
                  author { login }
                  pullRequestReview {
                    id
                    fullDatabaseId
                    state
                  }
                  body
                  path
                  line
                  startLine
                  outdated
                  originalLine
                  originalStartLine
${diffHunkField}                  commit { oid }
                  url
                  reactions(first: ${REACTIONS}) {
                    nodes {
                      content
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Fetch PR data via the GitHub GraphQL API.
 * @param {{host: string, owner: string, repo: string}} repoInfo
 * @param {number} prNumber
 * @returns {Promise<Object>}
 */
async function fetchPRComments(repoInfo, prNumber, { includeDiffHunk = false } = {}) {
  log('INFO', `Fetching PR #${prNumber} from ${repoInfo.owner}/${repoInfo.repo}...`);

  const query = buildPRCommentsQuery(prNumber, { includeDiffHunk });

  try {
    const commandArgs = ['api', 'graphql', '-f', `query=${query}`];
    commandArgs.push('-F', `owner=${repoInfo.owner}`);
    commandArgs.push('-F', `repo=${repoInfo.repo}`);

    const response = await runGhJson(commandArgs, { host: repoInfo.host });

    const pr = response.data.repository.pullRequest;
    if (!pr) {
      throw new Error(`PR #${prNumber} not found`);
    }

    log('INFO', `Found PR #${prNumber}`);
    return pr;
  } catch (error) {
    log('ERROR', `Failed to fetch PR: ${error.message}`);
    throw error;
  }
}

/**
 * Process PR data and extract comments based on filtering options.
 * @param {Object} pr - Pull request data from GitHub API
 * @param {Object} options - Filtering options (reaction, ignoreOutdated)
 * @returns {Object} Processed PR data with filtered comments
 */
function processPRData(pr, options = {}) {
  const result = {
    targetBranch: pr.baseRefName,
    sourceBranch: pr.headRefName,
    comments: [],
  };

  let processedThreadCount = 0;
  let skippedOutdatedCount = 0;

  pr.reviewThreads?.nodes?.forEach((thread) => {
    const comments = thread?.comments?.nodes ?? [];
    if (!comments.length) {
      return;
    }

    const lastComment = comments[comments.length - 1];
    if (!lastComment) {
      return;
    }

    if (thread.isResolved) {
      log('DEBUG', `Skipping resolved thread with comment ${lastComment.id}`);
      return;
    }

    if (options.pending && lastComment.pullRequestReview?.state !== 'PENDING') {
      log('DEBUG', `Skipping last comment ${lastComment.id} not in pending review`);
      return;
    }

    if (options.author && lastComment.author?.login !== options.author) {
      log('DEBUG', `Skipping last comment ${lastComment.id} from different author ${lastComment.author?.login}`);
      return;
    }

    if (options.ignoreOutdated && (thread.isOutdated || lastComment.outdated)) {
      log('DEBUG', `Skipping outdated thread/comment ${lastComment.id}`);
      skippedOutdatedCount++;
      return;
    }

    if (options.reactionContent) {
      const hasReaction = lastComment.reactions?.nodes?.some(
        (reaction) => reaction.content === options.reactionContent
      );
      if (!hasReaction) {
        log('DEBUG', `Skipping last comment ${lastComment.id} without ${options.reaction} reaction`);
        return;
      }
    }

    const previousComments = comments.slice(0, -1).map((contextComment) => ({
      body: contextComment.body,
      author: contextComment.author?.login ?? 'Unknown',
      path: contextComment.path,
    }));

    result.comments.push({
      id: lastComment.fullDatabaseId,
      reviewId: lastComment.pullRequestReview?.fullDatabaseId,
      body: lastComment.body,
      author: lastComment.author?.login ?? 'Unknown',
      path: lastComment.path,
      startLineNumber: lastComment.startLine,
      endLineNumber: lastComment.line,
      originalStartLineNumber: lastComment.originalStartLine,
      originalEndLineNumber: lastComment.originalLine,
      commitId: lastComment.commit?.oid ?? null,
      diffHunk: lastComment.diffHunk ?? null,
      url: lastComment.url ?? null,
      previousComments,
    });

    processedThreadCount++;
  });

  log('INFO', `Processed last comments from ${processedThreadCount} threads`);
  if (options.ignoreOutdated && skippedOutdatedCount > 0) {
    log('INFO', `Skipped ${skippedOutdatedCount} outdated threads/comments`);
  }

  return result;
}

/**
 * Entry point that orchestrates argument parsing, validation, and data retrieval.
 * @returns {Promise<void>}
 */
async function main() {
  try {
    log('INFO', 'GitHub PR Comments Fetcher starting...');

    const options = parseCliArgs(process.argv.slice(2));

    if (options.help) {
      showHelp(HELP_TEXT);
      return;
    }

    const standardValidations = createStandardValidations();
    const validations = [
      standardValidations.prNumber,
      standardValidations.repository,
      standardValidations.outputFile,
      standardValidations.reaction,
    ];

    validateArgs(options, validations);

    await ensureGhCli();

    const repoInfo = await resolveRepository(options.repo);
    const hostInfo = repoInfo.host && repoInfo.host !== 'github.com' ? ` (${repoInfo.host})` : '';
    log('INFO', `Target repository: ${repoInfo.owner}/${repoInfo.repo}${hostInfo}`);

    let prNumber = options.pr;
    if (!prNumber) {
      log('INFO', 'Auto-detecting current PR number...');
      prNumber = await getCurrentPRNumber();
    }

    const pr = await fetchPRComments(repoInfo, prNumber, {
      includeDiffHunk: Boolean(options.includeDiffHunk),
    });

    const result = processPRData(pr, options);

    const output = JSON.stringify(result, null, 2);

    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, output, 'utf8');
      log('INFO', `Results written to ${outputPath}`);
      log('INFO', `Found ${result.comments.length} comments in PR #${prNumber}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    log('ERROR', `Failed to fetch PR comments: ${error.message}`);
    process.exit(1);
  }
}

main();
