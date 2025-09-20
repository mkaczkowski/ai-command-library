#!/usr/bin/env node

/**
 * List Changed Files Script
 *
 * Extracts changed files from PR context JSON using git diff.
 * Provides a clean CLI interface for the review workflow.
 */

import { getChangedFilesFromContext } from './utils/repository.js';
import { parseArgs, createStandardArgHandlers, createFlagHandler, handleHelp } from './utils/cli.js';
import { log } from './utils/logger.js';

const HELP_TEXT = `
List Changed Files

Extracts changed files from PR context JSON using git diff.

Usage: node list-changed-files.js [options]

Options:
  --context=path           Path to PR context JSON file (required)
  --output=path            Write file list to specified file instead of stdout
  --use-local              Use local refs instead of origin/ prefix (rare)

Examples:
  node list-changed-files.js --context=tmp/pr-123-context.json
  node list-changed-files.js --context=tmp/pr-123-context.json --output=tmp/changed-files.txt
  node list-changed-files.js --context=tmp/pr-123-context.json --use-local
`;

async function main() {
  try {
    const config = {
      argHandlers: createStandardArgHandlers(),
      flagHandlers: {
        '--context': createFlagHandler('context'),
        '--output': createFlagHandler('output'),
        '--use-local': (options) => ({ ...options, useLocal: true }),
      },
      booleanFlags: ['--use-local'],
      requiredFlags: ['--context'],
    };

    const args = parseArgs(process.argv.slice(2), config);
    handleHelp(args, HELP_TEXT);

    // Prepare options (default to remote for reliability)
    const options = {
      useRemote: !args.useLocal,
    };

    log('INFO', `Extracting changed files from: ${args.context}`);

    // Get changed files
    const changedFiles = await getChangedFilesFromContext(args.context, options);

    if (changedFiles.length === 0) {
      log('INFO', 'No changed files found');
      return;
    }

    // Output results
    const output = changedFiles.join('\n');

    if (args.output) {
      const fs = await import('fs/promises');
      await fs.writeFile(args.output, output + '\n');
      log('INFO', `Wrote ${changedFiles.length} files to: ${args.output}`);
    } else {
      console.log(output);
    }

    log('INFO', `Found ${changedFiles.length} changed files`);
  } catch (error) {
    log('ERROR', `Script failed: ${error.message}`);
    process.exit(1);
  }
}

main();
