import fs from 'fs';
import { enableVerboseLogging, log } from './logger.js';
import { ALLOWED_REACTIONS, isSupportedReaction } from './reactions.js';

const HELP_HINT = 'Use --help for usage information.';

/**
 * Shared CLI utilities for the GitHub scripts.
 */

/**
 * Parse CLI arguments into an options object using a flexible handler system.
 * @param {string[]} argv
 * @param {Object} config - Configuration object with argHandlers and flagHandlers
 * @returns {Object} Parsed options
 */
function parseArgs(argv, config) {
  log('DEBUG', 'Parsing CLI arguments', { argv });

  const { argHandlers = {}, flagHandlers = {}, booleanFlags = [], requiredFlags = [] } = config;

  const buildUnknownParameterError = (message) => new Error(`\n${message}\n${HELP_HINT}`);

  let options = {};

  for (const arg of argv) {
    if (argHandlers[arg]) {
      options = argHandlers[arg](options);
      continue;
    }

    if (!arg.startsWith('--')) {
      throw buildUnknownParameterError(`Unknown argument: ${arg}`);
    }

    if (arg.includes('=')) {
      const [flag, ...rest] = arg.split('=');
      const value = rest.join('=');

      if (!flagHandlers[flag]) {
        throw buildUnknownParameterError(`Unknown flag: ${flag}`);
      }

      options = flagHandlers[flag](options, value);
      continue;
    }

    if (!booleanFlags.includes(arg)) {
      throw buildUnknownParameterError(`Unknown parameter: ${arg}`);
    }
  }

  for (const requiredFlag of requiredFlags) {
    const flagName = requiredFlag.replace('--', '');
    const camelCaseFlag = flagName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    if (!options[camelCaseFlag] && !options.help) {
      log('ERROR', `Missing required ${requiredFlag} parameter`);
      throw new Error(`Provide ${requiredFlag} parameter.\n${HELP_HINT}`);
    }
  }

  log('DEBUG', 'CLI arguments parsed successfully', options);
  return options;
}

/**
 * Create standard argument handlers for common CLI patterns.
 * @returns {Object} Standard argHandlers object
 */
function createStandardArgHandlers() {
  return {
    '--help': (options) => ({ ...options, help: true }),
    '-h': (options) => ({ ...options, help: true }),
    '--verbose': (options) => {
      enableVerboseLogging();
      return { ...options, verbose: true };
    },
  };
}

/**
 * Create a flag handler that sets a property on the options object.
 * @param {string} propertyName - The property name to set (camelCase)
 * @param {Function} [transform] - Optional transform function for the value
 * @returns {Function} Flag handler function
 */
function createFlagHandler(propertyName, transform = (value) => value) {
  return (options, value) => {
    log('DEBUG', `Setting ${propertyName}: ${value}`);
    return { ...options, [propertyName]: transform(value) };
  };
}

/**
 * Validate CLI arguments and throw descriptive errors.
 * @param {Object} options - Parsed options object
 * @param {Object[]} validations - Array of validation objects
 * @param {string} validations[].field - Field name to validate
 * @param {Function} validations[].validator - Validation function that returns true/false
 * @param {string} validations[].message - Error message if validation fails
 */
function validateArgs(options, validations = []) {
  const errors = [];

  for (const { field, validator, message } of validations) {
    if (options[field] !== undefined && !validator(options[field])) {
      errors.push(message);
    }
  }

  if (errors.length > 0) {
    const message = ['Validation errors:', ...errors.map((error) => `  ${error}`), '', HELP_HINT].join('\n');

    throw new Error(message);
  }

  return options;
}

/**
 * Display help text and exit.
 * @param {string} helpText - The help text to display
 */
function showHelp(helpText) {
  console.log(helpText.trim());
  process.exit(0);
}

/**
 * Create standard validation objects for common CLI arguments.
 * @returns {Object} Object containing standard validation functions
 */
function createStandardValidations() {
  return {
    prNumber: {
      field: 'pr',
      validator: (pr) => !isNaN(pr) && pr > 0,
      message: '--pr must be a valid PR number',
    },
    repository: {
      field: 'repo',
      validator: (repo) => repo && (repo.includes('/') || repo.includes('github.com')),
      message: '--repo must be in format owner/repo or full GitHub URL',
    },
    outputFile: {
      field: 'output',
      validator: (output) => output !== '',
      message: '--output filename cannot be empty',
    },
    reaction: {
      field: 'reaction',
      validator: (reaction) => isSupportedReaction(reaction),
      message: `--reaction must be one of: ${ALLOWED_REACTIONS.join(', ')}`,
    },
    mappingFile: {
      field: 'mappingFile',
      validator: (filePath) => {
        if (typeof filePath !== 'string' || filePath.trim() === '') {
          return false;
        }
        try {
          return fs.existsSync(filePath);
        } catch (error) {
          log('ERROR', `Error validating mapping file path: ${error.message}`);
          return false;
        }
      },
      message: '--mapping-file must point to an existing file',
    },
  };
}

export { parseArgs, createStandardArgHandlers, createFlagHandler, validateArgs, showHelp, createStandardValidations };
