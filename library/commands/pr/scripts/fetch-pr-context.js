#!/usr/bin/env node

/**
 * GitHub PR Context Fetcher
 *
 * Retrieves detailed metadata, commits, and file diffs for a pull request.
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
import { COMMON_BOOLEAN_FLAGS } from './utils/config.js';
import { normalizeDirectoryPath, shouldIncludeFile } from './utils/fileSystem.js';

const FILE_REVIEW_BLOCKLIST = Object.freeze({
  fileNames: new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']),
  directories: new Set(['dist', 'coverage', 'build'].map(normalizeDirectoryPath).filter(Boolean)),
});

const HELP_TEXT = `
GitHub PR Context Fetcher

Collects metadata, commit history, review activity, and file changes for a pull request.

Usage: node fetch-pr-context.js [--pr=123] [options]

Options:
  --pr=123                 PR number to fetch (auto-detects current PR when omitted)
  --repo=owner/repo        Repository slug or URL (auto-detects from git remote when omitted)
  --output=filename        Write JSON output to the given file instead of stdout
  --verbose                Enable debug logging
  --help, -h               Show this help message

Examples:
  # Fetch context for current PR and print to stdout
  node fetch-pr-context.js

  # Fetch PR #128 and write to tmp/pr-128-context.json
  node fetch-pr-context.js --pr=128 --output tmp/pr-128-context.json
`;

async function main() {
  try {
    log('INFO', 'GitHub PR Context Fetcher starting...');

    const options = parseCliArgs(process.argv.slice(2));

    if (options.help) {
      showHelp(HELP_TEXT);
      return;
    }

    const standardValidations = createStandardValidations();
    const validations = [standardValidations.prNumber, standardValidations.repository, standardValidations.outputFile];

    validateArgs(options, validations);

    await ensureGhCli();

    const repo = await resolveRepository(options.repo);
    const hostInfo = repo.host && repo.host !== 'github.com' ? ` (${repo.host})` : '';
    log('INFO', `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);

    let prNumber = options.pr;
    if (!prNumber) {
      log('INFO', 'Auto-detecting current PR number...');
      prNumber = await getCurrentPRNumber();
    }

    const pr = await fetchPRContext(repo, prNumber);

    const fileDetails = await fetchPRFileDetails(repo, prNumber);

    const result = buildContext(pr, { fileDetails });

    const output = JSON.stringify(result, null, 2);

    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, output, 'utf8');
      log('INFO', `Results written to ${outputPath}`);
      console.log(`Saved PR context for #${prNumber} to ${outputPath}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    log('ERROR', `Failed to fetch PR context: ${error.message}`);
    console.error(error.message);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = {
    ...createStandardArgHandlers(),
  };

  const flagHandlers = {
    '--repo': createFlagHandler('repo'),
    '--pr': createFlagHandler('pr', (value) => parseInt(value.trim(), 10)),
    '--output': createFlagHandler('output'),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
  });
}

async function fetchPRContext(repoInfo, prNumber) {
  log('INFO', `Fetching context for PR #${prNumber} from ${repoInfo.owner}/${repoInfo.repo}...`);

  const query = buildPRContextQuery(prNumber);

  const commandArgs = ['api', 'graphql', '-f', `query=${query}`];
  commandArgs.push('-F', `owner=${repoInfo.owner}`);
  commandArgs.push('-F', `repo=${repoInfo.repo}`);

  const response = await runGhJson(commandArgs, { host: repoInfo.host });
  const pr = response?.data?.repository?.pullRequest;

  if (!pr) {
    throw new Error(`PR #${prNumber} not found`);
  }

  log('INFO', `Fetched pull request #${prNumber}: ${pr.title}`);
  return pr;
}

function buildPRContextQuery(prNumber) {
  return `
    query FetchPRContext($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: ${prNumber}) {
          number
          title
          url
          state
          isDraft
          baseRefName
          headRefName
          author { login }
          body
          additions
          deletions
          changedFiles
        }
      }
    }
  `;
}

function buildContext(pr, { fileDetails = [] }) {
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    state: pr.state,
    isDraft: pr.isDraft,
    branches: {
      base: {
        ref: pr.baseRefName,
        repository: pr.baseRepository?.nameWithOwner || null,
      },
      head: {
        ref: pr.headRefName,
        repository: pr.headRepository?.nameWithOwner || null,
      },
    },
    author: pr.author?.login || 'unknown',
    stats: {
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changedFiles,
      commitCount: pr.commits?.totalCount || 0,
    },
    body: pr.body || '',
    files: extractFiles(fileDetails),
  };
}

function extractFiles(fileDetails = []) {
  const detailMap = new Map();
  for (const detail of fileDetails) {
    if (detail?.filename) {
      detailMap.set(detail.filename, detail);
    }
  }

  const reviewableFiles = Array.from(detailMap.values()).filter((detail) =>
    shouldIncludeFile(detail, FILE_REVIEW_BLOCKLIST)
  );

  return reviewableFiles.map((detail) => {
    const sanitized = { ...detail };
    delete sanitized.blob_url;
    delete sanitized.raw_url;
    delete sanitized.contents_url;
    return sanitized;
  });
}

async function fetchPRFileDetails(repoInfo, prNumber) {
  const perPage = 100;
  let page = 1;
  const results = [];
  let hasMore = true;

  while (hasMore) {
    const endpoint = `/repos/${repoInfo.owner}/${repoInfo.repo}/pulls/${prNumber}/files?per_page=${perPage}&page=${page}`;
    log('DEBUG', `Fetching file details: ${endpoint}`);
    const response = await runGhJson(['api', endpoint], { host: repoInfo.host });

    if (!Array.isArray(response)) {
      throw new Error('Unexpected response when fetching PR file details');
    }

    results.push(...response);

    if (response.length < perPage) {
      hasMore = false;
    } else {
      page += 1;
    }
  }

  log('INFO', `Fetched ${results.length} file detail(s)`);
  return results;
}

main();
