import path from 'path';
import { collectFilesRecursive, removeIfExists } from './fs-utils.js';
import {
  validateMode,
  resolveDestinationPath,
  checkSourceExists,
  getResourceEntries,
  ensureDirectory,
  copyFile,
  createSymlink,
} from './link-utils.js';

/**
 * Generic resource linker supporting both directory-level and file-level resources.
 * @param {object} config - Configuration object
 * @param {string} config.providerId - Provider ID for logging
 * @param {string} config.sourceRoot - Source directory path
 * @param {string} config.destination - Destination directory path
 * @param {string} config.mode - Linking mode ('copy' or 'symlink')
 * @param {boolean} config.dryRun - Dry run mode
 * @param {string} config.resourceName - Resource name for logging ('skills', 'agents', etc.)
 * @param {string} config.resourceType - Resource type ('directory' or 'file')
 * @param {function} config.filterFn - Filter function for resources (optional)
 * @param {object} config.logger - Logger instance
 */
export async function linkResource({
  providerId,
  sourceRoot,
  destination,
  mode,
  dryRun,
  resourceName,
  resourceType = 'directory',
  filterFn,
  logger = console,
}) {
  validateMode(mode);

  // Check if source exists
  const sourceExists = await checkSourceExists(sourceRoot, resourceName, logger);
  if (!sourceExists) {
    return;
  }

  if (!destination) {
    throw new Error(`No ${resourceName} destination provided for provider '${providerId}'.`);
  }

  const destinationRoot = resolveDestinationPath(destination);

  logger.log(`Linking ${resourceName} for provider '${providerId}' using mode '${mode}'.`);
  logger.log(`Source root: ${sourceRoot}`);
  logger.log(`Destination root: ${destinationRoot}`);

  // Get resources (files or directories based on config)
  const resources = await getResourceEntries(sourceRoot, filterFn);

  if (resources.length === 0) {
    logger.log(`No ${resourceName} found in source root.`);
    return;
  }

  // Link each resource
  for (const resource of resources) {
    const sourcePath = path.join(sourceRoot, resource);
    const destinationPath = path.join(destinationRoot, resource);

    if (resourceType === 'directory') {
      await linkResourceDirectory({
        sourcePath,
        destinationPath,
        mode,
        dryRun,
        logger,
      });
    } else if (resourceType === 'file') {
      await linkResourceFile({
        sourcePath,
        destinationPath,
        mode,
        dryRun,
        logger,
      });
    }
  }

  logger.log(dryRun ? 'Dry run finished.' : `${resourceName} linked successfully.`);
}

/**
 * Links a directory-level resource (e.g., skills).
 */
async function linkResourceDirectory({ sourcePath, destinationPath, mode, dryRun, logger }) {
  await removeIfExists(destinationPath, { dryRun, logger });

  if (mode === 'copy') {
    await copyResourceDirectory(sourcePath, destinationPath, { dryRun, logger });
  } else if (mode === 'symlink') {
    await symlinkResourceDirectory(sourcePath, destinationPath, { dryRun, logger });
  }
}

/**
 * Links a file-level resource (e.g., agents).
 */
async function linkResourceFile({ sourcePath, destinationPath, mode, dryRun, logger }) {
  await removeIfExists(destinationPath, { dryRun, logger });

  if (mode === 'copy') {
    await copyFile(sourcePath, destinationPath, { dryRun, logger });
  } else if (mode === 'symlink') {
    await symlinkResourceFile(sourcePath, destinationPath, { dryRun, logger });
  }
}

/**
 * Copies an entire directory recursively.
 */
async function copyResourceDirectory(source, destination, { dryRun, logger }) {
  if (dryRun) {
    logger.log(`[dry-run] copy directory ${source} -> ${destination}`);
    return;
  }

  await ensureDirectory(destination, { dryRun: false, logger });

  const files = await collectFilesRecursive(source);
  for (const sourceFile of files) {
    const relativeFile = path.relative(source, sourceFile);
    const destinationFile = path.join(destination, relativeFile);

    await ensureDirectory(path.dirname(destinationFile), { dryRun: false, logger });
    await copyFile(sourceFile, destinationFile, { dryRun: false, logger });
  }
}

/**
 * Creates a symlink to a directory.
 */
async function symlinkResourceDirectory(source, destination, { dryRun, logger }) {
  const fallbackFn = () => copyResourceDirectory(source, destination, { dryRun: false, logger });

  await createSymlink(source, destination, { dryRun, logger, fallbackFn });
}

/**
 * Creates a symlink to a file.
 */
async function symlinkResourceFile(source, destination, { dryRun, logger }) {
  const fallbackFn = () => copyFile(source, destination, { dryRun: false, logger });

  await createSymlink(source, destination, { dryRun, logger, fallbackFn });
}
