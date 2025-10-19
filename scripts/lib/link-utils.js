import path from 'path';
import { promises as fs } from 'fs';
import { expandHomeDir } from './path-utils.js';

export const SUPPORTED_MODES = new Set(['copy', 'symlink']);

/**
 * Validates that the mode is supported.
 * @param {string} mode - The mode to validate ('copy' or 'symlink')
 * @throws {Error} If mode is not supported
 */
export function validateMode(mode) {
  if (!SUPPORTED_MODES.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }
}

/**
 * Resolves a destination path, handling home directory expansion and relative paths.
 * @param {string} destinationInput - The destination path (may contain ~)
 * @returns {string} Absolute path to destination
 */
export function resolveDestinationPath(destinationInput) {
  const expandedDestination = expandHomeDir(destinationInput);
  return path.isAbsolute(expandedDestination) ? expandedDestination : path.resolve(process.cwd(), expandedDestination);
}

/**
 * Checks if a source directory exists. Logs and returns early if it doesn't.
 * @param {string} sourceRoot - Path to source directory
 * @param {string} resourceName - Name of resource type (for logging)
 * @param {object} logger - Logger instance
 * @returns {Promise<boolean>} True if source exists, false otherwise
 */
export async function checkSourceExists(sourceRoot, resourceName, logger = console) {
  try {
    await fs.access(sourceRoot);
    return true;
  } catch {
    logger.log(`${resourceName} source root not found at ${sourceRoot}. Skipping ${resourceName} linking.`);
    return false;
  }
}

/**
 * Gets entries from a directory with optional filtering.
 * @param {string} sourceRoot - Path to source directory
 * @param {function} filterFn - Optional function to filter entries
 * @returns {Promise<string[]>} Array of entry names
 */
export async function getResourceEntries(sourceRoot, filterFn) {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  return filterFn ? entries.filter(filterFn).map((entry) => entry.name) : entries.map((entry) => entry.name);
}

/**
 * Creates a directory recursively if needed.
 * @param {string} dirPath - Path to directory
 * @param {object} options - Options { dryRun }
 */
export async function ensureDirectory(dirPath, { dryRun } = {}) {
  if (dryRun) return;
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Removes a file or directory if it exists.
 * @param {string} targetPath - Path to remove
 * @param {object} options - Options { dryRun, logger }
 */
export async function removeIfExistsUtil(targetPath, { dryRun = false, logger = console } = {}) {
  try {
    const stats = await fs.stat(targetPath);
    if (dryRun) {
      logger.log(`[dry-run] remove ${targetPath}`);
      return;
    }

    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    logger.log(`remove ${targetPath}`);
  } catch (error) {
    // Path doesn't exist, which is fine - silently ignore ENOENT errors
    // eslint-disable-next-line no-unused-vars
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Copies a file with optional dry-run support.
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @param {object} options - Options { dryRun, logger }
 */
export async function copyFile(source, destination, { dryRun, logger = console } = {}) {
  if (dryRun) {
    logger.log(`[dry-run] copy ${source} -> ${destination}`);
    return;
  }

  await ensureDirectory(path.dirname(destination), { dryRun: false, logger });
  await fs.copyFile(source, destination);
  logger.log(`copy ${source} -> ${destination}`);
}

/**
 * Creates a symlink with optional dry-run support and Windows fallback.
 * @param {string} source - Source path
 * @param {string} destination - Destination symlink path
 * @param {object} options - Options { dryRun, logger, fallbackFn }
 */
export async function createSymlink(source, destination, { dryRun, logger = console, fallbackFn } = {}) {
  if (dryRun) {
    logger.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }

  await ensureDirectory(path.dirname(destination), { dryRun: false, logger });

  try {
    const linkType = process.platform === 'win32' ? 'dir' : undefined;
    await fs.symlink(source, destination, linkType);
    logger.log(`symlink ${destination} -> ${source}`);
  } catch (error) {
    if (process.platform === 'win32' && error.code === 'EACCES') {
      logger.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      if (fallbackFn) {
        await fallbackFn();
      }
    } else {
      throw error;
    }
  }
}
